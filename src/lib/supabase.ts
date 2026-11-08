import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase 연결 설정.
 *
 * 배포 환경(Vercel 등)이나 로컬 .env.local 에 아래 두 값이 있으면 Supabase(클라우드)를 사용하고,
 * 없으면 예전처럼 브라우저 내부 저장소(IndexedDB / localStorage)를 사용합니다.
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY  (예전 이름: anon public key)
 */
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const key = (
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
)?.trim();

// ---------------------------------------------------------------------------
// Visitor passcode (Private Access)
// 이 기기에서 한 번 입력한 패스코드를 보관하고, 자료 요청(/rest/v1)에 헤더로 붙입니다.
// Supabase는 이 헤더가 맞을 때만 자료를 내줍니다 (supabase/site-lock.sql 참고).
// ---------------------------------------------------------------------------
const PASSCODE_KEY = 'jh_site_passcode_v1';

/** 한글 등도 헤더로 보낼 수 있게 항상 같은 방식으로 인코딩 (확인/저장/헤더 모두 동일) */
export const normalizePasscode = (code: string) => encodeURIComponent(code.trim());

let sitePasscode: string | null = (() => {
  try {
    return localStorage.getItem(PASSCODE_KEY);
  } catch {
    return null;
  }
})();

export const getStoredPasscode = () => sitePasscode;

/** 정규화된 패스코드를 이 기기에 저장(또는 null로 삭제) */
export function setStoredPasscode(normalized: string | null) {
  sitePasscode = normalized;
  try {
    if (normalized) localStorage.setItem(PASSCODE_KEY, normalized);
    else localStorage.removeItem(PASSCODE_KEY);
  } catch {
    // private mode etc.: keeps working for this visit only
  }
}

const fetchWithPasscode: typeof fetch = (input, init) => {
  const target = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (!sitePasscode || !target.includes('/rest/v1/')) return fetch(input, init);
  const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
  headers.set('x-site-passcode', sitePasscode);
  return fetch(input, { ...init, headers });
};

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { global: { fetch: fetchWithPasscode } }) : null;

export const isCloudEnabled = supabase !== null;

/** 사진을 저장하는 Supabase Storage 버킷 이름 */
export const MEDIA_BUCKET = 'portfolio-media';
