import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Check, Clock3, Filter, RotateCcw, Trophy } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthProvider";

type Question={id:string;prompt:string;options:string[];category:string;difficulty:string;position:number};
type Quiz={id:string;title:string;slug:string;description:string;category:string;difficulty:string;timeLimit:number;questions:Question[]};
type Feedback={questionId:string;correct:boolean;explanation:string;category:string};
type Result={score:number;maxScore:number;scorePercent:number;xpAwarded:number;feedback?:Feedback[]};

const EMPTY_RESULT:Result={score:0,maxScore:0,scorePercent:0,xpAwarded:0,feedback:[]};

export function QuizView({onXp}:{onXp:(value:number)=>void}){
 const {session,openAuth}=useAuth();
 const [quizzes,setQuizzes]=useState<Quiz[]>([]);
 const [selected,setSelected]=useState<Quiz|null>(null);
 const [questionIndex,setQuestionIndex]=useState(0);
 const [answers,setAnswers]=useState<Record<string,number>>({});
 const [seconds,setSeconds]=useState(0);
 const [remaining,setRemaining]=useState(30);
 const [attemptKey,setAttemptKey]=useState("");
 const [busy,setBusy]=useState(false);
 const [result,setResult]=useState<Result|null>(null);
 const [error,setError]=useState("");
 const [timedOut,setTimedOut]=useState(false);
 const [domainFilter,setDomainFilter]=useState("All");

 useEffect(()=>{
  let alive=true;
  api<{quizzes:Quiz[]}>("/api/quizzes")
   .then(data=>{if(alive)setQuizzes(Array.isArray(data.quizzes)?data.quizzes:[]);})
   .catch(err=>{if(alive)setError(err instanceof Error?err.message:"Unable to load quizzes.");});
  return()=>{alive=false;};
 },[]);

 const domains=useMemo(()=>{
  if(!selected)return [];
  return ["All",...Array.from(new Set(selected.questions.map(q=>q.category).filter(Boolean))).sort()];
 },[selected]);

 const filteredQuestions=useMemo(()=>{
  if(!selected)return [];
  return domainFilter==="All"?selected.questions:selected.questions.filter(q=>q.category===domainFilter);
 },[selected,domainFilter]);

 const question=filteredQuestions[questionIndex];
 const questionAnswered=!!question&&Object.hasOwn(answers,question.id);
 const answeredCount=selected?Object.keys(answers).filter(id=>selected.questions.some(q=>q.id===id)).length:0;

 useEffect(()=>{
  if(!selected||result||questionAnswered||!question)return;
  const timer=window.setInterval(()=>{
   setSeconds(old=>old+1);
   setRemaining(old=>{
    if(old<=1){
     setAnswers(current=>({...current,[question.id]:-1}));
     setTimedOut(true);
     return 30;
    }
    return old-1;
   });
  },1000);
  return()=>window.clearInterval(timer);
 },[selected,result,questionAnswered,question?.id]);

 useEffect(()=>{
  if(questionIndex>=filteredQuestions.length&&filteredQuestions.length)setQuestionIndex(filteredQuestions.length-1);
 },[filteredQuestions.length,questionIndex]);

 const start=(quiz:Quiz)=>{
  setSelected(quiz);
  setQuestionIndex(0);
  setAnswers({});
  setResult(null);
  setSeconds(0);
  setRemaining(30);
  setTimedOut(false);
  setError("");
  setDomainFilter("All");
  setAttemptKey(crypto.randomUUID());
 };

 const leaveQuiz=()=>{
  setSelected(null);
  setResult(null);
  setAnswers({});
  setQuestionIndex(0);
  setError("");
 };

 const changeDomain=(next:string)=>{
  setDomainFilter(next);
  setQuestionIndex(0);
  setRemaining(30);
  setTimedOut(false);
 };

 const next=async()=>{
  if(!selected||!questionAnswered||!question)return;
  if(questionIndex<filteredQuestions.length-1){
   setQuestionIndex(index=>index+1);
   setRemaining(30);
   setTimedOut(false);
   return;
  }
  if(!session){
   setError("Sign in to save your result and earn XP.");
   openAuth();
   return;
  }
  setBusy(true);
  setError("");
  try{
   const response=await api<Result>("/api/quizzes/submit",{
    method:"POST",
    body:JSON.stringify({quizId:selected.id,attemptKey,answers,timeSpent:seconds})
   },session.access_token);
   setResult({...EMPTY_RESULT,...response,feedback:Array.isArray(response.feedback)?response.feedback:[]});
   const fresh=await api<{user:{xp:number}}>("/api/auth/sync",{},session.access_token);
   onXp(fresh.user.xp);
  }catch(err){
   setError(err instanceof Error?err.message:"Could not save this quiz attempt.");
  }finally{setBusy(false);}
 };

 const domainBreakdown=useMemo(()=>{
  const feedback=result?.feedback??[];
  const groups=new Map<string,{correct:number,total:number}>();
  for(const item of feedback){
   const key=item.category||"General";
   const current=groups.get(key)||{correct:0,total:0};
   current.total+=1;
   if(item.correct)current.correct+=1;
   groups.set(key,current);
  }
  return Array.from(groups.entries())
   .map(([domain,stats])=>({...stats,domain,percent:Math.round((stats.correct/Math.max(stats.total,1))*100)}))
   .sort((a,b)=>a.percent-b.percent||a.domain.localeCompare(b.domain));
 },[result]);

 if(error&&!selected)return <section className="content-page"><PageTitle eyebrow="GAMIFIED KNOWLEDGE CHECK" title="Quiz Arena" subtitle="Timed challenges across CHFI v11 and Cloud Security Engineering."/><div className="notice">{error}</div></section>;

 return <section className="content-page">
  <PageTitle eyebrow="GAMIFIED KNOWLEDGE CHECK" title="Quiz Arena" subtitle="Timed challenges across CHFI v11 and Cloud Security Engineering."/>
  {!selected?
   <div className="quiz-grid">
    {quizzes.map(quiz=><article className="quiz-card" key={quiz.id}>
     <div className="quiz-card-top"><span className="category-badge">{quiz.category}</span><span>{quiz.difficulty}</span></div>
     <h2>{quiz.title}</h2><p>{quiz.description}</p>
     <div className="quiz-card-meta"><span>{quiz.questions.length} questions</span><span><Clock3 size={14}/>{quiz.timeLimit} min</span></div>
     <button className="btn primary" onClick={()=>start(quiz)}>Start quiz <ArrowRight size={16}/></button>
    </article>)}
    {!quizzes.length&&!error&&<div className="empty-state">Loading quiz modules…</div>}
   </div>
  :
   <div className="quiz-stage panel">
    <div className="quiz-stage-top">
     <button className="text-button back-link" onClick={leaveQuiz}><ArrowLeft size={15}/> All quizzes</button>
     <span className="quiz-category">{selected.category} · {selected.difficulty}</span>
     {!result&&<span className="timer" aria-live="polite"><Clock3 size={15}/>{remaining}s left</span>}
    </div>
    {result?
     <div className="quiz-result">
      <div className="score-ring" style={{"--score":Math.max(0,Math.min(100,result.scorePercent))+"%"} as CSSProperties}>
       <div><b>{result.scorePercent}%</b><span>ACCURACY</span></div>
      </div>
      <span className="eyebrow"><Trophy size={14}/> RUN COMPLETE</span>
      <h2>{result.score} / {result.maxScore} correct</h2>
      <p>You earned <b className="xp-number">+{result.xpAwarded} XP</b> for this run.</p>
      <div className="quiz-domain-breakdown">
       <div className="panel-title"><span>DOMAIN STRENGTHS &amp; WEAKNESSES</span><Filter size={15}/></div>
       {domainBreakdown.length?
        <div className="domain-results">{domainBreakdown.map(item=><div className="domain-result" key={item.domain}><div><b>{item.domain}</b><span>{item.correct}/{item.total} correct</span></div><div className="domain-meter"><span style={{width:item.percent+"%"}}/></div><strong>{item.percent}%</strong></div>)}
        </div>
        :<p className="empty-note">Domain feedback was not returned for this attempt.</p>}
      </div>
      <div className="remediation"><h3>Review notes</h3>{(result.feedback??[]).map((item,index)=><p key={item.questionId}><span className={item.correct?"review-good":"review-bad"}>{item.correct?<Check size={14}/>:"↺"} Q{index+1}</span>{item.explanation}</p>)}</div>
      <div className="quiz-result-actions"><button className="btn secondary" onClick={()=>start(selected)}><RotateCcw size={16}/>Retake quiz</button><button className="btn primary" onClick={leaveQuiz}>Back to quizzes</button></div>
     </div>
    :
     <>
      <div className="quiz-filter-row">
       <div><span className="quiz-progress-row"><b>Question {Math.min(questionIndex+1,filteredQuestions.length)} of {filteredQuestions.length}</b><span>{selected.questions.length} total</span></span><span className="quiz-answer-count">{answeredCount} / {selected.questions.length} answered</span></div>
       <label className="quiz-domain-select"><Filter size={14}/><span>Domain</span><select value={domainFilter} onChange={e=>changeDomain(e.target.value)} aria-label="Filter quiz by domain">{domains.map(domain=><option key={domain}>{domain}</option>)}</select></label>
      </div>
      <div className="progress-track"><span style={{width:(filteredQuestions.length?((questionIndex+1)/filteredQuestions.length)*100:0)+"%"}}/></div>
      {!question?<div className="empty-state">No questions match this domain filter.</div>:
       <div className="question-block">
        <span className="eyebrow">{question.category} · {question.difficulty}</span>
        <h2>{question.prompt}</h2>
        <p className="quiz-instruction">Choose one answer. Your selection is highlighted immediately.</p>
        <div className="answer-options">{question.options.map((option,index)=><button key={option+"-"+index} type="button" aria-pressed={answers[question.id]===index} className={answers[question.id]===index?"answer-option selected":"answer-option"} onClick={()=>{setAnswers(old=>({...old,[question.id]:index}));setTimedOut(false);}}><span className="answer-letter">{String.fromCharCode(65+index)}</span><span>{option}</span>{answers[question.id]===index&&<span className="answer-state">Selected</span>}</button>)}</div>
        {timedOut&&<p role="status" className="answer-feedback incorrect-text"><b>Time expired.</b> This response is recorded as unanswered.</p>}
        {error&&<p role="status" className="form-message">{error}</p>}
        <div className="quiz-question-footer"><span>{questionIndex+1} / {filteredQuestions.length}</span><button className="btn primary" onClick={()=>void next()} disabled={!questionAnswered||busy}>{busy?"Saving…":questionIndex===filteredQuestions.length-1?(session?"Finish quiz":"Sign in to save"):"Next question"}<ArrowRight size={15}/></button></div>
       </div>}
     </>
    }
   </div>}
 </section>;
}

function PageTitle({eyebrow,title,subtitle}:{eyebrow:string;title:string;subtitle:string}){return <div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>}
