window.DPDP_ROOMS = [
  {
    path: 'foundation', level: '01', name: 'Foundation', difficulty: 'Beginner', audience: 'HR · Marketing · Operations · Newcomers', accent: 'cyan',
    description: 'Learn the actors, concepts and practical decisions behind personal-data processing.',
    rooms: [
      { id:'F1', code:'DPDP-101', title:'The Basics of DPDP', type:'Scenario Room', xp:180, description:'Identify personal data, Data Principal, Data Fiduciary and Data Processor in a real product workflow.',
        theory:['Digital personal data is the core scope of this platform. In a scenario, start by identifying whose data is involved, who decides the purpose and means, and who processes data on another party\'s behalf.','Treat the labels as roles in the scenario, not job titles. One organisation can act in different roles depending on the processing activity.'],
        tasks:[
          {type:'mcq', q:'An e-commerce company decides why customer contact details are collected and uses a vendor to send delivery messages. Which role best describes the e-commerce company for that processing?', options:['Data Principal','Data Fiduciary','Data Processor','Consent Manager'], answer:1, xp:40, explanation:'The organisation deciding the purpose and means of processing is the Data Fiduciary.'},
          {type:'flag', q:'A scenario note says: “The person to whom the personal data relates is the protected individual in the workflow.” Submit the role as the flag value.', answer:'data principal', xp:35, explanation:'The role described is the Data Principal.'},
          {type:'mcq', q:'A specialist service provider processes customer data on behalf of the deciding organisation. Which label fits that relationship?', options:['Data Processor','Data Principal','Board','Data Fiduciary'], answer:0, xp:35, explanation:'A processor handles personal data on behalf of the Data Fiduciary.'},
          {type:'flag', q:'Flag format: flag{role_that_decides_purpose}. Enter only the role name inside the braces.', answer:'data fiduciary', xp:70, explanation:'The role that decides the purpose of processing is the Data Fiduciary.'}
        ]},
      { id:'F2', code:'DPDP-102', title:'Consent & Notice Architecture', type:'Scenario Room', xp:180, description:'Review a checkout flow and identify clearer notice and consent patterns.',
        theory:['A notice should be understandable and give the information needed for informed consent.','For exercises, distinguish a genuine choice from a misleading or bundled interaction. Use the current Act and Rules source material when designing production training.'],
        tasks:[
          {type:'mcq', q:'Which checkout design is the clearest example of an explicit opt-in for optional marketing?', options:['Marketing box is pre-selected','User actively checks an unchecked marketing box','Marketing is bundled into an unrelated mandatory field','The app hides the choice behind a tiny link'], answer:1, xp:45, explanation:'An explicit action on an unchecked optional box is the clearest opt-in pattern.'},
          {type:'mcq', q:'Which notice characteristic is most aligned with a learner-friendly compliance review?', options:['Hidden inside unrelated text','Clear and understandable on its own','Only available after consent','Uses unexplained legal jargon'], answer:1, xp:45, explanation:'The Rules describe notice as standalone, understandable and in clear/plain language.'},
          {type:'flag', q:'Flag: identify the design pattern to reject when an optional consent control starts selected by default.', answer:'pre-ticked checkbox', xp:90, explanation:'The challenge is about avoiding a pre-selected optional consent choice.'}
        ]},
      { id:'F3', code:'DPDP-103', title:'Rights of Data Principals', type:'Scenario Room', xp:90, description:'Handle a support ticket involving access, correction, erasure and grievance workflows.',
        theory:['Rights exercises should be mapped to a clear operational flow: identify the request, verify the relevant account or workflow, route it correctly, and record completion.','In a real implementation, room content should distinguish the Act text from organisation-specific operating procedures.'],
        tasks:[
          {type:'mcq', q:'A learner reports that their personal data record contains an incorrect phone number. What request should they practice routing?', options:['Correction request','Security incident','Vendor onboarding','Marketing opt-in'], answer:0, xp:45, explanation:'The scenario is a correction request.'},
          {type:'mcq', q:'A complaint that was not resolved through an organisation\'s grievance route belongs to which learning workflow?', options:['Grievance redressal','Network scanning','Asset discovery','Threat hunting'], answer:0, xp:45, explanation:'The scenario belongs in the grievance workflow.'}
        ]}
      ]
  },
  {
    path:'technical', level:'02', name:'Technical & Security Controls', difficulty:'Intermediate', audience:'Engineers · Product · DevOps · IT', accent:'violet',
    description:'Turn privacy principles into technical controls, evidence and incident workflows.',
    rooms:[
      {id:'T1',code:'TECH-201',title:'Data Minimization & Retention',type:'Scenario Room',xp:140,description:'Decide what data a feature genuinely needs and what should happen after the purpose is complete.',
        theory:['Start with purpose, then test each field against that purpose. Document why a field is necessary rather than collecting it “just in case”.','Retention is an operational control: map retention triggers, owners, deletion or anonymisation actions, and evidence of completion.'],
        tasks:[
          {type:'mcq',q:'A delivery feature only needs a city and postal code, but the product team wants to collect date of birth “for analytics”. What should a privacy review challenge first?',options:['Whether the extra field has a specified purpose and necessity','Whether the dashboard is dark mode','Whether the database is on SSD','Whether the UI uses React'],answer:0,xp:60,explanation:'The first review question is whether the extra collection has a defined and justified purpose.'},
          {type:'flag',q:'Flag: the principle of collecting only what is necessary for a stated purpose.',answer:'data minimization',xp:80,explanation:'That is the core concept tested by this room.'}
        ]},
      {id:'T2',code:'TECH-202',title:'Encryption & Access Governance',type:'Scenario Room',xp:140,description:'Build an evidence trail around least privilege, access reviews and protection of personal data.',
        theory:['Use least privilege and role-based access as practical design patterns. Review who can access what, why they can access it, and how access changes are recorded.','Separate security controls from privacy decisions, while showing how they reinforce each other.'],
        tasks:[
          {type:'mcq',q:'A support analyst should view order status but not export full customer profiles. Which control best expresses that boundary?',options:['Role-based access control','Open public bucket','Shared admin account','Disable all logging'],answer:0,xp:60,explanation:'RBAC can separate permissions by role and task.'},
          {type:'flag',q:'Flag: a control that records who accessed a data system and when.',answer:'audit log',xp:80,explanation:'Audit logs create an evidence trail for access activity.'}
        ]},
      {id:'T3',code:'TECH-203',title:'Incident Handling',type:'Scenario Room',xp:160,description:'Practice the first-response path after a personal-data security incident.',
        theory:['Train the workflow rather than memorising a single clock. Capture facts, contain the issue, preserve evidence, assess affected data and follow the applicable notification and communication process.','This room deliberately avoids hard-coding an old draft timeline. Use the current notified law/rules and effective-date schedule when writing operational playbooks.'],
        tasks:[
          {type:'mcq',q:'What should happen before an incident team writes a public summary?',options:['Establish facts and preserve relevant evidence','Delete logs to reduce exposure','Guess the affected population','Publish employee passwords'],answer:0,xp:70,explanation:'Facts and evidence should be established before a final incident narrative is issued.'},
          {type:'flag',q:'Flag: the first governance objective when an incident is detected: preserve evidence and establish ____.',answer:'facts',xp:90,explanation:'The room uses “facts” as the missing term.'}
        ]}
    ]
  },
  {
    path:'governance', level:'03', name:'Governance, SDF & Penalties', difficulty:'Advanced', audience:'Compliance · Legal · Founders · DPO teams', accent:'amber',
    description:'Work through governance decisions, significant-data-fiduciary scenarios and penalty evidence.',
    rooms:[
      {id:'G1',code:'GOV-301',title:'Significant Data Fiduciary',type:'Scenario Room',xp:180,description:'Map higher-governance duties to an organisation profile and its processing risk.',
        theory:['Use the notified Act and Rules as the source of truth. Training content should distinguish obligations that are in force from obligations with a future effective date.','For advanced learners, ask what evidence an organisation would maintain to demonstrate governance decisions.'],
        tasks:[
          {type:'mcq',q:'A governance review finds that a team cannot show why a high-impact processing activity was approved. Which artifact would improve the evidence trail?',options:['Documented risk and compliance assessment','A decorative landing page','A social media post','A random password list'],answer:0,xp:80,explanation:'A documented risk/compliance assessment creates a decision trail.'},
          {type:'flag',q:'Flag: the governance role responsible for privacy leadership in the scenarios.',answer:'dpo',xp:100,explanation:'DPO is the expected role label in this room.'}
        ]},
      {id:'G2',code:'GOV-302',title:'Children & Cross-Border Processing',type:'Scenario Room',xp:180,description:'Test consent, safeguards and transfer decisions involving higher-risk data contexts.',
        theory:['Children’s-data scenarios require additional care. Build the exercise around the exact statutory and rules requirements that apply to the scenario and the effective date.','For transfers, teach learners to distinguish a transfer restriction from a general “data can never leave India” assumption.'],
        tasks:[
          {type:'mcq',q:'A product team wants to launch a child-focused service. What should the compliance team verify first?',options:['Applicable children’s-data requirements and safeguards','Whether the logo is animated','Whether the app has a leaderboard','Whether the office Wi-Fi is 5 GHz'],answer:0,xp:90,explanation:'The exercise starts with the applicable legal requirements and safeguards.'},
          {type:'flag',q:'Flag: the person whose personal data is processed, including in child-data scenarios.',answer:'data principal',xp:90,explanation:'The defined role remains the Data Principal.'}
        ]},
      {id:'G3',code:'GOV-303',title:'Penalty Simulation',type:'Decision Simulation',xp:230,description:'Run a post-mortem, identify control failures and connect them to evidence and remediation.',
        theory:['Do not reduce penalty learning to a single “fine number”. First identify the contravention, the relevant control failure and the organisation’s remediation evidence.','The Act contains a schedule of monetary penalties for specified contraventions. Use the current primary text for exact amounts and conditions.'],
        tasks:[
          {type:'mcq',q:'In a penalty post-mortem, which sequence is the strongest starting point?',options:['Contravention → failed control → evidence → remediation','Penalty number → guess the incident','UI colour → employee count → invoice','Marketing message → press release → badge'],answer:0,xp:110,explanation:'Start with the actual contravention, then identify the failed control, evidence and remediation.'},
          {type:'flag',q:'Flag: the document trail that shows what an organisation did to reduce repeat risk after an incident.',answer:'remediation evidence',xp:120,explanation:'The room focuses on evidence that remediation actually occurred.'}
        ]}
    ]
  }
];

window.findRoom = function(id){
  for(const path of DPDP_ROOMS){ const r=path.rooms.find(x=>x.id===id); if(r) return {...r, path:path.path, pathName:path.name, pathDifficulty:path.difficulty, accent:path.accent}; }
  return null;
};
