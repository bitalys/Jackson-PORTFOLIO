import React, { useEffect, useRef, useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

interface LockScreenProps {
  title?: string;
  onUnlock: (code: string) => Promise<boolean>;
  onOpenAdmin: () => void;
}

const MAX_TRIES = 5;
const COOLDOWN_SEC = 30;

/** Visitor passcode screen ("Private Access") shown while the site is locked. */
export const LockScreen: React.FC<LockScreenProps> = ({ title = 'Jackson Hong', onUnlock, onOpenAdmin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [fails, setFails] = useState(0);
  const [waitLeft, setWaitLeft] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (waitLeft <= 0) return;
    const t = window.setTimeout(() => setWaitLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [waitLeft]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || checking || waitLeft > 0) return;
    setChecking(true);
    setError(null);
    try {
      const ok = await onUnlock(code);
      if (!ok) {
        const n = fails + 1;
        setFails(n);
        setCode('');
        if (n >= MAX_TRIES) {
          setWaitLeft(COOLDOWN_SEC);
          setFails(0);
          setError(`Too many attempts. Please wait ${COOLDOWN_SEC} seconds.`);
        } else {
          setError('Incorrect passcode. Please try again.');
        }
        inputRef.current?.focus();
      }
    } catch {
      setError('Could not verify the passcode. Please check your connection and try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-white"
      style={{ background: 'radial-gradient(circle at 50% 30%, #18263a 0%, #0b1622 55%, #070d15 100%)' }}
    >
      <main className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 w-14 h-14 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
          <Lock className="w-6 h-6 text-white/80" />
        </div>
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/50 mb-4">Private Access</p>
        <h1
          className="text-4xl sm:text-5xl leading-[1.05] tracking-tight mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif", fontWeight: 500 }}
        >
          {title}
          <br />
          <span className="text-white/60">Portfolio</span>
        </h1>
        <p className="text-sm text-white/60 mb-10 leading-relaxed">
          This portfolio is private. Please enter the passcode you were given to continue.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <label htmlFor="site-passcode" className="sr-only">
            Passcode
          </label>
          <div className="flex items-stretch border border-white/25 focus-within:border-white/70 transition-colors bg-white/5">
            <input
              id="site-passcode"
              ref={inputRef}
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Passcode"
              autoComplete="current-password"
              autoFocus
              disabled={waitLeft > 0}
              className="flex-1 min-w-0 bg-transparent px-5 py-4 text-base tracking-[0.2em] placeholder:tracking-normal placeholder:text-white/35 text-white focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={checking || !code.trim() || waitLeft > 0}
              className="cursor-pointer px-5 flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase bg-white text-[#0b1622] hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Enter"
            >
              {checking ? '…' : waitLeft > 0 ? `${waitLeft}s` : 'Enter'}
              {!checking && waitLeft <= 0 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
          <p className="min-h-[1.25rem] text-xs text-rose-300" role="alert" aria-live="polite">
            {error}
          </p>
        </form>

        <p className="text-[11px] text-white/35 mt-6">Once entered, this device will be remembered.</p>
      </main>

      <footer className="absolute bottom-6 inset-x-0 flex justify-center gap-6 text-[10px] tracking-[0.2em] uppercase text-white/35">
        <span>© {new Date().getFullYear()} {title}</span>
        <button onClick={onOpenAdmin} className="cursor-pointer hover:text-white/80 transition-colors uppercase tracking-[0.2em]">
          Admin
        </button>
      </footer>
    </div>
  );
};
