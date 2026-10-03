window.DPDP_CURRICULUM = [
  {
    id:"start", level:"START", name:"Getting Started", tag:"Beginner",
    description:"DPDP framework ko zero se samjho: scope, terminology, applicability aur learning workflow.",
    lessons:[
      {id:"s1",title:"What is the DPDP Act?",sections:"Act: Section 1",body:["The Digital Personal Data Protection Act, 2023 is India’s statutory framework for processing digital personal data while recognising individuals’ rights and lawful processing needs.","The Act is Parliament-enacted law. The platform teaches the notified text and Government notifications, not private compliance opinions."],source:"Digital Personal Data Protection Act, 2023, MeitY/Gazette"},
      {id:"s2",title:"Core Vocabulary",sections:"Act: Section 2",body:["Data means a representation of information, facts, concepts, opinions or instructions suitable for communication, interpretation or processing.","Personal data means data about an individual who is identifiable by or in relation to such data.","Digital personal data means personal data in digital form.","Data Fiduciary determines the purpose and means of processing. Data Processor processes personal data on behalf of a Data Fiduciary. Data Principal is the individual to whom personal data relates.","A child is an individual who has not completed eighteen years. Consent Manager is a registered point of contact for giving, managing, reviewing and withdrawing consent."],"source":"Digital Personal Data Protection Act, 2023, Section 2"},
      {id:"s3",title:"Where the Act Applies",sections:"Act: Section 3",body:["The Act applies to processing of digital personal data within India where the personal data is collected in digital form or collected in non-digital form and subsequently digitised.","It also applies to processing outside India when connected with offering goods or services to Data Principals within India, subject to the statutory scope and exclusions.","The Act excludes personal or domestic processing and other categories specified in Section 3."],"source":"Digital Personal Data Protection Act, 2023, Section 3"}
    ]
  },
  {
    id:"principles", level:"CORE", name:"Principles of Processing", tag:"Beginner",
    description:"Notice, consent, legitimate uses, duties of fiduciaries and practical privacy-by-design decisions.",
    lessons:[
      {id:"p1",title:"Grounds for Processing",sections:"Act: Sections 4-7",body:["Section 4 sets out grounds for processing: processing must be for a lawful purpose for which the Data Principal has given consent or for certain legitimate uses.","Section 5 deals with notice before or along with a request for consent. The notice must communicate the personal data and purpose in the manner required by the Act.","Section 6 describes consent requirements. Consent must be free, specific, informed and unambiguous with clear affirmative action, and it must be as easy to withdraw as to give."],"source":"Digital Personal Data Protection Act, 2023, Sections 4-6"},
      {id:"p2",title:"Certain Legitimate Uses",sections:"Act: Section 7",body:["Section 7 specifies circumstances in which personal data may be processed without relying on consent, including statutory functions, provision of State benefits/services in specified circumstances, performance of functions under law, medical emergencies, employment-related purposes and other listed situations.","The exact statutory conditions matter. A generic business interest is not a substitute for a listed legitimate use."],"source":"Digital Personal Data Protection Act, 2023, Section 7"},
      {id:"p3",title:"General Duties of Data Fiduciary",sections:"Act: Section 8",body:["A Data Fiduciary remains responsible for complying with the Act even when a Data Processor is used.","The Act addresses reasonable security safeguards, personal-data breach handling, accuracy where relevant, erasure when the purpose is no longer served subject to retention requirements, publication of business contact information and grievance mechanisms.","Operational teams should translate each duty into an owner, control, evidence and review cycle."],"source":"Digital Personal Data Protection Act, 2023, Section 8"},
      {id:"p4",title:"Processor and Vendor Governance",sections:"Act: Section 8",body:["A Data Fiduciary may engage a Data Processor under a valid contract, but outsourcing processing does not remove the Fiduciary’s statutory responsibility.","A compliance program should map processors to purposes, categories of personal data, access, security measures, retention and incident escalation."],"source":"Digital Personal Data Protection Act, 2023, Section 8"}
    ]
  },
  {
    id:"rights", level:"CORE", name:"Data Principal Rights", tag:"Intermediate",
    description:"Access, correction, erasure, grievance redressal and nomination, with operational request handling.",
    lessons:[
      {id:"r1",title:"Right to Access Information",sections:"Act: Section 11",body:["A Data Principal has the statutory right to obtain information about personal data and processing as provided by Section 11, subject to the Act’s conditions.","The operational workflow should identify the requester, locate relevant records, apply the statutory scope and provide the response through the prescribed process."],"source":"Digital Personal Data Protection Act, 2023, Section 11"},
      {id:"r2",title:"Correction, Completion, Updating and Erasure",sections:"Act: Section 12",body:["Section 12 provides rights to correction and completion, updating and erasure of personal data, subject to the Act and applicable retention requirements.","Erasure is not an instruction to delete data regardless of legal retention. Teams must check whether retention is required by law before acting."],"source":"Digital Personal Data Protection Act, 2023, Section 12"},
      {id:"r3",title:"Grievance Redressal",sections:"Act: Section 13",body:["The Data Principal has a right to grievance redressal in relation to processing of personal data under the Act.","The Act requires the Data Fiduciary to establish an effective mechanism for grievance redressal and sets the statutory conditions for approaching the Board."],"source":"Digital Personal Data Protection Act, 2023, Section 13"},
      {id:"r4",title:"Nomination",sections:"Act: Section 14",body:["A Data Principal may nominate another individual who, in the event of death or incapacity, may exercise the rights of the Data Principal in accordance with the Act.","Product teams should treat nomination as a distinct rights workflow rather than mixing it with ordinary account recovery."],"source":"Digital Personal Data Protection Act, 2023, Section 14"},
      {id:"r5",title:"Duties of Data Principal",sections:"Act: Section 15",body:["Rights are accompanied by duties. Section 15 includes duties relating to compliance with applicable law, providing authentic information when exercising rights and not impersonating another person or suppressing material information."],"source":"Digital Personal Data Protection Act, 2023, Section 15"}
    ]
  },
  {
    id:"governance", level:"GOVERN", name:"Fiduciary Governance", tag:"Intermediate",
    description:"Accountability, Significant Data Fiduciaries and governance evidence.",
    lessons:[
      {id:"g1",title:"When Governance Becomes Significant",sections:"Act: Section 10",body:["The Central Government may notify a Data Fiduciary or class of Data Fiduciaries as Significant Data Fiduciaries based on factors specified by the Act, including volume and sensitivity of personal data processed, risk to rights, sovereignty and integrity, security of the State, risk to electoral democracy, security of the State and public order, among other factors.","The platform treats SDF status as a notified designation, not a self-assigned badge."],"source":"Digital Personal Data Protection Act, 2023, Section 10"},
      {id:"g2",title:"SDF Obligations",sections:"Act: Section 10",body:["Section 10 provides additional duties for Significant Data Fiduciaries, including appointment of a Data Protection Officer, appointment of an independent data auditor and undertaking specified assessments and audits.","A mature compliance system should connect each duty to evidence, ownership, review dates and remediation."],"source":"Digital Personal Data Protection Act, 2023, Section 10"},
      {id:"g3",title:"Data Protection Officer",sections:"Act: Section 10",body:["The Data Protection Officer is a governance contact for a Significant Data Fiduciary and has statutory responsibilities under Section 10.","Do not treat the DPO as a generic IT-security administrator. The platform separates privacy governance from technical security operations."],"source":"Digital Personal Data Protection Act, 2023, Section 10"},
      {id:"g4",title:"Data Audits and Assessments",sections:"Act: Section 10",body:["For an SDF, assessments and audits are part of the statutory governance model. Evidence should show what was assessed, when, by whom, findings, corrective actions and closure."],"source":"Digital Personal Data Protection Act, 2023, Section 10"}
    ]
  },
  {
    id:"special", level:"SPECIAL", name:"Children, Consent & Transfers", tag:"Intermediate",
    description:"Child data, consent managers and cross-border processing under the notified framework.",
    lessons:[
      {id:"c1",title:"Processing Personal Data of Children",sections:"Act: Section 9; Rules: 10-11",body:["The Act contains special requirements for processing personal data of children. A Data Fiduciary must obtain verifiable consent of the parent or lawful guardian before processing a child’s personal data, subject to the statutory framework and exemptions.","The Act restricts certain processing practices involving children, including tracking or behavioural monitoring and targeted advertising directed at children, subject to statutory exceptions."],"source":"Digital Personal Data Protection Act, 2023, Section 9; DPDP Rules, 2025"},
      {id:"c2",title:"Verifiable Consent",sections:"Rules: 10-11",body:["The Rules specify mechanisms for establishing verifiable consent for children and persons with disabilities, including circumstances involving identity and age verification of the relevant parent, guardian or individual.","The exact mechanism depends on the applicable Rule and its conditions. Training should not reduce this to a single UI checkbox."],"source":"Digital Personal Data Protection Rules, 2025, Rules 10 and 11"},
      {id:"c3",title:"Consent Manager",sections:"Act: Section 2 and Section 40; Rule 4",body:["A Consent Manager is a registered entity that enables a Data Principal to give, manage, review and withdraw consent through an accessible, transparent and interoperable platform.","Rule 4 addresses registration and obligations of Consent Managers. Its commencement is phased under Rule 1."],"source":"Digital Personal Data Protection Act, 2023; DPDP Rules, 2025, Rules 1 and 4"},
      {id:"c4",title:"Cross-Border Processing",sections:"Act: Section 16; Rules: 15",body:["The Act empowers the Central Government to restrict transfer of personal data outside India to such countries or territories as may be notified. The Rules also address restrictions and conditions concerning transfer outside India in the notified framework.","Do not teach the framework as a blanket rule that personal data can never leave India."],"source":"Digital Personal Data Protection Act, 2023, Section 16; DPDP Rules, 2025"}
    ]
  },
  {
    id:"security", level:"SECURITY", name:"Security & Breach Response", tag:"Intermediate",
    description:"Reasonable security safeguards, incident response and notification workflows.",
    lessons:[
      {id:"sec1",title:"Reasonable Security Safeguards",sections:"Act: Section 8; Rule 6",body:["The Act requires reasonable security safeguards to prevent personal data breaches. The Rules specify minimum safeguards such as appropriate technical and organisational measures, including security measures described in the notified framework.","A security program should cover access control, encryption or appropriate protection, logging, monitoring, backups, vulnerability management and incident response as appropriate to the processing environment."],"source":"Digital Personal Data Protection Act, 2023, Section 8; DPDP Rules, 2025, Rule 6"},
      {id:"sec2",title:"Personal Data Breach",sections:"Act: Section 8; Rule 7",body:["A personal data breach triggers a defined response process. The Rules specify information and communication requirements for notifying the Board and affected Data Principals in the manner and timelines prescribed by the notified framework.","Do not hard-code an old draft timeline into the product. The platform should display the current notified rule text and effective-date state."],"source":"Digital Personal Data Protection Act, 2023, Section 8; DPDP Rules, 2025, Rule 7"},
      {id:"sec3",title:"Incident Evidence",sections:"Act: Section 8; Rules: 6-7",body:["A breach workflow should preserve evidence, establish facts, identify affected systems and data, assess impact, document decisions, communicate through the applicable channel and track remediation.","The compliance evidence trail is as important as the technical containment step."],"source":"Digital Personal Data Protection Act, 2023; DPDP Rules, 2025"},
      {id:"sec4",title:"Retention and Erasure Controls",sections:"Act: Section 8; Rule 8",body:["The Rules address retention of personal data and erasure obligations in specified circumstances. Organisations should connect purpose completion to deletion or anonymisation workflows while preserving records that must lawfully be retained.","A retention schedule should identify data category, purpose, retention trigger, owner and evidence of disposal."],"source":"Digital Personal Data Protection Act, 2023, Section 8; DPDP Rules, 2025, Rule 8"}
    ]
  },
  {
    id:"state", level:"GOVERN", name:"State Processing & Exemptions", tag:"Advanced",
    description:"Government processing, exemptions, research and special statutory situations.",
    lessons:[
      {id:"e1",title:"Processing by the State",sections:"Act: Section 7; Rule 5",body:["The Act recognises certain legitimate uses connected with State functions, benefits, services, certificates, licences and permits, subject to statutory conditions.","Rule 5 provides additional detail for processing by the State and its instrumentalities in the circumstances covered by the Rules."],"source":"Digital Personal Data Protection Act, 2023, Section 7; DPDP Rules, 2025, Rule 5"},
      {id:"e2",title:"Exemptions",sections:"Act: Section 17; Rules: 12-14",body:["Section 17 provides exemptions for specified processing situations and classes, subject to conditions. The Rules prescribe details for certain exemptions and purposes.","A learner should first identify the exact statutory exemption before assuming that all compliance duties disappear."],"source":"Digital Personal Data Protection Act, 2023, Section 17; DPDP Rules, 2025"},
      {id:"e3",title:"Research and Archiving Contexts",sections:"Act: Section 17; Rules: 12-14",body:["The framework contains specific treatment for research, archiving, statistical or related purposes subject to prescribed conditions and safeguards.","The exercise is to map the purpose and conditions, not to treat the label 'research' as an automatic exemption."],"source":"Digital Personal Data Protection Act, 2023, Section 17; DPDP Rules, 2025"},
      {id:"e4",title:"Children Exemptions",sections:"Act: Section 9; Rules",body:["The Act permits the Central Government to prescribe exemptions from specified child-data obligations for certain classes of Data Fiduciaries or purposes, subject to the statutory framework.","Always check the current notified exemption and conditions before designing a child-data workflow."],"source":"Digital Personal Data Protection Act, 2023, Section 9; DPDP Rules, 2025"}
    ]
  },
  {
    id:"board", level:"ADVANCED", name:"Data Protection Board", tag:"Advanced",
    description:"Board structure, proceedings, directions, appeals and enforcement mechanics.",
    lessons:[
      {id:"b1",title:"Establishment of the Board",sections:"Act: Sections 18-20; Rules: 17-21",body:["The Act establishes the Data Protection Board of India as the statutory body for exercising powers and performing functions under the Act.","The Rules provide details concerning the Board’s composition, appointment-related processes, digital office, terms and procedural matters in the notified framework."],"source":"Digital Personal Data Protection Act, 2023; DPDP Rules, 2025, Rules 17-21"},
      {id:"b2",title:"Board Procedure",sections:"Act: Sections 27-33; Rules",body:["The Act provides for complaints, inquiries, directions and related enforcement mechanisms. The Board is designed to function through digital processes under the statutory framework.","Operational teams should distinguish an internal grievance process from a statutory Board proceeding."],"source":"Digital Personal Data Protection Act, 2023"},
      {id:"b3",title:"Appeals",sections:"Act: Section 29 and related provisions; Rule 23",body:["The Act provides an appeal mechanism against specified Board orders through the prescribed appellate forum and conditions.","The Rules provide procedural detail for appeals and related information requests in the notified framework."],"source":"Digital Personal Data Protection Act, 2023; DPDP Rules, 2025, Rule 23"},
      {id:"b4",title:"Information and Directions",sections:"Act: Sections 27-34",body:["The framework gives the Board powers to inquire into breaches and issue directions in accordance with the Act. The training focus is evidence: identify the obligation, document facts, show the response and preserve the decision trail."],"source":"Digital Personal Data Protection Act, 2023"}
    ]
  },
  {
    id:"penalties", level:"ADVANCED", name:"Penalties & Enforcement", tag:"Advanced",
    description:"Penalty schedule, aggravating evidence and compliance remediation.",
    lessons:[
      {id:"x1",title:"Penalty Architecture",sections:"Act: Section 33 and Schedule",body:["The Act provides monetary penalties for specified contraventions. The penalty schedule links contraventions to maximum amounts rather than creating a universal fine for every incident.","The correct learning method is to identify the contravention and statutory provision first, then consult the applicable penalty entry and conditions."],"source":"Digital Personal Data Protection Act, 2023, Section 33 and Schedule"},
      {id:"x2",title:"Assessing a Contravention",sections:"Act: Section 33",body:["Section 33 sets factors relevant to determining the amount of monetary penalty, including the nature, gravity and duration of the breach, type and nature of personal data affected, repetitive nature, gain or loss, mitigation and other statutory factors.","A post-mortem should therefore preserve evidence about impact, duration, recurrence, mitigation and remediation."],"source":"Digital Personal Data Protection Act, 2023, Section 33"},
      {id:"x3",title:"Remediation Evidence",sections:"Act: Section 33; Schedule",body:["Remediation should be measurable. Useful evidence can include control changes, access reviews, deletion records, security fixes, training, policy updates, incident timelines and validation results.","The platform separates legal penalty amounts from internal risk scoring so learners do not confuse the two."],"source":"Digital Personal Data Protection Act, 2023"}
    ]
  },
  {
    id:"rules", level:"RULES", name:"DPDP Rules 2025", tag:"Advanced",
    description:"Rule-by-rule operational layer: notice, consent, security, breach, retention, children, SDF, transfers and procedure.",
    lessons:[
      {id:"rr1",title:"Rules 1-2: Commencement & Definitions",sections:"Rules 1-2",body:["Rule 1 establishes phased commencement. Rules 1, 2 and 17-21 commence on publication; Rule 4 commences one year after publication; Rules 3, 5-16, 22 and 23 commence eighteen months after publication.","Rule 2 adds terms used by the Rules, including techno-legal measures, user account and verifiable consent."],"source":"DPDP Rules, 2025, Rules 1-2"},
      {id:"rr2",title:"Rule 3: Notice",sections:"Rule 3",body:["The notified Rules require notice to be clear, standalone and understandable, with itemised personal data and purposes and the prescribed access to rights, withdrawal and grievance mechanisms.","The notice is not merely a privacy-policy hyperlink. It is a consent-context communication requirement."],"source":"DPDP Rules, 2025, Rule 3"},
      {id:"rr3",title:"Rule 4: Consent Managers",sections:"Rule 4",body:["Rule 4 covers registration and obligations of Consent Managers, including eligibility, governance, interoperability and handling of consent records.","Its commencement is one year after publication of the Rules under Rule 1."],"source":"DPDP Rules, 2025, Rule 4"},
      {id:"rr4",title:"Rule 5: State Processing",sections:"Rule 5",body:["Rule 5 specifies requirements for processing by the State or its instrumentalities in the circumstances covered by the Act and Rules.","The lesson focuses on identifying the statutory purpose and the safeguards required by the applicable rule."],"source":"DPDP Rules, 2025, Rule 5"},
      {id:"rr5",title:"Rule 6: Security Safeguards",sections:"Rule 6",body:["Rule 6 sets out reasonable security safeguards and technical and organisational measures for protecting personal data.","Use the rule as the legal baseline, then map it to the organisation’s actual controls and evidence."],"source":"DPDP Rules, 2025, Rule 6"},
      {id:"rr6",title:"Rule 7: Personal Data Breach",sections:"Rule 7",body:["Rule 7 specifies breach-related notification and information requirements for the Board and affected Data Principals, subject to the rule’s prescribed process and timing.","The platform should version this content because incident playbooks must follow the notified rule currently in force."],"source":"DPDP Rules, 2025, Rule 7"},
      {id:"rr7",title:"Rule 8: Retention and Erasure",sections:"Rule 8",body:["Rule 8 addresses retention and erasure for specified classes and situations. Build retention controls around the purpose and the rule’s applicable requirements."],"source":"DPDP Rules, 2025, Rule 8"},
      {id:"rr8",title:"Rules 9-11: Contact, Rights & Verifiable Consent",sections:"Rules 9-11",body:["These rules add operational detail around contact mechanisms, Data Principal rights and verifiable consent for children and persons with disabilities.","The platform treats each request type as a separate workflow so learners can practice evidence collection and response handling."],"source":"DPDP Rules, 2025, Rules 9-11"},
      {id:"rr9",title:"Rules 12-14: Exemptions",sections:"Rules 12-14",body:["Rules 12-14 provide details for specified exemptions and purposes under the Act. The learner must map the processing purpose to the exact exemption and its conditions."],"source":"DPDP Rules, 2025, Rules 12-14"},
      {id:"rr10",title:"Rule 15: Cross-Border Processing",sections:"Rule 15",body:["Rule 15 addresses transfer of personal data outside India in the circumstances prescribed by the Central Government framework.","Do not convert this into an assumption that every international transfer is prohibited."],"source":"DPDP Rules, 2025, Rule 15"},
      {id:"rr11",title:"Rule 16: Significant Data Fiduciary",sections:"Rule 16",body:["Rule 16 adds operational requirements for Significant Data Fiduciaries, including governance and assessment-related requirements under the notified framework."],"source":"DPDP Rules, 2025, Rule 16"},
      {id:"rr12",title:"Rules 17-21: Board Framework",sections:"Rules 17-21",body:["Rules 17-21 cover the constitution and functioning of the Data Protection Board, including appointment-related and procedural matters.","These rules were placed in the immediate commencement group."],"source":"DPDP Rules, 2025, Rules 17-21"},
      {id:"rr13",title:"Rules 22-23: Information & Appeals",sections:"Rules 22-23",body:["The final rules include requirements concerning information sought by the Board and appeals/procedure under the Act.","These rules are in the eighteen-month commencement group under Rule 1."],"source":"DPDP Rules, 2025, Rules 22-23"}
    ]
  },
  {
    id:"practice", level:"LABS", name:"Compliance Practice", tag:"Hands-on",
    description:"Scenario-based investigations that combine the legal framework with operational evidence.",
    lessons:[
      {id:"l1",title:"Build a Data Inventory",sections:"Practice mapped to Act Sections 2, 4, 8",body:["For each processing activity record the Data Fiduciary, Data Processor, Data Principal category, purpose, personal-data fields, source, access, retention trigger, security controls and evidence owner.","Then challenge every field: what purpose requires it, what happens if it is not collected, and when should it be erased?"]},
      {id:"l2",title:"Review a Consent Journey",sections:"Practice mapped to Act Sections 5-6; Rule 3",body:["Inspect a hypothetical sign-up journey. Check whether notice is understandable, purposes are clear, consent is affirmative and withdrawal is as easy as giving consent.","Flag bundled or confusing consent experiences and link every finding to the relevant statutory requirement."]},
      {id:"l3",title:"Breach Tabletop",sections:"Practice mapped to Act Section 8; Rule 7",body:["Start with an incident fact pattern. Identify affected systems, data, users, processor involvement, containment, evidence, decision owners and notification actions.","The learner must distinguish confirmed facts from assumptions and produce a defensible incident timeline."]},
      {id:"l4",title:"Rights Request Desk",sections:"Practice mapped to Act Sections 11-14",body:["Handle access, correction, erasure, grievance and nomination scenarios. Identify the correct statutory workflow, evidence and escalation point.","Do not automatically delete data when a retention obligation applies."]},
      {id:"l5",title:"SDF Readiness Review",sections:"Practice mapped to Act Section 10; Rule 16",body:["Review a hypothetical organisation for SDF governance readiness: DPO, independent audit, assessment, risk evidence, processor governance and remediation tracking.","Separate legal designation from an internal risk tier."]},
      {id:"l6",title:"Penalty Post-Mortem",sections:"Practice mapped to Section 33 and Schedule",body:["Identify the contravention, relevant provision, failed control, duration, affected data, recurrence, mitigation and remediation evidence before consulting the penalty schedule.","The goal is traceability, not guessing a fine." ]}
    ]
  }
];

/* Emergency in-memory room registry. Built from the bundled curriculum, so it works without API/content fetches. */
window.DPDP_BUILD_ROOM_FALLBACK = function(){
  const curriculum = Array.isArray(window.DPDP_CURRICULUM) ? window.DPDP_CURRICULUM : [];
  const rooms = curriculum.flatMap(path => (path.modules || []).flatMap(module => (module.rooms || []).map(room => ({
    id: room.id,
    title: room.title || room.id,
    difficulty: room.difficulty || "beginner",
    estimated_minutes: room.estimated_minutes || 10,
    sections_covered: room.sections_covered || [room.sections || ""],
    learning_objectives: room.learning_objectives || room.objectives || [],
    summary: room.summary || ("Study " + (room.title || room.id) + " and apply the cited DPDP requirements."),
    cheat_sheet: room.cheat_sheet || [],
    source_pages: room.source_pages || [],
    official_text_status: "UNVERIFIED",
    statutory_theory: "Consult the complete official Act/Rules text for " + (room.sections || "the room's cited provisions") + ". This minimal offline fallback is a learning aid, not a substitute for the notified Gazette text.",
    case_study: {
      title: "Offline review scenario",
      scenario: "A team proposes personal-data processing but cannot yet show its purpose, data flow, roles or control evidence.",
      facts: ["Confirm the processing facts and source before deciding."],
      investigation_steps: ["Identify purpose and actors.", "Check the cited provision and commencement.", "Record the control owner and evidence."],
      expected_outcome: "A source-linked decision with unresolved questions clearly recorded."
    },
    operational_safeguards: {
      legal_anchor: "Rule 6 (check phased commencement)",
      status: "Offline baseline guidance only; load the full room registry for complete measures.",
      measures: [
        {id:"rule-6(a)",requirement:"Protect personal data using suitable safeguards including encryption, obfuscation, masking or virtual tokens.",implementation:"Use encryption in transit and at rest where appropriate and protect keys separately."},
        {id:"rule-6(b)",requirement:"Control access to computer resources used by the Data Fiduciary or processor.",implementation:"Apply unique identities, least privilege and access reviews."},
        {id:"rule-6(c)",requirement:"Use logs, monitoring and review to detect unauthorised access.",implementation:"Centralise access logs and investigate anomalous events."},
        {id:"rule-6(d)",requirement:"Use reasonable measures for continued processing if confidentiality, integrity or availability is compromised.",implementation:"Test backups, restoration and incident response."},
        {id:"rule-6(e)",requirement:"Retain relevant personal data, traffic data and other logs for at least one year unless another law requires otherwise.",implementation:"Protect relevant logs and document lawful retention."},
        {id:"rule-6(f)",requirement:"Include appropriate security provisions in processor contracts.",implementation:"Set security, incident, retention, audit and deletion terms."}
      ],
      additional_guidance: []
    },
    data_principal_workflow: [
      {right:"Access",provision:"Section 11",action:"Authenticate the requester, locate relevant records and preserve response evidence."},
      {right:"Correction and erasure",provision:"Section 12",action:"Verify the request, check lawful retention and record any processor action."},
      {right:"Grievance",provision:"Section 13; Rule 14",action:"Provide an effective channel; Rule 14 sets a response period no longer than 90 days when operative."},
      {right:"Appeal",provision:"Section 29; Rule 22",action:"Appeals from Board orders lie to TDSAT within 60 days, subject to applicable commencement and procedure."}
    ],
    penalty_matrix: [
      {reference:"Act Schedule, entry 1; Section 8(5)",contravention:"Failure to take reasonable security safeguards",maximum_amount:"₹250 crore"},
      {reference:"Act Schedule, entry 2; Section 8(6)",contravention:"Failure to give breach intimation",maximum_amount:"₹200 crore"},
      {reference:"Act Schedule, entry 3; Section 9",contravention:"Failure to fulfil child-data obligations",maximum_amount:"₹200 crore"},
      {reference:"Act Schedule, entry 4; Section 10",contravention:"Failure to fulfil SDF obligations",maximum_amount:"₹150 crore"},
      {reference:"Act Schedule, entry 5; Section 15",contravention:"Breach of Data Principal duties",maximum_amount:"₹10,000"},
      {reference:"Act Schedule, entry 7",contravention:"Any other provision of the Act or Rules",maximum_amount:"₹50 crore"}
    ],
    penalty_accuracy_note: "Statutory ceilings are not automatic penalties. Section 28(10) does not prescribe a fixed ₹10,000 cost for frivolous or vexatious complaints.",
    tasks: [{
      id: room.id + "-baseline",
      title: "Baseline room task",
      questions: [{
        id: room.id + "-baseline-q1",
        type: "mcq",
        prompt: "What should you use to verify the requirements in this room?",
        options: ["The cited official Act/Rules provision", "An unverified blog", "A social-media post", "An unrelated standard"],
        correct_answer: 0,
        answer: 0,
        explanation: "Use the cited official Act/Rules provision as the primary source for this learning room.",
        section_reference: room.sections || "",
        citation: {reference:room.sections || "Digital Personal Data Protection Act, 2023",source_id:"act-2023"},
        hints: [{text:"Check the cited provision in the official Gazette text."},{text:"Separate the statutory requirement from assumptions."}],
        why: "Use the cited official Act/Rules provision as the primary source for this learning room.",
        why_wrong: ["Correct: this uses the primary source.", "This is not an authoritative legal source.", "This is not an authoritative legal source.", "This does not establish the statutory requirement."]
      }]
    }]
  }))));
  return {rooms};
};
window.DPDP_SOURCE = {
  act:"https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf",
  rules:"https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025",
  actPage:"https://www.meity.gov.in/digital-personal-data-protection-act-2023",
  note:"https://www.meity.gov.in/writereaddata/files/Explanatory-Note-DPDP-Rules-2025.pdf"
};
window.DPDP_ROOM_CONTENT_FILES = Object.freeze({
  registry:new URL("content/legal-room-content.json",document.baseURI).pathname,
  tasks:new URL("content/tasks.json",document.baseURI).pathname
});


/* Three paths -> modules -> rooms/labs, with the full legal reference distributed across the three paths. */
(() => {
  const act = window.DPDP_ACT_REFERENCE?.lessons || [];
  const rules = window.DPDP_RULES_REFERENCE?.lessons || [];
  const paths = window.DPDP_CURRICULUM.slice(0, 3);

  const split3 = arr => {
    const n = Math.ceil(arr.length / 3);
    return [arr.slice(0, n), arr.slice(n, n * 2), arr.slice(n * 2)];
  };

  const [actA, actB, actC] = split3(act);
  const [ruleA, ruleB, ruleC] = split3(rules);

  const module = (id, name, tag, description, rooms) => ({
    id, name, tag, description, rooms
  });

  paths[0].modules = [
    module("start-foundations", "Foundations", "Beginner", "Start with the core DPDP concepts and scope.", paths[0].lessons.filter(x => x.id.startsWith("s"))),
    module("start-act-reference", "DPDP Act Reference", "Reference", "Official Act rooms covering the first legal-reference set.", actA),
    module("start-rules-reference", "DPDP Rules Reference", "Reference", "Official Rules rooms covering the first rules-reference set.", ruleA)
  ];

  paths[1].modules = [
    module("principles-processing", "Processing Principles", "Beginner", "Grounds, notice, consent, legitimate uses and fiduciary duties.", paths[1].lessons.filter(x => x.id.startsWith("p"))),
    module("principles-act-reference", "DPDP Act Reference", "Reference", "Official Act rooms covering the second legal-reference set.", actB),
    module("principles-rules-reference", "DPDP Rules Reference", "Reference", "Official Rules rooms covering the second rules-reference set.", ruleB)
  ];

  paths[2].modules = [
    module("rights-core", "Rights & Duties", "Intermediate", "Access, correction, erasure, grievance, nomination and Data Principal duties.", paths[2].lessons.filter(x => x.id.startsWith("r"))),
    module("rights-act-reference", "DPDP Act Reference", "Reference", "Official Act rooms covering the final legal-reference set and Schedule.", actC),
    module("rights-rules-reference", "DPDP Rules Reference", "Reference", "Official Rules rooms covering the final rules-reference set and Schedules.", ruleC)
  ];

  paths.forEach(p => delete p.lessons);
  window.DPDP_CURRICULUM = paths;
})();
