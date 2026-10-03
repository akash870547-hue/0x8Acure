import fs from "node:fs";
import path from "node:path";

const ROOT=path.join(process.cwd(),"content","rooms");
const LEGAL=path.join(process.cwd(),"content","legal-room-content.json");

if(!fs.existsSync(ROOT)){
  if(!fs.existsSync(LEGAL)){console.log("No room content yet.");process.exit(0);}
  const registry=JSON.parse(fs.readFileSync(LEGAL,"utf8"));
  const tasksFile=path.join(process.cwd(),"content","tasks.json");
  const casesFile=path.join(process.cwd(),"content","case-studies.json");
  const taskBank=JSON.parse(fs.readFileSync(tasksFile,"utf8"));
  const caseRegistry=JSON.parse(fs.readFileSync(casesFile,"utf8"));
  const errors=[];
  const rooms=Array.isArray(registry.rooms)?registry.rooms:[];
  const references=registry.legal_reference_catalog||{};
  if(rooms.length!==67) errors.push("Expected 67 legal rooms; found "+rooms.length);
  if(!Array.isArray(references.act)||references.act.length!==44) errors.push("Act reference catalog must cover Sections 1-44");
  if(!Array.isArray(references.rules)||references.rules.length!==23) errors.push("Rules reference catalog must cover Rules 1-23");
  if(!Array.isArray(references.rule_6_safeguards)||references.rule_6_safeguards.length<6) errors.push("Rule 6 safeguard catalog is incomplete");
  if(!Array.isArray(references.data_principal_workflow)||references.data_principal_workflow.length<5) errors.push("Data Principal rights workflow is incomplete");
  if(!Array.isArray(references.act_penalty_schedule)||references.act_penalty_schedule.length!==7) errors.push("Act penalty Schedule must list all seven categories");
  if(!String(references.enforcement_note||"").includes("not a frivolous complaint")) errors.push("Penalty note must distinguish the Section 15 ₹10,000 ceiling from frivolous-complaint costs");
  const dpDutyPenalty=references.act_penalty_schedule?.find(item=>item.reference.includes("entry 5"));
  if(dpDutyPenalty?.maximum_amount!=="₹10,000"||!dpDutyPenalty.reference.includes("Section 15")) errors.push("₹10,000 must map to Data Principal duties under Section 15");
  const otherBreachPenalty=references.act_penalty_schedule?.find(item=>item.reference.includes("entry 7"));
  if(otherBreachPenalty?.maximum_amount!=="₹50 crore") errors.push("Act Schedule entry 7 must retain the ₹50 crore other-contravention ceiling");
  if(!Array.isArray(taskBank.tasks)||taskBank.tasks.length!==rooms.length*6) errors.push("Task bank must contain six questions for each legal room");
  if(!Array.isArray(caseRegistry.cases)||caseRegistry.cases.length<6) errors.push("Case-study registry must contain at least six cases");
  const requiredCases=["healthcare-telemedicine-ransomware","fintech-consent-cross-border","ecommerce-dark-pattern-withdrawal","edtech-child-tracking","bpo-processor-fiduciary-liability","employee-hr-section-7"];
  for(const id of requiredCases) if(!caseRegistry.cases?.some(item=>item.id===id)) errors.push("Missing required case study: "+id);
  for(const item of caseRegistry.cases||[]){
    if(!item.scenario_background||!item.legal_issues?.length||!item.penalty_analysis?.length||!item.remediation_strategy||!item.remediation?.length) errors.push((item.id||"(case)")+": incomplete case-study analysis");
    for(const penalty of item.penalty_analysis||[]){
      if(String(penalty[2]).includes("₹50 crore")&&penalty[0]!=="Act Schedule, entry 7") errors.push(item.id+": ₹50 crore catch-all must cite Act Schedule entry 7");
    }
  }
  const sectionCoverage=new Set();
  const ruleCoverage=new Set();
  const bankIds=new Set();
  for(const task of (taskBank.tasks||[])){
    if(!task?.id||bankIds.has(task.id)) errors.push("Task bank contains an invalid or duplicate task ID: "+(task?.id||"(missing)"));
    bankIds.add(task?.id);
    const answerIsValid=task?.type==="multi-select"
      ? Array.isArray(task.correct_answer)&&task.correct_answer.length>0&&task.correct_answer.every(index=>Number.isInteger(index)&&index>=0&&index<task.options?.length)
      : Number.isInteger(task?.correct_answer)&&task.correct_answer>=0&&task.correct_answer<task.options?.length;
    if(!task?.prompt||!Array.isArray(task.options)||task.options.length<2||
      !answerIsValid||
      !task.explanation||!task.why||!Array.isArray(task.hints)||task.hints.length<2||
      !Array.isArray(task.why_wrong)||task.why_wrong.length!==task.options.length||!task.section_reference){
      errors.push((task?.id||"(missing task)")+": incomplete prompt, answer, hints, citation or rationale");
    }
  }
  for(const room of (registry.rooms||[])){
    const tasks=Array.isArray(room.tasks)?room.tasks:[];
    const questions=tasks.reduce((n,t)=>n+(Array.isArray(t.questions)?t.questions.length:0),0);
    if(!room.id||!room.title||!room.difficulty||!room.last_verified) errors.push(room.id+": missing room metadata");
    if(tasks.length<1) errors.push(room.id+": no tasks");
    if(questions<6) errors.push(room.id+": minimum six scenario tasks required; found "+questions);
    if(!room.final_challenge?.scenario||!room.final_challenge?.flag) errors.push(room.id+": missing final challenge/flag");
    if(!room.summary||!Array.isArray(room.cheat_sheet)) errors.push(room.id+": missing summary/cheat-sheet");
    if(!Array.isArray(room.act_section_ids)||!room.act_section_ids.length) errors.push(room.id+": missing Act section mappings");
    if(!Array.isArray(room.rule_ids)||!room.operational_safeguards?.measures?.length) errors.push(room.id+": missing Rules or operational safeguards mapping");
    if(!Array.isArray(room.data_principal_workflow)||!room.penalty_matrix?.length) errors.push(room.id+": missing rights workflow or penalty matrix");
    for(const id of room.act_section_ids||[]) sectionCoverage.add(Number(id.replace("section-","")));
    for(const id of room.rule_ids||[]) ruleCoverage.add(Number(id.replace("rule-","")));
    for(const task of tasks){
      if(!task.title||!Array.isArray(task.questions)) errors.push(room.id+"/"+task.id+": invalid task group");
      for(const q of (task.questions||[])){
        if(q.correct_answer===undefined||!q.prompt||!q.explanation||!q.citation?.reference||!q.hints?.length||!q.why||!q.why_wrong?.length) errors.push(room.id+"/"+q.id+": missing structured answer or source rationale");
      }
    }
  }
  if(sectionCoverage.size!==44) errors.push("Room mappings cover "+sectionCoverage.size+" unique Act sections, expected all 44");
  if(ruleCoverage.size!==23) errors.push("Room mappings cover "+ruleCoverage.size+" unique Rules, expected all 23");
  if(errors.length){console.error(errors.join("\n"));process.exit(1);}
  console.log("Validated 67 legal rooms, Sections 1-44, Rules 1-23, "+taskBank.tasks.length+" assessment tasks and "+caseRegistry.cases.length+" case studies.");
  process.exit(0);
}

const files=fs.readdirSync(ROOT).filter(f=>f.endsWith(".json"));
if(!files.length) throw new Error("content/rooms exists but contains no room JSON files.");

const errors=[];
for(const file of files){
  const p=path.join(ROOT,file);
  let room;
  try{room=JSON.parse(fs.readFileSync(p,"utf8"));}catch(e){errors.push(file+": invalid JSON");continue;}
  const tasks=Array.isArray(room.tasks)?room.tasks:[];
  if(!room.room?.title||!room.room?.difficulty||!room.room?.estimated_minutes||!Array.isArray(room.room?.sections_covered)||!Array.isArray(room.room?.learning_objectives)) errors.push(file+": missing room header fields");
  if(tasks.length<1) errors.push(file+": no tasks");
  let questionCount=0,scenario=false,flag=false;
  for(const t of tasks){
    if(!t.official_text?.provision||!t.official_text?.verbatim) errors.push(file+"/"+t.id+": missing verbatim official text");
    if(!t.simple_words||!Array.isArray(t.key_terms)||!t.real_world_example||!t.student_angle||!Array.isArray(t.common_mistakes)) errors.push(file+"/"+t.id+": missing A-G learning content");
    for(const q of (t.questions||[])){
      questionCount++;
      if(q.type==="scenario-section") scenario=true;
      if(q.type==="flag") flag=true;
      if(!q.correct_answer&&q.correct_answer!==0&&q.correct_answer!==false) errors.push(file+"/"+q.id+": missing correct_answer");
      if(!q.why||!Array.isArray(q.why_wrong)||!q.section_reference) errors.push(file+"/"+q.id+": missing answer rationale/reference");
    }
  }
  if(questionCount<10) errors.push(file+": minimum 10 questions required; found "+questionCount);
  if(!scenario) errors.push(file+": minimum 1 scenario-section question required");
  if(!flag) errors.push(file+": minimum 1 flag question required");
  if(!room.room_end?.summary||!room.room_end?.cheat_sheet||!room.room_end?.final_challenge||!room.room_end?.score_screen) errors.push(file+": missing room-end structure");
}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log("All room-content-v2 files satisfy the 0x8Acure room contract.");