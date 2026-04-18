-- Criar tabelas
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  created_at timestamptz default now() not null
);

create table if not exists exams (
  id text primary key,
  title text not null,
  description text,
  level text not null default 'Associate',
  updated_at timestamptz default now()
);

create table if not exists exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  exam_id text not null references exams,
  score int not null default 0,
  total_q int not null default 0,
  started_at timestamptz default now() not null,
  completed_at timestamptz
);

create table if not exists question_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references exam_sessions on delete cascade,
  user_id uuid not null references profiles on delete cascade,
  exam_id text not null,
  topic_tag text not null,
  is_correct boolean not null,
  question_text text not null,
  correct_answer text not null,
  user_answer text not null,
  attempted_at timestamptz default now() not null
);

-- Habilitar RLS
alter table profiles enable row level security;
alter table exam_sessions enable row level security;
alter table question_attempts enable row level security;

-- Policies
create policy "profiles: own data" on profiles
  for all using (auth.uid() = id);

create policy "exam_sessions: own data" on exam_sessions
  for all using (auth.uid() = user_id);

create policy "question_attempts: own data" on question_attempts
  for all using (auth.uid() = user_id);

alter table exams enable row level security;
create policy "exams: public read" on exams
  for select using (true);

create policy "exams: service insert" on exams
  for insert with check (true);

-- Trigger para auto-criar perfil
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
