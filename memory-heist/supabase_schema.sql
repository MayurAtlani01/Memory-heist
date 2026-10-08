-- ============================================================================
-- MEMORY HEIST — SUPABASE DATABASE SCHEMA & INITIAL SEED
-- ============================================================================

-- 1. Remove any conflicting auth trigger
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. Create Levels Table
create table if not exists public.levels (
  id text primary key,
  level_number integer not null unique,
  name text not null,
  description text,
  difficulty text not null,
  width integer not null,
  height integer not null,
  memorize_time_seconds integer not null,
  time_limit_seconds integer not null,
  base_score integer default 1000,
  grid jsonb not null,
  entrance jsonb,
  exit jsonb,
  key_pos jsonb,
  diamond_pos jsonb,
  guards jsonb,
  created_at timestamptz default now()
);

alter table public.levels enable row level security;

drop policy if exists "Levels are publicly readable" on public.levels;
create policy "Levels are publicly readable"
  on public.levels for select
  using (true);

-- 3. Create Attempts Table (Player runs and scores)
create table if not exists public.attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  player_id text,
  level_id text references public.levels(id) on delete cascade,
  mode text default 'NORMAL',
  status text default 'IN_PROGRESS',
  success boolean default false,
  time_taken_seconds integer default 0,
  flashes_used integer default 0,
  reason text,
  score integer default 0,
  score_breakdown jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);

alter table public.attempts enable row level security;

drop policy if exists "Anyone can read attempts" on public.attempts;
create policy "Anyone can read attempts"
  on public.attempts for select
  using (true);

drop policy if exists "Users or guests can insert attempts" on public.attempts;
create policy "Users or guests can insert attempts"
  on public.attempts for insert
  with check (true);

drop policy if exists "Users can update their own attempts" on public.attempts;
create policy "Users can update their own attempts"
  on public.attempts for update
  using (auth.uid() = user_id or player_id is not null);

-- 4. Seed 5 Mission Levels

insert into public.levels (id, level_number, name, description, difficulty, width, height, memorize_time_seconds, time_limit_seconds, base_score, grid, entrance, exit, key_pos, diamond_pos, guards)
values ('level-1', 1, 'Training Vault', 'Infiltrate the training vault. Observe guard patrol timings, secure the brass key, unlock the vault door, and grab the diamond.', 'EASY', 10, 10, 12, 45, 1000, '[[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 6, 0, 0, 1, 1, 0, 0, 0, 1], [1, 0, 0, 0, 0, 2, 0, 4, 0, 1], [1, 0, 0, 0, 1, 1, 0, 0, 0, 1], [1, 1, 0, 1, 1, 1, 1, 1, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 1, 1], [1, 0, 0, 0, 1, 1, 1, 0, 1, 1], [1, 0, 3, 0, 1, 1, 0, 0, 0, 1], [1, 0, 0, 0, 1, 1, 0, 0, 5, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]'::jsonb, '{"x": 1, "y": 1}'::jsonb, '{"x": 8, "y": 8}'::jsonb, '{"x": 2, "y": 7}'::jsonb, '{"x": 7, "y": 2}'::jsonb, '[{"id": "guard-1", "patrolPath": [{"x": 3, "y": 5}, {"x": 4, "y": 5}, {"x": 5, "y": 5}, {"x": 6, "y": 5}, {"x": 5, "y": 5}, {"x": 4, "y": 5}], "moveIntervalMs": 800, "initialFacing": "RIGHT", "visionRange": 3}]'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  difficulty = excluded.difficulty,
  grid = excluded.grid,
  guards = excluded.guards;

insert into public.levels (id, level_number, name, description, difficulty, width, height, memorize_time_seconds, time_limit_seconds, base_score, grid, entrance, exit, key_pos, diamond_pos, guards)
values ('level-2', 2, 'Office After Hours', 'Corporate offices after midnight. Two security guards patrol the corridors. Avoid crossing illuminated lines of sight.', 'MEDIUM', 12, 12, 10, 55, 1000, '[[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 6, 0, 0, 1, 1, 1, 1, 0, 0, 5, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1], [1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1], [1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 0, 1, 1, 0, 1, 1, 0, 2, 0, 1], [1, 0, 0, 0, 1, 0, 1, 1, 0, 4, 0, 1], [1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]'::jsonb, '{"x": 1, "y": 1}'::jsonb, '{"x": 10, "y": 1}'::jsonb, '{"x": 2, "y": 9}'::jsonb, '{"x": 9, "y": 8}'::jsonb, '[{"id": "guard-1", "patrolPath": [{"x": 4, "y": 2}, {"x": 6, "y": 2}, {"x": 8, "y": 2}, {"x": 6, "y": 2}], "moveIntervalMs": 750, "initialFacing": "RIGHT", "visionRange": 3}, {"id": "guard-2", "patrolPath": [{"x": 5, "y": 6}, {"x": 7, "y": 6}, {"x": 8, "y": 6}, {"x": 7, "y": 6}], "moveIntervalMs": 700, "initialFacing": "RIGHT", "visionRange": 3}]'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  difficulty = excluded.difficulty,
  grid = excluded.grid,
  guards = excluded.guards;

insert into public.levels (id, level_number, name, description, difficulty, width, height, memorize_time_seconds, time_limit_seconds, base_score, grid, entrance, exit, key_pos, diamond_pos, guards)
values ('level-3', 3, 'Museum Wing', 'Symmetrical museum halls with intersecting patrol routes. Time your movement between display corridors carefully.', 'HARD', 14, 14, 9, 65, 1000, '[[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1], [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1], [1, 0, 1, 0, 0, 0, 2, 4, 0, 1, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1], [1, 3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]'::jsonb, '{"x": 1, "y": 1}'::jsonb, '{"x": 12, "y": 12}'::jsonb, '{"x": 1, "y": 11}'::jsonb, '{"x": 7, "y": 6}'::jsonb, '[{"id": "guard-1", "patrolPath": [{"x": 3, "y": 4}, {"x": 6, "y": 4}, {"x": 9, "y": 4}, {"x": 9, "y": 9}, {"x": 6, "y": 9}, {"x": 3, "y": 9}], "moveIntervalMs": 680, "initialFacing": "RIGHT", "visionRange": 3}, {"id": "guard-2", "patrolPath": [{"x": 12, "y": 3}, {"x": 12, "y": 6}, {"x": 12, "y": 9}, {"x": 12, "y": 6}], "moveIntervalMs": 700, "initialFacing": "DOWN", "visionRange": 3}]'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  difficulty = excluded.difficulty,
  grid = excluded.grid,
  guards = excluded.guards;

insert into public.levels (id, level_number, name, description, difficulty, width, height, memorize_time_seconds, time_limit_seconds, base_score, grid, entrance, exit, key_pos, diamond_pos, guards)
values ('level-4', 4, 'Archive Basement', 'Deep underground repository with dense shelving units and 3 patrol units. Memorize the dead ends to avoid getting trapped.', 'EXPERT', 16, 16, 8, 75, 1000, '[[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1], [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 3, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1], [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1], [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 2, 0, 0, 1], [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 4, 0, 1], [1, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]'::jsonb, '{"x": 1, "y": 1}'::jsonb, '{"x": 1, "y": 14}'::jsonb, '{"x": 14, "y": 3}'::jsonb, '{"x": 13, "y": 13}'::jsonb, '[{"id": "guard-1", "patrolPath": [{"x": 3, "y": 4}, {"x": 6, "y": 4}, {"x": 8, "y": 4}, {"x": 6, "y": 4}], "moveIntervalMs": 620, "initialFacing": "RIGHT", "visionRange": 3}, {"id": "guard-2", "patrolPath": [{"x": 8, "y": 7}, {"x": 8, "y": 9}, {"x": 8, "y": 12}, {"x": 8, "y": 9}], "moveIntervalMs": 600, "initialFacing": "DOWN", "visionRange": 3}, {"id": "guard-3", "patrolPath": [{"x": 11, "y": 10}, {"x": 13, "y": 10}, {"x": 13, "y": 7}, {"x": 11, "y": 7}], "moveIntervalMs": 650, "initialFacing": "RIGHT", "visionRange": 3}]'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  difficulty = excluded.difficulty,
  grid = excluded.grid,
  guards = excluded.guards;

insert into public.levels (id, level_number, name, description, difficulty, width, height, memorize_time_seconds, time_limit_seconds, base_score, grid, entrance, exit, key_pos, diamond_pos, guards)
values ('level-5', 5, 'The Grand Heist', 'The ultimate challenge. 4 synchronized patrol officers protecting the multi-layered bank fortress. Every step must be planned.', 'MASTER', 18, 18, 7, 90, 1000, '[[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1], [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3, 0, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1], [1, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 4, 0, 1, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1], [1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1], [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]'::jsonb, '{"x": 1, "y": 1}'::jsonb, '{"x": 16, "y": 16}'::jsonb, '{"x": 15, "y": 3}'::jsonb, '{"x": 11, "y": 8}'::jsonb, '[{"id": "guard-1", "patrolPath": [{"x": 3, "y": 4}, {"x": 7, "y": 4}, {"x": 11, "y": 4}, {"x": 14, "y": 4}, {"x": 9, "y": 4}], "moveIntervalMs": 580, "initialFacing": "RIGHT", "visionRange": 4}, {"id": "guard-2", "patrolPath": [{"x": 14, "y": 6}, {"x": 14, "y": 9}, {"x": 14, "y": 12}, {"x": 14, "y": 9}], "moveIntervalMs": 600, "initialFacing": "DOWN", "visionRange": 3}, {"id": "guard-3", "patrolPath": [{"x": 12, "y": 13}, {"x": 8, "y": 13}, {"x": 4, "y": 13}, {"x": 8, "y": 13}], "moveIntervalMs": 620, "initialFacing": "LEFT", "visionRange": 3}, {"id": "guard-4", "patrolPath": [{"x": 3, "y": 11}, {"x": 3, "y": 8}, {"x": 3, "y": 5}, {"x": 3, "y": 8}], "moveIntervalMs": 600, "initialFacing": "UP", "visionRange": 3}]'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  difficulty = excluded.difficulty,
  grid = excluded.grid,
  guards = excluded.guards;
