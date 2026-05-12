create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

insert into public.admin_users (email)
values ('locallab.seoul@gmail.com')
on conflict (email) do nothing;

alter table public.admin_users enable row level security;

drop policy if exists "Authenticated admins can view admin users"
  on public.admin_users;

create policy "Authenticated admins can view admin users"
  on public.admin_users
  for select
  to authenticated
  using (email = auth.jwt() ->> 'email');

drop policy if exists "Authenticated users can view consultation requests"
  on public.consultation_requests;

create policy "Admins can view consultation requests"
  on public.consultation_requests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.email = auth.jwt() ->> 'email'
    )
  );

drop policy if exists "Authenticated users can update consultation requests"
  on public.consultation_requests;

create policy "Admins can update consultation requests"
  on public.consultation_requests
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.email = auth.jwt() ->> 'email'
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users
      where admin_users.email = auth.jwt() ->> 'email'
    )
  );
