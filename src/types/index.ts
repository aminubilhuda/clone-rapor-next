import 'next-auth';
import '@auth/core/jwt';

// ===== Extend NextAuth types =====
declare module 'next-auth' {
  interface User {
    jabatan?: number;
    id_user?: number;
    id_siswa?: number;
    moto?: string;
  }
  interface Session {
    user: {
      id_user?: number;
      id_siswa?: number;
      jabatan?: number;
      moto?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    jabatan?: number;
    id_user?: number;
    id_siswa?: number;
    moto?: string;
  }
}
