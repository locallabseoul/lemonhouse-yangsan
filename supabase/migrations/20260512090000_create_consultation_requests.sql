create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  address text,
  home_size text,
  budget text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'scheduled', 'closed')),
  source text not null default 'website'
);

create index if not exists consultation_requests_created_at_idx
  on public.consultation_requests (created_at desc);

alter table public.consultation_requests enable row level security;

drop policy if exists "Anyone can create consultation requests"
  on public.consultation_requests;

create policy "Anyone can create consultation requests"
  on public.consultation_requests
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Authenticated users can view consultation requests"
  on public.consultation_requests;

create policy "Authenticated users can view consultation requests"
  on public.consultation_requests
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can update consultation requests"
  on public.consultation_requests;

create policy "Authenticated users can update consultation requests"
  on public.consultation_requests
  for update
  to authenticated
  using (true)
  with check (true);
