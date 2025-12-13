-- Create the generations table
create table if not exists public.generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  courses jsonb not null,
  total_cost numeric,
  narrative text
);

-- Enable Row Level Security
alter table public.generations enable row level security;

-- Create Policies
create policy "Users can insert their own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own generations"
  on public.generations for select
  using (auth.uid() = user_id);
