-- 23-maktab: asosiy sxema
create extension if not exists pg_trgm;

create type public.user_role as enum ('superadmin', 'admin', 'maslahatchi', 'koordinator');
create type public.council_role as enum ('maslahatchi', 'lider', 'koordinator');
create type public.post_status as enum ('draft', 'review', 'published', 'rejected');
create type public.inquiry_status as enum ('yangi', 'korib_chiqilmoqda', 'javob_berildi');
create type public.club_type as enum ('ichki', 'tashqi');
create type public.participation as enum ('qatnashmoqda', 'qatnashmayapti', 'kutilmoqda');

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- Kengash a'zolari ----------
create table public.council_members (
  id uuid primary key default gen_random_uuid(),
  role public.council_role not null,
  first_name text not null,
  last_name text not null default '',
  grade text,
  direction_name text,
  direction_description text,
  slug text not null unique,
  photo_path text,
  thumb_path text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Foydalanuvchi profillari ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'koordinator',
  council_member_id uuid unique references public.council_members (id) on delete set null,
  blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Sayt sozlamalari (yagona qator) ----------
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  school_name text not null default '23-maktab',
  tagline text default 'Bilim — kelajak poydevori',
  logo_path text,
  hero_path text,
  hero_thumb_path text,
  about_short text,
  student_count int check (student_count > 0),
  teacher_count int check (teacher_count > 0),
  club_count int check (club_count > 0),
  class_count int check (class_count > 0),
  founded_year int check (founded_year > 1800),
  phone text,
  email text,
  address text,
  transport text,
  work_hours text default 'Dushanba–Shanba: 08:00–17:00',
  map_embed_url text,
  telegram_url text,
  instagram_url text,
  facebook_url text,
  youtube_url text,
  flag_url text default 'https://gov.uz/oz/pages/state-symbols',
  emblem_url text default 'https://gov.uz/oz/pages/state-symbols',
  anthem_url text default 'https://gov.uz/oz/pages/state-symbols',
  require_approval boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1);

-- ---------- Bosh sahifa bloklari ----------
create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  thumb_path text,
  title text,
  link_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_path text,
  url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Maktab haqida ----------
create table public.about_sections (
  key text primary key check (key in ('tarix', 'maqsad', 'yutuqlar')),
  title text not null,
  body text not null default '',
  updated_at timestamptz not null default now()
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  thumb_path text,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Kollektiv ----------
create table public.leaders (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  position text not null,
  bio text,
  reception_days text,
  phone text,
  email text,
  photo_path text,
  thumb_path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  subject text not null,
  category text,
  experience_years int check (experience_years >= 0),
  achievements text,
  bio text,
  photo_path text,
  thumb_path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Postlar ----------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.council_members (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null default '',
  status public.post_status not null default 'draft',
  reject_reason text,
  cover_path text,
  cover_thumb_path text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_pub_idx on public.posts (published_at desc) where status = 'published';
create index posts_author_idx on public.posts (author_id);
create index posts_title_trgm on public.posts using gin (title gin_trgm_ops);

create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  path text not null,
  thumb_path text,
  alt text,
  sort_order int not null default 0
);
create index post_images_post_idx on public.post_images (post_id);

create table public.post_files (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  path text not null,
  name text not null,
  mime text,
  size_bytes bigint
);
create index post_files_post_idx on public.post_files (post_id);

-- ---------- Tadbirlar ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  event_date date not null,
  event_time text,
  location text,
  description text not null default '',
  cover_path text,
  cover_thumb_path text,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index events_date_idx on public.events (event_date desc);
create index events_title_trgm on public.events using gin (title gin_trgm_ops);

create table public.event_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  path text not null,
  thumb_path text,
  alt text,
  sort_order int not null default 0
);
create index event_images_idx on public.event_images (event_id);

create table public.event_files (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  path text not null,
  name text not null,
  mime text,
  size_bytes bigint
);
create index event_files_idx on public.event_files (event_id);

-- ---------- To'garaklar ----------
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  type public.club_type not null,
  name text not null,
  slug text not null unique,
  leader_name text,
  schedule jsonb not null default '[]'::jsonb, -- [{day:"Dushanba", from:"15:00", to:"16:30"}]
  room text,
  members_count int check (members_count >= 0),
  description text,
  photo_path text,
  thumb_path text,
  center_address text,          -- tashqi to'garaklar uchun
  school_students_count int check (school_students_count >= 0), -- tashqi: maktab o'quvchilari
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Reyestr (YOPIQ) ----------
create table public.registry_students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  grade text,
  club_id uuid references public.clubs (id) on delete set null,
  status public.participation not null default 'kutilmoqda',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index registry_club_idx on public.registry_students (club_id);

create table public.registry_files (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  name text not null,
  mime text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

-- ---------- Murojaatlar ----------
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  subject text not null,
  message text not null,
  status public.inquiry_status not null default 'yangi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Rate limit va audit ----------
create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits int not null default 0
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  user_id uuid,
  table_name text not null,
  op text not null,
  record_id text,
  summary text
);
create index audit_at_idx on public.audit_log (at desc);

-- updated_at triggerlari
do $$
declare t text;
begin
  foreach t in array array['council_members','profiles','site_settings','announcements','about_sections',
    'leaders','teachers','posts','events','clubs','registry_students','inquiries']
  loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', t || '_upd', t);
  end loop;
end $$;
