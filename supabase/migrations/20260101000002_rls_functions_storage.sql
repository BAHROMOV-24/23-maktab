-- 23-maktab: yordamchi funksiyalar, triggerlar, RLS, storage

-- ========== Yordamchi funksiyalar (security definer: RLS rekursiyasiz) ==========
create or replace function public.app_role() returns public.user_role
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid() and not blocked
$$;

create or replace function public.my_council_member() returns uuid
language sql stable security definer set search_path = '' as $$
  select council_member_id from public.profiles where id = auth.uid() and not blocked
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(public.app_role() in ('admin', 'superadmin'), false)
$$;

create or replace function public.is_council_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(public.app_role() in ('admin', 'superadmin', 'maslahatchi'), false)
$$;

create or replace function public.can_edit_post(pid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.posts p
    where p.id = pid and (public.is_council_staff() or p.author_id = public.my_council_member())
  )
$$;

-- ========== Post triggeri: tasdiqlash qoidalari ==========
create or replace function public.posts_guard() returns trigger
language plpgsql set search_path = '' as $$
declare
  r public.user_role;
  need boolean;
begin
  if auth.uid() is null then  -- service role (seed, import)
    if new.status = 'published' and new.published_at is null then new.published_at = now(); end if;
    return new;
  end if;
  r := public.app_role();
  if r = 'koordinator' then
    select require_approval into need from public.site_settings where id = 1;
    if new.status = 'rejected' then
      raise exception 'Koordinator postni rad eta olmaydi';
    end if;
    if tg_op = 'UPDATE' then
      new.reject_reason := old.reject_reason;
      new.author_id := old.author_id;
    end if;
    if need and new.status = 'published' then
      if tg_op = 'UPDATE' and old.status = 'published' then
        new.status := 'review';   -- tahrirdan keyin qayta tasdiqlash kerak
      else
        raise exception 'Postni e''lon qilish uchun maslahatchi tasdig''i kerak';
      end if;
    end if;
    if new.status in ('draft', 'review') then new.reject_reason := null; end if;
  end if;
  if tg_op = 'INSERT' then new.created_by := auth.uid(); end if;
  if new.status = 'published' and (tg_op = 'INSERT' or old.status <> 'published') then
    new.published_at := now();
  end if;
  if new.status <> 'published' then new.published_at := null; end if;
  return new;
end $$;
create trigger posts_guard_trg before insert or update on public.posts
  for each row execute function public.posts_guard();

-- ========== Audit ==========
create or replace function public.log_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare j jsonb := to_jsonb(coalesce(new, old)); s text;
begin
  if tg_argv[0] is distinct from 'nosummary' then
    s := coalesce(j->>'title', j->>'name', j->>'full_name', j->>'first_name', j->>'school_name');
  end if;
  insert into public.audit_log (user_id, table_name, op, record_id, summary)
  values (auth.uid(), tg_table_name, tg_op, j->>'id', s);
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array['posts','events','announcements','leaders','teachers','council_members',
    'clubs','partners','hero_slides','site_settings','profiles']
  loop
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.log_change()', t || '_audit', t);
  end loop;
  create trigger registry_audit after insert or update or delete on public.registry_students
    for each row execute function public.log_change('nosummary');
end $$;

-- ========== RLS: yoqish ==========
do $$
declare t text;
begin
  foreach t in array array['council_members','profiles','site_settings','hero_slides','partners','announcements',
    'about_sections','gallery_images','leaders','teachers','posts','post_images','post_files','events',
    'event_images','event_files','clubs','registry_students','registry_files','inquiries','rate_limits','audit_log']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Yopiq jadvallardan anon huquqlarini butunlay olib tashlaymiz
revoke all on public.registry_students, public.registry_files, public.inquiries,
  public.rate_limits, public.audit_log, public.profiles from anon;
revoke all on public.rate_limits from authenticated;

-- ========== Ommaviy o'qish ==========
create policy "ommaviy o'qish" on public.site_settings for select using (true);
create policy "ommaviy o'qish" on public.hero_slides for select using (is_active or public.is_admin());
create policy "ommaviy o'qish" on public.partners for select using (true);
create policy "ommaviy o'qish" on public.announcements for select using (is_published or public.is_admin());
create policy "ommaviy o'qish" on public.about_sections for select using (true);
create policy "ommaviy o'qish" on public.gallery_images for select using (true);
create policy "ommaviy o'qish" on public.leaders for select using (true);
create policy "ommaviy o'qish" on public.teachers for select using (true);
create policy "ommaviy o'qish" on public.clubs for select using (true);
create policy "ommaviy o'qish" on public.events for select using (is_published or public.is_admin());
create policy "ommaviy o'qish" on public.event_images for select
  using (exists (select 1 from public.events e where e.id = event_id));
create policy "ommaviy o'qish" on public.event_files for select
  using (exists (select 1 from public.events e where e.id = event_id));
create policy "kengash o'qish" on public.council_members for select
  using (is_active or public.app_role() is not null);

-- ========== Admin: to'liq yozish ==========
do $$
declare t text;
begin
  foreach t in array array['site_settings','hero_slides','partners','announcements','about_sections','gallery_images',
    'leaders','teachers','events','event_images','event_files','clubs','registry_students','registry_files','inquiries']
  loop
    execute format('create policy "admin yozish" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ========== Kengash: maslahatchi + admin ==========
create policy "kengash yozish" on public.council_members for all
  using (public.is_council_staff()) with check (public.is_council_staff());

-- ========== Profillar ==========
create policy "o'z profilini o'qish" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
-- yozish: faqat service role (superadmin server action orqali)

-- ========== Postlar ==========
create policy "posts o'qish" on public.posts for select using (
  status = 'published' or public.is_council_staff() or author_id = public.my_council_member()
);
create policy "posts qo'shish" on public.posts for insert with check (
  public.is_council_staff() or (public.app_role() = 'koordinator' and author_id = public.my_council_member())
);
create policy "posts yangilash" on public.posts for update
  using (public.is_council_staff() or (public.app_role() = 'koordinator' and author_id = public.my_council_member()))
  with check (public.is_council_staff() or (public.app_role() = 'koordinator' and author_id = public.my_council_member()));
create policy "posts o'chirish" on public.posts for delete using (
  public.is_council_staff()
  or (public.app_role() = 'koordinator' and author_id = public.my_council_member() and status in ('draft', 'rejected'))
);

create policy "post_images o'qish" on public.post_images for select
  using (exists (select 1 from public.posts p where p.id = post_id));
create policy "post_images yozish" on public.post_images for all
  using (public.can_edit_post(post_id)) with check (public.can_edit_post(post_id));
create policy "post_files o'qish" on public.post_files for select
  using (exists (select 1 from public.posts p where p.id = post_id));
create policy "post_files yozish" on public.post_files for all
  using (public.can_edit_post(post_id)) with check (public.can_edit_post(post_id));

-- ========== Audit: admin va maslahatchi o'qiydi ==========
create policy "audit o'qish" on public.audit_log for select using (public.is_council_staff());
-- rate_limits: siyosat yo'q, faqat service role

-- ========== RPC funksiyalar ==========
-- Reyestr: faqat umumiy sonlar, ism-familiya HECH QACHON qaytmaydi
create or replace function public.registry_stats() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'total', (select count(*) from public.registry_students),
    'involved', (select count(*) from public.registry_students where club_id is not null and status = 'qatnashmoqda'),
    'by_club', coalesce((
      select jsonb_agg(jsonb_build_object('club', c.name, 'count', x.cnt) order by x.cnt desc)
      from (select club_id, count(*) cnt from public.registry_students
            where club_id is not null and status = 'qatnashmoqda' group by club_id) x
      join public.clubs c on c.id = x.club_id), '[]'::jsonb)
  )
$$;
grant execute on function public.registry_stats() to anon, authenticated;

-- Xotira ko'rsatkichi (faqat admin/superadmin)
create or replace function public.storage_usage() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Ruxsat yo''q'; end if;
  return jsonb_build_object(
    'storage_bytes', coalesce((select sum((metadata->>'size')::bigint) from storage.objects), 0),
    'files', (select count(*) from storage.objects),
    'db_bytes', pg_database_size(current_database())
  );
end $$;
revoke execute on function public.storage_usage() from public, anon;
grant execute on function public.storage_usage() to authenticated;

-- Qidiruv (RLS saqlanadi: faqat e'lon qilingan kontent)
create index if not exists teachers_name_trgm on public.teachers using gin (full_name gin_trgm_ops);
create index if not exists announcements_title_trgm on public.announcements using gin (title gin_trgm_ops);

create or replace function public.search_site(q text)
returns table (kind text, title text, url text, snippet text, at timestamptz)
language sql stable set search_path = '' as $$
  select * from (
    select 'yangilik'::text, p.title, '/yangiliklar/' || p.slug, p.excerpt, p.published_at
      from public.posts p where p.status = 'published' and p.title ilike '%' || q || '%'
    union all
    select 'elon', a.title, '/elonlar/' || a.id::text, left(regexp_replace(a.body, '<[^>]*>', '', 'g'), 160), a.published_at
      from public.announcements a where a.is_published and a.title ilike '%' || q || '%'
    union all
    select 'tadbir', e.title, '/tadbirlar/' || e.slug, e.location, e.published_at
      from public.events e where e.is_published and e.title ilike '%' || q || '%'
    union all
    select 'oqituvchi', t.full_name, '/oqituvchilar/' || t.id::text, t.subject, t.created_at
      from public.teachers t where t.full_name ilike '%' || q || '%' or t.subject ilike '%' || q || '%'
  ) s order by 5 desc limit 30
$$;
grant execute on function public.search_site(text) to anon, authenticated;

-- Rate limit (faqat service role)
create or replace function public.rate_limit_hit(p_key text, p_max int, p_window int) returns boolean
language plpgsql security definer set search_path = '' as $$
declare h int;
begin
  insert into public.rate_limits as r (key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case when r.window_start < now() - make_interval(secs => p_window) then 1 else r.hits + 1 end,
    window_start = case when r.window_start < now() - make_interval(secs => p_window) then now() else r.window_start end
  returning hits into h;
  return h <= p_max;
end $$;
revoke execute on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;

-- ========== Realtime ==========
alter publication supabase_realtime add table public.posts, public.events;

-- ========== Storage ==========
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('public-media', 'public-media', true, 15728640, array[
    'image/webp','image/jpeg','image/png','application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('private', 'private', false, 15728640, array[
    'application/pdf','image/webp','image/jpeg','image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do nothing;

create policy "public-media: xodimlar o'qiydi" on storage.objects for select
  using (bucket_id = 'public-media' and public.app_role() is not null);
create policy "public-media: xodimlar yuklaydi" on storage.objects for insert
  with check (bucket_id = 'public-media' and public.app_role() is not null);
create policy "public-media: yangilash" on storage.objects for update
  using (bucket_id = 'public-media' and (public.is_council_staff() or owner_id = auth.uid()::text));
create policy "public-media: o'chirish" on storage.objects for delete
  using (bucket_id = 'public-media' and (public.is_council_staff() or owner_id = auth.uid()::text));
create policy "private: faqat admin" on storage.objects for all
  using (bucket_id = 'private' and public.is_admin())
  with check (bucket_id = 'private' and public.is_admin());
