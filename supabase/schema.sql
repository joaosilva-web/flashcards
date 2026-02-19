-- ============================================
-- SCHEMA COMPLETO DO BANCO DE DADOS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Habilitar extensões
create extension if not exists "uuid-ossp";

-- ============================================
-- TABELA: profiles
-- ============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  daily_goal integer default 20,
  timezone text default 'UTC',
  theme text default 'system',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- TABELA: decks (Baralhos)
-- ============================================
create table decks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  color text default '#3b82f6',
  icon text default '📚',
  is_archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint name_not_empty check (char_length(name) > 0)
);

create index idx_decks_user_id on decks(user_id);
create index idx_decks_archived on decks(is_archived) where is_archived = false;

-- ============================================
-- TABELA: cards (Flashcards)
-- ============================================
create table cards (
  id uuid default uuid_generate_v4() primary key,
  deck_id uuid references decks(id) on delete cascade not null,
  front text not null,
  back text not null,
  front_html text,
  back_html text,
  tags text[] default array[]::text[],
  position integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint front_not_empty check (char_length(front) > 0),
  constraint back_not_empty check (char_length(back) > 0)
);

create index idx_cards_deck_id on cards(deck_id);
create index idx_cards_tags on cards using gin(tags);

-- ============================================
-- TABELA: card_states (Estado de revisão)
-- ============================================
create table card_states (
  id uuid default uuid_generate_v4() primary key,
  card_id uuid references cards(id) on delete cascade not null unique,
  user_id uuid references profiles(id) on delete cascade not null,
  
  ease_factor real default 2.5,
  interval_days integer default 0,
  repetitions integer default 0,
  
  state text default 'new',
  due_date timestamptz default now(),
  last_review_date timestamptz,
  
  total_reviews integer default 0,
  correct_reviews integer default 0,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint state_valid check (state in ('new', 'learning', 'review', 'relearning')),
  constraint ease_factor_range check (ease_factor >= 1.3),
  constraint interval_positive check (interval_days >= 0)
);

create index idx_card_states_card_id on card_states(card_id);
create index idx_card_states_user_id on card_states(user_id);
create index idx_card_states_due_date on card_states(due_date);
create index idx_card_states_state on card_states(state);
create index idx_card_states_user_due on card_states(user_id, due_date);

-- ============================================
-- TABELA: review_logs (Histórico de revisões)
-- ============================================
create table review_logs (
  id uuid default uuid_generate_v4() primary key,
  card_id uuid references cards(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  
  rating integer not null,
  time_spent_ms integer,
  
  previous_ease_factor real,
  previous_interval_days integer,
  previous_state text,
  
  new_ease_factor real,
  new_interval_days integer,
  new_state text,
  new_due_date timestamptz,
  
  reviewed_at timestamptz default now(),
  
  constraint rating_valid check (rating between 1 and 4)
);

create index idx_review_logs_card_id on review_logs(card_id);
create index idx_review_logs_user_id on review_logs(user_id);
create index idx_review_logs_reviewed_at on review_logs(reviewed_at);

-- ============================================
-- TABELA: study_sessions (Sessões de estudo)
-- ============================================
create table study_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  deck_id uuid references decks(id) on delete set null,
  
  started_at timestamptz default now(),
  ended_at timestamptz,
  
  cards_studied integer default 0,
  cards_correct integer default 0,
  total_time_ms integer default 0,
  
  created_at timestamptz default now()
);

create index idx_study_sessions_user_id on study_sessions(user_id);
create index idx_study_sessions_started_at on study_sessions(started_at);

-- ============================================
-- TABELA: daily_stats (Estatísticas diárias)
-- ============================================
create table daily_stats (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  
  cards_studied integer default 0,
  cards_correct integer default 0,
  new_cards integer default 0,
  review_cards integer default 0,
  total_time_ms integer default 0,
  
  created_at timestamptz default now(),
  
  unique(user_id, date)
);

create index idx_daily_stats_user_date on daily_stats(user_id, date);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_decks_updated_at before update on decks
  for each row execute function update_updated_at_column();

create trigger update_cards_updated_at before update on cards
  for each row execute function update_updated_at_column();

create trigger update_card_states_updated_at before update on card_states
  for each row execute function update_updated_at_column();

create or replace function create_card_state_for_new_card()
returns trigger as $$
begin
  insert into card_states (card_id, user_id)
  select new.id, d.user_id
  from decks d
  where d.id = new.deck_id;
  
  return new;
end;
$$ language plpgsql;

create trigger create_card_state_trigger after insert on cards
  for each row execute function create_card_state_for_new_card();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table profiles enable row level security;
alter table decks enable row level security;
alter table cards enable row level security;
alter table card_states enable row level security;
alter table review_logs enable row level security;
alter table study_sessions enable row level security;
alter table daily_stats enable row level security;

-- Policies para profiles
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Policies para decks
create policy "Users can view their own decks"
  on decks for select
  using (auth.uid() = user_id);

create policy "Users can create their own decks"
  on decks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own decks"
  on decks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own decks"
  on decks for delete
  using (auth.uid() = user_id);

-- Policies para cards
create policy "Users can view cards from their decks"
  on cards for select
  using (
    exists (
      select 1 from decks
      where decks.id = cards.deck_id
      and decks.user_id = auth.uid()
    )
  );

create policy "Users can create cards in their decks"
  on cards for insert
  with check (
    exists (
      select 1 from decks
      where decks.id = cards.deck_id
      and decks.user_id = auth.uid()
    )
  );

create policy "Users can update cards in their decks"
  on cards for update
  using (
    exists (
      select 1 from decks
      where decks.id = cards.deck_id
      and decks.user_id = auth.uid()
    )
  );

create policy "Users can delete cards from their decks"
  on cards for delete
  using (
    exists (
      select 1 from decks
      where decks.id = cards.deck_id
      and decks.user_id = auth.uid()
    )
  );

-- Policies para card_states
create policy "Users can view their own card states"
  on card_states for select
  using (auth.uid() = user_id);

create policy "Users can insert their own card states"
  on card_states for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own card states"
  on card_states for update
  using (auth.uid() = user_id);

-- Policies para review_logs
create policy "Users can view their own review logs"
  on review_logs for select
  using (auth.uid() = user_id);

create policy "Users can create their own review logs"
  on review_logs for insert
  with check (auth.uid() = user_id);

-- Policies para study_sessions
create policy "Users can view their own study sessions"
  on study_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their own study sessions"
  on study_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own study sessions"
  on study_sessions for update
  using (auth.uid() = user_id);

-- Policies para daily_stats
create policy "Users can view their own daily stats"
  on daily_stats for select
  using (auth.uid() = user_id);

create policy "Users can insert their own daily stats"
  on daily_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own daily stats"
  on daily_stats for update
  using (auth.uid() = user_id);

-- ============================================
-- FUNÇÃO PARA CRIAR PROFILE AUTOMATICAMENTE
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
