import { resolve4, resolveCname } from "node:dns/promises";
import { request as httpsRequest } from "node:https";
import { createClient } from "@supabase/supabase-js";
import { sendTelegram } from "./api.js";

const scanIntervalMs = 5 * 60_000;
const maxNamesPerDomain = 500;
const retryAfter = new Map();
const ipv4ToNumber = (address) => address.split(".").reduce((number, part) => (number * 256) + Number(part), 0);
const isPublicIpv4 = (address) => {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const value = ipv4ToNumber(address);
  const ranges = [
    ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
    ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
    ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
    ["224.0.0.0", 4], ["240.0.0.0", 4]
  ];
  return !ranges.some(([network, prefix]) => {
    const mask = (0xffffffff << (32 - prefix)) >>> 0;
    return (value & mask) === (ipv4ToNumber(network) & mask);
  });
};

async function discoverFromCt(rootDomain) {
  const url = `https://crt.sh/?q=${encodeURIComponent(`%.${rootDomain}`)}&output=json`;
  const response = await fetch(url, { headers: { "User-Agent": "AssetPulse/1.0 (passive certificate transparency monitor)" }, signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Certificate Transparency query failed with HTTP ${response.status}.`);
  if (!response.body) throw new Error("Certificate Transparency response was empty.");
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 10 * 1024 * 1024) {
      await reader.cancel();
      throw new Error("Certificate Transparency response exceeded the 10 MB safety limit.");
    }
    chunks.push(Buffer.from(value));
  }
  let certificates;
  try {
    certificates = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    throw new Error("Certificate Transparency returned invalid JSON.", { cause: error });
  }
  if (!Array.isArray(certificates)) throw new Error("Certificate Transparency returned an invalid response.");
  const names = new Map();
  for (const certificate of certificates) {
    for (const value of String(certificate.name_value || certificate.common_name || "").split(/\r?\n/)) {
      const hostname = value.trim().toLowerCase().replace(/^\*\./, "").replace(/\.$/, "");
      if (hostname !== rootDomain && hostname.endsWith(`.${rootDomain}`)) {
        names.set(hostname, String(certificate.issuer_name || "").slice(0, 512) || null);
      }
    }
  }
  return [...names.entries()].slice(0, maxNamesPerDomain).map(([hostname, issuer]) => ({ hostname, issuer }));
}

function httpStatusLabel(status) {
  const labels = { 200: "OK", 201: "Created", 301: "Moved Permanently", 302: "Found", 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 429: "Too Many Requests", 500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable" };
  return labels[status] || "";
}

async function resolveHost(hostname) {
  const [ipv4, aliases] = await Promise.allSettled([resolve4(hostname), resolveCname(hostname)]);
  const addresses = ipv4.status === "fulfilled" ? ipv4.value : [];
  const cnameTargets = aliases.status === "fulfilled" ? aliases.value : [];
  let allAddresses = addresses;
  if (!allAddresses.length && cnameTargets.length) {
    const targetResults = await Promise.allSettled(cnameTargets.slice(0, 5).map((target) => resolve4(target)));
    allAddresses = targetResults.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  }
  return { addresses: [...new Set(allAddresses)], cname: cnameTargets[0] || null };
}

function probeHttps(hostname, address) {
  return new Promise((resolve) => {
    const request = httpsRequest({
      hostname, method: "HEAD", path: "/", timeout: 5000,
      lookup: (_host, _options, callback) => callback(null, address, 4)
    }, (response) => {
      response.resume();
      resolve(response.statusCode || null);
    });
    request.on("timeout", () => request.destroy());
    request.on("error", () => resolve(null));
    request.end();
  });
}

async function loadDestinations(supabase, userId) {
  const { data, error } = await supabase.from("alert_destinations").select("destination_id").eq("user_id", userId).eq("channel_type", "telegram").eq("is_active", true);
  if (error) throw error;
  return (data || []).map((row) => row.destination_id);
}

async function scanDomain(supabase, domain) {
  const discoveries = await discoverFromCt(domain.root_domain);
  const { data: existing, error: existingError } = await supabase.from("discovered_assets").select("id,subdomain").eq("domain_id", domain.id);
  if (existingError) throw existingError;
  const existingByName = new Map((existing || []).map((asset) => [asset.subdomain, asset.id]));
  const discovered = [];

  for (let offset = 0; offset < discoveries.length; offset += 10) {
    const batch = await Promise.all(discoveries.slice(offset, offset + 10).map(async ({ hostname, issuer }) => {
      const resolved = await resolveHost(hostname);
      if (!resolved.addresses.length && !resolved.cname) return null;
      const publicAddress = resolved.addresses.find(isPublicIpv4) || null;
      const httpStatus = publicAddress ? await probeHttps(hostname, publicAddress) : null;
      return {
        domain_id: domain.id, subdomain: hostname, ip_address: resolved.addresses[0] || null,
        http_status: httpStatus, page_title: null, ssl_issuer: issuer,
        last_seen: new Date().toISOString(), is_new: !existingByName.has(hostname),
        ...(existingByName.has(hostname) ? { id: existingByName.get(hostname), first_seen: undefined } : { first_seen: new Date().toISOString() })
      };
    }));
    discovered.push(...batch.filter(Boolean));
  }

  for (const item of discovered) {
    const isNew = !existingByName.has(item.subdomain);
    const { error } = await supabase.from("discovered_assets").upsert(item, { onConflict: "domain_id,subdomain" });
    if (error) throw error;
    if (isNew) {
      const destinations = await loadDestinations(supabase, domain.user_id);
      if (destinations.length) {
        const message = [
          "🚨 AssetPulse Alert: New Subdomain Discovered!",
          `- Target: ${item.subdomain}`,
          `- IP: ${item.ip_address || "Not resolved"}`,
          `- HTTP Status: ${item.http_status ? `${item.http_status} ${httpStatusLabel(item.http_status)}`.trim() : "Unavailable (HTTPS HEAD check)"}`,
          `- Time: ${new Date().toISOString()}`
        ].join("\n");
        const sent = await sendTelegram(destinations, message);
        if (!sent) console.error(`AssetPulse alert delivery failed for ${item.subdomain}.`);
      }
    }
  }

  const { error: updateError } = await supabase.from("monitored_domains").update({ last_scanned_at: new Date().toISOString() }).eq("id", domain.id);
  if (updateError) throw updateError;
  console.info(`AssetPulse scanned ${domain.root_domain}: ${discovered.length} active names resolved.`);
}

export async function runDueAssetScans() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: domains, error } = await supabase.from("monitored_domains").select("id,user_id,root_domain,check_frequency,last_scanned_at").eq("status", "active").order("last_scanned_at", { ascending: true, nullsFirst: true }).limit(1000);
  if (error) throw error;
  const now = Date.now();
  const due = (domains || []).filter((domain) =>
    (!domain.last_scanned_at || now - Date.parse(domain.last_scanned_at) >= domain.check_frequency * 3_600_000) &&
    (retryAfter.get(domain.id) || 0) <= now
  ).slice(0, 100);
  for (const domain of due) {
    try {
      await scanDomain(supabase, domain);
      retryAfter.delete(domain.id);
    } catch (scanError) {
      retryAfter.set(domain.id, Date.now() + scanIntervalMs);
      console.error(`AssetPulse scan failed for ${domain.root_domain}.`, scanError);
    }
  }
}

export function startAssetMonitorWorker() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("AssetPulse worker is disabled: configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    return;
  }
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await runDueAssetScans();
    } catch (error) {
      console.error("AssetPulse scheduler run failed.", error);
    } finally {
      running = false;
    }
  };
  void tick();
  setInterval(() => void tick(), scanIntervalMs).unref();
  console.info("AssetPulse background worker started; scan scheduler checks every five minutes.");
}
