import { useMemo, useState } from "react";
import { Activity, ArrowDownToLine, BadgeCheck, Check, Clipboard, LockKeyhole, ShieldAlert, ShieldCheck, Sparkles, X } from "lucide-react";

type AuditKey = "camera" | "location" | "contacts" | "admob" | "firebase" | "analytics";
type AppCategory = "Commerce" | "Finance" | "Health" | "Education" | "Social" | "Productivity" | "Other";

const auditItems: { id: AuditKey; label: string; group: string; risk: number; disclosure: string }[] = [
  { id: "camera", label: "Camera", group: "Device permission", risk: 8, disclosure: "Camera access, when enabled, is used only for the feature you request." },
  { id: "location", label: "Location", group: "Device permission", risk: 16, disclosure: "Approximate or precise location may be used to provide location-based features." },
  { id: "contacts", label: "Contacts", group: "Device permission", risk: 14, disclosure: "Contacts are accessed only when you choose a contact-dependent feature." },
  { id: "admob", label: "AdMob advertising", group: "Advertising SDK", risk: 18, disclosure: "Advertising partners may process device identifiers and ad interaction data." },
  { id: "firebase", label: "Firebase services", group: "Cloud / analytics SDK", risk: 12, disclosure: "Firebase services may process diagnostic, usage, and device data to operate the app." },
  { id: "analytics", label: "Analytics SDK", group: "Analytics", risk: 14, disclosure: "Analytics data is used to understand product usage and improve the service." },
];

const categoryRisk: Record<AppCategory, number> = {
  Commerce: 8, Finance: 18, Health: 20, Education: 14, Social: 16, Productivity: 8, Other: 5,
};

function downloadFile(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AppComplianceScanner() {
  const [appName, setAppName] = useState("");
  const [category, setCategory] = useState<AppCategory>("Other");
  const [selected, setSelected] = useState<AuditKey[]>([]);
  const [encrypted, setEncrypted] = useState(true);
  const [deletionPath, setDeletionPath] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const riskScore = useMemo(() => {
    const permissionRisk = auditItems.filter(item => selected.includes(item.id)).reduce((sum, item) => sum + item.risk, 0);
    return Math.max(0, Math.min(100, categoryRisk[category] + permissionRisk - (encrypted ? 8 : 0) - (deletionPath ? 5 : 0)));
  }, [category, encrypted, deletionPath, selected]);
  const selectedItems = auditItems.filter(item => selected.includes(item.id));
  const sharedWithThirdParties = selected.some(id => id === "admob" || id === "firebase" || id === "analytics");
  const collectedAnswer = selectedItems.length > 0 || category !== "Other";

  const noticeSnippet = `${appName.trim() || "This app"} processes ${selectedItems.length ? selectedItems.map(item => item.label.toLowerCase()).join(", ") : "only the data necessary to provide its core functionality"}${category !== "Other" ? ` for ${category.toLowerCase()} services` : ""}. ${selectedItems.map(item => item.disclosure).join(" ")} ${encrypted ? "Data is protected in transit using encryption." : "We are reviewing transport encryption safeguards."} You may request access, correction, erasure, or raise a grievance by contacting [privacy contact]. Data is retained only for the disclosed purpose or as required by applicable law.`;

  const report = {
    product: "StoreShield App Auditor",
    generatedAt: new Date().toISOString(),
    appName: appName.trim() || "Unnamed app",
    category,
    riskScore,
    riskBand: riskScore >= 70 ? "High" : riskScore >= 40 ? "Elevated" : "Lower",
    declaredDataAndSdkUse: selectedItems.map(({ id, label, group }) => ({ id, label, group })),
    playStoreDataSafetyDraft: {
      dataCollected: collectedAnswer ? "Yes — disclose each selected permission, SDK, and related data type." : "No declared optional data use; verify all bundled SDKs and app behavior before submission.",
      dataShared: sharedWithThirdParties ? "Potentially — review each SDK provider's current processing and sharing terms." : "No third-party sharing declared; confirm against SDK configuration and contracts.",
      encryptedInTransit: encrypted ? "Yes (developer attestation; verify implementation)." : "Not confirmed — verify transport security before submission.",
      deletionRequestMechanism: deletionPath ? "Yes (developer attestation; verify the published request path)." : "No — provide a working deletion request path if required.",
    },
    dpdpaPrivacyNoticeDraft: noticeSnippet,
    disclaimer: "Automated preliminary checklist only. Verify SDK behavior, current Play Console requirements, and applicable law before publishing.",
  };

  const toggle = (id: AuditKey) => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const exportReport = () => {
    downloadFile(`${(appName.trim() || "storeshield-app").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-privacy-audit.json`, JSON.stringify(report, null, 2), "application/json");
    setNotice("Draft questionnaire and privacy notice exported. Validate every answer against the shipped build.");
  };
  const copyNotice = async () => {
    try {
      await navigator.clipboard.writeText(noticeSnippet);
      setNotice("Privacy notice copied to clipboard.");
    } catch (error) {
      console.error("Unable to copy privacy notice.", error);
      setNotice("Clipboard access was denied. Select and copy the generated notice manually.");
    }
  };

  return <section className="content-page storeshield-page">
    <div className="page-heading store-heading">
      <div><span className="eyebrow"><ShieldCheck size={14}/> STORESHIELD · PRIVACY RELEASE GATE</span><h1>StoreShield App Auditor</h1><p>Review app permissions and SDK declarations before Play Store or web-app release.</p></div>
      <span className="store-local-badge"><LockKeyhole size={14}/> CLIENT-SIDE REVIEW</span>
    </div>

    <div className="store-disclaimer" role="note"><ShieldAlert size={17}/><span><strong>Developer checklist, not a compliance certification.</strong> Data Safety answers are drafts generated from your selections. Confirm actual collection, sharing, retention, SDK behavior, Play Console policy, and current DPDPA requirements before publication.</span></div>

    <div className="store-grid">
      <section className="store-panel store-form">
        <div className="store-panel-title"><span>01</span><div><h2>Application profile</h2><p>Describe the product and its data footprint.</p></div></div>
        <label className="store-field"><span>Application name</span><input value={appName} onChange={event => setAppName(event.target.value)} placeholder="e.g. Acme Health" maxLength={100}/></label>
        <label className="store-field"><span>App category</span><select value={category} onChange={event => setCategory(event.target.value as AppCategory)}>{(["Commerce", "Finance", "Health", "Education", "Social", "Productivity", "Other"] as AppCategory[]).map(item => <option key={item}>{item}</option>)}</select></label>

        <div className="store-panel-title store-check-title"><span>02</span><div><h2>Permissions & SDKs</h2><p>Select every capability or SDK present in the app.</p></div></div>
        <div className="store-checks">{auditItems.map(item => <label key={item.id} className="store-check">
          <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)}/>
          <span><b>{item.label}</b><small>{item.group} · risk weight {item.risk}</small></span>
        </label>)}</div>

        <div className="store-panel-title store-check-title"><span>03</span><div><h2>Privacy controls</h2><p>Confirm controls present in the release candidate.</p></div></div>
        <label className="store-check"><input type="checkbox" checked={encrypted} onChange={event => setEncrypted(event.target.checked)}/><span><b>Data encrypted in transit</b><small>Developer attestation; verify transport and SDK endpoints.</small></span></label>
        <label className="store-check"><input type="checkbox" checked={deletionPath} onChange={event => setDeletionPath(event.target.checked)}/><span><b>Data deletion request path available</b><small>Verify a working in-app or published request process.</small></span></label>
      </section>

      <aside className="store-results">
        <section className="store-panel store-score-panel">
          <div className="store-score-top"><div><span className="store-result-label"><Activity size={14}/> PRIVACY EXPOSURE SCORE</span><p>Heuristic indicator from selected category, permissions, and controls.</p></div><strong className={riskScore >= 65 ? "store-score high" : riskScore >= 35 ? "store-score medium" : "store-score low"}>{riskScore}<small>%</small></strong></div>
          <div className="store-score-track" role="meter" aria-label="Privacy exposure score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={riskScore}><span style={{ width: `${riskScore}%` }}/></div>
          <div className="store-risk-caption"><span>{riskScore >= 70 ? "HIGH REVIEW PRIORITY" : riskScore >= 40 ? "ELEVATED REVIEW" : "LOWER DECLARED EXPOSURE"}</span><span>Not a legal risk rating</span></div>
        </section>

        <section className="store-panel">
          <div className="store-panel-title"><span>04</span><div><h2>Play Store Data Safety draft</h2><p>Questionnaire outputs based on your declarations.</p></div></div>
          <dl className="store-answers">
            <div><dt>Data collected</dt><dd>{report.playStoreDataSafetyDraft.dataCollected}</dd></div>
            <div><dt>Data shared</dt><dd>{report.playStoreDataSafetyDraft.dataShared}</dd></div>
            <div><dt>Encrypted in transit</dt><dd>{report.playStoreDataSafetyDraft.encryptedInTransit}</dd></div>
            <div><dt>Deletion requests</dt><dd>{report.playStoreDataSafetyDraft.deletionRequestMechanism}</dd></div>
          </dl>
        </section>

        <section className="store-panel store-notice-panel">
          <div className="store-panel-title"><span>05</span><div><h2>DPDPA notice snippet</h2><p>Editable draft language for counsel and product review.</p></div></div>
          <blockquote>{noticeSnippet}</blockquote>
          <button type="button" className="btn secondary store-copy" onClick={() => void copyNotice()}><Clipboard size={15}/>Copy notice</button>
        </section>

        <section className="store-panel store-export-panel">
          <div className="store-panel-title"><span>06</span><div><h2>Export & extended report</h2><p>Save the questionnaire draft; optional upgrade is simulated.</p></div></div>
          <button type="button" className="btn secondary full-width" onClick={exportReport}><ArrowDownToLine size={15}/>Instant Export · JSON Draft</button>
          {unlocked ? <div className="store-unlocked"><BadgeCheck size={16}/> Full review checklist unlocked for this session.</div> : <button type="button" className="btn primary full-width store-unlock" onClick={() => setCheckoutOpen(true)}><Sparkles size={15}/>Unlock Full Report · ₹299 (demo)</button>}
          {notice && <p className="store-feedback" role="status"><Check size={14}/>{notice}</p>}
        </section>
      </aside>
    </div>

    {unlocked && <section className="store-panel store-full-report"><div className="store-panel-title"><span>+</span><div><h2>Extended release checklist</h2><p>Validate each item against production configuration and current platform rules.</p></div></div><ul>
      <li>Map every permission and SDK field to its collection purpose, recipient, retention period, and deletion behavior.</li>
      <li>Inspect Android manifest / web tags, runtime network traffic, SDK defaults, and privacy settings in release builds.</li>
      <li>Reconcile disclosures with Play Console Data Safety answers; document evidence and obtain accountable owner sign-off.</li>
      <li>Publish a clear privacy notice, grievance contact, data-principal request workflow, and applicable consent controls.</li>
    </ul></section>}

    {checkoutOpen && <div className="store-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setCheckoutOpen(false); }}>
      <section className="store-modal" role="dialog" aria-modal="true" aria-labelledby="store-modal-title">
        <button type="button" className="store-modal-close" aria-label="Close checkout dialog" onClick={() => setCheckoutOpen(false)}><X size={17}/></button>
        <span className="eyebrow">SIMULATED CHECKOUT · NO PAYMENT</span><h2 id="store-modal-title">Unlock the extended audit</h2>
        <p>This prototype does not initiate UPI or collect payment details. The ₹299 offer is a checkout simulation only.</p>
        <div className="store-demo-payment"><LockKeyhole size={18}/><span><b>UPI checkout preview</b><small>₹299 · Test flow · No transaction will be created</small></span></div>
        <button type="button" className="btn primary full-width" onClick={() => { setUnlocked(true); setCheckoutOpen(false); setNotice("Demo unlock complete. No payment was taken."); }}>Simulate instant unlock</button>
        <button type="button" className="store-cancel" onClick={() => setCheckoutOpen(false)}>Cancel</button>
      </section>
    </div>}
  </section>;
}
