import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { pool } from './db';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const [rows]: any = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [credentials.username]
          );

          if (rows.length === 0) return null;

          const user = rows[0];

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) return null;

          return {
            id: user.id_user.toString(),
            name: user.nama,
            jabatan: user.jabatan,
            id_user: user.id_user,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.jabatan = user.jabatan;
        token.id_user = user.id_user;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.jabatan = token.jabatan as number | undefined;
        session.user.id_user = token.id_user as number | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
