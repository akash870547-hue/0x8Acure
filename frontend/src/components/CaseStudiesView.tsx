import { useMemo, useState } from "react";
import { Search, Shield } from "lucide-react";
import caseStudyData from "../../../content/case-studies.json";

type CaseStudy = (typeof caseStudyData.cases)[number];

export function CaseStudiesView() {
  const [query, setQuery] = useState("");
  const cases = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return caseStudyData.cases;
    return caseStudyData.cases.filter((study: CaseStudy) =>
      [
        study.title,
        study.sector,
        study.scenario_background,
        ...study.facts,
        ...study.legal_issues,
        ...study.remediation,
        ...study.technical_controls
      ].join(" ").toLowerCase().includes(search)
    );
  }, [query]);

  return (
    <section className="content-page">
      <div className="page-heading">
        <span className="eyebrow">DPDP ACT · APPLIED LEARNING</span>
        <h1>Case Studies</h1>
        <p>Work through realistic privacy scenarios, identify the relevant provisions, and turn findings into evidence-backed controls.</p>
      </div>

      <div className="case-study-notice panel" role="note">
        <Shield size={18} />
        <p>{caseStudyData.legal_status_note}</p>
      </div>

      <label className="materials-search case-study-search">
        <Search size={17} />
        <span className="visually-hidden">Search case studies</span>
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search cases, sectors, provisions, or controls…" />
      </label>

      <div className="case-study-grid">
        {cases.map((study: CaseStudy) => (
          <article className="case-study-card panel" key={study.id}>
            <header className="case-study-heading">
              <span className="case-study-sector">{study.sector}</span>
              <h2>{study.title}</h2>
              <p>{study.scenario_background}</p>
            </header>

            <section className="case-study-section">
              <h3>Facts to establish</h3>
              <ul>{study.facts.map(fact => <li key={fact}>{fact}</li>)}</ul>
            </section>

            <section className="case-study-section">
              <h3>Legal issues to assess</h3>
              <ul>{study.legal_issues.map(issue => <li key={issue}>{issue}</li>)}</ul>
            </section>

            <details className="case-study-details">
              <summary>Review penalty context and response plan</summary>
              <div className="case-study-section">
                <h3>Penalty context</h3>
                <ul className="case-study-penalties">
                  {study.penalty_analysis.map((item, index) => (
                    <li key={`${study.id}-penalty-${index}`}>
                      <strong>{item[1]} — {item[2]}</strong>
                      <p>{item[3]}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="case-study-section">
                <h3>Remediation</h3>
                <ul>{study.remediation.map(action => <li key={action}>{action}</li>)}</ul>
              </div>
              <div className="case-study-section">
                <h3>Technical controls</h3>
                <div className="case-study-controls">{study.technical_controls.map(control => <span key={control}>{control}</span>)}</div>
              </div>
            </details>
          </article>
        ))}
        {!cases.length && <p className="empty-state">No case studies match that search.</p>}
      </div>
    </section>
  );
}
