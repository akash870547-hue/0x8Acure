import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content");
const readJson = async name => JSON.parse(await readFile(path.join(contentDir, name), "utf8"));
const writeJson = (name, value) =>
  writeFile(path.join(contentDir, name), `${JSON.stringify(value, null, 2)}\n`);

const actContext = { window: {} };
vm.runInNewContext(await readFile(path.join(root, "act-reference.js"), "utf8"), actContext);
const actLessons = actContext.window.DPDP_ACT_REFERENCE.lessons.filter(lesson => /^Section \d+:/.test(lesson.title));
if (actLessons.length !== 44) throw new Error(`Expected 44 Act provisions, found ${actLessons.length}.`);

const actSource = "act-2023";
const rulesSource = "rules-2025";
const rules = [
  ["Short title and commencement", "Establishes the Rules and their phased commencement; check Rule 1 and the commencement notification before treating an operational rule as in force."],
  ["Definitions", "Supplies meanings for the Rules; use the Act's definitions where the Rules do not define a term."],
  ["Notice given by Data Fiduciary to Data Principal", "Requires a clear, standalone notice with an itemised description of personal data, the specified purpose, the means to exercise rights and the means to complain to the Board."],
  ["Registration and obligations of Consent Manager", "Sets registration, interoperability, accountability and governance requirements for Consent Managers. Its commencement is one year after publication of the Rules."],
  ["Processing for subsidy, benefit, service, certificate, licence or permit by State", "Sets notice and safeguards for the specified State processing uses, including the applicable Second Schedule conditions."],
  ["Reasonable security safeguards", "Requires safeguards including encryption, obfuscation, masking or virtual tokens; access controls; logs, monitoring and review; continuity measures; processor-contract provisions; and retention of relevant logs and data for at least one year unless another law requires otherwise."],
  ["Intimation of personal data breach", "Requires the Data Fiduciary to inform affected Data Principals without delay and the Board without delay, followed by the prescribed detailed information within 72 hours unless the Board allows more time."],
  ["Time period for specified purpose to be deemed as no longer being served", "Sets specified inactivity periods for covered classes of Data Fiduciaries and the notice and erasure steps, subject to legal retention duties and the Third and Seventh Schedules."],
  ["Contact information for questions about processing", "Requires Data Fiduciaries and Consent Managers to publish contact information for questions about processing and rights."],
  ["Verifiable consent for processing personal data of child", "Sets measures for verifying the identity and age of a parent or lawful guardian and obtaining verifiable consent, subject to applicable exemptions."],
  ["Verifiable consent for processing personal data of person with disability who has lawful guardian", "Requires verification of the lawful guardian and the guardian's authority under applicable law."],
  ["Exemption from certain obligations for child data", "Specifies classes and conditions for exemptions from certain child-data obligations; an exemption must be established, scoped and documented."],
  ["Additional obligations of Significant Data Fiduciary", "Requires periodic Data Protection Impact Assessments and audits, reporting significant findings, and due diligence regarding algorithmic software, subject to the notified text."],
  ["Rights of Data Principals", "Requires a readily available rights mechanism, prescribed request handling, grievance redressal and publication of the response period, which cannot exceed 90 days."],
  ["Transfer of personal data outside India", "Allows transfers subject to restrictions the Central Government may specify; it is not a general localisation mandate."],
  ["Processing for research, archiving or statistical purposes", "Provides a conditional exemption where processing meets the prescribed standards, including the Second Schedule."],
  ["Appointment of Chairperson and other Members", "Provides for appointment of the Chairperson and Members of the Board."],
  ["Salary, allowances and other terms and conditions of service", "Provides service conditions for the Chairperson and Members, read with the Fifth Schedule."],
  ["Meetings of Board and authentication of its orders, directions and instruments", "Provides for Board meetings and authentication of its decisions and instruments."],
  ["Functioning of Board as digital office", "Provides for the Board's digital-office procedure and electronic proceedings."],
  ["Appointment and service conditions of officers and employees of Board", "Provides for Board officers and employees, read with the Sixth Schedule."],
  ["Appeal to Appellate Tribunal", "Provides the appeal route to the Telecom Disputes Settlement and Appellate Tribunal (TDSAT), subject to the Act and Rules."],
  ["Calling for information from Data Fiduciary or intermediary", "Enables the Board to call for information for statutory purposes, subject to limits and safeguards in the Act and Seventh Schedule."]
].map(([title, summary], index) => ({
  number: index + 1,
  id: `rule-${String(index + 1).padStart(2, "0")}`,
  title: `Rule ${index + 1}: ${title}`,
  summary,
  source_id: rulesSource
}));

const ruleStart = new Date("2025-11-13T00:00:00Z");
const asOf = new Date("2026-10-03T00:00:00Z");
const addMonths = (date, months) => {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result.toISOString().slice(0, 10);
};
const commencement = {
  effective_as_of: asOf.toISOString().slice(0, 10),
  act_notification: "S.O. 5001(E), 13 November 2025",
  rules_notification: "G.S.R. 846(E), 13 November 2025",
  act_effective_on_publication: "Sections 1(2), 2, 18-26, 35, 38-43, 44(1) and 44(3)",
  act_effective_after_one_year: "Section 6(9) and Section 27(1)(d), from 13 November 2026",
  act_effective_after_eighteen_months: "Sections 3-5, Section 6(1)-(8) and 6(10), Sections 7-17, Section 27 except 27(1)(d), Sections 28-34, 36-37 and 44(2), from 13 May 2027",
  rules_effective_on_publication: "Rules 1-2 and 17-21",
  rules_effective_after_one_year: `Rule 4, from ${addMonths(ruleStart, 12)}`,
  rules_effective_after_eighteen_months: `Rules 3, 5-16 and 22-23, from ${addMonths(ruleStart, 18)}`,
  caution: "Commencement is provision-specific. These dates are derived from the cited commencement notifications; verify subsequent Gazette amendments before operational/legal reliance."
};

const safeguards = [
  { id: "rule-6(a)", requirement: "Protect personal data using encryption, obfuscation, masking or virtual tokens mapped to personal data, as appropriate.", implementation: "Use managed encryption at rest and in transit; protect keys separately; use masking/tokenisation in non-production or analytics flows where appropriate." },
  { id: "rule-6(b)", requirement: "Use appropriate measures to control access to computer resources used by the Data Fiduciary or its Data Processor.", implementation: "Apply unique identities, least privilege, role-based access, privileged-access controls and strong authentication; review access regularly." },
  { id: "rule-6(c)", requirement: "Maintain visibility of access through logs, monitoring and review to detect unauthorised access.", implementation: "Centralise tamper-resistant audit logs, alert on anomalous access/export, retain evidence, and investigate and document alerts." },
  { id: "rule-6(d)", requirement: "Use reasonable measures to ensure continued processing where confidentiality, integrity or availability is compromised.", implementation: "Maintain tested backups, recovery objectives, incident playbooks and continuity/failover arrangements proportionate to risk." },
  { id: "rule-6(e)", requirement: "Retain relevant personal data, traffic data and other logs for at least one year unless another law requires otherwise.", implementation: "Set a protected one-year minimum for relevant security/incident records; apply longer or different periods where another law requires, and document access and disposal." },
  { id: "rule-6(f)", requirement: "Include appropriate security provisions in contracts with Data Processors.", implementation: "Specify security controls, access restrictions, incident escalation, subprocessor governance, audit evidence, retention and secure return/deletion." }
];

const rightsWorkflow = [
  { right: "Access", provision: "Section 11", action: "Authenticate the requester, locate covered personal data and processing information, apply lawful limits, and record the response." },
  { right: "Correction, completion and updating", provision: "Section 12", action: "Verify the request, correct relevant records and propagate the change to processors where required; preserve an auditable change record." },
  { right: "Erasure", provision: "Sections 8(7)-(8) and 12", action: "Erase when the statutory conditions are met, including purpose no longer being served, after checking legal retention duties and required processor deletion." },
  { right: "Grievance", provision: "Sections 13 and 27; Rule 14", action: "Provide an accessible grievance channel and publish the response period; the Rule 14 limit is no more than 90 days. The Data Principal must first use the Data Fiduciary's mechanism before approaching the Board." },
  { right: "Appeal", provision: "Section 29; Rule 22", action: "An appeal from a Board order or direction lies to TDSAT within 60 days, subject to the Act and applicable Rules. Rule 22 has phased commencement." },
  { right: "Nomination", provision: "Section 14", action: "Record and securely maintain a nominee and apply the statutory process on death or incapacity." }
];

const penaltyMatrix = [
  { reference: "Act Schedule, entry 1; Section 8(5)", contravention: "Failure to take reasonable security safeguards to prevent personal data breach", maximum_inr_crore: 250 },
  { reference: "Act Schedule, entry 2; Section 8(6)", contravention: "Failure to give intimation of a personal data breach to the Board or affected Data Principals", maximum_inr_crore: 200 },
  { reference: "Act Schedule, entry 3; Section 9", contravention: "Failure to fulfil additional obligations relating to children's personal data", maximum_inr_crore: 200 },
  { reference: "Act Schedule, entry 4; Section 10", contravention: "Failure by a Significant Data Fiduciary to fulfil additional obligations", maximum_inr_crore: 150 },
  { reference: "Act Schedule, entry 5", contravention: "Breach of a term of a voluntary undertaking accepted by the Board", maximum_inr_crore: 50 },
  { reference: "Act Schedule, entry 6", contravention: "Any other provision of the Act or Rules", maximum_inr_crore: 50 }
];
const enforcementNote = "These are statutory maxima, not preset or automatic fines. Section 33 requires the Board to consider the factors specified there. Section 28(10) permits the Board to impose costs it deems fit for a frivolous or vexatious complaint; the Act's Schedule does not prescribe a fixed ₹10,000 amount.";

const strategies = [
  {
    test: /security|breach|incident|ransomware|capstone|rule-06|rule-07|s8-5|s8-6/i,
    scenario: "A security event exposes or may expose personal data; the incident team has only partially confirmed the affected records and timeline.",
    action: "Contain the exposure, preserve logs, establish scope and timeline, assess the Rule 6 safeguards and Section 8(6)/Rule 7 notification duties, and record decisions and owners.",
    evidence: "Access and export logs, incident timeline, affected-data assessment, containment record, processor notices, and a reasoned notification decision.",
    failure: "Deleting logs after containment, assuming there is no reportable breach before investigation, or treating encryption alone as the whole safeguard program.",
    explanation: "Rule 6 lists a set of safeguards, not a single-control safe harbour. Section 8(6) and Rule 7 address breach intimation; document the facts and meet the applicable notified timing."
  },
  {
    test: /children|child|edtech|rule-10|rule-11|rule-12|fourth schedule/i,
    scenario: "A service used by people under 18 sends behavioural events to an advertising or analytics SDK while its age/guardian verification and exemption analysis are incomplete.",
    action: "Pause the non-essential tracking/advertising path, assess Section 9 and Rules 10-12, verify any applicable exemption, and implement the required verifiable-consent controls.",
    evidence: "Age/guardian verification design, consent evidence, SDK data-flow inventory, exemption analysis and tests proving tracking/advertising restrictions.",
    failure: "Treating a child’s click as verifiable parental consent or relying on an exemption without establishing its class and conditions.",
    explanation: "Section 9 has additional child-data duties, subject to statutory exemptions. Rules 10-12 and their commencement must be checked for the specific service and date."
  },
  {
    test: /consent|notice|fintech|withdrawal|dark pattern|rule-03|rule-04|consent manager/i,
    scenario: "A sign-up flow combines service-essential processing with optional marketing or analytics consent and makes refusal or withdrawal harder than acceptance.",
    action: "Separate purposes, present a compliant notice and affirmative choice, make withdrawal as easy as giving consent, and propagate withdrawal to downstream processors.",
    evidence: "Versioned notice and consent records, purpose-level preference state, withdrawal event logs, suppression tests and processor propagation evidence.",
    failure: "Bundling optional purposes into service access, using a preselected choice, or retaining a stale downstream consent state.",
    explanation: "Sections 5-6 govern notice and consent; consent must be specific and informed, and withdrawal must be as easy as giving consent. Rule 3 adds notice detail when operative."
  },
  {
    test: /rights|grievance|rule-14|erasure|retention|nomination|access/i,
    scenario: "A Data Principal submits an access, correction, erasure or grievance request, but relevant records span several systems and processors.",
    action: "Authenticate the requester, classify the right, search relevant systems, check lawful retention, coordinate processor action, respond within the published period and preserve evidence.",
    evidence: "Request receipt and identity check, system search results, retention decision, processor task evidence, response and grievance escalation timestamps.",
    failure: "Closing the request without searching processors, erasing records that must legally be retained, or making the grievance route inaccessible.",
    explanation: "Sections 11-14 define Data Principal rights. Rule 14 sets operational requirements, including a response period capped at 90 days; verify its commencement."
  },
  {
    test: /processor|vendor|bpo|outsourc/i,
    scenario: "A contracted Data Processor or subprocessor suffers an incident or uses personal data outside the documented service instructions.",
    action: "The Data Fiduciary should contain and assess the event, exercise contractual oversight, direct processor remediation and fulfil its own statutory duties.",
    evidence: "Processing contract, subprocessor register, access and incident logs, escalation timestamps, corrective-action evidence and assurance records.",
    failure: "Treating outsourcing as a transfer of the Data Fiduciary's statutory accountability or relying only on a vendor's compliance certificate.",
    explanation: "Sections 8(1)-(2) make the Data Fiduciary responsible for processing on its behalf and require a valid contract for a Data Processor."
  },
  {
    test: /significant data fiduciary|\\bsdf\\b|rule-13/i,
    scenario: "A Data Fiduciary is notified as a Significant Data Fiduciary and must demonstrate its additional governance and assurance controls.",
    action: "Confirm the notified designation, appoint the required DPO and independent auditor, conduct the prescribed impact assessment and audit, and track findings to closure.",
    evidence: "Designation notice, DPO contact, independent audit, impact assessment, Board reporting and remediation register.",
    failure: "Self-designating as an SDF based only on internal risk scoring, or assuming SDF duties apply without checking the Government notification.",
    explanation: "Section 10's enhanced duties apply to a Data Fiduciary notified as an SDF; Rule 13 supplies additional detail and has phased commencement."
  },
  {
    test: /cross.border|transfer|outside india/i,
    scenario: "A vendor proposes overseas support access or foreign-region backups, but the organisation has not mapped destinations, subprocessors or sector rules.",
    action: "Map storage, access and onward transfers, identify applicable Central Government restrictions and sectoral requirements, then document safeguards and approval.",
    evidence: "Data-flow and destination inventory, processor/subprocessor list, access logs, applicable restriction review and contract controls.",
    failure: "Assuming that all overseas transfers are prohibited or that Indian primary hosting automatically resolves every transfer question.",
    explanation: "Section 16 permits restrictions to be specified by the Central Government; it is not a blanket data-localisation rule. Check current notifications and sectoral law."
  },
  {
    test: /penalt|enforcement|schedule|board|appeal|rule-22/i,
    scenario: "A compliance review identifies a potential contravention and asks the team to state its likely penalty before establishing the facts.",
    action: "Identify the precise contravention, operative provision and commencement, gather evidence, then explain the statutory ceiling and Section 33 factors without predicting an automatic fine.",
    evidence: "Provision-to-fact analysis, commencement check, evidence inventory, mitigation/remediation record and Board-process status.",
    failure: "Quoting a maximum as the expected fine, confusing the Act's penalty Schedule with the Rules' First Schedule, or inventing a fixed frivolous-complaint amount.",
    explanation: "Section 33 and the Act's Schedule establish ceilings and assessment factors. The Board may set costs under Section 28(10); no fixed ₹10,000 amount appears in that Schedule."
  },
  {
    test: /legitimate use|section 7|employment|hr data/i,
    scenario: "An employer proposes using employee personal data for a new purpose and labels it a legitimate use without recording the facts or applicable clause.",
    action: "Test the facts against the specific Section 7 employment purpose or another listed use, limit processing to that purpose, and document necessity, access and retention.",
    evidence: "Purpose assessment, employment-policy notice, data minimisation, role-based access, retention basis and documented Section 7 analysis.",
    failure: "Treating any activity convenient to the employer as a legitimate use or using the employment clause as unlimited consent.",
    explanation: "Section 7 lists specific legitimate uses, including employment-related purposes and safeguarding the employer from loss or liability; it is not a general-purpose exemption."
  }
];
const defaultStrategy = {
  scenario: "A product or operations team proposes processing personal data but has not documented its purpose, actors, data flow or applicable provision.",
  action: "Map the activity and actors, identify the exact provision and commencement status, assess the facts, then assign a control owner and retain decision evidence.",
  evidence: "Processing inventory, purpose and data map, source-linked assessment, accountable owner and dated implementation evidence.",
  failure: "Approving on the basis of a generic policy, an assumption, or a vendor assurance without mapping the actual processing.",
  explanation: "Apply the cited provision to the facts and distinguish statutory text, Rules, implementation guidance and assumptions."
};
const questionTypes = ["scenario", "mcq", "scenario", "spot-the-violation", "mcq", "scenario"];
const additionalActSectionsByRoom = {
  "rule-01": [1, 40, 41, 43],
  "rule-02": [2],
  "rule-03": [5],
  "rule-04": [6],
  "rule-05": [7],
  "rule-06": [8],
  "rule-07": [8],
  "rule-08": [8],
  "rule-09": [8],
  "rule-10": [9],
  "rule-11": [9],
  "rule-12": [9],
  "rule-13": [10],
  "rule-14": [11, 12, 13, 14],
  "rule-15": [16],
  "rule-16": [17],
  "rule-17": [18, 19],
  "rule-18": [19],
  "rule-19": [20],
  "rule-20": [27],
  "rule-21": [21],
  "rule-22": [29],
  "rule-23": [36],
  "schedule-01": [6],
  "schedule-02": [7, 17],
  "schedule-03": [8],
  "schedule-04": [9],
  "schedule-05": [19],
  "schedule-06": [21],
  "schedule-07": [8, 36],
  "a-board": [35, 37, 39],
  "a-exemptions": [38, 44],
  "a-penalty-analysis": [32, 33, 34, 42],
  "f-penalties": [33, 42]
};

function strategyFor(room) {
  return strategies.find(item => item.test.test(`${room.id} ${room.title} ${(room.sections_covered || []).join(" ")}`)) || defaultStrategy;
}

function getNumbers(text, expression, max) {
  const found = new Set();
  for (const match of text.matchAll(expression)) {
    const start = Number(match[1]);
    const end = Number(match[2] || match[1]);
    for (let value = start; value <= Math.min(end, max); value += 1) found.add(value);
  }
  return [...found].sort((a, b) => a - b);
}

function buildQuestions(room) {
  const citationText = (room.sections_covered || []).join("; ");
  const sectionNumbers = getNumbers(citationText, /Sections?\s+(\d+)(?:\s*[-–]\s*(\d+))?/gi, 44);
  const ruleNumbers = getNumbers(citationText, /Rules?\s+(\d+)(?:\s*[-–]\s*(\d+))?/gi, 23);
  const reference = citationText || "Digital Personal Data Protection Act, 2023";
  const source_id = ruleNumbers.length && !sectionNumbers.length ? rulesSource : actSource;
  const legalAnchor = [...sectionNumbers.map(n => `Section ${n}`), ...ruleNumbers.map(n => `Rule ${n}`)].join("; ") || reference;
  const strategy = strategyFor(room);
  const scenario = room.case_study?.scenario || strategy.scenario;
  const wrong = [
    "Proceed immediately and reconstruct the legal basis only if a complaint is received.",
    "Treat a generic privacy policy or vendor certificate as sufficient evidence.",
    "Delete relevant records and logs to reduce the organisation's exposure."
  ];
  const stems = [
    `Scenario: ${scenario} What should the reviewer require first?`,
    `For ${room.title}, which evidence best demonstrates implementation of ${legalAnchor}?`,
    `Which statement is the most accurate application of ${reference} to this scenario?`,
    `The team proposes the following action for ${room.title}. Which control should the reviewer challenge?`,
    `What is the most defensible next step when facts relevant to ${reference} remain incomplete?`,
    `How should the team explain enforcement exposure relating to ${reference}?`
  ];
  const correct = [
    strategy.action,
    strategy.evidence,
    strategy.explanation,
    strategy.failure,
    "Record confirmed facts and assumptions separately, preserve evidence, assign an owner and escalate unresolved legal questions before concluding.",
    "Identify the exact contravention and applicable commencement, then describe the statutory maximum as a ceiling rather than an automatic or predicted penalty."
  ];
  const distractors = [
    wrong,
    ["A general assurance that controls exist, with no processing-specific evidence.", "An undated policy that does not identify the system, owner or provision.", "A marketing statement from a supplier."],
    ["A provision can be treated as operative without checking commencement.", "A technical standard can replace the statutory test.", "A broad statement of business need proves every legal condition."],
    ["Keep the control, document its owner and test it against real data flows.", "Test the safeguard and retain evidence of the outcome.", "Review processor implementation and escalation arrangements."],
    ["Assume the most favourable interpretation and omit the open question.", "Rely on an unverified summary without checking the cited source.", "Treat missing evidence as proof that no processing took place."],
    ["Use the highest number as the amount automatically due.", "Ignore the relevant contravention and commencement date.", "Quote a fixed ₹10,000 complaint penalty as a Schedule item."]
  ];
  const correctPositions = [1, 2, 3, 0, 2, 1];
  const hints = [
    `Read ${reference} in the notified text and check the provision's commencement.`,
    `Separate the statutory obligation from the control, evidence and unresolved assumptions.`
  ];

  return stems.map((prompt, index) => {
    const position = correctPositions[index];
    const options = [...distractors[index]];
    options.splice(position, 0, correct[index]);
    const whyWrong = options.map((_, optionIndex) => optionIndex === position
      ? "Correct: this response applies the cited provision to the stated facts and identifies a verifiable control or decision."
      : `Incorrect: this option ${index === 5 ? "overstates, misstates or fails to establish the applicable statutory consequence" : "does not establish the provision-specific control and evidence required"}.`);
    return {
      id: `${room.id}-t${index + 1}`,
      type: questionTypes[index],
      prompt,
      options,
      correct_answer: position,
      answer: position,
      explanation: `${correct[index]} ${strategy.explanation} Citation: ${reference}.`,
      citation: { reference, source_id },
      section_reference: reference,
      hints: hints.map(text => ({ text, cost: 0 })),
      points: 10,
      difficulty: room.difficulty || "intermediate",
      room_context: `Room ${room.id}: ${legalAnchor}.`,
      evidence_required: [strategy.evidence, "Dated owner decision and source/commencement record."],
      why: `${correct[index]} ${strategy.explanation}`,
      why_wrong: whyWrong
    };
  });
}

const registry = await readJson("legal-room-content.json");
const taskBank = await readJson("tasks.json");
if (!Array.isArray(registry.rooms) || registry.rooms.length !== 67) {
  throw new Error(`Expected 67 legal rooms; found ${registry.rooms?.length ?? 0}.`);
}
if (!Array.isArray(taskBank.tasks)) throw new Error("tasks.json must contain a tasks array.");

const actCatalog = actLessons.map(lesson => {
  const number = Number(lesson.title.match(/^Section (\d+):/)[1]);
  return {
  number,
  id: `section-${number}`,
  title: lesson.title,
  summary: lesson.body[0],
  source_id: actSource
  };
});
const rulesCatalog = rules;
const questions = [];

for (const room of registry.rooms) {
  const questionSet = buildQuestions(room);
  questions.push(...questionSet);
  const citations = (room.sections_covered || []).join("; ");
  const sectionNumbers = [...new Set([
    ...getNumbers(citations, /Sections?\s+(\d+)(?:\s*[-–]\s*(\d+))?/gi, 44),
    ...(additionalActSectionsByRoom[room.id] || [])
  ])].sort((a, b) => a - b);
  const ruleNumbers = getNumbers(citations, /Rules?\s+(\d+)(?:\s*[-–]\s*(\d+))?/gi, 23);
  room.act_section_ids = sectionNumbers.map(number => `section-${number}`);
  room.rule_ids = ruleNumbers.map(number => `rule-${String(number).padStart(2, "0")}`);
  room.source_ids = [...new Set([...(room.source_ids || []), ...(sectionNumbers.length ? [actSource] : []), ...(ruleNumbers.length ? [rulesSource] : [])])];
  room.statutory_reference_note = "Citations identify relevant provisions; consult the complete Gazette text and commencement status before applying them.";
  room.operational_safeguards = {
    legal_anchor: "Rule 6 (phased commencement; see the commencement panel)",
    measures: safeguards,
    additional_guidance: [
      "Use encryption in transit and at rest where appropriate; specify the protocol, key ownership and rotation in engineering standards. The Rule names technical safeguards but does not prescribe cipher suites.",
      "Use least privilege, strong authentication, access reviews and privileged-access monitoring as risk-based implementation examples, not as verbatim Rule text.",
      "Test alerting, backups, restoration, incident escalation and processor controls; retain dated test and remediation evidence."
    ],
    status: "Rule 6 notified; 18-month commencement date is 13 May 2027."
  };
  room.data_principal_workflow = rightsWorkflow;
  room.penalty_matrix = penaltyMatrix;
  room.penalty_accuracy_note = enforcementNote;
  room.tasks = [{
    id: `${room.id}-assessment`,
    title: "Interactive compliance assessment",
    description: "Six room-specific scenarios with hints, citations, correct-answer rationales and wrong-option feedback.",
    questions: questionSet
  }];
  room.official_text_status = "GAZETTE_REFERENCE_SUMMARIES";
  room.last_verified = asOf.toISOString().slice(0, 10);
  room.legal_status = {
    status: "NOTIFIED_TEXT_WITH_PHASED_COMMENCEMENT",
    note: "Summaries are educational paraphrases linked to Government sources, not word-for-word statutory text. Check current commencement and corrigenda."
  };
}

const taskEntries = registry.rooms.flatMap(room => room.tasks[0].questions);
registry.version = "2026.10.3";
registry.last_verified = asOf.toISOString().slice(0, 10);
registry.legal_reference_catalog = {
  act: actCatalog,
  rules: rulesCatalog,
  commencement,
  rule_6_safeguards: safeguards,
  data_principal_workflow: rightsWorkflow,
  act_penalty_schedule: penaltyMatrix,
  enforcement_note: enforcementNote,
  schedules: [
    { number: 1, name: "Consent Manager", linked_rule: "Rule 4" },
    { number: 2, name: "State processing and research standards", linked_rules: ["Rule 5", "Rule 16"] },
    { number: 3, name: "Deemed purpose-completion periods", linked_rule: "Rule 8" },
    { number: 4, name: "Child-data exemptions", linked_rule: "Rule 12" },
    { number: 5, name: "Chairperson and Member service conditions", linked_rule: "Rule 18" },
    { number: 6, name: "Board officers and employees", linked_rule: "Rule 21" },
    { number: 7, name: "Information requests and specified purposes", linked_rules: ["Rule 8", "Rule 23"] }
  ]
};

taskBank.version = "2026.10.3-room-specific";
taskBank.last_verified = asOf.toISOString().slice(0, 10);
taskBank.source = "Room-specific educational scenarios mapped to the notified DPDP Act, 2023 and DPDP Rules, 2025; verify full official text and phased commencement.";
taskBank.task_count = taskEntries.length;
taskBank.tasks = taskEntries;
taskBank.legal_accuracy_note = enforcementNote;

await Promise.all([
  writeJson("legal-room-content.json", registry),
  writeJson("tasks.json", taskBank)
]);
console.log(`Enriched ${registry.rooms.length} rooms with Sections 1-44, Rules 1-23, safeguards, rights, penalties and ${taskEntries.length} assessment questions.`);
