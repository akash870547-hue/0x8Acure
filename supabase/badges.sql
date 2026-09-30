
-- Badge catalog and authoritative server-side badge evaluation
create table if not exists public.badge_catalog (
  id text primary key, name text not null, criteria text not null, category text not null check (category in ('room','path','skill','streak')), artwork_svg text not null
);
create table if not exists public.user_learning_days (
  user_id uuid not null references auth.users(id) on delete cascade, learning_date date not null, primary key(user_id,learning_date)
);
create table if not exists public.hint_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null,
  used_at timestamptz not null default now()
);
create index if not exists hint_events_user_task_idx on public.hint_events(user_id,task_id);
alter table public.room_progress add column if not exists hints_used integer not null default 0 check (hints_used >= 0);
alter table public.room_progress add column if not exists score_percent integer not null default 0 check (score_percent between 0 and 100);

insert into public.badge_catalog(id,name,criteria,category,artwork_svg) values
('room-f-overview','DPDP Overview and Scope','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">DPDP Overview and Scope</text></svg>'),
('room-f-definitions','Key Definitions and Roles','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Key Definitions and Roles</text></svg>'),
('room-f-notice-consent','Notice and Consent','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Notice and Consent</text></svg>'),
('room-f-rights-duties','Rights and Duties of Data Principals','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Rights and Duties of Data </text></svg>'),
('room-f-legitimate-uses','Certain Legitimate Uses','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Certain Legitimate Uses</text></svg>'),
('room-f-penalties','Penalties at a Glance','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Penalties at a Glance</text></svg>'),
('room-i-purpose','Purpose Limitation and Data Necessity','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Purpose Limitation and Dat</text></svg>'),
('room-i-security','Security Safeguards','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Security Safeguards</text></svg>'),
('room-i-retention','Retention and Erasure','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Retention and Erasure</text></svg>'),
('room-i-breach','Personal Data Breach Intimation','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Personal Data Breach Intim</text></svg>'),
('room-i-processors','Data Processor Obligations','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Data Processor Obligations</text></svg>'),
('room-i-consent','Consent Managers','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Consent Managers</text></svg>'),
('room-i-grievance','Grievance Redressal','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Grievance Redressal</text></svg>'),
('room-a-sdf','Significant Data Fiduciary Obligations','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Significant Data Fiduciary</text></svg>'),
('room-a-children','Children''s Data and Verifiable Parental Consent','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Children''s Data and Verifi</text></svg>'),
('room-a-crossborder','Cross-border Transfer','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Cross-border Transfer</text></svg>'),
('room-a-board','Data Protection Board and Appeals','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Data Protection Board and </text></svg>'),
('room-a-exemptions','Exemptions','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Exemptions</text></svg>'),
('room-a-penalty-analysis','Penalty Schedule Analysis','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Penalty Schedule Analysis</text></svg>'),
('room-a-full-incident','Full Incident Simulation','Complete room with score >= 70%.','room','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Full Incident Simulation</text></svg>'),
('path-foundation-complete','Foundation Complete','Complete all Foundation rooms.','path','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Foundation Complete</text></svg>'),
('path-intermediate-complete','Intermediate Complete','Complete all Intermediate rooms.','path','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Intermediate Complete</text></svg>'),
('path-advanced-complete','Advanced Complete','Complete all Advanced rooms.','path','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Advanced Complete</text></svg>'),
('skill-consent-expert','Consent Expert','Answer all tasks in Notice and Consent correctly.','skill','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Consent Expert</text></svg>'),
('skill-breach-responder','Breach Responder','Answer all tasks in Personal Data Breach Intimation correctly.','skill','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Breach Responder</text></svg>'),
('skill-penalty-analyst','Penalty Analyst','Answer all tasks in Penalties at a Glance and Penalty Schedule Analysis correctly.','skill','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">Penalty Analyst</text></svg>'),
('skill-no-hints-room','No-Hints Room','Complete any room with score >= 70% without using a hint.','skill','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">No-Hints Room</text></svg>'),
('streak-3','3 Day Streak','Learn on 3 consecutive days.','streak','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">3 Day Streak</text></svg>'),
('streak-7','7 Day Streak','Learn on 7 consecutive days.','streak','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">7 Day Streak</text></svg>'),
('streak-30','30 Day Streak','Learn on 30 consecutive days.','streak','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect x="12" y="12" width="216" height="216" rx="42" fill="#0b1220" stroke="#334155" stroke-width="4"/><path d="M120 42 145 91 199 99 160 137 170 191 120 165 70 191 80 137 41 99 95 91Z" fill="url(#g)"/><text x="120" y="214" text-anchor="middle" fill="#e7edf6" font-family="Arial" font-size="14" font-weight="700">30 Day Streak</text></svg>')
on conflict (id) do update set name=excluded.name,criteria=excluded.criteria,category=excluded.category,artwork_svg=excluded.artwork_svg;

create table if not exists public.task_catalog (
  id text primary key, room_id text not null, correct_answer jsonb not null
);
insert into public.task_catalog(id,room_id,correct_answer) values
('f-overview-t1','f-overview','0'::jsonb),
('f-overview-t2','f-overview','0'::jsonb),
('f-overview-t3','f-overview','0'::jsonb),
('f-overview-t4','f-overview','0'::jsonb),
('f-overview-t5','f-overview','[0,1,2,3]'::jsonb),
('f-overview-t6','f-overview','0'::jsonb),
('f-definitions-t1','f-definitions','0'::jsonb),
('f-definitions-t2','f-definitions','0'::jsonb),
('f-definitions-t3','f-definitions','0'::jsonb),
('f-definitions-t4','f-definitions','0'::jsonb),
('f-definitions-t5','f-definitions','[0,1,2,3]'::jsonb),
('f-definitions-t6','f-definitions','0'::jsonb),
('f-notice-consent-t1','f-notice-consent','0'::jsonb),
('f-notice-consent-t2','f-notice-consent','0'::jsonb),
('f-notice-consent-t3','f-notice-consent','0'::jsonb),
('f-notice-consent-t4','f-notice-consent','0'::jsonb),
('f-notice-consent-t5','f-notice-consent','[0,1,2,3]'::jsonb),
('f-notice-consent-t6','f-notice-consent','0'::jsonb),
('f-rights-duties-t1','f-rights-duties','0'::jsonb),
('f-rights-duties-t2','f-rights-duties','0'::jsonb),
('f-rights-duties-t3','f-rights-duties','0'::jsonb),
('f-rights-duties-t4','f-rights-duties','0'::jsonb),
('f-rights-duties-t5','f-rights-duties','[0,1,2,3]'::jsonb),
('f-rights-duties-t6','f-rights-duties','0'::jsonb),
('f-legitimate-uses-t1','f-legitimate-uses','0'::jsonb),
('f-legitimate-uses-t2','f-legitimate-uses','0'::jsonb),
('f-legitimate-uses-t3','f-legitimate-uses','0'::jsonb),
('f-legitimate-uses-t4','f-legitimate-uses','0'::jsonb),
('f-legitimate-uses-t5','f-legitimate-uses','[0,1,2,3]'::jsonb),
('f-legitimate-uses-t6','f-legitimate-uses','0'::jsonb),
('f-penalties-t1','f-penalties','0'::jsonb),
('f-penalties-t2','f-penalties','0'::jsonb),
('f-penalties-t3','f-penalties','0'::jsonb),
('f-penalties-t4','f-penalties','0'::jsonb),
('f-penalties-t5','f-penalties','[0,1,2,3]'::jsonb),
('f-penalties-t6','f-penalties','0'::jsonb),
('i-purpose-t1','i-purpose','0'::jsonb),
('i-purpose-t2','i-purpose','0'::jsonb),
('i-purpose-t3','i-purpose','0'::jsonb),
('i-purpose-t4','i-purpose','0'::jsonb),
('i-purpose-t5','i-purpose','[0,1,2,3]'::jsonb),
('i-purpose-t6','i-purpose','0'::jsonb),
('i-security-t1','i-security','0'::jsonb),
('i-security-t2','i-security','0'::jsonb),
('i-security-t3','i-security','0'::jsonb),
('i-security-t4','i-security','0'::jsonb),
('i-security-t5','i-security','[0,1,2,3]'::jsonb),
('i-security-t6','i-security','0'::jsonb),
('i-retention-t1','i-retention','0'::jsonb),
('i-retention-t2','i-retention','0'::jsonb),
('i-retention-t3','i-retention','0'::jsonb),
('i-retention-t4','i-retention','0'::jsonb),
('i-retention-t5','i-retention','[0,1,2,3]'::jsonb),
('i-retention-t6','i-retention','0'::jsonb),
('i-breach-t1','i-breach','0'::jsonb),
('i-breach-t2','i-breach','0'::jsonb),
('i-breach-t3','i-breach','0'::jsonb),
('i-breach-t4','i-breach','0'::jsonb),
('i-breach-t5','i-breach','[0,1,2,3]'::jsonb),
('i-breach-t6','i-breach','0'::jsonb),
('i-processors-t1','i-processors','0'::jsonb),
('i-processors-t2','i-processors','0'::jsonb),
('i-processors-t3','i-processors','0'::jsonb),
('i-processors-t4','i-processors','0'::jsonb),
('i-processors-t5','i-processors','[0,1,2,3]'::jsonb),
('i-processors-t6','i-processors','0'::jsonb),
('i-consent-t1','i-consent','0'::jsonb),
('i-consent-t2','i-consent','0'::jsonb),
('i-consent-t3','i-consent','0'::jsonb),
('i-consent-t4','i-consent','0'::jsonb),
('i-consent-t5','i-consent','[0,1,2,3]'::jsonb),
('i-consent-t6','i-consent','0'::jsonb),
('i-grievance-t1','i-grievance','0'::jsonb),
('i-grievance-t2','i-grievance','0'::jsonb),
('i-grievance-t3','i-grievance','0'::jsonb),
('i-grievance-t4','i-grievance','0'::jsonb),
('i-grievance-t5','i-grievance','[0,1,2,3]'::jsonb),
('i-grievance-t6','i-grievance','0'::jsonb),
('a-sdf-t1','a-sdf','0'::jsonb),
('a-sdf-t2','a-sdf','0'::jsonb),
('a-sdf-t3','a-sdf','0'::jsonb),
('a-sdf-t4','a-sdf','0'::jsonb),
('a-sdf-t5','a-sdf','[0,1,2,3]'::jsonb),
('a-sdf-t6','a-sdf','0'::jsonb),
('a-children-t1','a-children','0'::jsonb),
('a-children-t2','a-children','0'::jsonb),
('a-children-t3','a-children','0'::jsonb),
('a-children-t4','a-children','0'::jsonb),
('a-children-t5','a-children','[0,1,2,3]'::jsonb),
('a-children-t6','a-children','0'::jsonb),
('a-crossborder-t1','a-crossborder','0'::jsonb),
('a-crossborder-t2','a-crossborder','0'::jsonb),
('a-crossborder-t3','a-crossborder','0'::jsonb),
('a-crossborder-t4','a-crossborder','0'::jsonb),
('a-crossborder-t5','a-crossborder','[0,1,2,3]'::jsonb),
('a-crossborder-t6','a-crossborder','0'::jsonb),
('a-board-t1','a-board','0'::jsonb),
('a-board-t2','a-board','0'::jsonb),
('a-board-t3','a-board','0'::jsonb),
('a-board-t4','a-board','0'::jsonb),
('a-board-t5','a-board','[0,1,2,3]'::jsonb),
('a-board-t6','a-board','0'::jsonb),
('a-exemptions-t1','a-exemptions','0'::jsonb),
('a-exemptions-t2','a-exemptions','0'::jsonb),
('a-exemptions-t3','a-exemptions','0'::jsonb),
('a-exemptions-t4','a-exemptions','0'::jsonb),
('a-exemptions-t5','a-exemptions','[0,1,2,3]'::jsonb),
('a-exemptions-t6','a-exemptions','0'::jsonb),
('a-penalty-analysis-t1','a-penalty-analysis','0'::jsonb),
('a-penalty-analysis-t2','a-penalty-analysis','0'::jsonb),
('a-penalty-analysis-t3','a-penalty-analysis','0'::jsonb),
('a-penalty-analysis-t4','a-penalty-analysis','0'::jsonb),
('a-penalty-analysis-t5','a-penalty-analysis','[0,1,2,3]'::jsonb),
('a-penalty-analysis-t6','a-penalty-analysis','0'::jsonb),
('a-capstone-t1','a-capstone','0'::jsonb),
('a-capstone-t2','a-capstone','0'::jsonb),
('a-capstone-t3','a-capstone','0'::jsonb),
('a-capstone-t4','a-capstone','0'::jsonb),
('a-capstone-t5','a-capstone','[0,1,2,3]'::jsonb),
('a-capstone-t6','a-capstone','0'::jsonb)
on conflict (id) do update set room_id=excluded.room_id,correct_answer=excluded.correct_answer;

alter table public.badge_catalog enable row level security;
revoke all on public.badge_catalog from anon,authenticated;
grant select on public.badge_catalog to authenticated;
drop policy if exists badge_catalog_read on public.badge_catalog;
create policy badge_catalog_read on public.badge_catalog for select to authenticated using (true);

alter table public.user_learning_days enable row level security;
revoke all on public.user_learning_days from anon,authenticated;
grant select on public.user_learning_days to authenticated;
drop policy if exists learning_days_select_own on public.user_learning_days;
create policy learning_days_select_own on public.user_learning_days for select to authenticated using (auth.uid()=user_id);

revoke all on public.task_catalog from anon,authenticated;

revoke insert,update,delete on public.task_submissions from authenticated;
revoke insert,update,delete on public.badges_earned from authenticated;

create or replace function public.award_badge(p_user uuid,p_badge text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_inserted integer;
begin
  if p_user is null or p_user <> auth.uid() then raise exception 'Not authorized'; end if;
  insert into public.badges_earned(user_id,badge_id) values(p_user,p_badge) on conflict (user_id,badge_id) do nothing;
  get diagnostics v_inserted = row_count;
  return v_inserted = 1;
end; $$;
revoke all on function public.award_badge(uuid,text) from public,anon;
grant execute on function public.award_badge(uuid,text) to authenticated;

create or replace function public.evaluate_badges(p_user uuid)
returns table(badge_id text,name text,earned_date timestamptz) language plpgsql security definer set search_path = public as $$
declare b record; total integer; correct integer; pct integer; done_count integer; streak integer;
begin
  if p_user is null or p_user <> auth.uid() then raise exception 'Not authorized'; end if;
  insert into public.user_learning_days(user_id,learning_date)
    select p_user,current_date where not exists(select 1 from public.user_learning_days where user_id=p_user and learning_date=current_date)
    on conflict do nothing;
  select count(*) into done_count from public.room_progress where user_id=p_user and completed=true and score_percent>=70;
  for b in select id,name,category from public.badge_catalog loop
    if b.category='room' then
      select count(*) into total from public.task_catalog t where t.room_id=replace(b.id,'room-','');
      select count(distinct s.task_id) into correct from public.task_submissions s join public.task_catalog t on t.id=s.task_id where s.user_id=p_user and t.room_id=replace(b.id,'room-','') and s.correct=true;
      if total>0 and correct*100>=total*70 then perform public.award_badge(p_user,b.id); end if;
    elsif b.id like 'path-%-complete' then
      declare eligible integer;
      begin
        select count(*) into eligible from (
          select t.room_id
          from public.task_catalog t
          left join public.task_submissions s on s.task_id=t.id and s.user_id=p_user and s.correct=true
          group by t.room_id
          having count(*) > 0 and count(distinct s.task_id)*100 >= count(*)*70
        ) q;
        if (b.id='path-foundation-complete' and eligible>=6)
          or (b.id='path-intermediate-complete' and eligible>=13)
          or (b.id='path-advanced-complete' and eligible>=20)
        then perform public.award_badge(p_user,b.id); end if;
      end;

    elsif b.id in ('skill-consent-expert','skill-breach-responder','skill-penalty-analyst') then
      if b.id='skill-consent-expert' then select count(*) into total from public.task_catalog where room_id='f-notice-consent'; select count(distinct s.task_id) into correct from public.task_submissions s join public.task_catalog t on t.id=s.task_id where s.user_id=p_user and t.room_id='f-notice-consent' and s.correct=true;
      elsif b.id='skill-breach-responder' then select count(*) into total from public.task_catalog where room_id='i-breach'; select count(distinct s.task_id) into correct from public.task_submissions s join public.task_catalog t on t.id=s.task_id where s.user_id=p_user and t.room_id='i-breach' and s.correct=true;
      else select count(*) into total from public.task_catalog where room_id in ('f-penalties','a-penalty-analysis'); select count(distinct s.task_id) into correct from public.task_submissions s join public.task_catalog t on t.id=s.task_id where s.user_id=p_user and t.room_id in ('f-penalties','a-penalty-analysis') and s.correct=true; end if;
      if total>0 and correct=total then perform public.award_badge(p_user,b.id); end if;
    elsif b.id='skill-no-hints-room' then
      if exists(
        select 1 from (
          select t.room_id
          from public.task_catalog t
          left join public.task_submissions s on s.task_id=t.id and s.user_id=p_user and s.correct=true
          where t.id not in (select distinct he.task_id from public.hint_events he where he.user_id=p_user)
          group by t.room_id
          having count(*) > 0 and count(distinct s.task_id)*100 >= count(*)*70
        ) q
      ) then perform public.award_badge(p_user,b.id); end if;
    elsif b.id in ('streak-3','streak-7','streak-30') then
      select count(*) into streak from (select learning_date, learning_date-(row_number() over(order by learning_date))::int grp from public.user_learning_days where user_id=p_user) q group by grp order by count(*) desc limit 1;
      if (b.id='streak-3' and coalesce(streak,0)>=3) or (b.id='streak-7' and coalesce(streak,0)>=7) or (b.id='streak-30' and coalesce(streak,0)>=30) then perform public.award_badge(p_user,b.id); end if;
    end if;
  end loop;
  return query select e.badge_id,c.name,e.earned_at from public.badges_earned e join public.badge_catalog c on c.id=e.badge_id where e.user_id=p_user order by e.earned_at desc;
end; $$;
revoke all on function public.evaluate_badges(uuid) from public,anon;
grant execute on function public.evaluate_badges(uuid) to authenticated;

create or replace function public.submit_task(p_task_id text,p_answer jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare t record; ok boolean; awarded integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into t from public.task_catalog where id=p_task_id;
  if not found then raise exception 'Unknown task'; end if;
  ok := t.correct_answer = p_answer;
  insert into public.task_submissions(user_id,task_id,answer,correct,points) values(auth.uid(),p_task_id,p_answer,ok,case when ok then 10 else 0 end);
  insert into public.user_learning_days(user_id,learning_date) values(auth.uid(),current_date) on conflict do nothing;
  insert into public.hint_events(user_id,task_id) values(auth.uid(),p_task_id);
  perform public.evaluate_badges(auth.uid());
  return jsonb_build_object('correct',ok,'points',case when ok then 10 else 0 end);
end; $$;
revoke all on function public.submit_task(text,jsonb) from public,anon;
grant execute on function public.submit_task(text,jsonb) to authenticated;

create or replace function public.use_hint(p_task_id text)
returns boolean language plpgsql security definer set search_path = public as $$
declare rid text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select room_id into rid from public.task_catalog where id=p_task_id;
  if rid is null then raise exception 'Unknown task'; end if;
  insert into public.hint_events(user_id,task_id) values(auth.uid(),p_task_id);
  insert into public.room_progress(user_id,room_id,hints_used) values(auth.uid(),rid,1)
    on conflict(user_id,room_id) do update set hints_used=public.room_progress.hints_used+1;
  return true;
end; $$;
revoke all on function public.use_hint(text) from public,anon;
grant execute on function public.use_hint(text) to authenticated;

create or replace function public.complete_room(p_room_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare total integer; correct integer; pct integer; hints integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select count(*) into total from public.task_catalog where room_id=p_room_id;
  select count(distinct task_id) into correct from public.task_submissions s join public.task_catalog t on t.id=s.task_id where s.user_id=auth.uid() and t.room_id=p_room_id and s.correct=true;
  pct:=case when total=0 then 0 else floor(correct*100.0/total) end;
  if pct<70 then return jsonb_build_object('completed',false,'score_percent',pct,'reason','Room requires at least 70%'); end if;
  select coalesce(hints_used,0) into hints from public.room_progress where user_id=auth.uid() and room_id=p_room_id;
  insert into public.room_progress(user_id,room_id,completed,xp,score_percent,completed_at) values(auth.uid(),p_room_id,true,30,pct,now())
    on conflict(user_id,room_id) do update set completed=true,score_percent=excluded.score_percent,completed_at=coalesce(public.room_progress.completed_at,now());
  perform public.evaluate_badges(auth.uid());
  return jsonb_build_object('completed',true,'score_percent',pct,'hints_used',coalesce(hints,0));
end; $$;
revoke all on function public.complete_room(text) from public,anon;
grant execute on function public.complete_room(text) to authenticated;
