import { useMemo, useRef, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownToLine, CalendarDays, Check, ChevronDown, CircleAlert,
  Clock3, Database, FileArchive, FileSearch, Fingerprint, Network, Search, ShieldAlert,
  ShieldCheck, Upload, X,
} from "lucide-react";
import { History, Save } from "lucide-react";
import { useEffect } from "react";
import { useSupabaseSession } from "../../auth/SupabaseSession";
import { supabaseClient } from "../../lib/supabaseClient";
import {
  analyzeRecords, createReport, extractNetwork, extractProcesses, md5, parseEvidenceText,
  sampleCases, type AnalysisResult, type ArtifactCategory, type ForensicEvent, type Severity,
} from "./forensics";

type Panel = "timeline" | "memory" | "network" | "evidence";
type ReportFormat = "json" | "markdown";
type SavedCase = { id: string; case_name: string; evidence_hash: string | null; timeline_data: AnalysisResult; ioc_findings: unknown[]; report_markdown: string | null; updated_at: string };

const categories: ArtifactCategory[] = ["Event Log", "Process", "Network", "File System", "USB", "Web", "Prefetch", "Shimcache", "LNK", "Shellbags", "Browser History", "Memory"];
const blankResult: AnalysisResult = { events: [], processes: [], network: [], evidence: [] };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function SeverityTag({ severity }: { severity: Severity }) {
  return <span className={`forensics-severity severity-${severity.toLowerCase()}`}>{severity}</span>;
}

function getIocs(events: ForensicEvent[]): string[] {
  return [...new Set(events.flatMap(event => event.iocs))];
}

export function ForensicsEngine() {
  const { session, user } = useSupabaseSession();
  const [result, setResult] = useState<AnalysisResult>(blankResult);
  const [activeCase, setActiveCase] = useState("");
  const [panel, setPanel] = useState<Panel>("timeline");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [techniqueFilter, setTechniqueFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportFormat, setReportFormat] = useState<ReportFormat>("json");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [selectedSavedCase, setSelectedSavedCase] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadSavedCases = async () => {
    if (!supabaseClient || !user) { setSavedCases([]); return; }
    const { data, error: loadError } = await supabaseClient.from("forensic_cases")
      .select("id,case_name,evidence_hash,timeline_data,ioc_findings,report_markdown,updated_at")
      .eq("user_id", user.id).order("updated_at", { ascending: false }).limit(20);
    if (loadError) throw loadError;
    setSavedCases((data || []) as SavedCase[]);
  };

  useEffect(() => {
    let alive = true;
    if (!user) { setSavedCases([]); setSelectedSavedCase(""); return; }
    void loadSavedCases().catch((cause: unknown) => {
      if (alive) setError(cause instanceof Error ? cause.message : "Could not load saved forensic cases.");
    });
    return () => { alive = false; };
  }, [user?.id]);

  const filteredEvents = useMemo(() => result.events
    .filter(event => !search || `${event.title} ${event.details} ${event.source} ${event.iocs.join(" ")}`.toLowerCase().includes(search.toLowerCase()))
    .filter(event => !categoryFilter || event.category === categoryFilter)
    .filter(event => !techniqueFilter || event.technique === techniqueFilter)
    .filter(event => !severityFilter || event.severity === severityFilter)
    .filter(event => !fromDate || event.timestamp >= new Date(`${fromDate}T00:00:00`).toISOString())
    .filter(event => !toDate || event.timestamp <= new Date(`${toDate}T23:59:59.999`).toISOString())
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp)), [result.events, search, categoryFilter, techniqueFilter, severityFilter, fromDate, toDate]);
  const techniques = useMemo(() => [...new Set(result.events.flatMap(event => event.technique ? [event.technique] : []))].sort(), [result.events]);
  const indicators = useMemo(() => getIocs(result.events), [result.events]);
  const counts = useMemo(() => ({
    critical: result.events.filter(event => event.severity === "Critical").length,
    high: result.events.filter(event => event.severity === "High").length,
    techniques: techniques.length,
    suspicious: result.network.filter(flow => flow.suspicious || flow.dnsTunnel).length,
  }), [result.events, result.network, techniques.length]);
  const beaconSummary = useMemo(() => {
    const groups = new Map<string, number[]>();
    result.network.forEach(flow => {
      if (flow.destination === "unknown") return;
      const timestamps = groups.get(flow.destination) ?? [];
      timestamps.push(Date.parse(flow.timestamp));
      groups.set(flow.destination, timestamps);
    });
    return [...groups].flatMap(([destination, times]) => {
      if (times.length < 3) return [];
      times.sort((a, b) => a - b);
      const intervals = times.slice(1).map((time, index) => Math.round((time - times[index]) / 1000));
      const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => sum + (interval - mean) ** 2, 0) / intervals.length;
      return Math.sqrt(variance) / mean < 0.15 ? [{ destination, seconds: Math.round(mean), count: times.length }] : [];
    });
  }, [result.network]);

  const loadCase = (caseId: string) => {
    const chosen = sampleCases.find(item => item.id === caseId);
    if (!chosen) return;
    setResult({ events: chosen.events, processes: chosen.processes, network: chosen.network, evidence: [] });
    setActiveCase(chosen.title);
    setSearch("");
    setCategoryFilter("");
    setTechniqueFilter("");
    setSeverityFilter("");
    setFromDate("");
    setToDate("");
    setStatus(`Loaded ${chosen.title}. Sample artifacts are simulated and not original evidence.`);
    setError("");
  };

  const ingestFiles = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    setStatus("");
    setError("");
    let addedEvents: ForensicEvent[] = [];
    const addedEvidence: AnalysisResult["evidence"] = [];
    const messages: string[] = [];
    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        if (!globalThis.crypto?.subtle) throw new Error("Web Crypto is unavailable; serve this page over HTTPS or localhost to calculate SHA-256.");
        const sha256 = await crypto.subtle.digest("SHA-256", buffer);
        const sha256Hex = Array.from(new Uint8Array(sha256), byte => byte.toString(16).padStart(2, "0")).join("");
        const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
        const records = parseEvidenceText(text, file.name);
        const events = analyzeRecords(records, file.name);
        addedEvents = [...addedEvents, ...events];
        addedEvidence.push({ name: file.name, size: file.size, md5: md5(bytes), sha256: sha256Hex, parsed: events.length });
        if (/\.evtx$/i.test(file.name) && !text.trimStart().startsWith("<")) {
          messages.push(`${file.name}: raw binary EVTX is hashed but not decoded; export the log as XML or CSV to parse events.`);
        } else if (!events.length) {
          messages.push(`${file.name}: hashed successfully; no supported records were parsed from the file content.`);
        }
      } catch (caught) {
        const reason = caught instanceof Error ? caught.message : "Unknown browser processing error";
        messages.push(`${file.name}: ${reason}`);
      }
    }
    setResult(previous => {
      const events = [...previous.events, ...addedEvents];
      return {
        events,
        processes: [...previous.processes.filter(item => !addedEvents.some(event => event.category === "Process" && event.details.includes(item.name))), ...extractProcesses(addedEvents)],
        network: [...previous.network, ...extractNetwork(addedEvents)],
        evidence: [...previous.evidence, ...addedEvidence],
      };
    });
    setActiveCase(previous => previous || "Uploaded evidence");
    setBusy(false);
    setStatus(messages.length ? messages.join(" ") : `Ingested ${addedEvidence.length} file(s); computed local MD5 and SHA-256 hashes.`);
    if (messages.length && addedEvidence.length === 0) setError("No files were processed. Review the per-file errors above and retry.");
    if (inputRef.current) inputRef.current.value = "";
  };

  const exportReport = () => {
    const contents = createReport(result, activeCase || "Unlabeled case", reportFormat);
    const blob = new Blob([contents], { type: reportFormat === "json" ? "application/json" : "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `forensic-case-report.${reportFormat === "json" ? "json" : "md"}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus(`Exported forensic case report as ${reportFormat.toUpperCase()}.`);
  };

  const saveCase = async () => {
    if (!supabaseClient || !session?.user) {
      setError("Sign in with Supabase before saving a forensic case.");
      document.querySelector<HTMLElement>(".ap-auth-trigger")?.click();
      return;
    }
    setBusy(true); setError(""); setStatus("");
    try {
      const report = createReport(result, activeCase || "Unlabeled case", "markdown");
      const evidenceHash = result.evidence.length
        ? Array.from(new Uint8Array(await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(result.evidence.map(item => item.sha256).sort().join(":"))
        )), byte => byte.toString(16).padStart(2, "0")).join("")
        : null;
      const existing = savedCases.find(item => item.case_name === (activeCase || "Unlabeled case"));
      const payload = {
        user_id: session.user.id,
        case_name: activeCase || "Unlabeled case",
        evidence_hash: evidenceHash,
        timeline_data: result,
        ioc_findings: indicators,
        report_markdown: report,
        updated_at: new Date().toISOString()
      };
      const query = existing
        ? supabaseClient.from("forensic_cases").update(payload).eq("id", existing.id).eq("user_id", session.user.id)
        : supabaseClient.from("forensic_cases").insert(payload);
      const { error: saveError } = await query;
      if (saveError) throw saveError;
      await loadSavedCases();
      setStatus(`Saved forensic case "${payload.case_name}" to your Supabase account.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this forensic case.");
    } finally {
      setBusy(false);
    }
  };

  const openSavedCase = (caseId: string) => {
    setSelectedSavedCase(caseId);
    const saved = savedCases.find(item => item.id === caseId);
    if (!saved) return;
    setActiveCase(saved.case_name);
    setResult(saved.timeline_data);
    setStatus(`Loaded saved forensic case "${saved.case_name}". Evidence file bytes are not stored in the cloud.`);
    setError("");
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setTechniqueFilter("");
    setSeverityFilter("");
    setFromDate("");
    setToDate("");
  };

  return <section className="forensics-page">
    <div className="page-heading forensic-heading">
      <div><span className="eyebrow"><Fingerprint size={14}/> DIGITAL FORENSICS · CLIENT-SIDE TRIAGE</span><h1>DFIR Log & Artifact Analyzer</h1><p>Inspect local evidence, correlate artifacts, and preserve file hashes in your case report.</p></div>
      <div className="forensic-heading-actions">
        <label className="sample-select"><Database size={15}/><span className="visually-hidden">Load a sample case</span>
          <select value="" onChange={event => loadCase(event.target.value)} aria-label="Load sample case">
            <option value="">Load Sample Case</option>
            {sampleCases.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select><ChevronDown size={14}/>
        </label>
        <select className="forensic-format" value={reportFormat} onChange={event => setReportFormat(event.target.value as ReportFormat)} aria-label="Report format">
          <option value="json">JSON report</option><option value="markdown">Markdown report</option>
        </select>
        <button className="btn secondary report-button" type="button" disabled={busy} onClick={() => void saveCase()}><Save size={15}/>Save case</button>
        <label className="forensic-format ap-forensic-history"><History size={14}/><select aria-label="Load saved forensic case" value={selectedSavedCase} onChange={event => openSavedCase(event.target.value)}><option value="">{user ? "Saved cases" : "Sign in for cases"}</option>{savedCases.map(item => <option key={item.id} value={item.id}>{item.case_name} · {new Date(item.updated_at).toLocaleDateString()}</option>)}</select></label>
        <button className="btn primary report-button" onClick={exportReport}><ArrowDownToLine size={16}/>Export Forensic Case Report</button>
      </div>
    </div>

    <div className="forensic-disclaimer"><ShieldCheck size={15}/><span>Evidence stays in this browser session. SHA-256 is the primary integrity digest; MD5 is included for legacy comparison only and is collision-prone. This triage tool does not replace forensic acquisition, validated parsers, or documented chain of custody.</span></div>

    <div className={`forensic-dropzone${dragging ? " dragging" : ""}`} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); void ingestFiles(Array.from(event.dataTransfer.files)); }}>
      <input ref={inputRef} type="file" multiple hidden accept=".evtx,.xml,.csv,.tsv,.json,.jsonl,.log,.txt,.dmp,.mem" onChange={event => void ingestFiles(Array.from(event.target.files ?? []))} aria-label="Choose evidence files" />
      <div className="drop-icon"><Upload size={21}/></div><div><strong>Drop forensic evidence to begin triage</strong><p>Memory snippets · EVTX XML/CSV exports · JSON/CSV logs · PCAP metadata · Disk timelines</p><small>All parsing and hashing runs locally. Native binary EVTX is hashed; export it as XML/CSV for event parsing.</small></div>
      <button className="btn secondary" onClick={() => inputRef.current?.click()} disabled={busy}>{busy ? <Activity size={15} className="forensic-spin"/> : <FileSearch size={15}/>} {busy ? "Analyzing…" : "Browse evidence"}</button>
    </div>
    {(status || error) && <div className={error ? "forensic-status is-error" : "forensic-status"} role={error ? "alert" : "status"}>{error ? <CircleAlert size={16}/> : <Check size={16}/>}<span>{error || status}</span><button className="status-dismiss" onClick={() => { setStatus(""); setError(""); }} aria-label="Dismiss message"><X size={14}/></button></div>}

    <div className="forensic-stats">
      <div className="forensic-stat"><span>EVENTS IN CASE</span><strong>{result.events.length.toLocaleString()}</strong><small>Showing {filteredEvents.length.toLocaleString()} after filters</small></div>
      <div className="forensic-stat"><span>CRITICAL / HIGH</span><strong className="stat-alert">{counts.critical} <i>/</i> {counts.high}</strong><small>Priority findings</small></div>
      <div className="forensic-stat"><span>MITRE TECHNIQUES</span><strong>{counts.techniques.toString().padStart(2, "0")}</strong><small>Unique ATT&CK mappings</small></div>
      <div className="forensic-stat"><span>NETWORK FLAGS</span><strong className="stat-cyan">{counts.suspicious.toString().padStart(2, "0")}</strong><small>Suspicious flows / DNS indicators</small></div>
    </div>

    <section className="forensic-workspace">
      <div className="forensic-toolbar">
        <div className="forensic-panel-tabs" role="tablist" aria-label="Forensic analysis views">
          {([
            ["timeline", "Super-timeline", Clock3], ["memory", "Memory", Database], ["network", "Network", Network], ["evidence", "Evidence & hashes", FileArchive],
          ] as const).map(([id, label, Icon]) => <button key={id} role="tab" aria-selected={panel === id} className={panel === id ? "forensic-tab active" : "forensic-tab"} onClick={() => setPanel(id)}><Icon size={15}/>{label}{id === "evidence" && result.evidence.length > 0 && <span className="tab-count">{result.evidence.length}</span>}</button>)}
        </div>
        <span className="case-active"><span className="online-dot"/>{activeCase || "No case loaded"}</span>
      </div>

      {panel === "timeline" && <>
        <div className="forensic-filters">
          <label className="forensic-search"><Search size={15}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search artifacts, IOCs, source…" aria-label="Search forensic artifacts"/></label>
          <select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} aria-label="Filter artifact category"><option value="">All artifact categories</option>{categories.map(category => <option key={category}>{category}</option>)}</select>
          <select value={techniqueFilter} onChange={event => setTechniqueFilter(event.target.value)} aria-label="Filter MITRE technique"><option value="">All MITRE techniques</option>{techniques.map(technique => <option key={technique}>{technique}</option>)}</select>
          <select value={severityFilter} onChange={event => setSeverityFilter(event.target.value)} aria-label="Filter severity"><option value="">All severities</option>{(["Critical", "High", "Medium", "Low"] as Severity[]).map(severity => <option key={severity}>{severity}</option>)}</select>
          <label className="date-filter"><CalendarDays size={14}/><input type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} aria-label="From date"/></label>
          <label className="date-filter"><span>TO</span><input type="date" value={toDate} onChange={event => setToDate(event.target.value)} aria-label="To date"/></label>
          {(search || categoryFilter || techniqueFilter || severityFilter || fromDate || toDate) && <button className="clear-filter" onClick={clearFilters}>Clear filters</button>}
        </div>
        <div className="forensic-timeline" role="tabpanel">
          <div className="timeline-label"><span>CHRONOLOGICAL EVENT VIEW</span><span>{filteredEvents.length} EVENTS · MACB timestamps expanded when available</span></div>
          {filteredEvents.length ? <div className="timeline-list">{filteredEvents.map(item => <article className="timeline-event" key={item.id}>
            <div className="timeline-time"><time dateTime={item.timestamp}>{new Date(item.timestamp).toLocaleString()}</time><span>{item.source}</span></div>
            <span className={`timeline-node severity-node-${item.severity.toLowerCase()}`} aria-hidden="true"/>
            <div className="timeline-card"><div className="timeline-card-top"><div><SeverityTag severity={item.severity}/><span className="event-category">{item.category}</span>{item.eventId && <span className="event-id">EVT {item.eventId}</span>}</div>{item.technique && <span className="mitre-tag">{item.technique}</span>}</div><h3>{item.title}</h3><p>{item.details}</p>{item.iocs.length > 0 && <div className="ioc-list">{item.iocs.map(ioc => <code key={ioc}>{ioc}</code>)}</div>}</div>
          </article>)}</div> : <div className="forensic-empty"><FileSearch size={24}/><strong>No timeline artifacts match</strong><span>Load a sample case or ingest evidence, then adjust your filters.</span></div>}
        </div>
      </>}

      {panel === "memory" && <div className="artifact-panel" role="tabpanel">
        <div className="artifact-panel-heading"><div><span className="eyebrow">VOLATILITY-STYLE TRIAGE · SIMULATED VIEW</span><h2>Memory artifacts</h2></div><span className="simulator-tag"><Activity size={13}/> Artifact inspection simulator</span></div>
        <div className="memory-summary"><div><strong>{result.processes.length}</strong><span>PROCESSES</span></div><div><strong>{result.processes.filter(process => process.suspicious).length}</strong><span>SUSPICIOUS</span></div><div><strong>{result.events.filter(item => item.category === "Memory" && item.severity === "Critical").length}</strong><span>INJECTION FLAGS</span></div><div><strong>{result.network.filter(flow => flow.suspicious).length}</strong><span>ROGUE SOCKETS</span></div></div>
        {result.processes.length ? <div className="artifact-table-wrap"><table className="forensic-table"><thead><tr><th>PROCESS / PID</th><th>PPID</th><th>USER</th><th>ARTIFACT DETAIL</th><th>STATUS</th></tr></thead><tbody>{result.processes.map(process => <tr key={`${process.pid}-${process.name}`}><td><strong>{process.name}</strong><small>PID {process.pid}</small></td><td className="mono-cell">{process.ppid}</td><td>{process.user}</td><td className="detail-cell">{process.detail}</td><td>{process.suspicious ? <span className="flag-label"><AlertTriangle size={12}/> REVIEW</span> : <span className="clean-label"><Check size={12}/> BASELINE</span>}</td></tr>)}</tbody></table></div> : <div className="forensic-empty"><Database size={24}/><strong>No process artifacts parsed</strong><span>Load a sample case or import process-rich memory/log evidence.</span></div>}
        <h3 className="subsection-title">Injection & hidden module indicators</h3>
        {result.events.filter(item => item.category === "Memory").length ? result.events.filter(item => item.category === "Memory").map(item => <div className="finding-row" key={item.id}><SeverityTag severity={item.severity}/><span><strong>{item.title}</strong><small>{item.details}</small></span>{item.technique && <span className="mitre-tag">{item.technique}</span>}</div>) : <p className="muted-note">No explicit hidden DLL / injection indicators were parsed. A clean result is not evidence of absence.</p>}
      </div>}

      {panel === "network" && <div className="artifact-panel" role="tabpanel">
        <div className="artifact-panel-heading"><div><span className="eyebrow">FLOW CORRELATION · DNS · BEACONING</span><h2>Network artifact analysis</h2></div><span className="simulator-tag"><Network size={13}/> Client-side flow heuristics</span></div>
        <div className="network-indicators">{result.network.some(flow => flow.suspicious) && <div className="network-alert"><ShieldAlert size={17}/><span><strong>Suspicious outbound connections detected</strong><small>Validate destination reputation and scope from trusted threat intelligence.</small></span></div>}{result.network.some(flow => flow.dnsTunnel) && <div className="network-alert dns-alert"><AlertTriangle size={17}/><span><strong>Possible DNS tunneling indicator</strong><small>Long or high-entropy query labels are heuristic signals, not a verdict.</small></span></div>}</div>
        {beaconSummary.map(beacon => <div className="beacon-row" key={beacon.destination}><Activity size={15}/><span><strong>Possible beacon interval</strong><small>{beacon.count} connections to {beacon.destination}</small></span><b>~{beacon.seconds}s cadence</b></div>)}
        {result.network.length ? <div className="artifact-table-wrap"><table className="forensic-table"><thead><tr><th>TIMESTAMP</th><th>SOURCE</th><th>DESTINATION</th><th>PROTO</th><th>ANALYSIS</th><th>FLAG</th></tr></thead><tbody>{result.network.map((flow, index) => <tr key={`${flow.timestamp}-${flow.destination}-${index}`}><td className="mono-cell">{new Date(flow.timestamp).toLocaleString()}</td><td className="mono-cell">{flow.source}</td><td className="mono-cell">{flow.destination}</td><td>{flow.protocol}</td><td className="detail-cell">{flow.detail}</td><td>{flow.dnsTunnel ? <span className="flag-label">DNS REVIEW</span> : flow.suspicious ? <span className="flag-label">SUSPICIOUS</span> : <span className="clean-label">NORMAL</span>}</td></tr>)}</tbody></table></div> : <div className="forensic-empty"><Network size={24}/><strong>No network flows parsed</strong><span>Import PCAP metadata, connection logs, or load a sample scenario.</span></div>}
        <p className="muted-note">Flow flags are heuristic. Private, documentation, and reserved IP ranges are not independently validated against threat-intelligence feeds.</p>
      </div>}

      {panel === "evidence" && <div className="artifact-panel" role="tabpanel">
        <div className="artifact-panel-heading"><div><span className="eyebrow">CHAIN-OF-CUSTODY SUPPORT</span><h2>Evidence manifest</h2></div><span className="simulator-tag"><Fingerprint size={13}/> SHA-256 · MD5</span></div>
        <div className="hash-explainer"><ShieldCheck size={16}/><p>Hashes identify the ingested file bytes. MD5 is implemented locally because the Web Crypto API excludes MD5; SHA-256 is calculated with <code>crypto.subtle.digest</code>. Record acquisition details and custody transfers separately.</p></div>
        {result.evidence.length ? <div className="artifact-table-wrap"><table className="forensic-table evidence-table"><thead><tr><th>EVIDENCE ITEM</th><th>SIZE</th><th>PARSED</th><th>MD5</th><th>SHA-256</th></tr></thead><tbody>{result.evidence.map(item => <tr key={`${item.name}-${item.sha256}`}><td><strong>{item.name}</strong></td><td>{formatBytes(item.size)}</td><td>{item.parsed} records</td><td><code>{item.md5}</code></td><td><code>{item.sha256}</code></td></tr>)}</tbody></table></div> : <div className="forensic-empty"><FileArchive size={24}/><strong>No uploaded evidence in this case</strong><span>Sample cases contain simulated artifacts; upload files to add hash-verified evidence.</span></div>}
      </div>}
    </section>

    <section className="forensic-footer-grid">
      <div className="forensic-footer-card"><span className="eyebrow">CASE INDICATORS</span><h3>Extracted IOCs <b>{indicators.length}</b></h3>{indicators.length ? <div className="ioc-cloud">{indicators.slice(0, 14).map(indicator => <code key={indicator}>{indicator}</code>)}{indicators.length > 14 && <small>+{indicators.length - 14} more in report</small>}</div> : <p>No indicators extracted yet.</p>}</div>
      <div className="forensic-footer-card"><span className="eyebrow">ATT&CK COVERAGE</span><h3>Technique mapping <b>{techniques.length}</b></h3>{techniques.length ? <div className="technique-cloud">{techniques.map(technique => <span key={technique}>{technique}</span>)}</div> : <p>Technique IDs appear as event artifacts are identified.</p>}</div>
    </section>
  </section>;
}
