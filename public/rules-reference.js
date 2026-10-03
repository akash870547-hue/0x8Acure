window.DPDP_RULES_REFERENCE={
  id:"rules-reference",
  level:"RULES",
  name:"DPDP Rules, 2025 · Official Rule Index",
  tag:"Government Gazette",
  description:"Rule-by-rule index of the notified Digital Personal Data Protection Rules, 2025. The authoritative text is the MeitY Gazette PDF.",
  source:{
    id:"rules-2025",
    title:"Digital Personal Data Protection Rules, 2025",
    publisher:"Ministry of Electronics and Information Technology, Government of India",
    notification:"G.S.R. 846(E), 13 November 2025",
    url:"https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf"
  },
  commencement:{
    immediate:"Rules 1, 2 and 17 to 21",
    after_one_year:"Rule 4",
    after_eighteen_months:"Rules 3, 5 to 16, 22 and 23"
  },
  rules:Array.from({length:23},(_,i)=>({
    id:"rule"+(i+1),
    title:"Rule "+(i+1),
    source:"rules-2025",
    officialTextUrl:"https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf",
    verification:"Use the notified Gazette text. Do not substitute the draft Rules or explanatory note."
  })),
  schedules:Array.from({length:7},(_,i)=>({
    id:"schedule"+(i+1),
    title:"Schedule "+(i+1),
    source:"rules-2025",
    officialTextUrl:"https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf"
  }))
};