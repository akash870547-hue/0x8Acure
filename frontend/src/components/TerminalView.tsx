import { useState, type FormEvent, type CSSProperties } from "react";
import { Terminal } from "lucide-react";
type Target="materials"|"quiz"|"rooms"|"projects"|"leaderboard";
export function TerminalView({onNavigate}:{onNavigate:(tab:Target)=>void}){
 const [input,setInput]=useState(""),[lines,setLines]=useState<string[]>(["0x8Acure shell · type help to see available commands."]),[busy,setBusy]=useState(false);
 const run=(event:FormEvent)=>{
  event.preventDefault();if(busy)return;
  const command=input.trim().toLowerCase();if(!command)return;
  setInput("");setBusy(true);setLines(old=>[...old,"user@0x8acure:~$ "+command]);
  let output="";
  if(command==="help")output="Commands: help, whoami, skills, labs, quiz --start, metrics, clear";
  else if(command==="whoami")output="0x8Acure learner · defensive security and digital forensics workspace.";
  else if(command==="skills")output="Focus areas: DFIR · Web Pentest · Network Security · Active Directory · Privacy Engineering";
  else if(command==="labs"){output="Opening the authorized learning rooms…";onNavigate("rooms");}
  else if(command==="quiz --start"||command==="quiz"){output="Loading the quiz arena…";onNavigate("quiz");}
  else if(command==="metrics"){output="Opening current learner rankings and XP metrics…";onNavigate("leaderboard");}
  else if(command==="clear"){setLines([]);setBusy(false);return;}
  else output="Command not found: "+command+". Type help to view available commands.";
  window.setTimeout(()=>{setLines(old=>[...old,output]);setBusy(false);},80);
 };
 return <section className="terminal-widget" aria-label="Interactive terminal"><div className="terminal-widget-header"><span><Terminal size={16}/> TERMINAL ACCESS</span><span className="terminal-status"><i/> READY</span></div><div className="terminal-transcript" aria-live="polite" aria-relevant="additions">{lines.map((line,index)=>{const output=!line.startsWith("user@");return <p key={index} className={output?"output-line":"command-line"}>{output?<span className="typed-output" style={{"--chars":line.length} as CSSProperties}>{line}</span>:line}</p>;})}{busy&&<p className="output-line typing">processing<span>•••</span></p>}</div><form className="terminal-form" onSubmit={run}><label className="terminal-prompt" htmlFor="terminal-command">user@0x8acure:~$</label><input id="terminal-command" autoComplete="off" spellCheck={false} value={input} onChange={event=>setInput(event.target.value)} placeholder="enter command" aria-label="Terminal command"/><button type="submit" aria-label="Run command">↵</button></form><div className="terminal-shortcuts"><button type="button" onClick={()=>onNavigate("materials")}>materials</button><button type="button" onClick={()=>onNavigate("projects")}>arsenal</button><button type="button" onClick={()=>onNavigate("leaderboard")}>metrics</button></div></section>;
}
