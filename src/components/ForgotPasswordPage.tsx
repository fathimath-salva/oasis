import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC<{ onBackToSignIn: () => void }> = ({ onBackToSignIn }) => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!email.trim()) { setError('Enter the email address used for your account.'); return; }
    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(email);
      if (result.error) setError(result.error);
      else {
        setMessage(result.message ?? 'If an account matches that email, reset instructions will be sent.');
        setCooldown(true);
        window.setTimeout(() => setCooldown(false), 30000);
      }
    } catch {
      setError('We could not process that request. Check your connection and try again.');
    } finally { setIsSubmitting(false); }
  };

  return <section className="mx-auto max-w-xl px-4 py-12 sm:py-16">
    <div className="rounded-3xl border border-[#D8C9A7] bg-white p-6 shadow-sm sm:p-9">
      <Mail className="mb-4 h-6 w-6 text-[#53583A]" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#53583A]">Account recovery</p>
      <h1 className="mt-2 font-serif text-3xl text-[#26352A]">Forgot your password?</h1>
      <p className="mt-3 text-sm leading-6 text-[#53583A]">Enter your account email. If it matches an account, we’ll send a secure reset link.</p>
      <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-[#26352A]" htmlFor="recovery-email">Email address</label>
      <input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#D8C9A7] px-4 py-3 text-base sm:text-sm" />
        {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}
        <button type="submit" disabled={isSubmitting || cooldown} className="w-full rounded-xl bg-[#26352A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#19231C] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Requesting link…' : cooldown ? 'Please wait before requesting again' : 'Send reset link'}</button>
      </form>
      <button type="button" onClick={onBackToSignIn} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#53583A] hover:text-[#26352A]"><ArrowLeft className="h-4 w-4" />Back to sign in</button>
    </div>
  </section>;
};
