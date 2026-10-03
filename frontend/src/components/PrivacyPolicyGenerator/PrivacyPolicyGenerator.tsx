import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BadgeCheck, Check, CheckCircle2, Clipboard, Code2,
  Copy, Download, FileText, Globe2, LockKeyhole, ShieldCheck, Sparkles,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import "./PrivacyPolicyGenerator.css";

type DataKey = "email" | "phone" | "name" | "upi" | "cards" | "ip" | "cookies" | "health" | "biometrics" | "children";
type PurposeKey = "consent" | "employment" | "medical" | "subsidy" | "compliance";
type ProcessorKey = "aws" | "gcp" | "azure" | "ga4" | "mixpanel" | "razorpay" | "stripe";
type Category = "Startup / MSME" | "Regular Data Fiduciary" | "Significant Data Fiduciary";
type Deliverable = "policy" | "banner" | "pro";
type PolicyFormat = "markdown" | "html";

type FormData = {
  organization: string;
  domain: string;
  contactEmail: string;
  grievanceName: string;
  grievanceEmail: string;
  grievanceAddress: string;
  category: Category;
  data: DataKey[];
  purposes: PurposeKey[];
  processors: ProcessorKey[];
  storage: "India only" | "Global locations";
  retentionMonths: string;
  deletionWorkflow: string;
  grievanceSla: "7" | "15" | "30";
};

const initialForm: FormData = {
  organization: "",
  domain: "",
  contactEmail: "",
  grievanceName: "",
  grievanceEmail: "",
  grievanceAddress: "",
  category: "Startup / MSME",
  data: ["email", "name", "ip", "cookies"],
  purposes: ["consent"],
  processors: [],
  storage: "India only",
  retentionMonths: "24",
  deletionWorkflow: "Submit an erasure request to our privacy contact. We will verify the request, delete or irreversibly anonymise data no longer required by law, and confirm completion.",
  grievanceSla: "30",
};

const dataOptions: { key: DataKey; label: string; group: string; hint: string }[] = [
  { key: "email", label: "Email address", group: "Identifiers", hint: "Account and service communications" },
  { key: "phone", label: "Phone number", group: "Identifiers", hint: "Account verification and support" },
  { key: "name", label: "Name", group: "Identifiers", hint: "Account profile and correspondence" },
  { key: "upi", label: "UPI details", group: "Financial", hint: "Payment processing" },
  { key: "cards", label: "Payment card details", group: "Financial", hint: "Handled by the selected payment processor" },
  { key: "ip", label: "IP address", group: "Device & usage", hint: "Security, diagnostics, and service delivery" },
  { key: "cookies", label: "Cookies / device identifiers", group: "Device & usage", hint: "Preferences, analytics, or advertising" },
  { key: "health", label: "Health information", group: "Additional care", hint: "Limit collection and access to the stated purpose" },
  { key: "biometrics", label: "Biometric information", group: "Additional care", hint: "Use only where necessary and specifically disclosed" },
  { key: "children", label: "Children's personal data", group: "Additional care", hint: "Additional safeguards and parental consent may apply" },
];

const purposeOptions: { key: PurposeKey; title: string; detail: string; basis: string }[] = [
  { key: "consent", title: "Consent", detail: "Purpose-specific, informed, clear, affirmative and withdrawable", basis: "Section 6" },
  { key: "employment", title: "Employment", detail: "Employment-related purposes or safeguarding the employer from loss or liability", basis: "Section 7" },
  { key: "medical", title: "Medical emergency", detail: "Medical emergency involving a threat to life or immediate threat to health", basis: "Section 7" },
  { key: "subsidy", title: "State subsidy / benefit", detail: "Specified State benefits, services, licences, certificates or permits", basis: "Section 7" },
  { key: "compliance", title: "Legal compliance", detail: "Compliance with a legal obligation to disclose information", basis: "Section 7" },
];

const processors: { key: ProcessorKey; label: string; group: string }[] = [
  { key: "aws", label: "Amazon Web Services (AWS)", group: "Cloud hosting" },
  { key: "gcp", label: "Google Cloud Platform", group: "Cloud hosting" },
  { key: "azure", label: "Microsoft Azure", group: "Cloud hosting" },
  { key: "ga4", label: "Google Analytics 4", group: "Analytics" },
  { key: "mixpanel", label: "Mixpanel", group: "Analytics" },
  { key: "razorpay", label: "Razorpay", group: "Payments" },
  { key: "stripe", label: "Stripe", group: "Payments" },
];

const steps = [
  { title: "Business identity", subtitle: "Identity & roles", icon: Globe2 },
  { title: "Data & purposes", subtitle: "Collection & processing", icon: LockKeyhole },
  { title: "Processors", subtitle: "Vendors & transfers", icon: Code2 },
  { title: "Retention & rights", subtitle: "Lifecycle & requests", icon: ShieldCheck },
];

function toggle<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function clean(value: string): string {
  return value.trim() || "[To be completed]";
}

function makePolicy(form: FormData): string {
  const collected = dataOptions.filter((item) => form.data.includes(item.key));
  const selectedPurposes = purposeOptions.filter((item) => form.purposes.includes(item.key));
  const selectedProcessors = processors.filter((item) => form.processors.includes(item.key));
  const categories = collected.length ? collected.map((item) => `- **${item.label}:** ${item.hint}`).join("\n") : "- No categories have been selected. Complete this section before publishing.";
  const lawful = selectedPurposes.length
    ? selectedPurposes.map((item) => `- **${item.title} (${item.basis}):** ${item.detail}. We rely on this ground only when it applies to the particular processing activity.`).join("\n")
    : "- No lawful grounds have been selected. Complete this section before publishing.";
  const vendorText = selectedProcessors.length
    ? selectedProcessors.map((item) => `- ${item.label} (${item.group})`).join("\n")
    : "- No service providers have been selected. List each provider actually used before publishing.";
  const children = form.data.includes("children")
    ? "We process children's personal data only where the applicable requirements are met, including verifiable consent of a parent or lawful guardian where required. We do not knowingly undertake tracking, behavioural monitoring, or targeted advertising directed at children where prohibited by law. Our operational safeguards and age-assurance approach should be reviewed and documented before launch."
    : "We do not intend to process children's personal data through the services described here. If that changes, we will update this notice and implement the safeguards and consent requirements that apply before processing begins.";
  const transfer = form.storage === "India only"
    ? "We have indicated India-only storage for this configuration. Confirm that every processor, backup, support access path, and sub-processor actually keeps data in India before making this statement live."
    : "We may use providers that process or store personal data in locations outside India. Such transfers are subject to restrictions, conditions, or requirements notified by the Central Government under applicable law. Confirm actual locations and contractual safeguards with each provider before publishing.";
  const vendors = selectedProcessors.length
    ? `We use the following providers as configured: \n\n${vendorText}\n\nThese providers process data on our instructions or under their own applicable terms, depending on the service. We require appropriate contractual, security, and confidentiality safeguards and review sub-processor arrangements.`
    : `No providers were selected in this configuration. Before publishing, identify processors and sub-processors that can access personal data, their purpose, and their processing locations.`;

  return `# Privacy Policy

**Effective date:** ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}  
**Data Fiduciary:** ${clean(form.organization)}  
**Website / app:** ${clean(form.domain)}

## 1. About this notice

${clean(form.organization)} ("we", "us", or "our") is the Data Fiduciary for the personal data described in this notice, except where another entity determines the purpose and means of processing. The organisation category selected for this draft is **${form.category}**; this selection is informational and does not determine statutory classification. Significant Data Fiduciary status requires government notification. This notice is intended for people who use our website, app, products, or services ("you").

This notice describes our intended processing under the **Digital Personal Data Protection Act, 2023 (DPDP Act)** and the **Digital Personal Data Protection Rules, 2025**, as applicable and in force. It is a configurable drafting aid, not a legal opinion or a certification of compliance. Verify every statement against actual data flows, applicable notifications, exemptions, contracts, and the current law before publication.

## 2. Personal data we process

We process the categories selected for this configuration:

${categories}

Personal data means data about an individual who is identifiable by or in relation to that data. We aim to collect only data reasonably necessary for the disclosed purposes. Do not submit personal data that is not required for the relevant service.

## 3. Purposes and grounds for processing

We process personal data for the following purposes and grounds, as applicable to each activity:

${lawful}

Where processing is based on consent, we will provide a notice describing the personal data and purpose, seek consent through a clear affirmative action, and provide a way to withdraw consent that is as easy as giving it. Withdrawal does not affect the lawfulness of processing before withdrawal. We will stop or cause the relevant processing to stop unless continued processing is required or authorised by law.

We do not treat the Section 7 grounds as a general legitimate-interest basis. We use a Section 7 ground only when the specific statutory conditions for that ground are satisfied.

## 4. Cookies and similar technologies

${form.data.includes("cookies") ? "We use cookies or similar device identifiers for the purposes described above. Where consent is the applicable ground, non-essential analytics or marketing technologies remain off until you make a choice. You can change or withdraw your cookie choice at any time using the consent controls on our site. Essential technologies needed to provide a service you request may operate where otherwise permitted by law." : "This configuration does not indicate cookies or similar device identifiers. If we add them, we will update this notice and provide appropriate choice controls before any consent-dependent use."}

## 5. Service providers and transfers

${vendors}

${transfer}

## 6. Security, incidents, and accountability

We implement reasonable security safeguards appropriate to the personal data and processing risks, including access controls, operational procedures, and review of service providers. No transmission or storage method can be guaranteed absolutely secure. If a personal data breach occurs, we will take steps required by applicable law, including notices to affected Data Principals and the Data Protection Board of India where required by the Act and Rules.

## 7. Retention and erasure

We retain personal data for up to **${clean(form.retentionMonths)} months** after collection or for the period necessary for the disclosed purpose, whichever is appropriate to the particular data and legal requirements. Actual periods may differ by record type where required for security, dispute resolution, accounting, or another legal obligation. We periodically review whether data remains necessary and erase or anonymise it when no longer required, subject to applicable law.

${clean(form.deletionWorkflow)}

## 8. Your rights as a Data Principal

Subject to the DPDP Act and applicable Rules, you may request information about personal data being processed and processing activities, seek correction or completion of inaccurate or incomplete data, request erasure where retention is no longer necessary or required by law, raise a grievance, and nominate another individual to exercise your rights in the event of death or incapacity. You may also withdraw consent where processing relies on consent.

To exercise a right or withdraw consent, contact us using the details in Section 10. We may need to verify your identity and will respond in accordance with applicable law. You may approach the Data Protection Board of India where the statutory grievance process has not resolved your grievance, as permitted by law.

## 9. Children's personal data

${children}

## 10. Grievance officer and contact

For privacy questions, rights requests, or grievances, contact:

- **Organisation:** ${clean(form.organization)}
- **General contact:** ${clean(form.contactEmail)}
- **Grievance officer:** ${clean(form.grievanceName)}
- **Grievance email:** ${clean(form.grievanceEmail)}
- **Postal address:** ${clean(form.grievanceAddress)}

We aim to acknowledge and resolve grievances within **${form.grievanceSla} days**, subject to any shorter or otherwise applicable period prescribed by law. This operational target does not extend a statutory deadline.

## 11. Changes to this notice

We will update this notice when our processing changes or when necessary to reflect applicable law. The effective date above indicates when this version was prepared; update it when publishing a revised notice.

---

**Before publication:** replace every "[To be completed]" prompt, confirm actual purposes, data categories, providers, locations, retention schedules, and rights workflows, and have the notice reviewed for your specific service and current legal requirements.
`;
}

function makeBannerSnippet(form: FormData): string {
  const config = JSON.stringify({
    organization: form.organization.trim() || "This website",
    domain: form.domain.trim(),
  }).replace(/</g, "\\u003c");
  return `<script>
(() => {
  "use strict";
  const config = ${config};
  const key = "lexconsent-preferences-v1";
  const labels = {
    en: { title: "Your privacy choices", body: config.organization + " uses optional cookies to improve the experience. Choose what you allow. You can change your choice at any time.", analytics: "Analytics", marketing: "Marketing", functional: "Functional", accept: "Accept selected", reject: "Reject optional", settings: "Save preferences", withdraw: "Withdraw consent", language: "हिंदी", saved: "Your choice has been saved." },
    hi: { title: "आपकी गोपनीयता पसंद", body: config.organization + " अनुभव बेहतर बनाने के लिए वैकल्पिक कुकीज़ का उपयोग करता है। अपनी पसंद चुनें। आप इसे कभी भी बदल सकते हैं।", analytics: "विश्लेषण", marketing: "मार्केटिंग", functional: "कार्यात्मक", accept: "चयन स्वीकारें", reject: "वैकल्पिक अस्वीकारें", settings: "पसंद सहेजें", withdraw: "सहमति वापस लें", language: "English", saved: "आपकी पसंद सहेज ली गई है।" }
  };
  let language = "en";
  let choice = { analytics: false, marketing: false, functional: false };
  try {
    const stored = localStorage.getItem(key);
    if (stored) choice = Object.assign(choice, JSON.parse(stored));
  } catch (error) {
    console.warn("LexConsent: preferences could not be read from local storage.", error);
  }
  const style = document.createElement("style");
  style.textContent = "#lexconsent-root{position:fixed;z-index:2147483646;inset:auto 16px 16px auto;max-width:min(440px,calc(100vw - 32px));font:14px/1.5 system-ui,sans-serif;color:#132238}#lexconsent-root *{box-sizing:border-box}#lexconsent-card{background:#fff;border:1px solid #d7e0eb;border-radius:16px;padding:20px;box-shadow:0 18px 56px #10213a33}#lexconsent-card h2{font-size:18px;margin:0 0 8px}#lexconsent-card p{margin:0 0 14px;color:#43536a}#lexconsent-card .lc-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid #edf1f6}#lexconsent-card .lc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}#lexconsent-card button{font:600 13px system-ui,sans-serif;border:1px solid #bbc8d8;border-radius:8px;background:#fff;color:#132238;padding:9px 11px;cursor:pointer}#lexconsent-card button.lc-primary{background:#075e48;border-color:#075e48;color:#fff}#lexconsent-card button:focus-visible,#lexconsent-card input:focus-visible{outline:3px solid #008f72;outline-offset:2px}#lexconsent-card .lc-link{border:0;padding:5px;color:#075e48;text-decoration:underline}#lexconsent-withdraw{position:fixed;z-index:2147483645;right:16px;bottom:16px;background:#fff;color:#132238;border:1px solid #bbc8d8;border-radius:8px;padding:9px 11px;font:600 12px system-ui,sans-serif;cursor:pointer;display:none}";
  document.head.appendChild(style);
  const root = document.createElement("div");
  root.id = "lexconsent-root";
  const withdraw = document.createElement("button");
  withdraw.id = "lexconsent-withdraw";
  withdraw.type = "button";
  document.body.appendChild(withdraw);
  document.body.appendChild(root);
  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify(choice));
    } catch (error) {
      console.warn("LexConsent: preferences could not be saved to local storage.", error);
    }
    window.dispatchEvent(new CustomEvent("lexconsent:change", { detail: { ...choice } }));
    withdraw.style.display = "block";
  };
  const render = () => {
    const text = labels[language];
    root.replaceChildren();
    const card = document.createElement("section");
    card.id = "lexconsent-card";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-label", text.title);
    const title = document.createElement("h2");
    title.textContent = text.title;
    const body = document.createElement("p");
    body.textContent = text.body;
    const languageButton = document.createElement("button");
    languageButton.className = "lc-link";
    languageButton.type = "button";
    languageButton.textContent = text.language;
    languageButton.addEventListener("click", () => { language = language === "en" ? "hi" : "en"; render(); });
    card.append(title, body, languageButton);
    ["analytics", "marketing", "functional"].forEach((name) => {
      const row = document.createElement("label");
      row.className = "lc-row";
      const caption = document.createElement("span");
      caption.textContent = text[name];
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = Boolean(choice[name]);
      input.setAttribute("aria-label", text[name]);
      input.addEventListener("change", () => { choice[name] = input.checked; });
      row.append(caption, input);
      card.appendChild(row);
    });
    const actions = document.createElement("div");
    actions.className = "lc-actions";
    const makeButton = (label, primary, action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      if (primary) button.className = "lc-primary";
      button.addEventListener("click", action);
      actions.appendChild(button);
    };
    makeButton(text.accept, true, () => { save(); root.replaceChildren(); });
    makeButton(text.reject, false, () => { choice = { analytics: false, marketing: false, functional: false }; save(); root.replaceChildren(); });
    makeButton(text.settings, false, () => { save(); root.replaceChildren(); });
    card.appendChild(actions);
    root.appendChild(card);
  };
  window.lexConsent = {
    getPreferences: () => ({ ...choice }),
    open: render,
    withdraw: () => {
      choice = { analytics: false, marketing: false, functional: false };
      save();
      render();
    }
  };
  withdraw.textContent = labels[language].withdraw;
  withdraw.addEventListener("click", () => window.lexConsent.withdraw());
  let hasStoredChoice = false;
  try {
  hasStoredChoice = Boolean(localStorage.getItem(key));
  } catch (error) {
  console.warn("LexConsent: saved preference status could not be read.", error);
  }
  if (hasStoredChoice) withdraw.style.display = "block";
  else render();
})();
</script>`;
}

function markdownToHtml(markdown: string): string {
  const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ?? char);
  const paragraphs = markdown.split(/\n{2,}/).map((block) => {
    const lines = block.split("\n");
    if (lines.every((line) => /^- /.test(line))) return `<ul>${lines.map((line) => `<li>${escapeHtml(line.slice(2)).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</li>`).join("")}</ul>`;
    if (/^#{1,3} /.test(block)) {
      const level = block.match(/^#+/)?.[0].length ?? 1;
      const content = block.replace(/^#{1,3} /, "");
      return `<h${level}>${escapeHtml(content).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</h${level}>`;
    }
    if (block === "---") return "<hr>";
    return `<p>${lines.map(escapeHtml).join("<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`;
  }).join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Privacy Policy</title><style>body{font:16px/1.65 system-ui,sans-serif;max-width:820px;margin:48px auto;padding:0 24px;color:#1e293b}h1,h2,h3{line-height:1.25;color:#0f172a}h1{border-bottom:1px solid #cbd5e1;padding-bottom:12px}li{margin:.35em 0}hr{border:0;border-top:1px solid #cbd5e1;margin:30px 0}@media print{body{margin:0 auto}}</style></head><body>${paragraphs}</body></html>`;
}

export function PrivacyPolicyGenerator() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [step, setStep] = useState(0);
  const [deliverable, setDeliverable] = useState<Deliverable>("policy");
  const [format, setFormat] = useState<PolicyFormat>("markdown");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const policy = useMemo(() => makePolicy(form), [form]);
  const bannerCode = useMemo(() => makeBannerSnippet(form), [form]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFeedback("");
  };
  const updateList = (...args: ["data", DataKey] | ["purposes", PurposeKey] | ["processors", ProcessorKey]) => {
    const [key, value] = args;
    setForm((current) => {
      if (key === "data") return { ...current, data: toggle(current.data, value) };
      if (key === "purposes") return { ...current, purposes: toggle(current.purposes, value) };
      return { ...current, processors: toggle(current.processors, value) };
    });
    setFeedback("");
  };

  const validateStep = () => {
    if (step === 0) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!form.organization.trim() || !form.domain.trim() || !emailPattern.test(form.contactEmail)
        || !form.grievanceName.trim() || !emailPattern.test(form.grievanceEmail) || !form.grievanceAddress.trim()) {
        setFeedback("Enter the organisation name, website or app domain, valid contact and grievance emails, and the grievance officer's name and postal address.");
        return false;
      }
    }
    if (step === 1 && (!form.data.length || !form.purposes.length)) {
      setFeedback("Select at least one personal data category and one applicable processing ground.");
      return false;
    }
    return true;
  };
  const nextStep = () => {
    if (validateStep()) {
      setFeedback("");
      setStep((current) => Math.min(3, current + 1));
    }
  };
  const copyText = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(message);
    } catch (error) {
      console.error("Clipboard access failed.", error);
      setFeedback("Copy failed. Your browser did not grant clipboard access; select and copy the text manually.");
    }
  };
  const download = (filename: string, content: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="content-page lc-page">
      <header className="lc-heading">
        <div>
          <span className="eyebrow"><span className="online-dot" /> PRIVACY ENGINE · INDIA</span>
          <h1>LexConsent <em>AI</em></h1>
          <p>Draft a clear privacy notice and generate a consent banner, tailored to your processing setup.</p>
        </div>
        <span className="lc-local-badge"><ShieldCheck size={15} /> Drafts generated in your browser</span>
      </header>

      <nav className="lc-steps" aria-label="Policy configuration steps">
        {steps.map(({ title, subtitle, icon: Icon }, index) => (
          <button key={title} type="button" className={`lc-step${step === index ? " is-active" : ""}${step > index ? " is-done" : ""}`} onClick={() => { if (index <= step || (index === step + 1 && validateStep())) { setStep(index); setFeedback(""); } }} aria-current={step === index ? "step" : undefined}>
            <span className="lc-step-icon">{step > index ? <Check size={15} /> : <Icon size={16} />}</span>
            <span><strong>{title}</strong><small>{subtitle}</small></span>
          </button>
        ))}
      </nav>

      <div className="lc-workspace">
        <section className="lc-builder" aria-label="Policy configuration">
          <div className="lc-panel-heading">
            <span className="lc-kicker">STEP {step + 1} / 4</span>
            <h2>{steps[step].title}</h2>
            <p>{step === 0 ? "Tell people who is responsible for their data." : step === 1 ? "Describe the information you handle and why." : step === 2 ? "Identify service providers and processing locations." : "Set your retention practice and support expectations."}</p>
          </div>

          {step === 0 && <div className="lc-form-grid">
            <label className="lc-field lc-span-2">Organisation legal name<input value={form.organization} onChange={(event) => update("organization", event.target.value)} placeholder="e.g. Acme Technologies Private Limited" autoComplete="organization" /></label>
            <label className="lc-field">Website / app domain<input value={form.domain} onChange={(event) => update("domain", event.target.value)} placeholder="https://example.com" /></label>
            <label className="lc-field">Privacy contact email<input value={form.contactEmail} onChange={(event) => update("contactEmail", event.target.value)} placeholder="privacy@example.com" type="email" autoComplete="email" /></label>
            <div className="lc-field lc-span-2"><span>Organisation category</span><div className="lc-choice-row">{(["Startup / MSME", "Regular Data Fiduciary", "Significant Data Fiduciary"] as Category[]).map((item) => <label className="lc-radio" key={item}><input type="radio" name="category" checked={form.category === item} onChange={() => update("category", item)} /><span>{item}</span></label>)}</div><small>Classification does not determine legal status. SDF status is notified by the Central Government.</small></div>
            <div className="lc-fieldset lc-span-2"><strong>Grievance officer details</strong><p>Provide a contact point that Data Principals can readily access.</p><div className="lc-form-grid">
              <label className="lc-field">Officer name<input value={form.grievanceName} onChange={(event) => update("grievanceName", event.target.value)} placeholder="Full name" /></label>
              <label className="lc-field">Officer email<input value={form.grievanceEmail} onChange={(event) => update("grievanceEmail", event.target.value)} placeholder="grievance@example.com" type="email" /></label>
              <label className="lc-field lc-span-2">Postal address<textarea value={form.grievanceAddress} onChange={(event) => update("grievanceAddress", event.target.value)} rows={2} placeholder="Registered or service address" /></label>
            </div></div>
          </div>}

          {step === 1 && <div className="lc-field-stack">
            <fieldset className="lc-option-fieldset"><legend>Personal data collected</legend><p>Select only categories that your service actually collects or processes.</p><div className="lc-option-grid">{dataOptions.map((item) => <label key={item.key} className="lc-check-card"><input type="checkbox" checked={form.data.includes(item.key)} onChange={() => updateList("data", item.key)} /><span className="lc-check-copy"><b>{item.label}</b><small>{item.group} · {item.hint}</small></span></label>)}</div></fieldset>
            <fieldset className="lc-option-fieldset"><legend>Purposes and lawful grounds</legend><p>Section 7 grounds are specific statutory uses, not a general legitimate-interest basis.</p><div className="lc-purpose-list">{purposeOptions.map((item) => <label key={item.key} className="lc-purpose"><input type="checkbox" checked={form.purposes.includes(item.key)} onChange={() => updateList("purposes", item.key)} /><span><b>{item.title}</b><small>{item.detail}</small></span><em>{item.basis}</em></label>)}</div></fieldset>
          </div>}

          {step === 2 && <div className="lc-field-stack">
            <fieldset className="lc-option-fieldset"><legend>Processors and service providers</legend><p>Select vendors currently used by your website or app. Verify their contracts and sub-processors separately.</p><div className="lc-option-grid">{processors.map((item) => <label key={item.key} className="lc-check-card"><input type="checkbox" checked={form.processors.includes(item.key)} onChange={() => updateList("processors", item.key)} /><span className="lc-check-copy"><b>{item.label}</b><small>{item.group}</small></span></label>)}</div></fieldset>
            <fieldset className="lc-option-fieldset"><legend>Storage & cross-border processing</legend><p>Choose based on actual storage, backup, access, and support locations.</p><div className="lc-radio-stack">
              <label className="lc-radio-card"><input type="radio" name="storage" checked={form.storage === "India only"} onChange={() => update("storage", "India only")} /><span><b>India only</b><small>Use only if all relevant processing locations and access paths are within India.</small></span></label>
              <label className="lc-radio-card"><input type="radio" name="storage" checked={form.storage === "Global locations"} onChange={() => update("storage", "Global locations")} /><span><b>Global locations</b><small>Cross-border processing is subject to restrictions or conditions notified under applicable law.</small></span></label>
            </div></fieldset>
          </div>}

          {step === 3 && <div className="lc-field-stack">
            <label className="lc-field">Default retention period (months)<input type="number" min="1" max="600" value={form.retentionMonths} onChange={(event) => update("retentionMonths", event.target.value)} /><small>Set a practical default; different records may require different schedules.</small></label>
            <label className="lc-field">Deletion workflow<textarea rows={5} value={form.deletionWorkflow} onChange={(event) => update("deletionWorkflow", event.target.value)} /><small>Describe how requests are verified, actioned, and confirmed, including legal retention exceptions.</small></label>
            <label className="lc-field">Grievance response target<select value={form.grievanceSla} onChange={(event) => update("grievanceSla", event.target.value as FormData["grievanceSla"])}><option value="7">7 days</option><option value="15">15 days</option><option value="30">30 days</option></select><small>Operational target only; statutory timelines always take precedence.</small></label>
            <aside className="lc-callout"><BadgeCheck size={18} /><span><b>Principal rights included</b><small>Access to information, correction, completion, erasure, grievance redressal, nomination, and withdrawal of consent are reflected in the generated draft.</small></span></aside>
          </div>}

          {feedback && <p className={feedback.includes("failed") ? "lc-feedback is-error" : "lc-feedback"} role="status">{feedback}</p>}
          <div className="lc-step-actions">
            {step > 0 && <button type="button" className="btn ghost" onClick={() => { setStep((current) => current - 1); setFeedback(""); }}><ArrowLeft size={15} /> Back</button>}
            {step < 3 ? <button type="button" className="btn primary" onClick={nextStep}>Continue <ArrowRight size={15} /></button> : <button type="button" className="btn primary" onClick={() => { setDeliverable("policy"); setFeedback("Your draft is ready. Review every statement before publishing."); }}>Review deliverables <ArrowRight size={15} /></button>}
          </div>
        </section>

        <section className="lc-preview" aria-label="Live document preview">
          <div className="lc-deliverable-tabs" role="tablist" aria-label="Generated deliverables">
            <button type="button" role="tab" aria-selected={deliverable === "policy"} className={deliverable === "policy" ? "active" : ""} onClick={() => setDeliverable("policy")}><FileText size={15} /> Policy</button>
            <button type="button" role="tab" aria-selected={deliverable === "banner"} className={deliverable === "banner" ? "active" : ""} onClick={() => setDeliverable("banner")}><Code2 size={15} /> Banner</button>
            <button type="button" role="tab" aria-selected={deliverable === "pro"} className={deliverable === "pro" ? "active" : ""} onClick={() => setDeliverable("pro")}><Sparkles size={15} /> Pro</button>
          </div>

          {deliverable === "policy" && <div className="lc-deliverable-panel" role="tabpanel">
            <div className="lc-preview-toolbar"><span><span className="online-dot" /> LIVE PREVIEW</span><div className="lc-toolbar-actions">
              <div className="lc-format-toggle" role="group" aria-label="Policy view">{(["markdown", "html"] as PolicyFormat[]).map((item) => <button type="button" key={item} className={format === item ? "selected" : ""} onClick={() => setFormat(item)}>{item === "markdown" ? "Markdown" : "HTML"}</button>)}</div>
              <button type="button" className="lc-icon-action" onClick={() => void copyText(policy, "Policy copied to clipboard.")} aria-label="Copy policy markdown"><Copy size={15} /></button>
              <button type="button" className="lc-icon-action" onClick={() => download("privacy-policy.html", markdownToHtml(policy), "text/html;charset=utf-8")} aria-label="Download HTML policy"><Download size={15} /></button>
              <button type="button" className="lc-icon-action" onClick={() => window.print()} aria-label="Print policy"><FileText size={15} /></button>
            </div></div>
            <div className={`lc-document${format === "html" ? " lc-html-view" : ""}`}>
              {format === "markdown" ? <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{policy}</ReactMarkdown> : <div dangerouslySetInnerHTML={{ __html: markdownToHtml(policy).replace(/^.*?<body>/s, "").replace(/<\/body>.*$/s, "") }} />}
            </div>
            <p className="lc-legal-note"><ShieldCheck size={14} /> Drafting support only — review this notice against your real practices and current law.</p>
          </div>}

          {deliverable === "banner" && <div className="lc-deliverable-panel lc-banner-panel" role="tabpanel">
            <div className="lc-preview-toolbar"><span><span className="online-dot" /> VANILLA JS · NO DEPENDENCIES</span><button type="button" className="btn secondary lc-copy-button" onClick={() => void copyText(bannerCode, "Consent banner script copied.")}><Clipboard size={15} /> Copy script</button></div>
            <div className="lc-demo-banner"><div><strong>Your privacy choices</strong><p>{form.organization.trim() || "This website"} uses optional cookies to improve your experience. Choose what you allow.</p></div><div className="lc-demo-controls"><label><input type="checkbox" /> Analytics</label><label><input type="checkbox" /> Marketing</label><label><input type="checkbox" /> Functional</label></div><div className="lc-demo-actions"><button type="button">Reject optional</button><button type="button">Accept selected</button></div><small>English · हिंदी &nbsp; · &nbsp; Withdraw consent</small></div>
            <label className="lc-code-label">Copy-paste snippet <span>Generated from your configuration</span></label>
            <pre className="lc-code"><code>{bannerCode}</code></pre>
            <p className="lc-legal-note"><LockKeyhole size={14} /> Preferences emit a lexconsent:change event and are queryable via window.lexConsent. Connect choices to your actual tags before deployment.</p>
          </div>}

          {deliverable === "pro" && <div className="lc-deliverable-panel lc-pro-panel" role="tabpanel">
            <div className="lc-pro-art"><div className="lc-pro-mark"><Sparkles size={28} /></div><span className="lc-kicker">LEXCONSENT PRO</span><h2>Privacy ops, on autopilot.</h2><p>Stay ahead of change with a managed policy workspace.</p></div>
            <div className="lc-pro-features"><div><CheckCircle2 size={18} /><span><b>Hosted policy pages</b><small>Publish a versioned policy page with a shareable URL.</small></span></div><div><CheckCircle2 size={18} /><span><b>Rule update alerts</b><small>Track rule changes and review notices when requirements change.</small></span></div><div><CheckCircle2 size={18} /><span><b>Cookie audit integration</b><small>Inventory site cookies and align controls with your banner.</small></span></div></div>
            <button type="button" className="btn primary lc-upgrade-button" onClick={() => setUpgradeOpen(true)}><Sparkles size={16} /> Explore Pro · ₹999 / year</button>
            <small className="lc-simulation-note">Illustrative upgrade only — no payment is collected and no service is provisioned.</small>
          </div>}
        </section>
      </div>

      <footer className="lc-footer-note"><span><ShieldCheck size={16} /> Privacy-first drafting</span><span>DPDP Act, 2023 · Rules, 2025 · Tailor before use</span></footer>

      {upgradeOpen && <div className="lc-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setUpgradeOpen(false); }}>
        <section className="lc-modal" role="dialog" aria-modal="true" aria-labelledby="lc-modal-title">
          <button type="button" className="lc-modal-close" aria-label="Close upgrade dialog" onClick={() => setUpgradeOpen(false)}><X size={18} /></button>
          <span className="lc-pro-mark"><Sparkles size={24} /></span><span className="lc-kicker">PRO · ₹999 / YEAR</span><h2 id="lc-modal-title">Your privacy operations, together.</h2>
          <p>This preview simulates the upgrade flow. Production hosting, regulatory alerts, cookie audits, and payment processing are not connected yet.</p>
          <ul><li>Hosted and versioned policy pages</li><li>Change alerts for your team to review</li><li>Cookie inventory and consent audit integrations</li></ul>
          <button type="button" className="btn primary full-width" onClick={() => { setUpgradeOpen(false); setFeedback("Pro is a simulated offer. No payment was taken or service activated."); }}>Got it · continue with free</button>
        </section>
      </div>}
    </section>
  );
}
