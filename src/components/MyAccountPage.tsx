import React from 'react';
import { useAuth } from '../context/AuthContext';

export const MyAccountPage: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'customer') {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl text-[#343923]">My Account</h1>
        <p className="mt-3 text-sm text-[#53583A]">Sign in with a customer account to view your account details.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#53583A]">Customer account</p>
        <h1 className="mt-2 font-serif text-3xl text-[#343923]">My Account</h1>
      </header>
      <dl className="divide-y divide-[#53583A]/15 border-y border-[#53583A]/20 bg-white px-5">
        <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
          <dt className="text-xs font-medium text-[#53583A]">Name</dt>
          <dd className="text-sm text-[#343923]">{user.fullName}</dd>
        </div>
        <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
          <dt className="text-xs font-medium text-[#53583A]">Email</dt>
          <dd className="text-sm text-[#343923]">{user.email}</dd>
        </div>
        <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
          <dt className="text-xs font-medium text-[#53583A]">Phone</dt>
          <dd className="text-sm text-[#343923]">{user.phone}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-5 text-[#53583A]">Profile changes will be available when customer authentication is connected.</p>
    </main>
  );
};
