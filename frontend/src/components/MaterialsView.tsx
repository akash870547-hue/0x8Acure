import {useMemo,useState} from "react";
import {motion} from "framer-motion";
import {ArrowUpRight,BookOpen,Cloud,FileText,FolderOpen,Search,ShieldCheck} from "lucide-react";
import {materialsData,MASTER_DRIVE_URL} from "../../../data/materialsData.js";
import {cloudSecurityData,CLOUD_SECURITY_DRIVE_URL} from "../../../data/cloudSecurityData.js";

const tracks=["All Materials","Digital Forensics / CHFI","Cloud Security Engineer"] as const;
type TrackFilter=typeof tracks[number];
const allMaterials=[
  ...materialsData.map(item=>({...item,track:"Digital Forensics / CHFI"})),
  ...cloudSecurityData
];

export function MaterialsView({query,onQueryChange}:{query:string;onQueryChange:(value:string)=>void}){
  const [track,setTrack]=useState<TrackFilter>("All Materials");
  const modules=useMemo(()=>{
    const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return allMaterials.filter(item=>{
      const cloud=item.track==="Cloud Security";
      const matchesTrack=track==="All Materials"||(track==="Cloud Security Engineer"?cloud:!cloud);
      const haystack=[item.title,item.track,item.category,item.type,("level" in item?item.level:""),...item.topics,...(item.keywords||[])].join(" ").toLowerCase();
      return matchesTrack&&terms.every(term=>haystack.includes(term));
    });
  },[query,track]);
  const documentCount=materialsData.reduce((total,item)=>total+(item.resourceCount||1),0)+cloudSecurityData.length;
  return <section className="materials-page" aria-labelledby="materials-title">
    <div className="materials-hero">
      <div className="materials-hero-copy"><span className="eyebrow"><ShieldCheck size={14}/> FIELD LIBRARY · CHFI · CLOUD SECURITY</span><h1 id="materials-title">Forensics &amp; Security Materials</h1><p>Comprehensive DFIR, CHFI, and Cloud Security Engineering repositories.</p><div className="materials-stats"><div><b>{allMaterials.length}+</b><span>Modules</span></div><div><b>{documentCount}+</b><span>Resources</span></div><div><b><i className="online-dot"/> Cloud</b><span>Direct access</span></div></div></div>
      <a className="btn master-drive-button" href={MASTER_DRIVE_URL} target="_blank" rel="noopener noreferrer"><Cloud size={18}/>Open Master Drive Vault<ArrowUpRight size={16}/></a>
      <div className="materials-orbit" aria-hidden="true"><span>DFIR</span><i/><i/><i/></div>
    </div>

    <section className="cloud-spotlight" aria-labelledby="cloud-track-title">
      <div className="cloud-spotlight-icon" aria-hidden="true"><Cloud size={23}/></div>
      <div className="cloud-spotlight-copy"><span className="cloud-new-badge">NEW TRACK: Cloud Security Engineer</span><h2 id="cloud-track-title">Cloud Security Engineering</h2><p>Six guided modules covering cloud foundations, IAM, network defense, data protection, containers, and compliance.</p></div>
      <a className="btn cloud-drive-button" href={CLOUD_SECURITY_DRIVE_URL} target="_blank" rel="noopener noreferrer"><Cloud size={17}/>Open Cloud Security Drive<ArrowUpRight size={15}/></a>
    </section>

    <div className="materials-controls">
      <label className="materials-search"><Search size={18}/><span className="visually-hidden">Search study materials</span><input type="search" value={query} onChange={event=>onQueryChange(event.target.value)} placeholder="Search AWS, Azure, IAM, S3, Kubernetes, FTK…" /></label>
      <div className="materials-filters" role="group" aria-label="Filter study material tracks">{tracks.map(item=><button type="button" className={track===item?"filter-pill active":"filter-pill"} key={item} aria-pressed={track===item} onClick={()=>setTrack(item)}>{item}</button>)}</div>
      <p className="results-count" aria-live="polite">Showing {modules.length} of {allMaterials.length} modules</p>
    </div>

    {modules.length?<div className="materials-grid">{modules.map((item,index)=>{
      const cloud=item.track==="Cloud Security";
      const resourceCount="resourceCount" in item?item.resourceCount:undefined;
      return <motion.article className={cloud?"material-card cloud-material-card":"material-card"} key={item.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.22,delay:Math.min(index*.025,.2)}}>
        <div className="material-card-top"><span className="material-type">{cloud?<Cloud size={14}/>:<FileText size={14} />}{item.type}</span><span className={cloud?"material-level":"material-size"}>{cloud?("level" in item?item.level:""):(("fileSize" in item?item.fileSize:"")||"")}</span></div>
        <span className="material-category">{item.category}</span><h2>{item.title}</h2>
        <div className="topic-list">{item.topics.map(topic=><span className="topic-chip" key={topic}>{topic}</span>)}</div>
        <div className="material-card-bottom"><span><BookOpen size={14}/>{cloud?"Cloud module":`${resourceCount||1} linked resource${(resourceCount||1)===1?"":"s"}`}</span><a href={item.driveUrl} target="_blank" rel="noopener noreferrer">{cloud?"View Cloud Module in Drive":"Open folder"}<ArrowUpRight size={15}/></a></div>
      </motion.article>;
    })}</div>:<div className="materials-empty"><FolderOpen size={34}/><h2>No study modules match your query</h2><p>Try another cloud term, forensic topic, or track.</p><button className="btn secondary" type="button" onClick={()=>{onQueryChange("");setTrack("All Materials");}}>Clear filters</button></div>}
    <p className="materials-note">Module entries link to the relevant shared Drive repository. Use the track filters or search topics and tools to find a module.</p>
  </section>;
}
