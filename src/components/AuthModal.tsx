import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/salon';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode = 'login', onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (!email.trim() || !password) {
        setError('Please enter your email address and password.');
        return;
      }
      if (mode === 'register' && (!fullName.trim() || !phone.trim())) {
        setError('Please fill in your name and phone number.');
        return;
      }
      if (mode === 'register' && password.length < 8) {
        setError('Choose a password with at least 8 characters.');
        return;
      }

      const result = mode === 'login'
        ? await login(email, password)
        : await register(fullName, email, phone, password);
      if (result.error) {
        setError(result.error);
      } else if (result.needsEmailConfirmation) {
        setMessage('Check your email to confirm your account, then sign in.');
      } else {
        onClose();
        if (result.role) onSuccess?.(result.role);
      }
    } catch {
      setError('We could not complete sign-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#D8C9A7]">
        {/* Header */}
        <div className="bg-[#26352A] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-gray-300 hover:text-white hover:bg-[#344839]"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#D8C9A7]" />
            <span className="text-[10px] tracking-widest text-[#D8C9A7] uppercase font-semibold">
              THE OASIS SALON & SPA
            </span>
          </div>
          <h3 className="font-serif text-2xl font-bold mt-1 text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Customer Account'}
          </h3>
          <p className="text-xs text-[#E3E9DF]/80 mt-1">
            Sign in with your salon account. Customers must sign in before confirming an appointment.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-100 text-xs font-semibold">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-[#26352A] text-[#26352A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              mode === 'register'
                ? 'border-[#26352A] text-[#26352A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Register (Customer)
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {message && <p className="rounded-xl bg-emerald-50 p-3 text-emerald-800">{message}</p>}

          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-gray-700">Password *</label>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border p-2.5"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Mobile Number (India) *</label>
              <input
                type="tel"
                placeholder="98451 12233"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#26352A] text-white rounded-xl font-semibold hover:bg-[#19231C] active:scale-95 transition-all shadow-md mt-2"
          >
            {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

      </div>
    </div>
  );
};
