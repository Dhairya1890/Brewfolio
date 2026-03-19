-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  slug text unique,
  name text not null,
  username text not null,
  headline text,
  bio text,
  avatar_url text,
  location text,
  email text,
  links jsonb default '{}',
  stats jsonb default '{}',
  projects jsonb default '[]',
  skills jsonb default '[]',
  competitive jsonb default '[]',
  theme text default 'minimal',
  accent_color text default 'violet',
  sections_visible jsonb default '{"projects":true,"skills":true,"stats":true,"competitive":true,"blog":false,"contact":false}',
  is_published boolean default false,
  published_url text,
  last_generated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies
alter table profiles enable row level security;

create policy "Users can read own profiles"
  on profiles for select using (auth.uid() = user_id);

create policy "Users can insert own profiles"
  on profiles for insert with check (auth.uid() = user_id);

create policy "Users can update own profiles"
  on profiles for update using (auth.uid() = user_id);

-- Public portfolios are readable by anyone
create policy "Published profiles are public"
  on profiles for select using (is_published = true);
