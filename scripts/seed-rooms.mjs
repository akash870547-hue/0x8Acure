const API = process.env.DPDP_API_BASE || "http://localhost:8080";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const rooms = [
  ["F1","DPDP-101","The Basics of DPDP","foundation"],
  ["F2","DPDP-102","Consent & Notice Architecture","foundation"],
  ["F3","DPDP-103","Rights of Data Principals","foundation"],
  ["T1","TECH-201","Data Minimization & Retention","technical"],
  ["T2","TECH-202","Encryption & Access Governance","technical"],
  ["T3","TECH-203","Incident Handling","technical"],
  ["G1","GOV-301","Significant Data Fiduciary","governance"],
  ["G2","GOV-302","Children & Cross-Border Processing","governance"],
  ["G3","GOV-303","Penalty Simulation","governance"]
];

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD first.");
  process.exit(1);
}

const login = await fetch(API + "/api/auth/login", {
  method: "POST",
  headers: {"content-type":"application/json"},
  body: JSON.stringify({email:ADMIN_EMAIL,password:ADMIN_PASSWORD})
});
if (!login.ok) throw new Error("Admin login failed: " + await login.text());
const {token} = await login.json();

const payload = rooms.map(function(r) {
  return {
    id:r[0],
    code:r[1],
    title:r[2],
    path:r[3],
    version:"2026.1",
    status:"published",
    source_url:"https://www.meity.gov.in/",
    legal_reference:"Review against current notified DPDP Act 2023 and DPDP Rules 2025",
    effective_from:null
  };
});

const seed = await fetch(API + "/api/admin/seed-rooms", {
  method:"POST",
  headers:{"content-type":"application/json","authorization":"Bearer " + token},
  body:JSON.stringify({rooms:payload})
});
if (!seed.ok) throw new Error("Seed failed: " + await seed.text());
console.log(await seed.json());
