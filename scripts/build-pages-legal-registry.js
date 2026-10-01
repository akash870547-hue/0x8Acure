import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const contentDir=path.join(root,"content");
const source=JSON.parse(fs.readFileSync(path.join(contentDir,"legal-room-content.json"),"utf8"));
const chapter=JSON.parse(fs.readFileSync(path.join(contentDir,"chapter-ii-rooms.json"),"utf8"));

// GitHub Pages has no grading API. These existing room quizzes use the legacy
// client-side learning flow; the separate Cyber Lab quizzes remain server graded.
const rooms=[...(source.rooms||[]).filter(room=>!room.id.startsWith("ch2-")),...(chapter.rooms||[])];
const roomIds=new Set();
for(const room of rooms){
  if(!room.id||roomIds.has(room.id))throw new Error(`Missing or duplicate legal room id: ${room.id||"(empty)"}`);
  roomIds.add(room.id);
  for(const task of room.tasks||[])for(const question of task.questions||[]){
    if(question.answer===undefined&&question.correct_answer===undefined)throw new Error(`Missing answer for ${room.id}/${question.id||"question"}`);
  }
}

const registry={
  version:source.version,
  source_policy:source.source_policy,
  last_verified:source.last_verified,
  sources:source.sources,
  commencement:source.commencement,
  rooms
};
const output=path.resolve(process.argv[2]||path.join(root,"_site","content","legal-room-registry.json"));
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(registry));
console.log(`Prepared ${rooms.length} DPDP rooms for static hosting at ${output}.`);
