-- Notes shared by one household (the parents) across their devices.
-- See docs/database.md for the why and how to apply.

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (household_id, user_id)
);

-- One row per recipe, mirrors src/core/notes/RecipeNote.ts.
create table public.recipe_notes (
  household_id uuid not null references public.households (id) on delete cascade,
  recipe_id text not null,
  comment text,
  hidden boolean not null default false,
  rating smallint check (rating between 0 and 5),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) default auth.uid(),
  primary key (household_id, recipe_id)
);

create function public.is_household_member(target uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.household_members
    where household_id = target and user_id = auth.uid()
  );
$$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.recipe_notes enable row level security;

create policy "members read their household" on public.households
  for select using (public.is_household_member(id));

create policy "members read their membership" on public.household_members
  for select using (user_id = auth.uid());

create policy "members read notes" on public.recipe_notes
  for select using (public.is_household_member(household_id));

create policy "members write notes" on public.recipe_notes
  for insert with check (public.is_household_member(household_id));

create policy "members update notes" on public.recipe_notes
  for update using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

-- Live updates: a note written on the phone shows on the computer.
alter publication supabase_realtime add table public.recipe_notes;
