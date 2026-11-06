create extension if not exists pg_trgm;

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  syllabus_code text not null,
  chapter_name text not null default '',
  question_type text not null check (question_type in ('MCQ', 'ASSERTION_REASON', 'SHORT', 'LONG', 'CASE_STUDY')),
  difficulty text not null check (difficulty in ('EASY', 'MEDIUM', 'HARD')),
  marks numeric not null check (marks > 0),
  question_latex text not null,
  options_json jsonb,
  answer_key_latex text not null default '',
  diagram_svg text,
  used_count integer not null default 0,
  swap_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists questions_lookup_idx on public.questions (syllabus_code, question_type, difficulty, marks) where is_active = true;
create index if not exists questions_text_trgm_idx on public.questions using gin (question_latex gin_trgm_ops);
create index if not exists questions_chapter_idx on public.questions (chapter_name);

alter table public.questions enable row level security;
drop policy if exists "Active questions are readable" on public.questions;
create policy "Active questions are readable" on public.questions for select using (is_active = true);
drop policy if exists "Generated questions can be cached" on public.questions;
create policy "Generated questions can be cached" on public.questions for insert with check (is_active = true);

create or replace function public.increment_swap_count(q_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.questions
  set swap_count = swap_count + 1,
      is_active = case when swap_count + 1 >= 5 then false else is_active end
  where id = q_id;
end;
$$;

revoke all on function public.increment_swap_count(uuid) from public;
grant execute on function public.increment_swap_count(uuid) to anon, authenticated;
