'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';
import { requireGuruBK } from '@/lib/actions/auth-guard';
import { getSekolahWithFilter } from '@/lib/sekolah-helper';
import { isValidDateString, parseJsonArray } from '@/lib/validate';
import { BIDANG_BK, type BidangBK } from '@/lib/bk';
import type { AgendaBKRow } from '@/lib/agenda-bk';

function clean(value: FormDataEntryValue | null): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanBidang(values: string[]): BidangBK[] {
  const allowed = new Set(BIDANG_BK.map((b) => b.key));
  return Array.from(new Set(values.filter((v): v is BidangBK => allowed.has(v as BidangBK))));
}

function toDateString(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(value).slice(0, 10);
}

function readFields(formData: FormData) {
  const parsed = parseJsonArray<string>(formData.get('bidang') as string, 'bidang');
  return {
    tanggal: String(formData.get('tanggal') || '').trim(),
    waktu: clean(formData.get('waktu')),
    jenis_kegiatan: clean(formData.get('jenis_kegiatan')),
    sasaran: clean(formData.get('sasaran')),
    hasil: clean(formData.get('hasil')),
    tindak_lanjut: clean(formData.get('tindak_lanjut')),
    parsedBidang: parsed,
  };
}

export async function getAgendaBK(): Promise<AgendaBKRow[]> {
  const auth = await requireGuruBK();
  if (auth.error || !auth.user) return [];

  const sekolah = await getSekolahWithFilter();
  const [rows]: any = await pool.query(
    `SELECT id_agenda, tanggal, waktu, jenis_kegiatan, bidang, sasaran, hasil, tindak_lanjut
     FROM agenda_bk
     WHERE tahun = ? AND semester = ? AND id_user = ? AND deleted_at IS NULL
     ORDER BY tanggal ASC, id_agenda ASC`,
    [sekolah.tahun, sekolah.semester, auth.user.id_user],
  );

  return rows.map((row: any) => ({
    id_agenda: Number(row.id_agenda),
    tanggal: toDateString(row.tanggal),
    waktu: row.waktu ?? null,
    jenis_kegiatan: row.jenis_kegiatan ?? '',
    bidang: row.bidang ?? '',
    sasaran: row.sasaran ?? null,
    hasil: row.hasil ?? null,
    tindak_lanjut: row.tindak_lanjut ?? null,
  }));
}

export async function addAgendaBK(formData: FormData) {
  const auth = await requireGuruBK();
  if (auth.error || !auth.user) {
    return { success: false, error: auth.error || 'Unauthorized' } as const;
  }

  const { tanggal, waktu, jenis_kegiatan, sasaran, hasil, tindak_lanjut, parsedBidang } = readFields(formData);
  if (!parsedBidang.ok) return { success: false, error: parsedBidang.error } as const;
  const bidang = cleanBidang(parsedBidang.value);

  if (!isValidDateString(tanggal)) return { success: false, error: 'Tanggal tidak valid' } as const;
  if (!jenis_kegiatan) return { success: false, error: 'Jenis kegiatan wajib diisi' } as const;
  if (bidang.length === 0) return { success: false, error: 'Pilih minimal satu bidang layanan' } as const;

  try {
    const sekolah = await getSekolahWithFilter();
    await pool.query(
      `INSERT INTO agenda_bk
       (tahun, semester, id_user, tanggal, waktu, jenis_kegiatan, bidang, sasaran, hasil, tindak_lanjut)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sekolah.tahun,
        sekolah.semester,
        auth.user.id_user,
        tanggal,
        waktu,
        jenis_kegiatan,
        bidang.join(','),
        sasaran,
        hasil,
        tindak_lanjut,
      ],
    );

    revalidatePath('/guru/bk/agenda');
    revalidatePath('/cetak/bk/agenda');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menyimpan agenda' } as const;
  }
}

export async function updateAgendaBK(formData: FormData) {
  const auth = await requireGuruBK();
  if (auth.error || !auth.user) {
    return { success: false, error: auth.error || 'Unauthorized' } as const;
  }

  const idAgenda = Number(formData.get('id_agenda'));
  if (!Number.isInteger(idAgenda) || idAgenda <= 0) {
    return { success: false, error: 'Agenda tidak valid' } as const;
  }

  const { tanggal, waktu, jenis_kegiatan, sasaran, hasil, tindak_lanjut, parsedBidang } = readFields(formData);
  if (!parsedBidang.ok) return { success: false, error: parsedBidang.error } as const;
  const bidang = cleanBidang(parsedBidang.value);

  if (!isValidDateString(tanggal)) return { success: false, error: 'Tanggal tidak valid' } as const;
  if (!jenis_kegiatan) return { success: false, error: 'Jenis kegiatan wajib diisi' } as const;
  if (bidang.length === 0) return { success: false, error: 'Pilih minimal satu bidang layanan' } as const;

  try {
    const sekolah = await getSekolahWithFilter();
    const [result]: any = await pool.query(
      `UPDATE agenda_bk
       SET tanggal = ?, waktu = ?, jenis_kegiatan = ?, bidang = ?, sasaran = ?, hasil = ?, tindak_lanjut = ?
       WHERE id_agenda = ? AND id_user = ? AND tahun = ? AND semester = ? AND deleted_at IS NULL`,
      [
        tanggal,
        waktu,
        jenis_kegiatan,
        bidang.join(','),
        sasaran,
        hasil,
        tindak_lanjut,
        idAgenda,
        auth.user.id_user,
        sekolah.tahun,
        sekolah.semester,
      ],
    );

    if (result.affectedRows === 0) {
      return { success: false, error: 'Agenda tidak ditemukan atau sudah dihapus' } as const;
    }

    revalidatePath('/guru/bk/agenda');
    revalidatePath('/cetak/bk/agenda');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal memperbarui agenda' } as const;
  }
}

export async function deleteAgendaBK(idAgenda: number) {
  const auth = await requireGuruBK();
  if (auth.error || !auth.user) {
    return { success: false, error: auth.error || 'Unauthorized' } as const;
  }
  if (!Number.isInteger(idAgenda) || idAgenda <= 0) {
    return { success: false, error: 'Agenda tidak valid' } as const;
  }

  try {
    const sekolah = await getSekolahWithFilter();
    const [result]: any = await pool.query(
      `UPDATE agenda_bk SET deleted_at = NOW()
       WHERE id_agenda = ? AND id_user = ? AND tahun = ? AND semester = ? AND deleted_at IS NULL`,
      [idAgenda, auth.user.id_user, sekolah.tahun, sekolah.semester],
    );

    if (result.affectedRows === 0) {
      return { success: false, error: 'Agenda tidak ditemukan atau sudah dihapus' } as const;
    }

    revalidatePath('/guru/bk/agenda');
    revalidatePath('/cetak/bk/agenda');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menghapus agenda' } as const;
  }
}
