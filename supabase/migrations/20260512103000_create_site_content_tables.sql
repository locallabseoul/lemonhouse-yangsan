create table if not exists public.homepage_hero (
  id text primary key default 'main',
  eyebrow text not null default '아파트 전문 인테리어',
  title text not null,
  description text not null,
  background_image_url text not null,
  primary_label text not null default '시공사례 보기',
  primary_href text not null default '#portfolio',
  secondary_label text not null default '빠른 견적 문의',
  secondary_href text not null default '#consultation',
  updated_at timestamptz not null default now()
);

insert into public.homepage_hero (
  id,
  eyebrow,
  title,
  description,
  background_image_url,
  primary_label,
  primary_href,
  secondary_label,
  secondary_href
) values (
  'main',
  '아파트 전문 인테리어',
  '당신의 일상을 예술로 바꾸는 공간',
  '레몬하우스 양산점이 제안하는 프리미엄 아파트 인테리어 솔루션. 수천 건의 시공 노하우로 생활에 맞는 집을 완성합니다.',
  'https://storage.googleapis.com/uxpilot-auth.appspot.com/81f6913b97-f8d90312708e182715ae.png',
  '시공사례 보기',
  '#portfolio',
  '빠른 견적 문의',
  '#consultation'
) on conflict (id) do nothing;

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  apartment text not null,
  size text not null check (size in ('20평대', '30평대', '40평대 이상')),
  style text not null,
  image_url text not null,
  description text not null,
  sort_order integer not null default 100,
  is_published boolean not null default true
);

create index if not exists portfolio_items_public_order_idx
  on public.portfolio_items (is_published, sort_order, created_at desc);

insert into public.portfolio_items (
  title,
  apartment,
  size,
  style,
  image_url,
  description,
  sort_order,
  is_published
)
select *
from (
  values
    (
      '물금 신도시 34평 리모델링',
      '양산 물금 LH',
      '30평대',
      '모던 내추럴',
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/d6eb74bbdf-9528890bc29c3f9d619c.png',
      '확장 거실과 아일랜드 주방으로 생활 동선을 넓힌 신혼부부 맞춤 공간',
      10,
      true
    ),
    (
      '석산 24평 화이트톤 인테리어',
      '양산 석산 휴먼시아',
      '20평대',
      '미니멀 화이트',
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/7df1efc5f3-851dd304e59a8a60e0e3.png',
      '수납을 벽면에 숨기고 간접조명으로 넓어 보이는 구조를 완성',
      20,
      true
    ),
    (
      '중부동 42평 프리미엄 리뉴얼',
      '양산 현대아파트',
      '40평대 이상',
      '클래식 모던',
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/e8d26a720f-3c936237859745fba5d8.png',
      '가족 구성원의 취향을 반영한 호텔식 마감과 독립적인 생활 구역',
      30,
      true
    ),
    (
      '범어 31평 주방 중심 리모델링',
      '양산 범어 e편한세상',
      '30평대',
      '우드 포인트',
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/95b00ff06d-5dca8d92e64050e686d9.png',
      '대면형 주방과 팬트리 수납으로 요리와 대화가 편한 집',
      40,
      true
    ),
    (
      '덕계 26평 실속형 전체 공사',
      '양산 덕계 대승하이아트',
      '20평대',
      '웜 그레이',
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/6e02175faf-e55bfc7e53a7424f2ad3.png',
      '예산 안에서 욕실, 마루, 도배, 조명까지 균형 있게 개선',
      50,
      true
    ),
    (
      '평산 48평 가족형 인테리어',
      '양산 평산 코아루',
      '40평대 이상',
      '소프트 럭셔리',
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/d27b0163bf-a76c6e8f08b671f28751.png',
      '아이방과 서재를 분리하고 가족 공용 공간의 개방감을 극대화',
      60,
      true
    )
) as seed(title, apartment, size, style, image_url, description, sort_order, is_published)
where not exists (select 1 from public.portfolio_items);

alter table public.homepage_hero enable row level security;
alter table public.portfolio_items enable row level security;

drop policy if exists "Anyone can view homepage hero"
  on public.homepage_hero;

create policy "Anyone can view homepage hero"
  on public.homepage_hero
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can view published portfolio items"
  on public.portfolio_items;

create policy "Anyone can view published portfolio items"
  on public.portfolio_items
  for select
  to anon, authenticated
  using (is_published = true);
