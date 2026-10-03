import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity, AlertTriangle, ArrowUpRight, BadgeCheck, Download, FileText, Gauge,
  Shield, ShieldAlert, Sparkles,
} from "lucide-react";

type Tier = "Startup / MSME" | "Regular Data Fiduciary" | "Significant Data Fiduciary";
type Scale = "<1,000" | "10,000" | "100,000" | "1,000,000+";
type Vector = "Exposed S3 / Cloud Storage" | "SQLi / Web Application Flaw" | "Ransomware / Malicious Insider" | "Third-Party Vendor / Processor";
type DataKind = "Government identifiers" | "Financial & payment data" | "Authentication credentials" | "Health & biometric information" | "Children's / minors' data" | "Basic contact information";
type Control = "AES-256 encryption at rest" | "TLS 1.3 in transit" | "MFA on all endpoints" | "Centralized SIEM audit logs" | "Incident response playbook";

const dataKinds: { name: DataKind; detail: string; weight: number }[] = [
  { name: "Government identifiers", detail: "Aadhaar, PAN, and other government IDs", weight: 18 },
  { name: "Financial & payment data", detail: "UPI IDs, payment cards, and bank details", weight: 20 },
  { name: "Authentication credentials", detail: "Passwords, session tokens, and hashes", weight: 18 },
  { name: "Health & biometric information", detail: "Diagnostics, health records, or biometrics", weight: 18 },
  { name: "Children's / minors' data", detail: "Personal data of a child; assess Section 9", weight: 25 },
  { name: "Basic contact information", detail: "Phone numbers, email addresses, and names", weight: 8 },
];
const controlOptions: Control[] = [
  "AES-256 encryption at rest", "TLS 1.3 in transit", "MFA on all endpoints",
  "Centralized SIEM audit logs", "Incident response playbook",
];
const demos: { label: string; values: Scenario }[] = [
  { label: "Fintech UPI payment gateway leak", values: { tier: "Regular Data Fiduciary", data: ["Financial & payment data", "Government identifiers", "Basic contact information"], scale: "100,000", principalCount: 100_000, vector: "Exposed S3 / Cloud Storage", controls: ["TLS 1.3 in transit", "MFA on all endpoints", "Centralized SIEM audit logs"], contained: false } },
  { label: "EdTech minor data exposure", values: { tier: "Significant Data Fiduciary", data: ["Children's / minors' data", "Basic contact information", "Authentication credentials"], scale: "100,000", principalCount: 100_000, vector: "Third-Party Vendor / Processor", controls: ["AES-256 encryption at rest", "TLS 1.3 in transit", "Incident response playbook"], contained: false } },
  { label: "Hospital telemedicine misconfiguration", values: { tier: "Regular Data Fiduciary", data: ["Health & biometric information", "Basic contact information", "Authentication credentials"], scale: "10,000", principalCount: 10_000, vector: "Exposed S3 / Cloud Storage", controls: ["TLS 1.3 in transit", "MFA on all endpoints", "Incident response playbook"], contained: true } },
];
const scalePoints: Record<Scale, number> = { "<1,000": 4, "10,000": 10, "100,000": 16, "1,000,000+": 22 };
const vectorPoints: Record<Vector, number> = {
  "Exposed S3 / Cloud Storage": 10, "SQLi / Web Application Flaw": 14,
  "Ransomware / Malicious Insider": 17, "Third-Party Vendor / Processor": 12,
};

type Scenario = { tier: Tier; data: DataKind[]; scale: Scale; principalCount: number; vector: Vector; controls: Control[]; contained: boolean };

const initialScenario: Scenario = { tier: "Startup / MSME", data: [], scale: "<1,000", principalCount: 500, vector: "Exposed S3 / Cloud Storage", controls: [], contained: false };

function scaleForPrincipalCount(count: number): Scale {
  if (count < 1_000) return "<1,000";
  if (count < 100_000) return "10,000";
  if (count < 1_000_000) return "100,000";
  return "1,000,000+";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatCr(value: number): string {
  if (value < 1) return `₹${Math.max(1, Math.round(value * 100))} Lakhs`;
  return `₹${Number.isInteger(value) ? value : value.toFixed(1)} Crores`;
}

function makeMemo(scenario: Scenario, baseScore: number, adjustedScore: number, band: string, children: boolean, risk: { legal: number; operational: number; reputational: number }, credit: number): string {
  const data = scenario.data.length ? scenario.data.join(", ") : "No data categories selected";
  const controls = scenario.controls.length ? scenario.controls.join(", ") : "None of the listed controls confirmed";
  return `# DPDPA Breach Impact & Liability Assessment

**Prepared:** ${new Date().toLocaleDateString("en-IN")}  
**Assessment type:** Preliminary scenario estimate — not a legal opinion or penalty prediction

## Executive Summary

This tabletop assessment models a ${scenario.vector.toLowerCase()} incident affecting approximately **${scenario.principalCount.toLocaleString("en-IN")} data principals**. The organization is classified as a ${scenario.tier}. The selected data categories are: ${data}. The base severity score is **${baseScore}/100**; after any modelled mitigation credit, the adjusted score is **${adjustedScore}/100**. The illustrative penalty band is **${band}**. The estimate is subject to investigation, facts, applicable law, and the determination of the competent authority.

## Legal Issues for Counsel to Assess

- **Section 4:** Confirm a lawful purpose and applicable ground for processing each affected category; assess notice, consent, and any applicable legitimate-use basis.
- **Section 8(5):** Assess whether reasonable security safeguards were in place to prevent the personal data breach. The Schedule 1 ceiling is up to **₹250 crore** for the specified contravention; it is not an automatic fine.
- **Section 9:** ${children ? "Children's data was selected. Investigate applicable verifiable-parental-consent duties and restrictions on tracking, behavioural monitoring, or targeted advertising; the Schedule 1 ceiling for specified Section 9 contraventions is up to ₹200 crore." : "No children's data was selected. Reassess if minors' data is identified during investigation; applicable Section 9 obligations and the Schedule 1 ceiling (up to ₹200 crore for specified contraventions) would then require review."}
- **Reporting:** Notify the Data Protection Board of India without delay as applicable; prepare the prescribed follow-up information within the applicable 72-hour period, subject to current rules and any permitted extension. Separately assess CERT-In applicability and its six-hour reporting direction.

## Technical Remediation & Evidence Preservation

1. Contain the exposure, revoke affected credentials/tokens, and block attacker access; preserve logs and forensic evidence before rotation or rebuild.
2. Identify affected systems, data fields, data principals, exfiltration indicators, exposure window, and root cause; document a defensible incident timeline.
3. Validate safeguards reported as active: ${controls}. Address unconfirmed controls and rotate keys/secrets where compromise is plausible.
4. Close the entry point, test remediation, review vendor access and contracts, and monitor for abuse or recurrence.
5. Assign an incident commander, counsel, privacy lead, and communications owner; record decisions and regulator/customer notifications.

## Grievance & Data Principal Response

Provide an accessible grievance contact, explain the nature and likely consequences of the incident in plain language, describe protective steps individuals can take, and give a route to raise a complaint. Triage requests promptly, retain a response log, and coordinate required communications with counsel and the applicable regulatory process.

## Scenario & Model Notes

- Controls represented as active: ${controls}.
- Estimated affected data principals: ${scenario.principalCount.toLocaleString("en-IN")}.
- Self-contained within 72 hours: ${scenario.contained ? "Yes" : "No / not confirmed"}.
- Illustrative mitigation credit applied: ${credit}%.
- Blast-radius indicators (heuristic): legal ${risk.legal}/100, operational ${risk.operational}/100, reputational ${risk.reputational}/100.
- This tool uses a transparent educational heuristic. It does not determine statutory liability, guarantee mitigation, replace breach notification rules, or account for every fact, rule, exemption, or regulator discretion.
`;
}

function RiskBar({ label, value, tone }: { label: string; value: number; tone: "legal" | "operational" | "reputation" }) {
  return <div className="riskbar-row"><div><span>{label}</span><strong>{value}/100</strong></div><div className="riskbar-track" role="meter" aria-label={`${label} impact`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span className={`riskbar-fill ${tone}`} style={{ width: `${value}%` }}/></div></div>;
}

export function BreachEstimator() {
  const [scenario, setScenario] = useState<Scenario>(initialScenario);
  const [memoOpen, setMemoOpen] = useState(false);
  const [memo, setMemo] = useState("");
  useEffect(() => {
    if (!memoOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setMemoOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [memoOpen]);

  const assessment = useMemo(() => {
    const tierPoints = scenario.tier === "Significant Data Fiduciary" ? 10 : scenario.tier === "Regular Data Fiduciary" ? 5 : 0;
    const dataPoints = dataKinds.filter(item => scenario.data.includes(item.name)).reduce((sum, item) => sum + item.weight, 0);
    const controlCredit = scenario.controls.length * 4;
    const rawScore = 12 + dataPoints + scalePoints[scaleForPrincipalCount(scenario.principalCount)] + vectorPoints[scenario.vector] + tierPoints - controlCredit;
    const score = clamp(Math.round(rawScore), 0, 100);
    const children = scenario.data.includes("Children's / minors' data");
    const credit = scenario.contained && scenario.controls.includes("AES-256 encryption at rest") ? 40 : 0;
    const mitigatedScore = Math.round(score * (1 - credit / 100));
    const risk = {
      legal: clamp(Math.round(mitigatedScore * (children ? 1 : 0.82) + (children ? 12 : 0)), 0, 100),
      operational: clamp(Math.round(mitigatedScore * 0.8 + (scenario.vector.includes("Ransomware") ? 14 : 0)), 0, 100),
      reputational: clamp(Math.round(mitigatedScore * 0.72 + (scenario.principalCount >= 1_000_000 ? 15 : 0)), 0, 100),
    };
    const upperCapCr = (score >= 45 ? 250 : 75) + (children ? (score >= 45 ? 200 : 60) : 0);
    const upper = Math.max(0.1, Math.round(upperCapCr * (mitigatedScore / 100) * 10) / 10);
    const lower = Math.max(0.05, Math.round(upper * (score >= 75 ? 0.2 : 0.08) * 20) / 20);
    const band = `${formatCr(lower)} – ${formatCr(upper)}`;
    const label = mitigatedScore >= 75 ? "CRITICAL" : mitigatedScore >= 50 ? "HIGH" : mitigatedScore >= 25 ? "ELEVATED" : "GUARDED";
    return { score, mitigatedScore, children, credit, risk, band, label };
  }, [scenario]);

  const update = <K extends keyof Scenario>(key: K, value: Scenario[K]) => setScenario(previous => ({ ...previous, [key]: value }));
  const toggle = <T extends string>(list: T[], value: T): T[] => list.includes(value) ? list.filter(item => item !== value) : [...list, value];
  const generateMemo = () => {
    setMemo(makeMemo(scenario, assessment.score, assessment.mitigatedScore, assessment.band, assessment.children, assessment.risk, assessment.credit));
    setMemoOpen(true);
  };
  const downloadMemo = () => {
    const url = URL.createObjectURL(new Blob([memo], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "dpdpa-breach-assessment.md";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <section className="content-page breach-page">
    <div className="breach-heading">
      <div className="page-heading"><span className="eyebrow"><span className="online-dot"/> INCIDENT IMPACT · INDIA DPDP ACT</span><h1>Breach Liability Calculator</h1><p>Estimate incident blast radius, reporting urgency, and illustrative statutory exposure.</p></div>
      <span className="breach-live"><Activity size={14}/> LOCAL SCENARIO MODEL</span>
    </div>
    <div className="breach-disclaimer" role="note"><AlertTriangle size={17}/><span><strong>Planning estimate only.</strong> This educational heuristic is not legal advice, a regulator assessment, or a prediction of a penalty. Statutory ceilings are maximums for specified contraventions, not automatic fines; obtain qualified counsel and verify current rules and reporting applicability.</span></div>

    <div className="demo-strip" aria-label="Load a sample scenario"><span>LOAD SCENARIO</span>{demos.map(demo => <button key={demo.label} type="button" className="btn secondary demo-button" onClick={() => setScenario(demo.values)}><Sparkles size={14}/>{demo.label}</button>)}</div>

    <div className="breach-grid">
      <div className="breach-form">
        <section className="breach-panel">
          <div className="breach-panel-title"><span className="breach-step">01</span><div><h2>Organization & incident</h2><p>Set the scenario context and estimated reach.</p></div></div>
          <label className="breach-field"><span>Organization tier</span><select value={scenario.tier} onChange={event => update("tier", event.target.value as Tier)}><option>Startup / MSME</option><option>Regular Data Fiduciary</option><option>Significant Data Fiduciary</option></select></label>
          <label className="breach-field"><span>Affected data principals</span><input className="principal-count-input" type="number" min={1} max={1_000_000_000} step={1} value={scenario.principalCount} onChange={event => { const count = Math.max(1, Math.min(1_000_000_000, Number(event.target.value) || 1)); setScenario(previous => ({ ...previous, principalCount: count, scale: scaleForPrincipalCount(count) })); }}/><small>Estimated unique people whose personal data may be affected.</small></label>
          <label className="breach-field"><span>Breach vector</span><select value={scenario.vector} onChange={event => update("vector", event.target.value as Vector)}><option>Exposed S3 / Cloud Storage</option><option>SQLi / Web Application Flaw</option><option>Ransomware / Malicious Insider</option><option>Third-Party Vendor / Processor</option></select></label>
        </section>

        <section className="breach-panel">
          <div className="breach-panel-title"><span className="breach-step">02</span><div><h2>Compromised data matrix</h2><p>Select every category known or reasonably suspected to be involved.</p></div></div>
          <div className="breach-checks">{dataKinds.map(item => <label className="breach-check" key={item.name}><input type="checkbox" checked={scenario.data.includes(item.name)} onChange={() => update("data", toggle(scenario.data, item.name))}/><span><b>{item.name}</b><small>{item.detail}</small></span>{item.name === "Children's / minors' data" && <span className="section-tag">SECTION 9</span>}</label>)}</div>
        </section>

        <section className="breach-panel">
          <div className="breach-panel-title"><span className="breach-step">03</span><div><h2>Rule 6 security controls</h2><p>Record controls verified at the time of the incident.</p></div></div>
          <div className="breach-checks control-checks">{controlOptions.map(control => <label className="breach-check" key={control}><input type="checkbox" checked={scenario.controls.includes(control)} onChange={() => update("controls", toggle(scenario.controls, control))}/><span><b>{control}</b></span><BadgeCheck size={15} className={scenario.controls.includes(control) ? "control-on" : "control-off"}/></label>)}</div>
          <label className="breach-check containment-check"><input type="checkbox" checked={scenario.contained} onChange={event => update("contained", event.target.checked)}/><span><b>Incident self-contained within 72 hours</b><small>Confirm with incident timeline and forensic evidence.</small></span></label>
          <p className="mitigation-note">The model applies up to 40% illustrative mitigation credit only when AES-256 at rest and containment within 72 hours are both selected. This is not a statutory discount.</p>
        </section>
      </div>

      <aside className="breach-results" aria-label="Risk assessment summary">
        <section className="breach-panel score-panel">
          <div className="score-top"><span>BASE SEVERITY SCORE</span><span className={`risk-status ${assessment.label.toLowerCase()}`}>{assessment.label}</span></div>
          <div className="score-reading"><strong>{assessment.score}</strong><span>/ 100</span></div>
          <div className="score-track" role="meter" aria-label="Base severity score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={assessment.score}><span style={{ width: `${assessment.score}%` }}/></div>
          {assessment.credit > 0 && <p className="credit-line"><Shield size={14}/> {assessment.credit}% modelled mitigation applied · adjusted score {assessment.mitigatedScore}</p>}
          <p className="score-footnote">Weighted scenario score from data sensitivity, scale, vector, organization tier, and selected controls.</p>
        </section>

        <section className="breach-panel penalty-panel">
          <div className="result-label"><ShieldAlert size={16}/> ILLUSTRATIVE PENALTY BAND</div>
          <strong className="penalty-band">{assessment.band}</strong>
          <div className="cap-notes"><p><span>Section 8(5) · Schedule 1</span><b>Up to ₹250 Cr</b></p><p><span>Section 9 · specified contraventions</span><b>Up to ₹200 Cr</b></p></div>
          <small>Possible contraventions may be assessed separately. The actual amount, if any, depends on facts and the authority's determination.</small>
        </section>

        <section className="breach-panel timeline-panel">
          <div className="breach-panel-title compact"><span className="timeline-icon"><Gauge size={16}/></span><div><h2>Reporting urgency</h2><p>Track parallel obligations; confirm applicability with counsel.</p></div></div>
          <div className="report-line"><span className="report-dot urgent"/><div><b>CERT-In · 6-hour rule</b><small>Report specified cyber incidents within 6 hours of noticing / being brought to notice, where the CERT-In directions apply.</small></div><strong>≤ 6H</strong></div>
          <div className="report-line"><span className="report-dot board"/><div><b>DPDP Board · without delay</b><small>Initial intimation without delay; provide prescribed details within 72 hours, subject to applicable Rules and any permitted extension.</small></div><strong>NOW</strong></div>
        </section>

        <section className="breach-panel blast-panel">
          <div className="result-label"><Activity size={16}/> BLAST RADIUS</div>
          <RiskBar label="Legal exposure" value={assessment.risk.legal} tone="legal"/>
          <RiskBar label="Operational impact" value={assessment.risk.operational} tone="operational"/>
          <RiskBar label="Reputational impact" value={assessment.risk.reputational} tone="reputation"/>
        </section>

        <button className="btn primary memo-cta" type="button" onClick={generateMemo}><FileText size={17}/>Generate Board-Ready Compliance Memo</button>
        <a className="audit-cta" href="mailto:?subject=DPDPA%20%26%20VAPT%20Security%20Audit"><span><b>Book a Formal DPDPA & VAPT Security Audit</b><small>Opens an email draft to share with your DPDPA/VAPT security advisor.</small></span><ArrowUpRight size={18}/></a>
      </aside>
    </div>

    {memoOpen && createPortal(<div className="memo-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setMemoOpen(false); }}><section className="memo-dialog" role="dialog" aria-modal="true" aria-labelledby="memo-title"><div className="memo-head"><div><span className="eyebrow">EXECUTIVE BRIEF · MARKDOWN</span><h2 id="memo-title">Board-Ready Compliance Memo</h2></div><button type="button" className="icon-button" onClick={() => setMemoOpen(false)} aria-label="Close memo">×</button></div><textarea aria-label="Generated compliance memo" readOnly value={memo}/><div className="memo-actions"><button type="button" className="btn secondary" onClick={downloadMemo}><Download size={15}/>Download Markdown</button><button type="button" className="btn primary" onClick={() => window.print()}>Print / Save as PDF</button></div></section></div>, document.body)}
  </section>;
}
