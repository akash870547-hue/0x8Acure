import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import { Activity, ArrowUpRight, Calculator, Fingerprint, ShieldCheck } from "lucide-react";

const ForensicsEngine = lazy(() => import("./components/ForensicsEngine/ForensicsEngine").then(module => ({ default: module.ForensicsEngine })));
const AppComplianceScanner = lazy(() => import("./components/AppComplianceScanner").then(module => ({ default: module.AppComplianceScanner })));
const BreachEstimator = lazy(() => import("./components/BreachEstimator/BreachEstimator").then(module => ({ default: module.BreachEstimator })));
const PrivacyPolicyGenerator = lazy(() => import("./components/PrivacyPolicyGenerator/PrivacyPolicyGenerator").then(module => ({ default: module.PrivacyPolicyGenerator })));
type Tool = "forensics" | "storeshield" | "breach" | "policy-generator";

const tools: { id: Tool; label: string; icon: typeof Activity }[] = [
  { id: "forensics", label: "DFIR Log & Artifact Analyzer", icon: Fingerprint },
  { id: "storeshield", label: "StoreShield App Auditor", icon: ShieldCheck },
  { id: "breach", label: "Breach Liability Calculator", icon: Calculator },
  { id: "policy-generator", label: "LexConsent AI", icon: ShieldCheck },
];

function toolFromLocation(): Tool {
  const view = new URLSearchParams(window.location.search).get("view");
  if (view === "storeshield" || view === "compliance") return "storeshield";
  if (view === "policy-generator") return "policy-generator";
  if (view === "breach" || view === "estimator") return "breach";
  return "forensics";
}

class ModuleErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };

  static getDerivedStateFromError() {
    return { error: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("CyberLab module failed to load.", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return <section className="engine-error" role="alert">
        <h2>Workbench module unavailable</h2>
        <p>The requested tool could not be loaded. Check your connection and reload the application.</p>
        <button className="btn secondary" onClick={() => window.location.reload()}>Reload workbench</button>
      </section>;
    }
    return this.props.children;
  }
}

function App() {
  const [tool, setTool] = useState<Tool>(toolFromLocation);

  useEffect(() => {
    const handleBack = () => setTool(toolFromLocation());
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  const navigate = (next: Tool) => {
    setTool(next);
    const url = new URL(window.location.href);
    url.searchParams.set("view", next);
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <div className="app-shell cyber-workspace">
    <a className="skip-link" href="#main-content">Skip to workbench</a>
    <header className="topbar cyber-topbar">
      <a className="brand cyber-brand" href="/app/" aria-label="ForensiX CyberLab Suite">
        <span className="brand-mark">FX</span>
        <span>ForensiX<small>CYBERLAB SUITE</small></span>
      </a>
      <nav className="top-nav cyber-nav" aria-label="Security workbenches">
        {tools.map(({ id, label, icon: Icon }) => <button
          key={id}
          type="button"
          className={tool === id ? "nav-item active" : "nav-item"}
          aria-current={tool === id ? "page" : undefined}
          onClick={() => navigate(id)}
        ><Icon size={16}/>{label}</button>)}
      </nav>
      <a className="academy-link" href="/" target="_self"><ArrowUpRight size={15}/> Back to DPDP Academy</a>
    </header>
    <div className="app-layout cyber-layout">
      <aside className="sidebar cyber-sidebar">
        <div className="sidebar-label">OPERATIONAL TOOLS</div>
        {tools.map(({ id, label, icon: Icon }) => <button
          key={id}
          type="button"
          className={tool === id ? "side-item active" : "side-item"}
          aria-current={tool === id ? "page" : undefined}
          onClick={() => navigate(id)}
        ><Icon size={17}/><span>{label}</span></button>)}
        <div className="sidebar-bottom"><span className="online-dot"/> LOCAL-FIRST WORKBENCH<p>Evidence and risk assessments stay in your browser.</p><a href="/" target="_self" className="legacy-link">Back to DPDP Academy <ArrowUpRight size={13}/></a></div>
      </aside>
      <main id="main-content" className="main-content cyber-main" tabIndex={-1}>
        <div className="workbench-status"><span><Activity size={14}/> CYBER OPERATIONS · INDIA</span><span className="workbench-live"><i/> WORKBENCH READY</span></div>
        <ModuleErrorBoundary key={tool}>
          <Suspense fallback={<div className="panel content-loading" role="status">Loading security workbench…</div>}>
            {tool === "forensics" ? <ForensicsEngine/> : tool === "storeshield" ? <AppComplianceScanner/> : tool === "policy-generator" ? <PrivacyPolicyGenerator/> : <BreachEstimator/>}
          </Suspense>
        </ModuleErrorBoundary>
      </main>
    </div>
    <footer className="app-footer cyber-footer"><span>ForensiX · Digital Forensics & Automated Incident Response Engine</span><span>Authorized defensive use only.</span></footer>
  </div>;
}

export default App;
