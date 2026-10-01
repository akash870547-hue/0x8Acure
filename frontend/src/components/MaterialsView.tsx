import {useMemo,useState} from "react";
import {motion} from "framer-motion";
import {ArrowUpRight,BookOpen,Cloud,FileText,FolderOpen,Search,ShieldCheck} from "lucide-react";
import {materialsData,MASTER_DRIVE_URL} from "../../../data/materialsData.js";

const filters=["All","Forensic Foundations","Investigation Process","Disk Forensics","Artifact Analysis","Advanced DFIR"];
export function MaterialsView(){
  const [query,setQuery]=useState(""),[category,setCategory]=useState("All");
  const modules=useMemo(()=>{
    const term=query.trim().toLowerCase();
    return materialsData.filter(item=>{
      const matchesCategory=category==="All"||item.category===category;
      const haystack=[item.title,item.category,item.type,...item.topics,...(item.keywords||[])].join(" ").toLowerCase();
      return matchesCategory&&(!term||haystack.includes(term));
    });
  },[query,category]);
  const documentCount=materialsData.reduce((total,item)=>total+(item.resourceCount||1),0);
  return <section className="materials-page" aria-labelledby="materials-title">
    <div className="materials-hero">
      <div className="materials-hero-copy"><span className="eyebrow"><ShieldCheck size={14}/> FIELD LIBRARY · CHFI v10 / v11</span><h1 id="materials-title">Forensics &amp; Security Materials</h1><p>Comprehensive DFIR &amp; CHFI Study Repository</p><div className="materials-stats"><div><b>{materialsData.length}+</b><span>Modules</span></div><div><b>{documentCount}+</b><span>Resources</span></div><div><b><i className="online-dot"/> Cloud</b><span>Direct access</span></div></div></div>
      <a className="btn master-drive-button" href={MASTER_DRIVE_URL} target="_blank" rel="noopener noreferrer"><Cloud size={18}/>Open Master Drive Vault<ArrowUpRight size={16}/></a>
      <div className="materials-orbit" aria-hidden="true"><span>DFIR</span><i/><i/><i/></div>
    </div>
    <div className="materials-controls"><label className="materials-search"><Search size={18}/><span className="visually-hidden">Search modules and topics</span><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search FTK, NTFS, Network…" /></label><div className="materials-filters" role="group" aria-label="Filter by category">{filters.map(item=><button type="button" className={category===item?"filter-pill active":"filter-pill"} key={item} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}</div><p className="results-count" aria-live="polite">Showing {modules.length} of {materialsData.length} modules</p></div>
    {modules.length?<div className="materials-grid">{modules.map((item,index)=><motion.article className="material-card" key={item.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.22,delay:Math.min(index*.025,.2)}}>
      <div className="material-card-top"><span className="material-type"><FileText size={14}/>{item.type}</span><span className="material-size">{item.fileSize}</span></div><span className="material-category">{item.category}</span><h2>{item.title}</h2><div className="topic-list">{item.topics.map(topic=><span className="topic-chip" key={topic}>{topic}</span>)}</div><div className="material-card-bottom"><span><BookOpen size={14}/>{item.resourceCount||1} linked resource{(item.resourceCount||1)===1?"":"s"}</span><a href={item.driveUrl} target="_blank" rel="noopener noreferrer">Open folder<ArrowUpRight size={15}/></a></div>
    </motion.article>)}</div>:<div className="materials-empty"><FolderOpen size={34}/><h2>No forensic modules match your query</h2><p>Try another topic, tool name, or category.</p><button className="btn secondary" onClick={()=>{setQuery("");setCategory("All");}}>Clear filters</button></div>}
    <p className="materials-note">Module names and sizes are starter catalog entries. Drive access opens the shared master repository; add individual file URLs to <code>data/materialsData.js</code> as they become available.</p>
  </section>;
}
