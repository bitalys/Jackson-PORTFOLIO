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

export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;

export const isCloudEnabled = supabase !== null;

/** 사진을 저장하는 Supabase Storage 버킷 이름 */
export const MEDIA_BUCKET = 'portfolio-media';
