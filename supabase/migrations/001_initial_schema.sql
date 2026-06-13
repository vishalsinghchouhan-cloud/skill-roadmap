-- SkillRoadmap Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  xp integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- User progress tracking
create table public.user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  skill_slug text not null,
  node_id text not null,
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(user_id, skill_slug, node_id)
);

alter table public.user_progress enable row level security;

create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

-- Badges
create table public.badges (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  icon text not null,
  description text not null,
  criteria jsonb not null,
  created_at timestamp with time zone default now()
);

-- User badges
create table public.user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  earned_at timestamp with time zone default now(),
  unique(user_id, badge_id)
);

alter table public.user_badges enable row level security;

create policy "Users can view own badges"
  on public.user_badges for select
  using (auth.uid() = user_id);

-- Insert default badges
insert into public.badges (name, icon, description, criteria) values
  ('First Steps', '🎯', 'Complete your first topic', '{"type": "node_count", "threshold": 1}'),
  ('Getting Started', '🌱', 'Complete 5 topics', '{"type": "node_count", "threshold": 5}'),
  ('Knowledge Seeker', '📚', 'Complete 15 topics', '{"type": "node_count", "threshold": 15}'),
  ('Skill Master', '🏆', 'Complete an entire skill roadmap', '{"type": "skill_complete", "threshold": 100}'),
  ('Dedicated Learner', '🔥', 'Maintain a 7-day learning streak', '{"type": "streak", "threshold": 7}');

-- Cached roadmaps (so we don't regenerate the same skill)
create table public.cached_roadmaps (
  id uuid default uuid_generate_v4() primary key,
  skill_slug text not null unique,
  skill_name text not null,
  roadmap_data jsonb not null,
  created_at timestamp with time zone default now()
);

alter table public.cached_roadmaps enable row level security;

create policy "Anyone can read cached roadmaps"
  on public.cached_roadmaps for select
  using (true);

create policy "Authenticated users can cache roadmaps"
  on public.cached_roadmaps for insert
  with check (auth.role() = 'authenticated');
