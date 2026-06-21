'use client';

import { useSession } from 'next-auth/react';

export default function Topbar() {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'User';

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left - Page title placeholder */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {userName ? `Selamat datang, ${userName}` : 'Dashboard'}
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-red-600">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
