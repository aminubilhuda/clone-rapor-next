import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { pool } from './db';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';
import { JABATAN } from './constants';

interface StaffAuthRow extends RowDataPacket {
  id_user: number;
  jabatan: number;
  nama: string;
  password: string;
  moto: string;
}

interface StudentAuthRow extends RowDataPacket {
  id_siswa: number;
  nama_siswa: string;
  password: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
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
          const [staffRows] = await pool.query<StaffAuthRow[]>(
            `SELECT id_user, jabatan, nama, password, IFNULL(moto, '') AS moto
             FROM users
             WHERE username = ? AND deleted_at IS NULL`,
            [credentials.username]
          );

          if (staffRows.length > 0) {
            const user = staffRows[0];
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
              moto: user.moto,
            };
          }

          const [studentRows] = await pool.query<StudentAuthRow[]>(
            `SELECT id_siswa, nama_siswa, password
             FROM siswa
             WHERE username = ? AND aktif = 1 AND deleted_at IS NULL`,
            [credentials.username]
          );

          if (studentRows.length === 0) return null;

          const student = studentRows[0];
          const isStudentPasswordValid = await bcrypt.compare(
            credentials.password as string,
            student.password
          );

          if (!isStudentPasswordValid) return null;

          return {
            id: `siswa:${student.id_siswa}`,
            name: student.nama_siswa,
            jabatan: JABATAN.SISWA,
            id_siswa: student.id_siswa,
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
        token.id_siswa = user.id_siswa;
        token.moto = user.moto;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.jabatan = token.jabatan as number | undefined;
        session.user.id_user = token.id_user as number | undefined;
        session.user.id_siswa = token.id_siswa as number | undefined;
        session.user.moto = token.moto as string | undefined;
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
