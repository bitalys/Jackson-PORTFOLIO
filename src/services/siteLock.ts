import { supabase, normalizePasscode, getStoredPasscode, setStoredPasscode } from '../lib/supabase';

/**
 * Visitor passcode lock ("Private Access").
 *
 * Cloud (Supabase): the passcode is stored as a salted hash in `site_settings` and the database itself refuses
 *   to return portfolio data without the right passcode header or an admin login (supabase/site-lock.sql).
 * Browser-only mode (no Supabase): settings live in this browser's storage. This only hides the screen —
 *   it is not real protection, and the admin page says so.
 */

export interface LockStatus {
  locked: boolean;
  title?: string;
  /** false when the Supabase SQL (site-lock.sql) has not been run yet */
  supported: boolean;
}

export interface AdminLockStatus {
  locked: boolean;
  hasPasscode: boolean;
  supported: boolean;
  /** true = enforced by the database, false = browser-only screen */
  enforced: boolean;
}

const LOCAL_KEY = 'jh_site_lock_local_v1';

interface LocalLock {
  locked: boolean;
  salt?: string;
  hash?: string;
}

const readLocal = (): LocalLock => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '') as LocalLock;
  } catch {
    return { locked: false };
  }
};

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const isMissingFunction = (msg?: string) => !!msg && /function|schema cache|does not exist|404/i.test(msg);

export const SiteLock = {
  /** 방문자 화면: 잠금 여부 */
  async getStatus(): Promise<LockStatus> {
    if (!supabase) {
      return { locked: !!readLocal().locked && !!readLocal().hash, supported: true };
    }
    const { data, error } = await supabase.rpc('site_lock_status');
    if (error) return { locked: false, supported: !isMissingFunction(error.message) };
    const d = (data || {}) as { locked?: boolean; title?: string };
    return { locked: !!d.locked, title: d.title || undefined, supported: true };
  },

  /** 패스코드 확인 (정규화된 값) */
  async verifyNormalized(normalized: string): Promise<boolean> {
    if (!supabase) {
      const l = readLocal();
      if (!l.locked) return true;
      return !!l.hash && l.hash === (await sha256Hex((l.salt || '') + normalized));
    }
    const { data, error } = await supabase.rpc('verify_site_passcode', { code: normalized });
    if (error) throw new Error(error.message);
    return data === true;
  },

  /** 잠금 화면에서 입력한 패스코드 확인 → 맞으면 이 기기에 저장 */
  async unlock(code: string): Promise<boolean> {
    const normalized = normalizePasscode(code);
    if (!normalized) return false;
    const ok = await this.verifyNormalized(normalized);
    if (ok) setStoredPasscode(normalized);
    return ok;
  },

  /** 이 기기에 저장된 패스코드가 아직 유효한지 (비밀번호가 바뀌면 false) */
  async checkStored(): Promise<boolean> {
    const stored = getStoredPasscode();
    if (!stored) return false;
    try {
      const ok = await this.verifyNormalized(stored);
      if (!ok) setStoredPasscode(null);
      return ok;
    } catch {
      return false;
    }
  },

  // ----------------------------- Admin -----------------------------

  async adminStatus(): Promise<AdminLockStatus> {
    if (!supabase) {
      const l = readLocal();
      return { locked: !!l.locked && !!l.hash, hasPasscode: !!l.hash, supported: true, enforced: false };
    }
    const { data, error } = await supabase.rpc('admin_get_site_lock');
    if (error) {
      if (isMissingFunction(error.message)) return { locked: false, hasPasscode: false, supported: false, enforced: true };
      throw new Error(error.message);
    }
    const d = (data || {}) as { locked?: boolean; has_passcode?: boolean };
    return { locked: !!d.locked, hasPasscode: !!d.has_passcode, supported: true, enforced: true };
  },

  /**
   * 잠금 ON/OFF 및(또는) 비밀번호 변경.
   * 새 비밀번호를 정하면 관리자 기기에도 저장해서, 로그아웃해도 바로 사이트를 볼 수 있게 합니다.
   */
  async adminSet(enabled: boolean, newCode?: string): Promise<void> {
    const normalized = newCode && newCode.trim() ? normalizePasscode(newCode) : undefined;
    if (newCode !== undefined && newCode.trim() && newCode.trim().length < 4) {
      throw new Error('비밀번호는 4자 이상이어야 합니다.');
    }
    if (!supabase) {
      const l = readLocal();
      const next: LocalLock = { ...l, locked: enabled };
      if (normalized) {
        next.salt = Math.random().toString(36).slice(2);
        next.hash = await sha256Hex(next.salt + normalized);
      }
      if (enabled && !next.hash) throw new Error('먼저 방문자 비밀번호를 정해 주세요.');
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    } else {
      const { error } = await supabase.rpc('admin_set_site_lock', {
        enabled,
        new_code: normalized ?? null
      });
      if (error) {
        if (/set a passcode first/i.test(error.message)) throw new Error('먼저 방문자 비밀번호를 정해 주세요.');
        if (/at least 4/i.test(error.message)) throw new Error('비밀번호는 4자 이상이어야 합니다.');
        throw new Error(error.message);
      }
    }
    if (normalized) setStoredPasscode(normalized);
  }
};
