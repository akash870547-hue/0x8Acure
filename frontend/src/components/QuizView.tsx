import { useEffect, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Check, Clock3, RotateCcw, Trophy } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthProvider";

type Question={id:string;prompt:string;options:string[];category:string;difficulty:string;position:number};
type Quiz={id:string;title:string;slug:string;description:string;category:string;difficulty:string;timeLimit:number;questions:Question[]};
type Result={score:number;maxScore:number;scorePercent:number;xpAwarded:number;feedback?:{questionId:string;correct:boolean;explanation:string;category:string}[]};
export function QuizView({onXp}:{onXp:(value:number)=>void}){
 const {session,openAuth}=useAuth();
 const [quizzes,setQuizzes]=useState<Quiz[]>([]),[selected,setSelected]=useState<Quiz|null>(null),[questionIndex,setQuestionIndex]=useState(0);
 const [answers,setAnswers]=useState<Record<string,number>>({}),[seconds,setSeconds]=useState(0),[remaining,setRemaining]=useState(30);
 const [attemptKey,setAttemptKey]=useState(""),[busy,setBusy]=useState(false),[result,setResult]=useState<Result|null>(null),[error,setError]=useState(""),[timedOut,setTimedOut]=useState(false);
 useEffect(()=>{api<{quizzes:Quiz[]}>('/api/quizzes').then(data=>setQuizzes(data.quizzes)).catch(err=>setError(err.message));},[]);
 const question=selected?.questions[questionIndex];
 const questionAnswered=!!question&&Object.hasOwn(answers,question.id);
 useEffect(()=>{
  if(!selected||result||questionAnswered)return;
  const timer=window.setInterval(()=>{
   setSeconds(old=>old+1);
   setRemaining(old=>{
    if(old<=1){setAnswers(current=>({...current,[selected.questions[questionIndex].id]:-1}));setTimedOut(true);return 30;}
    return old-1;
   });
  },1000);
  return()=>window.clearInterval(timer);
 },[selected,result,questionAnswered,questionIndex]);
 const start=(quiz:Quiz)=>{
  setSelected(quiz);setQuestionIndex(0);setAnswers({});setResult(null);setSeconds(0);setRemaining(30);
  setTimedOut(false);setError("");setAttemptKey(crypto.randomUUID());
 };
 const next=async()=>{
  if(!selected||!questionAnswered)return;
  if(questionIndex<selected.questions.length-1){setQuestionIndex(index=>index+1);setRemaining(30);setTimedOut(false);return;}
  if(!session){setError("Sign in to save your result and earn XP.");openAuth();return;}
  setBusy(true);setError("");
  try{
   const response=await api<Result>("/api/quizzes/submit",{method:"POST",body:JSON.stringify({quizId:selected.id,attemptKey,answers,timeSpent:seconds})},session.access_token);
   setResult(response);
   const fresh=await api<{user:{xp:number}}>("/api/auth/sync",{},session.access_token);onXp(fresh.user.xp);
  }catch(err){setError(err instanceof Error?err.message:"Could not save this quiz attempt.");}
  finally{setBusy(false);}
 };
 if(error&&!selected)return <section className="content-page"><PageTitle eyebrow="GAMIFIED KNOWLEDGE CHECK" title="Quiz Arena" subtitle="Timed quizzes across web, network, and identity security."/><div className="notice">{error}</div></section>;
 return <section className="content-page"><PageTitle eyebrow="GAMIFIED KNOWLEDGE CHECK" title="Quiz Arena" subtitle="Timed quizzes across web, network, and identity security."/>
 {!selected?<div className="quiz-grid">{quizzes.map(quiz=><article className="quiz-card" key={quiz.id}><div className="quiz-card-top"><span className="category-badge">{quiz.category}</span><span>{quiz.difficulty}</span></div><h2>{quiz.title}</h2><p>{quiz.description}</p><div className="quiz-card-meta"><span>{quiz.questions.length} questions</span><span><Clock3 size={14}/>{quiz.timeLimit} min</span></div><button className="btn primary" onClick={()=>start(quiz)}>Start quiz <ArrowRight size={16}/></button></article>)}{!quizzes.length&&!error&&<div className="empty-state">Loading quiz modules…</div>}</div>:<div className="quiz-stage panel">
  <div className="quiz-stage-top"><button className="text-button back-link" onClick={()=>setSelected(null)}><ArrowLeft size={15}/> All quizzes</button><span className="quiz-category">{selected.category} · {selected.difficulty}</span><span className="timer"><Clock3 size={15}/>{remaining}s left</span></div>
  {result?<div className="quiz-result"><div className="score-ring" style={{"--score":result.scorePercent+"%"} as CSSProperties}><div><b>{result.scorePercent}%</b><span>ACCURACY</span></div></div><span className="eyebrow"><Trophy size={14}/> RUN COMPLETE</span><h2>{result.score} / {result.maxScore} correct</h2><p>You earned <b className="xp-number">+{result.xpAwarded} XP</b> for this run.</p><div className="remediation"><h3>Review notes</h3>{result.feedback?.map((item,index)=><p key={item.questionId}><span className={item.correct?"review-good":"review-bad"}>{item.correct?<Check size={14}/>: "↺"} Q{index+1}</span>{item.explanation}</p>)}</div><button className="btn primary" onClick={()=>start(selected)}><RotateCcw size={16}/>Try Again</button></div>:<><div className="quiz-progress-row"><span>Question {questionIndex+1} of {selected.questions.length}</span><span>{Math.round((questionIndex/selected.questions.length)*100)}% complete</span></div><div className="progress-track"><span style={{width:(questionIndex/selected.questions.length*100)+"%"}}/></div><div className="question-block"><span className="eyebrow">{question?.category} · {question?.difficulty}</span><h2>{question?.prompt}</h2><p className="quiz-instruction">Choose one answer. Results and explanations appear after your final submission.</p><div className="answer-options">{question?.options.map((option,index)=><button key={option} aria-pressed={answers[question.id]===index} className={answers[question.id]===index?"answer-option selected":"answer-option"} onClick={()=>{setAnswers(old=>({...old,[question.id]:index}));setTimedOut(false);}}><span className="answer-letter">{String.fromCharCode(65+index)}</span><span>{option}</span>{answers[question.id]===index&&<span className="answer-state">Selected</span>}</button>)}</div>{timedOut&&<p role="status" className="answer-feedback incorrect-text"><b>Time expired.</b> This response is recorded as unanswered.</p>}{error&&<p role="status" className="form-message">{error}</p>}<div className="quiz-question-footer"><span>{Object.keys(answers).length} / {selected.questions.length} answered</span><button className="btn primary" onClick={()=>void next()} disabled={!questionAnswered||busy}>{busy?"Saving…":questionIndex===selected.questions.length-1?(session?"Finish quiz":"Sign in to save"):"Next question"}<ArrowRight size={15}/></button></div></div></>}
 </div>}
 </section>;
}
function PageTitle({eyebrow,title,subtitle}:{eyebrow:string;title:string;subtitle:string}){return <div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>}
