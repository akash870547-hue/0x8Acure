import {useMemo,useState} from "react";
import {motion} from "framer-motion";
import {ArrowUpRight,BookOpen,ChevronDown,Clipboard,Cloud,FileText,FolderOpen,Search,ShieldCheck,Terminal} from "lucide-react";
import {modulesData} from "../../../data/modulesData.js";

const MASTER_DRIVE_URL="https://drive.google.com/drive/folders/1Pj3FZyAQTeaZVF8i5jvwTRBJCLhtvZiw?usp=drive_link";
const filters=["All","CHFI v11","Cloud Security Engineering"];

type Module={id:string;track:string;moduleNumber:number;title:string;summary:string;detailedTopics:string[];toolsArsenal:string[];cliCommands:string[];driveUrl:string};

export function MaterialsView(){
 const [query,setQuery]=useState("");
 const [track,setTrack]=useState("All");
 const [openId,setOpenId]=useState<string|null>(null);
 const [copied,setCopied]=useState("");
 const modules=useMemo(()=>{
  const term=query.trim().toLowerCase();
  return (modulesData as Module[]).filter(item=>{
   const matchesTrack=track==="All"||item.track===track;
   const haystack=[item.title,item.track,item.summary,...item.detailedTopics,...item.toolsArsenal,...item.cliCommands].join(" ").toLowerCase();
   return matchesTrack&&(!term||haystack.includes(term));
  });
 },[query,track]);
 const copyCommand=async(command:string)=>{
  try{
   await navigator.clipboard.writeText(command);
   setCopied(command);
   window.setTimeout(()=>setCopied(current=>current===command?"":current),1400);
  }catch{
   setCopied("");
  }
 };
 return <section className="materials-page" aria-labelledby="materials-title">
  <div className="materials-hero">
   <div className="materials-hero-copy"><span className="eyebrow"><ShieldCheck size={14}/> FIELD LIBRARY · 21 MODULES</span><h1 id="materials-title">Forensics &amp; Cloud Security Materials</h1><p>Canonical CHFI v11 and Cloud Security Engineering curriculum, with searchable tools, topics, and field commands.</p><div className="materials-stats"><div><b>{(modulesData as Module[]).length}</b><span>Modules</span></div><div><b>{(modulesData as Module[]).reduce((n,item)=>n+item.cliCommands.length,0)}</b><span>Commands</span></div><div><b><i className="online-dot"/> Cloud</b><span>Direct access</span></div></div></div>
   <a className="btn master-drive-button" href={MASTER_DRIVE_URL} target="_blank" rel="noopener noreferrer"><Cloud size={18}/>Open Course Drive<ArrowUpRight size={16}/></a>
   <div className="materials-orbit" aria-hidden="true"><span>DFIR</span><i/><i/><i/></div>
  </div>
  <div className="materials-controls">
   <label className="materials-search"><Search size={18}/><span className="visually-hidden">Search modules, tools and commands</span><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search Volatility, MFT, Prowler, KMS…" /></label>
   <div className="materials-filters" role="group" aria-label="Filter by track">{filters.map(item=><button type="button" className={track===item?"filter-pill active":"filter-pill"} key={item} aria-pressed={track===item} onClick={()=>setTrack(item)}>{item}</button>)}</div>
   <p className="results-count" aria-live="polite">Showing {modules.length} of {(modulesData as Module[]).length} modules</p>
  </div>
  {modules.length?
   <div className="materials-grid">{modules.map((item,index)=>{
    const expanded=openId===item.id;
    return <motion.article className={expanded?"material-card expanded":"material-card"} key={item.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.18,delay:Math.min(index*.018,.16)}}>
     <button type="button" className="material-card-toggle" aria-expanded={expanded} aria-controls={"module-"+item.id} onClick={()=>setOpenId(expanded?null:item.id)}>
      <span className="material-card-toggle-copy"><span className="material-type"><FileText size={14}/>{item.track}</span><span className="material-category">MODULE {String(item.moduleNumber).padStart(2,"0")}</span><h2>{item.title}</h2><p>{item.summary}</p></span><ChevronDown size={18} className={expanded?"chevron-open":""}/>
     </button>
     <div id={"module-"+item.id} hidden={!expanded} className="material-card-details">
      <div className="module-detail-grid">
       <section><h3><BookOpen size={14}/>Subtopics</h3><div className="topic-list">{item.detailedTopics.map(topic=><span className="topic-chip" key={topic}>{topic}</span>)}</div></section>
       <section><h3><Terminal size={14}/>Tools Arsenal</h3><div className="topic-list tool-list">{item.toolsArsenal.map(tool=><span className="topic-chip" key={tool}>{tool}</span>)}</div></section>
      </div>
      <section className="command-section"><h3><Terminal size={14}/>CLI Command Lab</h3><div className="command-list">{item.cliCommands.map((command,commandIndex)=><div className="command-block" key={command+commandIndex}><code>{command}</code><button type="button" className="copy-command" onClick={()=>void copyCommand(command)} aria-label={"Copy "+command}>{copied===command?<><Clipboard size={13}/>Copied</>:<><Clipboard size={13}/>Copy Command</>}</button></div>)}</div></section>
      <a className="module-drive-link" href={item.driveUrl||MASTER_DRIVE_URL} target="_blank" rel="noopener noreferrer"><Cloud size={14}/>Open module Drive folder<ArrowUpRight size={14}/></a>
     </div>
    </motion.article>;
   })}</div>
  :<div className="materials-empty"><FolderOpen size={34}/><h2>No modules match your query</h2><p>Try Volatility, MFT, Prowler, KMS, or another topic/tool.</p><button className="btn secondary" onClick={()=>{setQuery("");setTrack("All");}}>Clear filters</button></div>}
 </section>;
}
