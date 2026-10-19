import React, { useState } from 'react';
import { AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/salon';
import { validateNewPassword } from '../lib/registration';

export const ResetPasswordPage: React.FC<{
  onReturnToSignIn: (role?: UserRole) => void;
  onRequestNewReset: () => void;
}> = ({ onReturnToSignIn, onRequestNewReset }) => {
  const { recoverySessionActive, recoverySessionReady, updatePasswordFromRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [verifiedRole, setVerifiedRole] = useState<UserRole | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const validationError = validateNewPassword(password, confirmPassword);
    if (validationError) { setError(validationError); return; }
    setIsSubmitting(true);
    try {
      const result = await updatePasswordFromRecovery(password);
      if (result.error) setError(result.error);
      else {
        setMessage(result.message ?? 'Your password has been updated. Please sign in again.');
        setIsComplete(true);
      }
      if (result.passwordUpdated) {
        setIsComplete(true);
        setVerifiedRole(result.role);
        if (result.error) setMessage('Password updated. Sign out if needed, then continue to the appropriate sign-in page.');
      }
      setPassword('');
      setConfirmPassword('');
    } catch {
      setError('We could not update your password. Request a new recovery link and try again.');
    } finally { setIsSubmitting(false); }
  };

  return <section className="mx-auto max-w-xl px-4 py-12 sm:py-16">
    <div className="rounded-3xl border border-[#D8C9A7] bg-white p-6 shadow-sm sm:p-9">
      <KeyRound className="mb-4 h-6 w-6 text-[#53583A]" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#53583A]">Secure account recovery</p>
      <h1 className="mt-2 font-serif text-3xl text-[#26352A]">Set a new password</h1>
      {!recoverySessionReady ? <p role="status" className="mt-4 text-sm text-[#53583A]">Verifying the secure recovery session…</p> : isComplete ? <div className="mt-4 space-y-4">
        {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}
        <button type="button" onClick={() => onReturnToSignIn(verifiedRole)} className="text-sm font-semibold text-[#53583A] hover:text-[#26352A]">Continue to sign in</button>
      </div> : !recoverySessionActive ? <div className="mt-4 space-y-4">
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />This recovery link is missing, expired, or could not be verified. Request a new reset link to continue.</p>
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={onRequestNewReset} className="rounded-xl bg-[#26352A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#19231C]">Request a new reset email</button>
          <button type="button" onClick={() => onReturnToSignIn()} className="text-sm font-semibold text-[#53583A] hover:text-[#26352A]">Return to sign in</button>
        </div>
      </div> : <>
        <p className="mt-3 text-sm leading-6 text-[#53583A]">Choose a new password for your account.</p>
        <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-[#26352A]" htmlFor="new-password">New password</label>
          <input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-[#D8C9A7] px-4 py-3 text-base sm:text-sm" />
          <label className="block text-sm font-medium text-[#26352A]" htmlFor="confirm-password">Confirm new password</label>
          <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-[#D8C9A7] px-4 py-3 text-base sm:text-sm" />
          {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
          {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}
          <button type="submit" disabled={isSubmitting || Boolean(message)} className="w-full rounded-xl bg-[#26352A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#19231C] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Saving password…' : 'Save New Password'}</button>
        </form>
      </>}
    </div>
  </section>;
};
