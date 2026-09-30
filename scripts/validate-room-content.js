const fs=require("fs");
const path=require("path");

const ROOT=path.join(process.cwd(),"content","rooms");
const LEGAL=path.join(process.cwd(),"content","legal-room-content.json");

if(!fs.existsSync(ROOT)){
  if(!fs.existsSync(LEGAL)){console.log("No room content yet.");process.exit(0);}
  const registry=JSON.parse(fs.readFileSync(LEGAL,"utf8"));
  const errors=[];
  for(const room of (registry.rooms||[])){
    const tasks=Array.isArray(room.tasks)?room.tasks:[];
    const questions=tasks.reduce((n,t)=>n+(Array.isArray(t.questions)?t.questions.length:0),0);
    if(!room.id||!room.title||!room.difficulty||!room.last_verified) errors.push(room.id+": missing room metadata");
    if(tasks.length<1) errors.push(room.id+": no tasks");
    if(questions<10) errors.push(room.id+": minimum 10 questions required; found "+questions);
    if(!room.final_challenge?.scenario||!room.final_challenge?.flag) errors.push(room.id+": missing final challenge/flag");
    if(!room.summary||!Array.isArray(room.cheat_sheet)) errors.push(room.id+": missing summary/cheat-sheet");
    for(const task of tasks){
      if(!task.provision||!Array.isArray(task.official_text)||!task.official_text.length) errors.push(room.id+"/"+task.id+": missing official provision reference");
      if(!task.simple_words||!Array.isArray(task.key_terms)||!task.real_world_example||!task.student_angle||!Array.isArray(task.common_mistakes)) errors.push(room.id+"/"+task.id+": missing A-F learning content");
      for(const q of (task.questions||[])){
        if(q.correct_answer===undefined && q.answer===undefined) errors.push(room.id+"/"+q.id+": missing answer");
        if(!q.why||!Array.isArray(q.why_wrong)||!q.section_reference) errors.push(room.id+"/"+q.id+": missing rationale/reference");
      }
    }
  }
  if(errors.length){console.error(errors.join("\n"));process.exit(1);}
  console.log("Validated legal-room-content.json: "+(registry.rooms||[]).length+" rooms.");
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