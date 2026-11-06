import React, { useRef, useState } from 'react';

/**
 * 문의 폼 공통 로직 (Formspree 전송 + 스팸 방지).
 * 모든 템플릿이 같은 로직을 쓰고, 화면 모양만 템플릿별로 다르게 그립니다.
 */

// Formspree form (https://formspree.io/f/<id>). The ID is public; it can be overridden per environment.
const FORMSPREE_FORM_ID =
  ((import.meta.env.VITE_FORMSPREE_FORM_ID as string | undefined) || '').trim() || 'xljjvzyb';
const FORMSPREE_ENDPOINT = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;

// Spam protection settings
const MIN_FILL_TIME_MS = 3000; // bots usually submit instantly
const COOLDOWN_MS = 60 * 1000; // one message per minute per browser
const COOLDOWN_KEY = 'jh_contact_last_sent';
export const CONTACT_LIMITS = { name: 100, email: 200, organization: 150, message: 3000 };
export const MIN_MESSAGE_LENGTH = 10;

const readLastSent = () => {
  try {
    return Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
  } catch {
    return 0;
  }
};

export function useContactForm(fallbackEmail: string) {
  const profile = { email: fallbackEmail };
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formShownAt = useRef(Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !message.trim()) return;

    // Honeypot filled or submitted too fast: almost certainly a bot. Pretend success silently.
    if (honeypot || Date.now() - formShownAt.current < MIN_FILL_TIME_MS) {
      setSubmitted(true);
      return;
    }

    if (message.trim().length < MIN_MESSAGE_LENGTH) {
      setError(`Please write a little more (at least ${MIN_MESSAGE_LENGTH} characters).`);
      return;
    }

    const wait = readLastSent() + COOLDOWN_MS - Date.now();
    if (wait > 0) {
      setError(`You just sent a message. Please wait ${Math.ceil(wait / 1000)} seconds before sending another.`);
      return;
    }

    setSending(true);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(), // Formspree uses this as the reply-to address
          organization: organization.trim(),
          message: message.trim(),
          _subject: `Portfolio inquiry from ${name.trim()}`,
          _gotcha: honeypot
        })
      });

      if (!res.ok) {
        let detail = '';
        try {
          const data = await res.json();
          detail = (data?.errors || []).map((er: { message?: string }) => er.message).filter(Boolean).join(' ');
        } catch {
          // ignore
        }
        throw new Error(detail || `Request failed (${res.status})`);
      }

      try {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      } catch {
        // ignore
      }
      setSubmitted(true);
      setName('');
      setEmail('');
      setOrganization('');
      setMessage('');
      setTimeout(() => {
        setSubmitted(false);
        formShownAt.current = Date.now();
      }, 6000);
    } catch (err) {
      setError(
        `Sorry, your message could not be sent${
          err instanceof Error && err.message ? ` (${err.message})` : ''
        }. Please try again later or email ${profile.email} directly.`
      );
    } finally {
      setSending(false);
    }
  };

  return {
    name, setName,
    email, setEmail,
    organization, setOrganization,
    message, setMessage,
    honeypot, setHoneypot,
    submitted, sending, error,
    handleSubmit,
    limits: CONTACT_LIMITS
  };
}
