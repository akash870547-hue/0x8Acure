-- 0x8Acure server-side certificates. Run after schema.sql and badges.sql.
alter table public.certificates add column if not exists certificate_type text, add column if not exists path_id text, add column if not exists score_percent integer, add column if not exists completion_date date, add column if not exists payload jsonb, add column if not exists revoked boolean not null default false;
update public.certificates set certificate_type=coalesce(certificate_type,'legacy'),path_id=coalesce(path_id,'legacy'),score_percent=coalesce(score_percent,0),completion_date=coalesce(completion_date,issued_at::date),payload=coalesce(payload,'{}'::jsonb);
alter table public.certificates alter column certificate_type set not null,alter column path_id set not null,alter column score_percent set not null,alter column completion_date set not null;
create unique index if not exists certificates_user_type_uidx on public.certificates(user_id,certificate_type);
revoke all on public.certificates from anon,authenticated;

create or replace function public.issue_certificate(p_type text)
returns table(certificate_id text,certificate_type text,path_id text,course text,holder_name text,score_percent integer,completion_date date,verification_hash text)
language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); prefix text; title text; pat text; total integer; correct integer; score integer; bad integer; cid text; issued timestamptz; vh text; payload jsonb;
begin
 if u is null then raise exception 'Authentication required'; end if;
 if p_type not in ('foundation','intermediate','advanced','master') then raise exception 'Unknown certificate type'; end if;
 if p_type='foundation' then prefix:='8AC-FND-'; title:='0x8Acure DPDP Foundation Certificate'; pat:='f-%';
 elsif p_type='intermediate' then prefix:='8AC-INT-'; title:='0x8Acure DPDP Intermediate Certificate'; pat:='i-%';
 elsif p_type='advanced' then prefix:='8AC-ADV-'; title:='0x8Acure DPDP Advanced Certificate'; pat:='a-%';
 else prefix:='8AC-MST-'; title:='0x8Acure DPDP Master Certificate'; pat:='%'; end if;
 with rooms as(select distinct room_id from public.task_catalog where p_type='master' or room_id like pat),
 scores as(select r.room_id,count(t.id) total_tasks,count(distinct case when s.correct then s.task_id end) correct_tasks from rooms r join public.task_catalog t on t.room_id=r.room_id left join public.task_submissions s on s.task_id=t.id and s.user_id=u group by r.room_id)
 select coalesce(sum(total_tasks),0),coalesce(sum(correct_tasks),0),count(*) filter(where total_tasks=0 or correct_tasks*100<total_tasks*70) into total,correct,bad from scores;
 if total=0 then raise exception 'No certificate tasks are configured'; end if;
 score:=floor(correct*100.0/total);
 if bad>0 or score<70 then raise exception 'Certificate eligibility requires every room at 70% or higher and an overall score of at least 70%'; end if;
 select c.certificate_id,c.certificate_type,c.path_id,c.course,p.name,c.score_percent,c.completion_date,c.verification_hash into certificate_id,certificate_type,path_id,course,holder_name,score_percent,completion_date,verification_hash from public.certificates c join public.profiles p on p.id=c.user_id where c.user_id=u and c.certificate_type=p_type limit 1;
 if certificate_id is not null then return next; return; end if;
 cid:=prefix||upper(encode(gen_random_bytes(8),'hex')); issued:=now();
 vh:=encode(digest(cid||'|'||u::text||'|'||title||'|'||score::text||'|'||issued::text,'sha256'),'hex');
 payload:=jsonb_build_object('certificate_id',cid,'certificate_type',p_type,'path_id',p_type,'course',title,'score_percent',score,'completion_date',issued::date,'verification_hash',vh,'verification_url','https://akash870547-hue.github.io/0x8Acure/verify/'||cid,'legal_basis_line','Based on the DPDP Act, 2023 and DPDP Rules, 2025, as verified on '||to_char(issued::date,'YYYY-MM-DD')||'.');
 insert into public.certificates(certificate_id,user_id,course,issued_at,verification_hash,certificate_type,path_id,score_percent,completion_date,payload) values(cid,u,title,issued,vh,p_type,p_type,score,issued::date,payload) on conflict(user_id,certificate_type) do nothing;
 select c.certificate_id,c.certificate_type,c.path_id,c.course,p.name,c.score_percent,c.completion_date,c.verification_hash into certificate_id,certificate_type,path_id,course,holder_name,score_percent,completion_date,verification_hash from public.certificates c join public.profiles p on p.id=c.user_id where c.user_id=u and c.certificate_type=p_type limit 1;
 return next;
end; $$;
revoke all on function public.issue_certificate(text) from public,anon;
grant execute on function public.issue_certificate(text) to authenticated;

create or replace function public.verify_certificate(p_certificate_id text)
returns table(certificate_id text,valid boolean,course text,holder_name text,score_percent integer,completion_date date,issued_at timestamptz,certificate_type text,verification_hash text,legal_basis_line text)
language sql security definer set search_path=public as $$
 select c.certificate_id,not c.revoked,c.course,p.name,c.score_percent,c.completion_date,c.issued_at,c.certificate_type,c.verification_hash,coalesce(c.payload->>'legal_basis_line','Based on the DPDP Act, 2023 and DPDP Rules, 2025, as verified on '||to_char(c.completion_date,'YYYY-MM-DD')||'.')
 from public.certificates c join public.profiles p on p.id=c.user_id where c.certificate_id=p_certificate_id limit 1;
$$;
revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon,authenticated;