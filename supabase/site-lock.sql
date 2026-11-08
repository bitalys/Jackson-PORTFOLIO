-- =====================================================================
-- Jackson Hong Portfolio — 방문자 비밀번호 잠금 (Private Access)
-- Supabase 대시보드 > SQL Editor > New query 에 전체를 붙여넣고 Run 하세요.
-- 여러 번 실행해도 안전합니다.
--
-- 하는 일
--  1) 잠금 설정 테이블(site_settings): 잠금 ON/OFF, 비밀번호 해시(원문 저장 안 함)
--  2) 잠금이 켜져 있으면 올바른 패스코드(요청 헤더 x-site-passcode) 또는
--     로그인한 관리자에게만 자료(카테고리/서브메뉴/자료/About)를 읽을 수 있게 RLS 변경
--  3) 사이트가 호출하는 함수: 잠금 상태 확인, 패스코드 확인, 관리자 설정 변경
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- 1) Settings (single row). No RLS policies: reachable only through the functions below.
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  lock_enabled boolean not null default false,
  passcode_salt text,
  passcode_hash text,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;
alter table public.site_settings enable row level security;

-- Hash helper (salted SHA-256)
create or replace function public._site_hash(code text, salt text)
returns text language sql immutable
set search_path = public, extensions
as $$
  select encode(extensions.digest(coalesce(salt, '') || coalesce(code, ''), 'sha256'), 'hex')
$$;

-- True when the site is public, or the request carries the right passcode header
create or replace function public.site_passcode_ok()
returns boolean language sql stable security definer
set search_path = public, extensions
as $$
  select coalesce((
    select (not s.lock_enabled)
        or (s.passcode_hash is not null
            and s.passcode_hash = public._site_hash(
                  nullif(current_setting('request.headers', true), '')::json ->> 'x-site-passcode',
                  s.passcode_salt))
    from public.site_settings s where s.id = 1
  ), true)
$$;

-- Lock screen: is the site locked? (+ name for the lock screen title)
create or replace function public.site_lock_status()
returns json language sql stable security definer
set search_path = public
as $$
  select json_build_object(
    'locked', coalesce((select lock_enabled from public.site_settings where id = 1), false),
    'title', (select data ->> 'name' from public.site_profile where id = 1)
  )
$$;

-- Lock screen: check a passcode
create or replace function public.verify_site_passcode(code text)
returns boolean language sql stable security definer
set search_path = public, extensions
as $$
  select coalesce((
    select (not s.lock_enabled)
        or (s.passcode_hash is not null and s.passcode_hash = public._site_hash(code, s.passcode_salt))
    from public.site_settings s where s.id = 1
  ), true)
$$;

-- Admin: read settings (never returns the hash)
create or replace function public.admin_get_site_lock()
returns json language plpgsql stable security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;
  return (
    select json_build_object('locked', lock_enabled, 'has_passcode', passcode_hash is not null)
    from public.site_settings where id = 1
  );
end
$$;

-- Admin: turn the lock on/off and/or change the passcode
create or replace function public.admin_set_site_lock(enabled boolean, new_code text default null)
returns void language plpgsql security definer
set search_path = public, extensions
as $$
declare
  salt text;
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;
  if new_code is not null and length(new_code) > 0 then
    if length(new_code) < 4 then
      raise exception 'passcode must be at least 4 characters';
    end if;
    salt := encode(extensions.gen_random_bytes(16), 'hex');
    update public.site_settings
       set passcode_salt = salt, passcode_hash = public._site_hash(new_code, salt), updated_at = now()
     where id = 1;
  end if;
  if enabled and (select passcode_hash from public.site_settings where id = 1) is null then
    raise exception 'set a passcode first';
  end if;
  update public.site_settings set lock_enabled = enabled, updated_at = now() where id = 1;
end
$$;

-- Function permissions
revoke all on function public._site_hash(text, text) from public, anon, authenticated;
revoke all on function public.admin_get_site_lock() from public, anon;
revoke all on function public.admin_set_site_lock(boolean, text) from public, anon;
grant execute on function public.site_passcode_ok() to anon, authenticated;
grant execute on function public.site_lock_status() to anon, authenticated;
grant execute on function public.verify_site_passcode(text) to anon, authenticated;
grant execute on function public.admin_get_site_lock() to authenticated;
grant execute on function public.admin_set_site_lock(boolean, text) to authenticated;

-- 2) Read access: public site, correct passcode, or a logged-in admin
drop policy if exists "public read" on public.categories;
drop policy if exists "visitor read" on public.categories;
create policy "visitor read" on public.categories for select
  using ((select public.site_passcode_ok()) or (select auth.uid()) is not null);

drop policy if exists "public read" on public.submenus;
drop policy if exists "visitor read" on public.submenus;
create policy "visitor read" on public.submenus for select
  using ((select public.site_passcode_ok()) or (select auth.uid()) is not null);

drop policy if exists "public read" on public.items;
drop policy if exists "visitor read" on public.items;
create policy "visitor read" on public.items for select
  using ((select public.site_passcode_ok()) or (select auth.uid()) is not null);

drop policy if exists "public read" on public.site_profile;
drop policy if exists "visitor read" on public.site_profile;
create policy "visitor read" on public.site_profile for select
  using ((select public.site_passcode_ok()) or (select auth.uid()) is not null);
