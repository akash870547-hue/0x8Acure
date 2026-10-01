import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();
const quizzes = [
  {
    slug: "web-security-basics", title: "Web Security Basics", category: "Web Pentest", difficulty: "Beginner",
    description: "Identify common web application security controls.",
    questions: [
      {prompt:"Which response header is designed to reduce clickjacking risk?",options:["X-Frame-Options","Server","ETag","Accept-Ranges"],correctOption:0,explanation:"X-Frame-Options, or a CSP frame-ancestors directive, controls whether a page can be embedded in frames.",category:"Web Pentest",difficulty:"Beginner"},
      {prompt:"What is the safest way to prevent SQL injection in a database query?",options:["Escape quotes manually","Use parameterized queries","Hide database errors","Block spaces"],correctOption:1,explanation:"Parameterized queries keep user-controlled values separate from SQL syntax.",category:"Web Pentest",difficulty:"Beginner"}
    ]
  },
  {
    slug: "network-defense", title: "Network Defense Essentials", category: "Network Security", difficulty: "Beginner",
    description: "Practice safe network monitoring and segmentation decisions.",
    questions: [
      {prompt:"What does a default-deny firewall policy do?",options:["Allows all traffic","Blocks traffic unless explicitly permitted","Blocks only inbound traffic","Disables logging"],correctOption:1,explanation:"Default deny blocks unmatched traffic, allowing only rules that are explicitly approved.",category:"Network Security",difficulty:"Beginner"},
      {prompt:"Which protocol protects web traffic in transit?",options:["HTTP","Telnet","TLS","FTP"],correctOption:2,explanation:"TLS provides encryption and integrity for connections such as HTTPS.",category:"Network Security",difficulty:"Beginner"}
    ]
  },
  {
    slug: "identity-and-directory", title: "Identity & Directory Security", category: "Active Directory", difficulty: "Intermediate",
    description: "Review practical identity hardening concepts.",
    questions: [
      {prompt:"Which practice best limits standing administrative privilege?",options:["Shared admin accounts","Just-in-time privileged access","Long-lived domain admin sessions","Password reuse"],correctOption:1,explanation:"Just-in-time access grants elevated rights only when needed and for a limited duration.",category:"Active Directory",difficulty:"Intermediate"},
      {prompt:"What is a key benefit of tiered administration?",options:["Fewer audit events","Separating high-value identity systems from user endpoints","Removing MFA","Using one admin account everywhere"],correctOption:1,explanation:"Tiering reduces credential exposure by separating administrative boundaries and workflows.",category:"Active Directory",difficulty:"Intermediate"}
    ]
  }
];

const projects = [
  {slug:"dpdp-source-lab",title:"DPDP Source Lab",summary:"A source-first learning experience for exploring India's Digital Personal Data Protection Act and Rules.",content:"## What it does\n\nTurns primary-source provisions into short learning rooms, cited questions, and completion tracking.\n\n## Focus\n\n- Source traceability\n- Privacy engineering\n- Accessible learning flows",tags:["Privacy","Tooling"],featured:true},
  {slug:"web-header-observatory",title:"Web Header Observatory",summary:"A safe local checklist for inspecting browser security headers on systems you own or are authorized to assess.",content:"## What it does\n\nOrganizes common response headers by purpose and provides defensive review notes.\n\n> Use only on systems you own or are authorized to test.",tags:["Web","Tooling"],featured:true},
  {slug:"network-segmentation-notes",title:"Network Segmentation Notes",summary:"A concise visual notebook for documenting trust boundaries and defensive access paths.",content:"## What it does\n\nMaps zones, expected flows, and review questions for a small lab network.",tags:["Network","Writeup"],featured:false},
  {slug:"identity-hardening-lab",title:"Identity Hardening Lab",summary:"A defensive practice plan for reducing standing privileges and improving account recovery.",content:"## What it does\n\nA repeatable checklist for MFA coverage, privileged access, recovery, and audit review.",tags:["Active Directory","Writeup"],featured:false}
];

async function main() {
  const email=(process.env.ADMIN_EMAIL||"admin@0x8acure.local").trim().toLowerCase();
  const username=(process.env.ADMIN_USERNAME||"0x8acure-admin").trim();
  const admin=await prisma.user.upsert({where:{email},update:{username,role:"admin"},create:{id:process.env.SEED_ADMIN_USER_ID||randomUUID(),email,username,role:"admin"}});

  for(const quiz of quizzes){
    const {questions:quizQuestions,...quizData}=quiz;
    const saved=await prisma.quiz.upsert({where:{slug:quiz.slug},update:{title:quiz.title,description:quiz.description,category:quiz.category,difficulty:quiz.difficulty,isActive:true},create:{...quizData,isActive:true}});
    for(const [position,question] of quizQuestions.entries()){
      await prisma.question.upsert({where:{quizId_position:{quizId:saved.id,position}},update:{...question,options:question.options},create:{...question,options:question.options,quizId:saved.id,position}});
    }
  }
  for(const project of projects){
    await prisma.project.upsert({where:{slug:project.slug},update:{...project,published:true},create:{...project,published:true,createdById:admin.id}});
  }
  const rooms=[
    {slug:"web-pentest",title:"Web Application Lab",topic:"Web Pentest"},
    {slug:"network-security",title:"Network Defense Room",topic:"Network Security"},
    {slug:"identity-defense",title:"Identity Defense Room",topic:"Active Directory"}
  ];
  for(const room of rooms) await prisma.room.upsert({where:{slug:room.slug},update:{...room,isActive:true},create:{...room,isActive:true,createdBy:admin.id}});
}

main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>prisma.$disconnect());
