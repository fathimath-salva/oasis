import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Briefcase,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/salon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register, switchRole } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      if (!email.trim()) {
        setError('Please enter your email or staff username.');
        return;
      }
      login(email);
      onClose();
      if (onSuccess) onSuccess();
    } else {
      if (!fullName.trim() || !phone.trim() || !email.trim()) {
        setError('Please fill in all registration fields.');
        return;
      }
      register(fullName, email, phone);
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    switchRole(role);
    onClose();
    if (onSuccess) onSuccess();
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
            Sign in to manage your appointments, booking history, and preferences.
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

          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Kavya Rai"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              {mode === 'login' ? 'Email or Username *' : 'Email Address *'}
            </label>
            <input
              type="text"
              placeholder={mode === 'login' ? 'admin@oasis-salon.in or kavya@example.com' : 'kavya@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border rounded-xl"
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
            className="w-full py-3 bg-[#26352A] text-white rounded-xl font-semibold hover:bg-[#19231C] active:scale-95 transition-all shadow-md mt-2"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {import.meta.env.DEV && <>
        {/* Development-only demo accounts */}
        <div className="bg-[#F5F1E8] p-5 border-t border-[#D8C9A7]/40 space-y-2 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
            Instant Demo Account Sign-In (For Testing)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('customer')}
              className="p-2 bg-white rounded-xl border border-gray-200 text-center hover:border-[#26352A] transition-colors"
            >
              <User className="w-3.5 h-3.5 mx-auto text-[#26352A] mb-0.5" />
              <span className="text-[10px] font-bold text-[#26352A] block">Customer</span>
              <span className="text-[9px] text-gray-400">Kavya Rai</span>
            </button>

            <button
              onClick={() => handleQuickDemo('staff')}
              className="p-2 bg-white rounded-xl border border-gray-200 text-center hover:border-[#26352A] transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 mx-auto text-[#26352A] mb-0.5" />
              <span className="text-[10px] font-bold text-[#26352A] block">Staff</span>
              <span className="text-[9px] text-gray-400">Ramesh Shetty</span>
            </button>

            <button
              onClick={() => handleQuickDemo('admin')}
              className="p-2 bg-white rounded-xl border border-gray-200 text-center hover:border-[#26352A] transition-colors"
            >
              <Shield className="w-3.5 h-3.5 mx-auto text-[#26352A] mb-0.5" />
              <span className="text-[10px] font-bold text-[#26352A] block">Admin</span>
              <span className="text-[9px] text-gray-400">Salon Director</span>
            </button>
          </div>
        </div>
        </>}
      </div>
    </div>
  );
};
