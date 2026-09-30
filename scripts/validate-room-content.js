const fs=require("fs");
const path=require("path");

const ROOT=path.join(process.cwd(),"content","rooms");
if(!fs.existsSync(ROOT)){console.log("No content/rooms directory yet; structural validation will run once official-source room files are added.");process.exit(0);}
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