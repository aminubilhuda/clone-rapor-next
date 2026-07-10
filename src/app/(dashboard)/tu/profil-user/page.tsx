import { pool } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfileForm from '@/app/(dashboard)/profile/_components/profile-form';

async function getUserProfile() {
  try {
    const session = await auth();
    if (!session?.user) return null;

    const [rows]: any = await pool.query(
      'SELECT id_user, nama, nip, nuptk, kontak, username, foto, jabatan FROM users WHERE id_user = ?',
      [session.user.id_user]
    );

    if (rows.length === 0) return null;

    const user = rows[0];

    const [jabatanRows]: any = await pool.query(
      'SELECT jabatan FROM jabatan WHERE id_jabatan = ?',
      [user.jabatan]
    );
    const namaJabatan = jabatanRows[0]?.jabatan || '-';

    return { user, namaJabatan };
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
}

export default async function TuProfilUserPage() {
  const session = await auth();
  if (!session?.user || (session.user.jabatan !== 1 && session.user.jabatan !== 2)) redirect('/login');

  const data = await getUserProfile();
  if (!data) {
    return <div className="text-center py-20 text-red-500">Gagal memuat data profil.</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl premium-shadow border border-[rgba(0,0,0,0.04)]">
        <div className="border-b border-[rgba(0,0,0,0.04)] px-6 py-4">
          <h3 className="font-semibold text-[#1A1A2E]">Profil Saya</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">Kelola informasi profil Anda</p>
        </div>
        <div className="p-6">
          <ProfileForm user={data.user} namaJabatan={data.namaJabatan} />
        </div>
      </div>
    </div>
  );
}
