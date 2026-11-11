create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) > 0),
  description text not null default '',
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.todos enable row level security;

grant select, insert, update, delete on public.todos to authenticated;

drop policy if exists "Users can read their own todos" on public.todos;
create policy "Users can read their own todos"
  on public.todos for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own todos" on public.todos;
create policy "Users can create their own todos"
  on public.todos for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own todos" on public.todos;
create policy "Users can update their own todos"
  on public.todos for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own todos" on public.todos;
create policy "Users can delete their own todos"
  on public.todos for delete
  to authenticated
  using ((select auth.uid()) = user_id);
