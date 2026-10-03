import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const validDomain = (value) => {
  const domain = String(value || "").trim().toLowerCase().replace(/\.$/, "");
  if (domain.length > 253 || domain.includes("*") || domain.includes("/") || domain.includes(":")) return null;
  const labels = domain.split(".");
  if (labels.length < 2 || labels.some((label) => !/^(?!-)[a-z0-9-]{1,63}(?<!-)$/.test(label))) return null;
  return domain;
};
const hashToken = (token) => createHash("sha256").update(token).digest("hex");
const equalHex = (left, right) => {
  const a = Buffer.from(left || "", "hex");
  const b = Buffer.from(right || "", "hex");
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
};
const isConfigured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const messageFrom = (error) => error?.message || "AssetPulse request failed.";

export function createAssetMonitorApi() {
  const router = Router();

  router.use(async (req, res, next) => {
    if (req.path === "/telegram/webhook" || req.path === "/razorpay/webhook") return next();
    if (!isConfigured()) return res.status(503).json({ error: "AssetPulse Supabase service is not configured." });
    try {
      const authorization = req.headers.authorization || "";
      if (!authorization.startsWith("Bearer ")) return res.status(401).json({ error: "Supabase sign-in is required." });
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase.auth.getUser(authorization.slice(7));
      if (error || !data.user) return res.status(401).json({ error: "Supabase session is invalid or expired." });
      req.assetPulse = { supabase, user: data.user };
      next();
    } catch (error) {
      console.error("AssetPulse authentication failed.", error);
      return res.status(500).json({ error: "Could not validate the AssetPulse session." });
    }
  });

  router.get("/dashboard", async (req, res) => {
    const { supabase, user } = req.assetPulse;
    const [domains, subscription, destinations] = await Promise.all([
      supabase.from("monitored_domains").select("id,root_domain,status,check_frequency,last_scanned_at,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("plan_tier,max_domains,status").eq("user_id", user.id).maybeSingle(),
      supabase.from("alert_destinations").select("id,channel_type,destination_id,is_active").eq("user_id", user.id)
    ]);
    const failure = domains.error || subscription.error || destinations.error;
    if (failure) return res.status(500).json({ error: messageFrom(failure) });
    const counts = await Promise.all((domains.data || []).map(async (domain) => {
      const result = await supabase.from("discovered_assets").select("id", { count: "exact", head: true }).eq("domain_id", domain.id);
      return { id: domain.id, count: result.count || 0, error: result.error };
    }));
    const countFailure = counts.find((result) => result.error);
    if (countFailure) return res.status(500).json({ error: messageFrom(countFailure.error) });
    res.json({
      domains: (domains.data || []).map((domain) => ({ ...domain, asset_count: counts.find((result) => result.id === domain.id)?.count || 0 })),
      subscription: subscription.data || { plan_tier: "free", max_domains: 2, status: "active" },
      destinations: destinations.data
    });
  });

  router.get("/assets", async (req, res) => {
    const { supabase, user } = req.assetPulse;
    const domainId = String(req.query.domainId || "");
    const { data: domain, error: ownerError } = await supabase.from("monitored_domains").select("id").eq("id", domainId).eq("user_id", user.id).maybeSingle();
    if (ownerError) return res.status(500).json({ error: messageFrom(ownerError) });
    if (!domain) return res.status(404).json({ error: "Monitored domain not found." });
    const { data, error } = await supabase.from("discovered_assets").select("id,subdomain,ip_address,http_status,page_title,ssl_issuer,first_seen,last_seen,is_new").eq("domain_id", domainId).order("first_seen", { ascending: false });
    if (error) return res.status(500).json({ error: messageFrom(error) });
    res.json({ assets: data });
  });

  router.post("/domains", async (req, res) => {
    const rootDomain = validDomain(req.body?.rootDomain);
    if (!rootDomain) return res.status(400).json({ error: "Enter a valid public root domain, such as example.com." });
    const { supabase, user } = req.assetPulse;
    const { data, error } = await supabase.from("monitored_domains").insert({ user_id: user.id, root_domain: rootDomain }).select("id,root_domain,status,check_frequency,last_scanned_at,created_at").single();
    if (error) return res.status(error.code === "23505" ? 409 : error.message.includes("Domain limit") ? 402 : 500).json({ error: messageFrom(error) });
    res.status(201).json({ domain: { ...data, asset_count: 0 } });
  });

  router.patch("/domains/:id", async (req, res) => {
    const status = req.body?.status;
    if (status !== "active" && status !== "paused") return res.status(400).json({ error: "Status must be active or paused." });
    const { data, error } = await req.assetPulse.supabase.from("monitored_domains").update({ status }).eq("id", req.params.id).eq("user_id", req.assetPulse.user.id).select("id,status").maybeSingle();
    if (error) return res.status(500).json({ error: messageFrom(error) });
    if (!data) return res.status(404).json({ error: "Monitored domain not found." });
    res.json({ domain: data });
  });

  router.delete("/domains/:id", async (req, res) => {
    const { data, error } = await req.assetPulse.supabase.from("monitored_domains").delete().eq("id", req.params.id).eq("user_id", req.assetPulse.user.id).select("id").maybeSingle();
    if (error) return res.status(500).json({ error: messageFrom(error) });
    if (!data) return res.status(404).json({ error: "Monitored domain not found." });
    res.status(204).end();
  });

  router.post("/telegram/link-token", async (req, res) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return res.status(503).json({ error: "Telegram notifications are not configured." });
    const token = randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
    const { error } = await req.assetPulse.supabase.from("telegram_link_tokens").insert({
      user_id: req.assetPulse.user.id, token_hash: hashToken(token), expires_at: expiresAt
    });
    if (error) return res.status(500).json({ error: messageFrom(error) });
    res.json({ token, botUrl: `https://t.me/AssetPulseBot?start=${encodeURIComponent(token)}`, expiresAt });
  });

  router.post("/telegram/test", async (req, res) => {
    const { data, error } = await req.assetPulse.supabase.from("alert_destinations").select("destination_id").eq("user_id", req.assetPulse.user.id).eq("channel_type", "telegram").eq("is_active", true);
    if (error) return res.status(500).json({ error: messageFrom(error) });
    if (!data?.length) return res.status(400).json({ error: "Link a Telegram chat before sending a test." });
    const sent = await sendTelegram(data.map((row) => row.destination_id), "✅ AssetPulse test notification received. Your Telegram alerts are connected.");
    if (!sent) return res.status(502).json({ error: "Telegram could not deliver the test message. Check the bot token and chat permissions." });
    res.json({ ok: true });
  });

  router.post("/subscriptions", async (req, res) => {
    const planId = process.env.RAZORPAY_PRO_PLAN_ID;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!planId || !keyId || !keySecret) return res.status(503).json({ error: "Razorpay subscriptions are not configured." });
    const { data: existing, error: readError } = await req.assetPulse.supabase.from("subscriptions").select("plan_tier,status").eq("user_id", req.assetPulse.user.id).maybeSingle();
    if (readError) return res.status(500).json({ error: messageFrom(readError) });
    if (existing?.plan_tier === "pro" && existing.status === "active") return res.status(409).json({ error: "Your Pro subscription is already active." });
    try {
      const response = await fetch("https://api.razorpay.com/v1/subscriptions", {
        method: "POST",
        headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId, total_count: 120, quantity: 1, customer_notify: 1, notes: { assetpulse_user_id: req.assetPulse.user.id, plan_tier: "pro" } })
      });
      const payload = await response.json();
      if (!response.ok) return res.status(502).json({ error: payload?.error?.description || "Razorpay could not create the subscription." });
      res.status(201).json({ subscriptionId: payload.id, keyId });
    } catch (error) {
      console.error("AssetPulse Razorpay subscription creation failed.", error);
      res.status(502).json({ error: "Razorpay is temporarily unavailable." });
    }
  });

  router.post("/subscriptions/verify", async (req, res) => {
    const { razorpay_subscription_id: subscriptionId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || typeof subscriptionId !== "string" || typeof paymentId !== "string" || typeof signature !== "string") {
      return res.status(400).json({ error: "Razorpay verification details are incomplete." });
    }
    const expected = createHmac("sha256", secret).update(`${subscriptionId}|${paymentId}`).digest("hex");
    if (!equalHex(signature, expected)) return res.status(400).json({ error: "Razorpay payment signature is invalid." });
    const { data: previous, error: readError } = await req.assetPulse.supabase.from("subscriptions").select("status").eq("user_id", req.assetPulse.user.id).maybeSingle();
    if (readError) return res.status(500).json({ error: messageFrom(readError) });
    const { data: userSubscription, error } = await req.assetPulse.supabase.from("subscriptions").upsert({
      user_id: req.assetPulse.user.id, razorpay_subscription_id: subscriptionId,
      plan_tier: "pro", max_domains: 15, status: previous?.status === "active" ? "active" : "pending", updated_at: new Date().toISOString()
    }, { onConflict: "user_id" }).select("plan_tier,max_domains,status").single();
    if (error) return res.status(500).json({ error: messageFrom(error) });
    res.json({ subscription: userSubscription });
  });

  router.post("/telegram/webhook", async (req, res) => {
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!configuredSecret || req.get("x-telegram-bot-api-secret-token") !== configuredSecret) return res.sendStatus(401);
    if (!isConfigured()) return res.sendStatus(503);
    const text = req.body?.message?.text;
    const chatId = req.body?.message?.chat?.id;
    const match = typeof text === "string" ? text.match(/^\/link(?:@\w+)?\s+([A-Za-z0-9_-]{20,80})$/) : null;
    if (!match || chatId === undefined) return res.sendStatus(200);
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: linkToken, error } = await supabase.from("telegram_link_tokens").select("id,user_id").eq("token_hash", hashToken(match[1])).is("consumed_at", null).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (error) {
      console.error("AssetPulse Telegram linking lookup failed.", error);
      return res.sendStatus(500);
    }
    if (!linkToken) {
      const sent = await sendTelegram([String(chatId)], "This AssetPulse link has expired or was already used. Generate a new one from your dashboard.");
      if (!sent) console.error("AssetPulse could not notify a Telegram user about an expired link.");
      return res.sendStatus(200);
    }
    const { data: consumed, error: consumeError } = await supabase.from("telegram_link_tokens").update({ consumed_at: new Date().toISOString() }).eq("id", linkToken.id).is("consumed_at", null).select("id").maybeSingle();
    if (consumeError) {
      console.error("AssetPulse Telegram token consumption failed.", consumeError);
      return res.sendStatus(500);
    }
    if (!consumed) return res.sendStatus(200);
    const { error: destinationError } = await supabase.from("alert_destinations").upsert({
      user_id: linkToken.user_id, channel_type: "telegram", destination_id: String(chatId), is_active: true
    }, { onConflict: "user_id,channel_type,destination_id" });
    if (destinationError) {
      console.error("AssetPulse Telegram destination save failed.", destinationError);
      return res.sendStatus(500);
    }
    const sent = await sendTelegram([String(chatId)], "✅ AssetPulse test notification received. Your chat is linked and will receive new-asset alerts here.");
    if (!sent) console.error("AssetPulse linked Telegram chat, but delivery of the confirmation test failed.");
    res.sendStatus(200);
  });

  router.post("/razorpay/webhook", async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.get("x-razorpay-signature") || "";
    if (!secret || !req.rawBody) return res.status(503).json({ error: "Razorpay webhook verification is not configured." });
    if (!isConfigured()) return res.status(503).json({ error: "AssetPulse Supabase service is not configured." });
    const expected = createHmac("sha256", secret).update(req.rawBody).digest("hex");
    if (!equalHex(signature, expected)) return res.sendStatus(401);
    const event = req.body?.event;
    const subscription = req.body?.payload?.subscription?.entity;
    if (!subscription?.id) return res.sendStatus(200);
    const userId = subscription.notes?.assetpulse_user_id;
    if (!userId) return res.sendStatus(200);
    const isActive = event === "subscription.activated" || event === "subscription.charged";
    const isEnded = ["subscription.cancelled", "subscription.halted", "subscription.completed"].includes(event);
    if (isActive || isEnded) {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { error } = await supabase.from("subscriptions").upsert({
        user_id: userId, razorpay_subscription_id: subscription.id,
        plan_tier: isActive ? "pro" : "free", max_domains: isActive ? 15 : 2,
        status: isActive ? "active" : "cancelled", updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
      if (error) {
        console.error("AssetPulse Razorpay webhook could not update subscription.", error);
        return res.sendStatus(500);
      }
    }
    res.sendStatus(200);
  });

  return router;
}

export async function sendTelegram(chatIds, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;
  let allSent = true;
  for (const chatId of chatIds) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
        signal: AbortSignal.timeout(10_000)
      });
      const result = await response.json();
      if (!response.ok || !result?.ok) allSent = false;
    } catch (error) {
      console.error("AssetPulse Telegram delivery failed.", error);
      allSent = false;
    }
  }
  return allSent;
}
