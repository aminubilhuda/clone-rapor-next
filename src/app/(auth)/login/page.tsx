'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Username atau Password Salah!');
      setLoading(false);
      return;
    }

    router.refresh();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl p-8 premium-shadow-lg border border-[rgba(0,0,0,0.04)]">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 rounded-xl bg-[#1A1A2E] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A2E] tracking-tight">E-Rapor SMK</h2>
            <p className="text-sm text-[#6B7280] mt-1">Masuk ke akun Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoFocus
                className="w-full px-3.5 py-2.5 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl text-sm text-[#1A1A2E] placeholder-[#6B7280]/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40 transition-all"
                placeholder="Masukkan username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3.5 py-2.5 bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl text-sm text-[#1A1A2E] placeholder-[#6B7280]/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40 transition-all"
                placeholder="Masukkan password"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#DC2626] hover:bg-[#B91C1C] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-medium rounded-xl transition-all duration-150 flex items-center justify-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-[#6B7280]/60">
            &copy; {new Date().getFullYear()} E-Rapor SMK Abdi Negara Tuban
          </div>
        </div>
      </div>
    </div>
  );
}
