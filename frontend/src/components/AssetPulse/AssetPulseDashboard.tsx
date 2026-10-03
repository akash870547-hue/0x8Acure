import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Activity, ArrowDownToLine, Bot, Check, Clock3, Globe2, LoaderCircle, Pause, Play, Plus, Search, ShieldCheck, Trash2, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import "./asset-pulse.css";

type MonitorStatus = "active" | "paused";
type PlanTier = "free" | "pro" | "agency";
type Domain = { id: string; root_domain: string; status: MonitorStatus; check_frequency: number; last_scanned_at: string | null; created_at: string; asset_count: number };
type Asset = { id: string; subdomain: string; ip_address: string | null; http_status: number | null; page_title: string | null; ssl_issuer: string | null; first_seen: string; last_seen: string; is_new: boolean };
type Subscription = { plan_tier: PlanTier; max_domains: number; status: string };
type Destination = { id: string; channel_type: "telegram" | "discord"; destination_id: string; is_active: boolean };
type Dashboard = { domains: Domain[]; subscription: Subscription; destinations: Destination[] };
type LinkToken = { token: string; botUrl: string; expiresAt: string };
type Filter = "all" | "new" | "active";
type RazorpayOptions = { key: string; subscription_id: string; name: string; description: string; handler: (response: { razorpay_subscription_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void; modal: { ondismiss: () => void }; theme: { color: string } };
declare global { interface Window { Razorpay?: new (options: RazorpayOptions) => { open: () => void } } }

const apiBase = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "" : "https://zerox8acure-dpdp-ctf.onrender.com")).replace(/\/$/, "");

async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${apiBase}/api/asset-monitor${path}`, { ...options, headers });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => ({ error: "The AssetPulse server returned an invalid response." }));
  if (!response.ok) throw new Error(payload.error || "AssetPulse request failed.");
  return payload as T;
}

function dateLabel(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not scanned yet";
}

function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AssetPulseDashboard() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [domainDraft, setDomainDraft] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [link, setLink] = useState<LinkToken | null>(null);
  const [showTelegram, setShowTelegram] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refreshDashboard = useCallback(async (token: string) => {
    const result = await request<Dashboard>("/dashboard", token);
    setDashboard(result);
    if (!result.domains.some((domain) => domain.id === selectedDomain)) setSelectedDomain(result.domains[0]?.id || "");
  }, [selectedDomain]);
  const refreshAssets = useCallback(async (token: string, domainId: string) => {
    if (!domainId) { setAssets([]); return; }
    const result = await request<{ assets: Asset[] }>(`/assets?domainId=${encodeURIComponent(domainId)}`, token);
    setAssets(result.assets);
  }, []);

  useEffect(() => {
    let alive = true;
    if (!supabase) { setAuthReady(true); return; }
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return;
      if (sessionError) setError(sessionError.message);
      setSessionToken(data.session?.access_token || null);
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionToken(session?.access_token || null);
      if (!session) { setDashboard(null); setAssets([]); }
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!sessionToken) return;
    setBusy(true);
    setError("");
    void refreshDashboard(sessionToken).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load AssetPulse."))
      .finally(() => setBusy(false));
  }, [sessionToken, refreshDashboard]);

  useEffect(() => {
    if (!sessionToken || !selectedDomain) { setAssets([]); return; }
    void refreshAssets(sessionToken, selectedDomain).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load discovered assets."));
  }, [sessionToken, selectedDomain, refreshAssets]);

  const selected = dashboard?.domains.find((domain) => domain.id === selectedDomain) || null;
  const destinations = dashboard?.destinations.filter((destination) => destination.channel_type === "telegram" && destination.is_active) || [];
  const filteredAssets = useMemo(() => assets.filter((asset) => {
    if (filter === "new" && !asset.is_new) return false;
    if (filter === "active" && !asset.ip_address) return false;
    if (statusFilter !== "all" && String(asset.http_status || "unknown") !== statusFilter) return false;
    if (dateFilter && new Date(asset.first_seen).toISOString().slice(0, 10) !== dateFilter) return false;
    const needle = search.trim().toLowerCase();
    return !needle || asset.subdomain.toLowerCase().includes(needle) || (asset.ip_address || "").includes(needle) || (asset.ssl_issuer || "").toLowerCase().includes(needle);
  }), [assets, filter, statusFilter, dateFilter, search]);

  async function withBusy(action: () => Promise<void>) {
    setBusy(true); setError(""); setNotice("");
    try { await action(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The request could not be completed."); }
    finally { setBusy(false); }
  }

  async function authenticate(event: FormEvent) {
    event.preventDefault();
    const client = supabase;
    if (!client) return;
    await withBusy(async () => {
      const result = authMode === "signin"
        ? await client.auth.signInWithPassword({ email: email.trim(), password })
        : await client.auth.signUp({ email: email.trim(), password });
      if (result.error) throw result.error;
      if (authMode === "signup" && !result.data.session) setNotice("Account created. Confirm your email, then sign in to connect AssetPulse.");
      else if (result.data.session) setSessionToken(result.data.session.access_token);
    });
  }

  async function addDomain(event: FormEvent) {
    event.preventDefault();
    if (!sessionToken) return;
    await withBusy(async () => {
      await request<{ domain: Domain }>("/domains", sessionToken, { method: "POST", body: JSON.stringify({ rootDomain: domainDraft }) });
      setDomainDraft("");
      await refreshDashboard(sessionToken);
      setNotice("Domain added to passive monitoring.");
    });
  }

  async function toggleDomain(domain: Domain) {
    if (!sessionToken) return;
    await withBusy(async () => {
      await request(`/domains/${domain.id}`, sessionToken, { method: "PATCH", body: JSON.stringify({ status: domain.status === "active" ? "paused" : "active" }) });
      await refreshDashboard(sessionToken);
    });
  }

  async function removeDomain(domain: Domain) {
    if (!sessionToken || !window.confirm(`Remove ${domain.root_domain} and its discovered assets?`)) return;
    await withBusy(async () => {
      await request(`/domains/${domain.id}`, sessionToken, { method: "DELETE" });
      await refreshDashboard(sessionToken);
      setNotice(`${domain.root_domain} removed.`);
    });
  }

  async function createTelegramLink() {
    if (!sessionToken) return;
    await withBusy(async () => {
      setLink(await request<LinkToken>("/telegram/link-token", sessionToken, { method: "POST" }));
    });
  }

  async function testTelegram() {
    if (!sessionToken) return;
    await withBusy(async () => {
      await request("/telegram/test", sessionToken, { method: "POST" });
      setNotice("Test message sent to your linked Telegram chat.");
    });
  }

  async function startProCheckout() {
    if (!sessionToken) return;
    await withBusy(async () => {
      const { subscriptionId, keyId } = await request<{ subscriptionId: string; keyId: string }>("/subscriptions", sessionToken, { method: "POST", body: "{}" });
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Razorpay checkout could not be loaded."));
          document.head.append(script);
        });
      }
      if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable in this browser.");
      const checkout = new window.Razorpay({
        key: keyId, subscription_id: subscriptionId, name: "AssetPulse", description: "Pro plan · ₹499/month",
        theme: { color: "#58f2bd" },
        modal: { ondismiss: () => setNotice("Checkout closed before payment was completed.") },
        handler: (response) => {
          void withBusy(async () => {
            await request("/subscriptions/verify", sessionToken, { method: "POST", body: JSON.stringify(response) });
            await refreshDashboard(sessionToken);
            setShowUpgrade(false);
            setNotice("Payment verified. Your Pro plan will activate when Razorpay confirms the subscription.");
          });
        }
      });
      checkout.open();
    });
  }

  if (!authReady) return <main className="assetpulse-page"><div className="ap-loading"><LoaderCircle className="ap-spin"/> Loading AssetPulse…</div></main>;
  if (!supabase) return <main className="assetpulse-page"><AuthRequired title="Connect Supabase to use AssetPulse" description="Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then sign in with a Supabase user account."/></main>;
  if (!sessionToken) return <main className="assetpulse-page">
    <header className="ap-hero">
      <div><span className="ap-kicker"><Activity size={14}/> EXTERNAL ATTACK SURFACE MONITORING</span><h1>AssetPulse</h1><p>Track your exposed subdomains through Certificate Transparency and DNS—without port scans or intrusive probes.</p></div>
      <span className="ap-status-chip"><i/> PASSIVE DISCOVERY</span>
    </header>
    <section className="ap-panel ap-auth-panel"><div className="ap-panel-title"><ShieldCheck size={18}/><h2>Supabase sign in</h2></div><p>AssetPulse stores monitoring data under your authenticated Supabase account.</p>
      <form className="ap-auth-form" onSubmit={authenticate}>
        <label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)}/></label>
        <label>Password<input type="password" autoComplete={authMode === "signin" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)}/></label>
        <button className="ap-button primary" disabled={busy}>{busy && <LoaderCircle className="ap-spin" size={16}/>} {authMode === "signin" ? "Sign in" : "Create account"}</button>
      </form>
      <button className="ap-link-button" onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}>{authMode === "signin" ? "New to AssetPulse? Create a Supabase account" : "Already have an account? Sign in"}</button>
    </section>
    <Feedback error={error} notice={notice}/>
  </main>;

  const plan = dashboard?.subscription;
  const domainLimit = plan?.status === "active" ? plan.max_domains : 2;
  return <main className="assetpulse-page">
    <header className="ap-hero">
      <div><span className="ap-kicker"><Activity size={14}/> EXTERNAL ATTACK SURFACE MONITORING</span><h1>AssetPulse</h1><p>Discover internet-facing assets from public Certificate Transparency logs and DNS.</p></div>
      <span className="ap-status-chip"><i/> MONITORING READY</span>
    </header>
    <Feedback error={error} notice={notice}/>
    <section className="ap-metrics">
      <div className="ap-metric"><span>MONITORED DOMAINS</span><strong>{dashboard?.domains.length || 0}<small> / {domainLimit}</small></strong></div>
      <div className="ap-metric"><span>DISCOVERED ASSETS</span><strong>{assets.length}</strong></div>
      <div className="ap-metric"><span>NEW IN THIS VIEW</span><strong>{assets.filter((asset) => asset.is_new).length}</strong></div>
      <div className="ap-metric"><span>SCAN FREQUENCY</span><strong>{plan?.plan_tier === "pro" || plan?.plan_tier === "agency" ? "2h" : "24h"}</strong></div>
    </section>
    <section className="ap-panel">
      <div className="ap-section-heading"><div><span className="ap-kicker">SCOPE</span><h2>Monitored domains</h2></div><button className="ap-button secondary" onClick={() => setShowTelegram(true)}><Bot size={16}/> Telegram {destinations.length ? <Check size={15}/> : null}</button></div>
      <form className="ap-add-domain" onSubmit={addDomain}><label className="visually-hidden" htmlFor="ap-domain">Root domain</label><Globe2 size={17}/><input id="ap-domain" value={domainDraft} onChange={(event) => setDomainDraft(event.target.value)} placeholder="example.com" required/><button className="ap-button primary" disabled={busy || (dashboard?.domains.length || 0) >= domainLimit}><Plus size={16}/> Add domain</button></form>
      <div className="ap-table-wrap"><table className="ap-table"><thead><tr><th>DOMAIN</th><th>ASSETS</th><th>STATUS</th><th>LAST SCAN</th><th>FREQUENCY</th><th>ACTIONS</th></tr></thead><tbody>
        {dashboard?.domains.map((domain) => <tr key={domain.id} className={selectedDomain === domain.id ? "selected" : ""} onClick={() => setSelectedDomain(domain.id)}>
          <td><button className="ap-domain-link" onClick={() => setSelectedDomain(domain.id)}><Globe2 size={15}/>{domain.root_domain}</button></td><td>{selectedDomain === domain.id ? assets.length : domain.asset_count}</td><td><span className={`ap-state ${domain.status}`}>{domain.status}</span></td><td>{dateLabel(domain.last_scanned_at)}</td><td>Every {domain.check_frequency}h</td><td><div className="ap-row-actions"><button title={domain.status === "active" ? "Pause monitoring" : "Resume monitoring"} onClick={(event) => { event.stopPropagation(); void toggleDomain(domain); }}>{domain.status === "active" ? <Pause size={15}/> : <Play size={15}/>}</button><button title="Remove domain" onClick={(event) => { event.stopPropagation(); void removeDomain(domain); }}><Trash2 size={15}/></button></div></td>
        </tr>)}
        {!dashboard?.domains.length && <tr><td className="ap-empty" colSpan={6}>Add a root domain to start passive asset discovery.</td></tr>}
      </tbody></table></div>
      <div className="ap-plan-row"><span><ShieldCheck size={16}/> Current plan: <strong>{plan?.plan_tier || "free"}</strong> · {domainLimit} domains · {plan?.plan_tier === "pro" || plan?.plan_tier === "agency" ? "2h" : "24h"} scans</span>
        {plan?.plan_tier !== "pro" && plan?.plan_tier !== "agency" && <button className="ap-link-button" onClick={() => setShowUpgrade(true)}>Upgrade to Pro · ₹499/month</button>}</div>
    </section>
    <section className="ap-panel ap-assets-panel">
      <div className="ap-section-heading"><div><span className="ap-kicker">INVENTORY</span><h2>{selected ? `Subdomains · ${selected.root_domain}` : "Subdomain explorer"}</h2></div><div className="ap-export-actions"><button className="ap-button secondary" disabled={!filteredAssets.length} onClick={() => downloadFile("assetpulse-assets.csv", toCsv(filteredAssets), "text/csv;charset=utf-8")}><ArrowDownToLine size={15}/> CSV</button><button className="ap-button secondary" disabled={!filteredAssets.length} onClick={() => downloadFile("assetpulse-assets.json", JSON.stringify(filteredAssets, null, 2), "application/json")}><ArrowDownToLine size={15}/> JSON</button></div></div>
      <div className="ap-filters"><label className="ap-search"><Search size={16}/><input aria-label="Search subdomains" placeholder="Search hostname, IP, issuer…" value={search} onChange={(event) => setSearch(event.target.value)}/></label>
        <select aria-label="Asset filter" value={filter} onChange={(event) => setFilter(event.target.value as Filter)}><option value="all">All assets</option><option value="new">New</option><option value="active">Active DNS</option></select>
        <select aria-label="HTTP status filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Any HTTP status</option>{["200","301","302","400","401","403","404","500","unknown"].map((value) => <option key={value} value={value}>{value === "unknown" ? "Not checked" : value}</option>)}</select>
        <label className="ap-date-filter"><Clock3 size={15}/><input aria-label="Filter by date added" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}/></label>
      </div>
      <div className="ap-table-wrap"><table className="ap-table ap-asset-table"><thead><tr><th>SUBDOMAIN</th><th>IP ADDRESS</th><th>HTTPS</th><th>TLS ISSUER</th><th>FIRST SEEN</th><th>LAST SEEN</th><th></th></tr></thead><tbody>
        {filteredAssets.map((asset) => <tr key={asset.id}><td><span className="ap-host">{asset.subdomain}</span>{asset.is_new && <span className="ap-new">NEW</span>}</td><td>{asset.ip_address || "—"}</td><td>{asset.http_status ? <span className={`ap-http ${asset.http_status < 400 ? "good" : "warn"}`}>{asset.http_status}</span> : <span className="ap-muted">Not checked</span>}</td><td className="ap-issuer">{asset.ssl_issuer || "—"}</td><td>{dateLabel(asset.first_seen)}</td><td>{dateLabel(asset.last_seen)}</td><td>{asset.page_title ? <span title={asset.page_title}>Page title</span> : null}</td></tr>)}
        {!filteredAssets.length && <tr><td className="ap-empty" colSpan={7}>{selected ? "No discovered assets match the current filters." : "Select a monitored domain to browse its discovered assets."}</td></tr>}
      </tbody></table></div>
      <div className="ap-footnote">Discovery uses crt.sh certificate records and DNS A/CNAME lookups. HTTPS status uses a bounded, public-IP-pinned HEAD request; no port scans or page content are collected.</div>
    </section>
    {busy && <div className="ap-busy" role="status"><LoaderCircle size={15} className="ap-spin"/> Working…</div>}
    {showTelegram && <TelegramModal linked={destinations.length > 0} link={link} onCreateLink={createTelegramLink} onTest={testTelegram} onClose={() => setShowTelegram(false)} busy={busy}/>}
    {showUpgrade && <UpgradeModal busy={busy} onUpgrade={startProCheckout} onClose={() => setShowUpgrade(false)}/>}
  </main>;
}

function toCsv(rows: Asset[]) {
  const columns: (keyof Asset)[] = ["subdomain", "ip_address", "http_status", "page_title", "ssl_issuer", "first_seen", "last_seen", "is_new"];
  const quote = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [columns.join(","), ...rows.map((row) => columns.map((column) => quote(row[column])).join(","))].join("\r\n");
}

function AuthRequired({ title, description }: { title: string; description: string }) {
  return <section className="ap-panel ap-auth-panel"><div className="ap-panel-title"><ShieldCheck size={18}/><h2>{title}</h2></div><p>{description}</p></section>;
}

function Feedback({ error, notice }: { error: string; notice: string }) {
  return <>{error && <div className="ap-feedback error" role="alert"><X size={15}/>{error}</div>}{notice && <div className="ap-feedback notice" role="status"><Check size={15}/>{notice}</div>}</>;
}

function TelegramModal({ linked, link, onCreateLink, onTest, onClose, busy }: { linked: boolean; link: LinkToken | null; onCreateLink: () => Promise<void>; onTest: () => Promise<void>; onClose: () => void; busy: boolean }) {
  const copy = () => { if (link) void navigator.clipboard.writeText(`/link ${link.token}`); };
  return <div className="ap-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="ap-modal" role="dialog" aria-modal="true" aria-labelledby="telegram-title">
    <button className="ap-modal-close" aria-label="Close Telegram setup" onClick={onClose}><X size={18}/></button><span className="ap-kicker"><Bot size={14}/> ALERT CHANNEL</span><h2 id="telegram-title">Connect Telegram</h2><p>Link a private chat to receive new-subdomain alerts.</p>
    <ol className="ap-steps"><li><b>1</b><span>Start <a href="https://t.me/AssetPulseBot" target="_blank" rel="noreferrer">@AssetPulseBot</a>.</span></li><li><b>2</b><span>Generate a short-lived link token, then send <code>/link &lt;token&gt;</code> to the bot.</span></li><li><b>3</b><span>The bot confirms the link and sends a test alert. You can also trigger a test below.</span></li></ol>
    {linked && <div className="ap-linked"><Check size={16}/> Telegram is connected <button className="ap-link-button" onClick={() => void onTest()} disabled={busy}>Send test notification</button></div>}
    {link && <div className="ap-link-result"><a className="ap-button secondary" href={link.botUrl} target="_blank" rel="noreferrer">Open AssetPulse bot</a><button className="ap-copy-token" onClick={copy}>/link {link.token}</button><small>Expires {new Date(link.expiresAt).toLocaleTimeString()} · only one successful use</small></div>}
    <div className="ap-modal-actions"><button className="ap-button primary" onClick={() => void onCreateLink()} disabled={busy}>{linked ? "Create another link" : "Generate link token"}</button><button className="ap-button secondary" onClick={onClose}>Done</button></div>
  </section></div>;
}

function UpgradeModal({ busy, onUpgrade, onClose }: { busy: boolean; onUpgrade: () => Promise<void>; onClose: () => void }) {
  return <div className="ap-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="ap-modal ap-upgrade-modal" role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
    <button className="ap-modal-close" aria-label="Close Pro plan details" onClick={onClose}><X size={18}/></button><span className="ap-kicker"><ShieldCheck size={14}/> ASSETPULSE PRO</span><h2 id="upgrade-title">More coverage. Faster signals.</h2><div className="ap-price">₹499 <small>/ month</small></div>
    <ul><li><Check size={16}/> Monitor up to 15 domains</li><li><Check size={16}/> 2-hour scan intervals</li><li><Check size={16}/> Telegram alerts as assets are discovered</li></ul>
    <p className="ap-payment-note">Recurring billing is managed securely by Razorpay. Subscription access activates after Razorpay confirms payment.</p>
    <div className="ap-modal-actions"><button className="ap-button primary" onClick={() => void onUpgrade()} disabled={busy}>{busy ? <LoaderCircle size={16} className="ap-spin"/> : null}Continue to Razorpay</button><button className="ap-button secondary" onClick={onClose}>Not now</button></div>
  </section></div>;
}
