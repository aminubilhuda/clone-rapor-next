# Rencana Implementasi — Sub Mapel Konsentrasi Keahlian (Fase F)

Tanggal: 2026-10-23
Status: menunggu persetujuan
Rancangan & panduan tabel: `/Users/godboy/.opencode/plan/2026-10-23-mapel-konsentrasi-submapel.md`

## Tujuan

Mapel konsentrasi (Akuntansi, Bisnis Digital, RPL, Perhotelan, LPKKK) menjadi baris judul tanpa nilai. Sub-mapel di bawahnya adalah mapel penuh dengan guru, TP, dan nilai sendiri. Format baru hanya berlaku untuk periode yang punya sub-mapel terdaftar; periode 2024-2025 dan 2025-2026 harus identik dengan sebelumnya.

## Keputusan yang dipakai plan ini

1. Satu kolom `mapel.parent_id` (self-reference, nullable). Tidak ada tabel baru.
2. Kedalaman maksimal 1 level.
3. Induk = mapel yang punya anak. Induk tidak punya `mapel_kelas`, TP, nilai, atau enrollment di periode baru.
4. Deteksi tampilan **per periode**: mapel dirender sebagai header hanya jika pada periode itu ada anak yang diikuti siswa. Jika tidak, mapel dirender seperti biasa.
5. Urutan: blok induk mengikuti `mapel.urut` induk; anak diurutkan `urut`, lalu `nama_mapel`, lalu `id_mapel`.
6. Penomoran anak: `1..n` di dalam induk. Mapel biasa melanjutkan nomor kelompok. Keputusan ini menutup pertanyaan terbuka #4 di rancangan.
7. Baris induk: tebal, `colspan` seluruh kolom, tanpa latar tambahan. Keputusan ini menutup pertanyaan terbuka #5.
8. Data sub-mapel (nama, singkatan, guru) tidak di-seed oleh plan ini. Itu diisi TU lewat UI setelah kode terpasang, mengikuti panduan di `docs/mapel-konsentrasi.md`.

## Peta file

Baru:

- `migrations/0003_mapel_parent.sql`
- `src/lib/mapel-hierarki.ts`
- `src/lib/__tests__/mapel-hierarki.test.ts`
- `src/lib/__tests__/rapor-templates-baseline.test.ts`
- `docs/mapel-konsentrasi.md`

Diubah:

- `src/lib/actions/mapel-actions.ts`
- `src/app/(dashboard)/tu/mapel/page.tsx`
- `src/app/(dashboard)/tu/mapel/_components/mapel-client.tsx`
- `src/app/(dashboard)/tu/mapel/_components/modal-mapel.tsx`
- `src/app/(dashboard)/tu/mapel-kelas/page.tsx`
- `src/app/(dashboard)/tu/mapel-kelas/_components/mapel-kelas-client.tsx`
- `src/app/(dashboard)/tu/mapel-kelas/_components/modal-mapel-kelas.tsx`
- `src/lib/actions/mapel-kelas-actions.ts`
- `src/app/(dashboard)/tu/mapel-siswa/page.tsx`
- `src/lib/actions/mapel-siswa-actions.ts`
- `src/app/api/tu/cetak-rapor/route.ts`
- `src/lib/pdf-templates/tengah-semester-template.ts`
- `src/lib/pdf-templates/semester-template.ts`
- `src/lib/pdf-templates/tengah-semester-pdfmake.ts`
- `src/lib/pdf-templates/semester-pdfmake.ts`

Catatan: working tree saat ini punya perubahan lain yang belum di-commit (`.gitignore`, `AGENTS.md`, `dapodik-actions.ts`, dll). Jangan stage file di luar daftar ini.

---

## Task 0 — Baseline & migrasi

### Task 0.1 — Kunci tampilan rapor lama dengan characterization test

Tujuan: membuktikan template rapor tidak berubah untuk data tanpa `children`.

**File baru:** `src/lib/__tests__/rapor-templates-baseline.test.ts`

Isi:

```ts
import { describe, it, expect } from 'vitest';
import {
  generateTengahSemesterRaporHTML,
  type SiswaMidRapor,
} from '../pdf-templates/tengah-semester-template';
import {
  generateSemesterRaporHTML,
  type SiswaSemesterRapor,
} from '../pdf-templates/semester-template';

const sekolah = {
  nama_sekolah: 'SMK Negeri 1 Contoh',
  alamat: 'Jl. Pendidikan No. 1',
  logo: null,
  nama_kepsek: 'Kepala Sekolah',
  nip_kepsek: '19700101 199001 1 001',
};

const midSiswa: SiswaMidRapor = {
  id_siswa: 1,
  nama_siswa: 'Siswa Contoh',
  nis: '123',
  nisn: '456',
  nama_kelas: 'XI RPL',
  fase: 'F',
  id_kelas: 1,
  kelompok_mapels: [
    {
      huruf: 'A',
      kelompok: 'Mata Pelajaran Umum',
      mapels: [
        { nama_mapel: 'Matematika', nilai: 80, kktp: 75 },
        { nama_mapel: 'Bahasa Indonesia', nilai: 85, kktp: 75 },
      ],
    },
    {
      huruf: 'B',
      kelompok: 'Mata Pelajaran Kejuruan',
      mapels: [
        { nama_mapel: 'Rekayasa Perangkat Lunak', nilai: 78, kktp: 70 },
        { nama_mapel: 'Basis Data', nilai: 82, kktp: 70 },
      ],
    },
  ],
  presensi: [{ absen: 'Sakit', jumlah: 1 }],
  catatan_wali: 'Catatan contoh.',
  wali_kelas: 'Wali Kelas',
  nip_wali: '19800101 200501 1 001',
  tanggal_mid: '23 Oktober 2026',
  lokasi: 'Contoh',
};

const semesterSiswa: SiswaSemesterRapor = {
  ...midSiswa,
  id_tingkat: 2,
  kelompok_mapels: [
    {
      huruf: 'A',
      kelompok: 'Mata Pelajaran Umum',
      mapels: [
        {
          nama_mapel: 'Matematika',
          nilai: 80,
          deskripsi_max: 'Baik dalam',
          tujuan_max: 'menyelesaikan persamaan.',
          deskripsi_min: 'Cukup dalam',
          tujuan_min: 'menyelesaikan operasi dasar.',
        },
      ],
    },
    {
      huruf: 'B',
      kelompok: 'Mata Pelajaran Kejuruan',
      mapels: [
        {
          nama_mapel: 'Rekayasa Perangkat Lunak',
          nilai: 78,
          deskripsi_max: 'Baik dalam',
          tujuan_max: 'merancang aplikasi.',
          deskripsi_min: 'Cukup dalam',
          tujuan_min: 'menggunakan alat dasar.',
        },
      ],
    },
  ],
  prakerin: [],
  kokurikuler_text: '',
  eskul: [],
  organisasi: [],
  tanggapan_ortu: '',
  tanggal_rapor: '20 Desember 2026',
  isSemester2: false,
  tingkatNaik: 'XII',
  tahunPelajaran: '2026-2027',
};

describe('baseline rapor tanpa hierarki', () => {
  it('tengah semester tidak berubah', () => {
    expect(
      generateTengahSemesterRaporHTML([midSiswa], sekolah, '2026-2027', 'Ganjil', {
        nama: 'Wali Kelas',
        nip: '19800101 200501 1 001',
      })
    ).toMatchSnapshot();
  });

  it('semester tidak berubah', () => {
    expect(
      generateSemesterRaporHTML([semesterSiswa], sekolah, '2026-2027', 'Ganjil', {
        nama: 'Wali Kelas',
        nip: '19800101 200501 1 001',
      })
    ).toMatchSnapshot();
  });
});
```

Langkah:

1. Tulis file di atas.
2. Jalankan `npm test -- rapor-templates-baseline`. Snapshot dibuat otomatis dan tes lulus.
3. Periksa isi snapshot: tidak ada `colspan="4"` untuk baris mapel, penomoran 1..n berurutan.
4. Commit:
   ```bash
   git add src/lib/__tests__/rapor-templates-baseline.test.ts \
     src/lib/__tests__/__snapshots__/rapor-templates-baseline.test.ts.snap
   git commit -m "test(rapor): kunci output template rapor sebelum hierarki mapel"
   ```

### Task 0.2 — Migrasi `parent_id`

**File baru:** `migrations/0003_mapel_parent.sql`

```sql
-- Kolom parent_id pada mapel (self-reference, maksimal 1 level).
SET @has_column := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'mapel'
    AND COLUMN_NAME = 'parent_id'
);
SET @sql := IF(@has_column = 0,
  'ALTER TABLE mapel ADD COLUMN parent_id INT NULL AFTER id_mapel',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index untuk lookup anak.
SET @has_index := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'mapel'
    AND INDEX_NAME = 'idx_mapel_parent'
);
SET @sql := IF(@has_index = 0,
  'ALTER TABLE mapel ADD INDEX idx_mapel_parent (parent_id)',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign key: hapus induk -> anak menjadi mapel biasa.
SET @has_fk := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'mapel'
    AND CONSTRAINT_NAME = 'fk_mapel_parent'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql := IF(@has_fk = 0,
  'ALTER TABLE mapel ADD CONSTRAINT fk_mapel_parent FOREIGN KEY (parent_id) REFERENCES mapel(id_mapel) ON DELETE SET NULL',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

Langkah:

1. Jalankan `bash scripts/db-migrate.sh`.
2. Verifikasi:
   ```bash
   set -a; . ./.env; set +a
   mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW COLUMNS FROM mapel LIKE 'parent_id'; SHOW INDEX FROM mapel WHERE Key_name = 'idx_mapel_parent';"
   ```
3. Commit:
   ```bash
   git add migrations/0003_mapel_parent.sql
   git commit -m "feat(db): tambah parent_id pada mapel untuk sub mapel konsentrasi"
   ```

---

## Task 1 — Helper hierarki

### Task 1.1 — Tes helper (tulis dulu, harus gagal)

**File baru:** `src/lib/__tests__/mapel-hierarki.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { buildMapelHierarki, type MapelHierarkiRow } from '../mapel-hierarki';

const mapel = (
  id_mapel: number,
  nama_mapel: string,
  urut: number,
  parent_id: number | null = null
): MapelHierarkiRow => ({ id_mapel, nama_mapel, urut, parent_id });

describe('buildMapelHierarki', () => {
  it('mempertahankan urutan lama jika tidak ada anak', () => {
    const items = [mapel(2, 'B', 1), mapel(1, 'A', 2)];
    const hasil = buildMapelHierarki(items);
    expect(hasil.map((n) => n.nama_mapel)).toEqual(['B', 'A']);
    expect(hasil.every((n) => !n.is_parent)).toBe(true);
  });

  it('mengelompokkan anak di bawah induk walau induk tidak ikut terdaftar', () => {
    const items = [mapel(11, 'Basis Data', 1, 20), mapel(12, 'Pemrograman Web', 2, 20)];
    const parentById = new Map([[20, mapel(20, 'RPL', 5)]]);
    const hasil = buildMapelHierarki(items, parentById);
    expect(hasil).toHaveLength(1);
    expect(hasil[0]).toMatchObject({ id_mapel: 20, nama_mapel: 'RPL', is_parent: true });
    expect(hasil[0].items.map((i) => i.nama_mapel)).toEqual(['Basis Data', 'Pemrograman Web']);
  });

  it('mengurutkan anak berdasarkan urut, nama, lalu id', () => {
    const items = [
      mapel(13, 'Zeta', 2, 20),
      mapel(12, 'Beta', 1, 20),
      mapel(11, 'Alpha', 1, 20),
    ];
    const parentById = new Map([[20, mapel(20, 'RPL', 1)]]);
    const hasil = buildMapelHierarki(items, parentById);
    expect(hasil[0].items.map((i) => i.id_mapel)).toEqual([11, 12, 13]);
  });

  it('menempatkan blok induk sesuai urut induk di antara mapel biasa', () => {
    const items = [mapel(1, 'Matematika', 1), mapel(11, 'Basis Data', 1, 20)];
    const parentById = new Map([[20, mapel(20, 'RPL', 2)]]);
    const hasil = buildMapelHierarki(items, parentById);
    expect(hasil.map((n) => n.nama_mapel)).toEqual(['Matematika', 'RPL']);
  });

  it('anak yatim tetap tampil sebagai mapel biasa', () => {
    const items = [mapel(11, 'Basis Data', 1, 99)];
    const hasil = buildMapelHierarki(items);
    expect(hasil).toEqual([
      { id_mapel: 11, nama_mapel: 'Basis Data', is_parent: false, items: [items[0]] },
    ]);
  });

  it('membuang baris induk jika induk dan anak sama-sama terdaftar', () => {
    const items = [mapel(20, 'RPL', 2), mapel(11, 'Basis Data', 1, 20)];
    const hasil = buildMapelHierarki(items);
    expect(hasil).toHaveLength(1);
    expect(hasil[0].is_parent).toBe(true);
    expect(hasil[0].items).toHaveLength(1);
  });
});
```

Jalankan `npx vitest run src/lib/__tests__/mapel-hierarki.test.ts` — harus gagal karena modul belum ada.

### Task 1.2 — Implementasi helper

**File baru:** `src/lib/mapel-hierarki.ts`

```ts
export interface MapelHierarkiRow {
  id_mapel: number;
  parent_id: number | null;
  nama_mapel: string;
  urut: number | null;
}

export interface MapelHierarkiNode<T extends MapelHierarkiRow> {
  id_mapel: number;
  nama_mapel: string;
  is_parent: boolean;
  items: T[];
}

const compareText = (a: string, b: string) => a.localeCompare(b, 'id');

const leaf = <T extends MapelHierarkiRow>(item: T): MapelHierarkiNode<T> => ({
  id_mapel: item.id_mapel,
  nama_mapel: item.nama_mapel,
  is_parent: false,
  items: [item],
});

/**
 * Mengelompokkan mapel anak di bawah induknya.
 * Jika tidak ada satu pun anak, urutan input dikembalikan apa adanya
 * (menjaga tampilan periode lama).
 */
export function buildMapelHierarki<T extends MapelHierarkiRow>(
  items: T[],
  parentById: Map<number, MapelHierarkiRow> = new Map(),
): MapelHierarkiNode<T>[] {
  if (!items.some((item) => item.parent_id != null)) {
    return items.map(leaf);
  }

  const itemById = new Map(items.map((item) => [item.id_mapel, item]));
  const lookupParent = (parentId: number): MapelHierarkiRow | undefined =>
    parentById.get(parentId) ?? itemById.get(parentId);

  const groups = new Map<number, T[]>();
  const standalone: T[] = [];

  for (const item of items) {
    const parent = item.parent_id == null ? undefined : lookupParent(item.parent_id);
    if (!parent) {
      standalone.push(item);
      continue;
    }
    const group = groups.get(item.parent_id!) ?? [];
    group.push(item);
    groups.set(item.parent_id!, group);
  }

  if (groups.size === 0) {
    return items.map(leaf);
  }

  // Induk yang ikut terdaftar sebagai mapel siswa tidak dirender ganda.
  const parentIds = new Set(groups.keys());
  const entries: Array<{
    sortUrut: number;
    sortNama: string;
    sortId: number;
    node: MapelHierarkiNode<T>;
  }> = [];

  for (const item of standalone) {
    if (parentIds.has(item.id_mapel)) continue;
    entries.push({
      sortUrut: item.urut ?? 0,
      sortNama: item.nama_mapel,
      sortId: item.id_mapel,
      node: leaf(item),
    });
  }

  for (const [parentId, children] of groups) {
    const parent = lookupParent(parentId)!;
    const sorted = [...children].sort(
      (a, b) =>
        (a.urut ?? 0) - (b.urut ?? 0) ||
        compareText(a.nama_mapel, b.nama_mapel) ||
        a.id_mapel - b.id_mapel,
    );
    entries.push({
      sortUrut: parent.urut ?? 0,
      sortNama: parent.nama_mapel,
      sortId: parent.id_mapel,
      node: {
        id_mapel: parent.id_mapel,
        nama_mapel: parent.nama_mapel,
        is_parent: true,
        items: sorted,
      },
    });
  }

  entries.sort(
    (a, b) =>
      a.sortUrut - b.sortUrut ||
      compareText(a.sortNama, b.sortNama) ||
      a.sortId - b.sortId,
  );

  return entries.map((entry) => entry.node);
}
```

Langkah:

1. Jalankan `npm test -- mapel-hierarki` — semua lulus.
2. Jalankan `npm run typecheck`.
3. Commit:
   ```bash
   git add src/lib/mapel-hierarki.ts src/lib/__tests__/mapel-hierarki.test.ts
   git commit -m "feat(mapel): helper hierarki induk-anak per periode"
   ```

---

## Task 2 — Master mapel (TU)

### Task 2.1 — Server actions: simpan & validasi `parent_id`

**File:** `src/lib/actions/mapel-actions.ts`

Ganti isi `updateMapel` dan `deleteMapel` menjadi:

```ts
export async function updateMapel(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_mapel') as string;
  const namaMapel = formData.get('nama_mapel') as string;
  const sMapel = formData.get('s_mapel') as string;
  const idKelompok = Number(formData.get('id_kelompok'));
  const urut = formData.get('urut') as string;
  const parentIdRaw = formData.get('parent_id') as string;
  const parentId = parentIdRaw ? Number(parentIdRaw) : null;

  if (!namaMapel?.trim()) {
    return { success: false, error: 'Nama mata pelajaran wajib diisi' } as const;
  }
  if (!Number.isInteger(idKelompok) || idKelompok <= 0) {
    return { success: false, error: 'Kelompok mapel tidak valid' } as const;
  }
  if (parentId !== null && (!Number.isInteger(parentId) || parentId <= 0)) {
    return { success: false, error: 'Induk mapel tidak valid' } as const;
  }

  try {
    await withTransaction(async (conn) => {
      if (parentId !== null && Number(id) === parentId) {
        throw new Error('Mapel tidak boleh menjadi induk dirinya sendiri');
      }

      const [childrenRows]: any = await conn.query(
        'SELECT COUNT(*) AS jumlah FROM mapel WHERE parent_id = ?',
        [id || 0]
      );
      const jumlahAnak = Number(childrenRows[0]?.jumlah || 0);

      let parentRow: any = null;
      if (parentId !== null) {
        const [rows]: any = await conn.query(
          'SELECT id_mapel, parent_id, id_kelompok FROM mapel WHERE id_mapel = ?',
          [parentId]
        );
        parentRow = rows[0];
        if (!parentRow) throw new Error('Induk mapel tidak ditemukan');
        if (parentRow.parent_id !== null) {
          throw new Error('Sub-mapel tidak boleh memiliki sub-mapel lagi');
        }
        if (Number(parentRow.id_kelompok) !== idKelompok) {
          throw new Error('Kelompok sub-mapel harus sama dengan kelompok induk');
        }
        if (jumlahAnak > 0) {
          throw new Error('Mapel yang sudah punya sub-mapel tidak bisa dijadikan sub-mapel');
        }
      }

      if (id) {
        if (jumlahAnak > 0) {
          const [rows]: any = await conn.query(
            'SELECT id_kelompok FROM mapel WHERE id_mapel = ?',
            [id]
          );
          if (rows[0] && Number(rows[0].id_kelompok) !== idKelompok) {
            throw new Error('Kelompok induk tidak bisa diubah selama masih punya sub-mapel');
          }
        }
        await conn.query(
          `UPDATE mapel
           SET nama_mapel = ?, s_mapel = ?, id_kelompok = ?, urut = ?, parent_id = ?
           WHERE id_mapel = ?`,
          [namaMapel, sMapel, idKelompok, urut, parentId, id]
        );
      } else {
        await conn.query(
          `INSERT INTO mapel (nama_mapel, s_mapel, id_kelompok, urut, id_sekolah, parent_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [namaMapel, sMapel, idKelompok, urut, SEKOLAH_ID, parentId]
        );
      }
    });

    revalidatePath('/tu/mapel');
    revalidatePath('/tu/mapel-kelas');
    revalidatePath('/tu/mapel-siswa');
    return { success: true } as const;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menyimpan data',
    } as const;
  }
}

export async function deleteMapel(id: number) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  try {
    const [rows]: any = await pool.query(
      'SELECT COUNT(*) AS jumlah FROM mapel WHERE parent_id = ?',
      [id]
    );
    if (Number(rows[0]?.jumlah || 0) > 0) {
      return {
        success: false,
        error: 'Mapel induk tidak bisa dihapus selama masih punya sub-mapel',
      } as const;
    }

    await pool.query('DELETE FROM mapel WHERE id_mapel = ?', [id]);
    revalidatePath('/tu/mapel');
    return { success: true } as const;
  } catch {
    return { success: false, error: 'Gagal menghapus data' } as const;
  }
}
```

Tambahkan import:

```ts
import { pool, withTransaction } from '@/lib/db';
```

`updateUrutMapel` tidak berubah.

Verifikasi cepat:

- `npm run typecheck`.
- Di UI: edit mapel biasa, simpan tanpa induk → `parent_id` tetap `NULL`.
- Coba jadikan mapel yang punya anak sebagai anak → muncul pesan error.
- Coba hapus induk yang punya anak → muncul pesan error.

Commit:

```bash
git add src/lib/actions/mapel-actions.ts
git commit -m "feat(mapel): simpan parent_id dan validasi hierarki satu level"
```

### Task 2.2 — Query halaman master

**File:** `src/app/(dashboard)/tu/mapel/page.tsx`

Ganti `getMapel()`:

```ts
async function getMapel() {
  try {
    const [mapel]: any = await pool.query(`
      SELECT m.*, km.huruf, km.kelompok AS nama_kelompok,
        p.nama_mapel AS nama_induk,
        (SELECT COUNT(*) FROM mapel c WHERE c.parent_id = m.id_mapel) AS jumlah_anak
      FROM mapel m
      JOIN kelompok_mapel km ON m.id_kelompok = km.id_kelompok
      LEFT JOIN mapel p ON m.parent_id = p.id_mapel
      ORDER BY COALESCE(p.urut, m.urut) ASC,
        COALESCE(p.id_mapel, m.id_mapel) ASC,
        (m.parent_id IS NULL) DESC,
        m.urut ASC,
        m.nama_mapel ASC,
        m.id_mapel ASC
    `);
    return mapel;
  } catch (error) {
    console.error('Mapel fetch error:', error);
    return [];
  }
}
```

### Task 2.3 — Modal: pilihan induk

**File:** `src/app/(dashboard)/tu/mapel/_components/modal-mapel.tsx`

Ubah props:

```ts
interface ModalMapelProps {
  open: boolean;
  onClose: () => void;
  mapel: any | null;
  refKelompok: any[];
  refInduk: any[];
  defaultParentId: number | null;
  onSave: (formData: FormData) => Promise<void>;
}
```

Signature:

```tsx
export default function ModalMapel({
  open,
  onClose,
  mapel,
  refKelompok,
  refInduk,
  defaultParentId,
  onSave,
}: ModalMapelProps) {
```

Di dalam form, setelah field Kelompok, tambahkan:

```tsx
<div>
  <label className="block text-sm font-medium text-[#1A1A2E]/80 mb-1.5">
    Induk Mapel <span className="text-gray-400 font-normal">(opsional)</span>
  </label>
  {Number(mapel?.jumlah_anak || 0) > 0 ? (
    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
      Mapel ini adalah induk. Sub-mapel tidak boleh punya induk lagi.
    </p>
  ) : (
    <select
      name="parent_id"
      defaultValue={mapel?.parent_id ?? defaultParentId ?? ''}
      className="w-full bg-[#F8F9FB] border border-[rgba(0,0,0,0.08)] rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-[#DC2626] outline-none transition-all"
    >
      <option value="">— Mapel biasa (tanpa induk) —</option>
      {refInduk
        .filter((m: any) => m.id_mapel !== mapel?.id_mapel)
        .map((m: any) => (
          <option key={m.id_mapel} value={m.id_mapel}>
            {m.nama_mapel}
          </option>
        ))}
    </select>
  )}
</div>
```

Catatan: `refInduk` hanya berisi mapel top-level (`parent_id IS NULL`). Jika mapel yang diedit sedang punya anak, select diganti pesan.

### Task 2.4 — Tabel master: hierarki, badge, tambah sub-mapel

**File:** `src/app/(dashboard)/tu/mapel/_components/mapel-client.tsx`

1. State baru:

```tsx
const [defaultParentId, setDefaultParentId] = useState<number | null>(null);
const refInduk = mapel.filter((m) => m.parent_id == null);
```

2. Ubah handler:

```tsx
const openTambah = (parent?: any) => {
  setSelected(null);
  setDefaultParentId(parent?.id_mapel ?? null);
  setModalEdit(true);
};
const openEdit = (row: any) => {
  setSelected(row);
  setDefaultParentId(null);
  setModalEdit(true);
};
const closeModals = () => {
  setModalEdit(false);
  setModalHapus(false);
  setSelected(null);
  setDefaultParentId(null);
};
```

3. Tombol tambah utama tetap `openTambah()`.

4. Pada render kolom `nama_mapel`, sebelum fallback generik:

```tsx
if (col.key === 'nama_mapel') {
  const isInduk = Number(row.jumlah_anak || 0) > 0;
  return (
    <td key={col.key} className="px-4 py-3">
      {row.parent_id ? (
        <span className="text-gray-400 mr-1.5">↳</span>
      ) : null}
      <span className={isInduk ? 'font-semibold text-[#1A1A2E]' : ''}>
        {row.nama_mapel}
      </span>
      {isInduk && (
        <span className="ml-2 inline-flex items-center bg-red-50 text-[#DC2626] text-[10px] font-semibold px-2 py-0.5 rounded-full">
          Induk
        </span>
      )}
      {row.parent_id && row.nama_induk ? (
        <span className="block text-[11px] text-gray-400 ml-4">{row.nama_induk}</span>
      ) : null}
    </td>
  );
}
```

5. Tambahkan tombol "+" khusus induk di kolom aksi, sebelum tombol edit:

```tsx
{!row.parent_id && (
  <button
    onClick={() => openTambah(row)}
    className="text-emerald-600/70 hover:text-emerald-700 transition-colors"
    title="Tambah sub-mapel"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  </button>
)}
```

6. Oper props ke modal:

```tsx
<ModalMapel
  open={modalEdit}
  onClose={closeModals}
  mapel={selected}
  refKelompok={refKelompok}
  refInduk={refInduk}
  defaultParentId={defaultParentId}
  onSave={handleSave}
/>
```

### Task 2.5 — Verifikasi manual master mapel

1. `npm run dev`.
2. Login `abdira` / `abdira`, buka `/tu/mapel`.
3. Pastikan Akuntansi (18), Bisnis Digital (19), RPL (20), Perhotelan (21), LPKKK (22) tampil dengan badge **Induk**.
4. Klik "+" pada RPL → modal terbuka dengan Induk Mapel = RPL.
5. Simpan sub-mapel uji `Tes Sub Mapel` (singkatan `TSM`, urut 99). Pastikan muncul di bawah RPL dengan tanda `↳`.
6. Coba hapus RPL → harus ditolak.
7. Hapus `Tes Sub Mapel` lewat UI → berhasil.
8. Screenshot halaman sebelum dan sesudah.

Commit:

```bash
git add "src/app/(dashboard)/tu/mapel/page.tsx" \
  "src/app/(dashboard)/tu/mapel/_components/mapel-client.tsx" \
  "src/app/(dashboard)/tu/mapel/_components/modal-mapel.tsx"
git commit -m "feat(mapel): tampilan hierarki dan form sub-mapel di master mapel"
```

---

## Task 3 — Mapel kelas & enrollment

### Task 3.1 — Halaman mapel kelas: hanya mapel non-induk + urutan grup

**File:** `src/app/(dashboard)/tu/mapel-kelas/page.tsx`

`getData()`:

```ts
const [rows]: any = await pool.query(`
  SELECT mk.*, k.nama_kelas, m.nama_mapel, m.parent_id,
    p.nama_mapel AS nama_induk, u.nama AS nama_guru
  FROM mapel_kelas mk
  JOIN kelas k ON mk.id_kelas = k.id_kelas
  JOIN mapel m ON mk.id_mapel = m.id_mapel
  LEFT JOIN mapel p ON m.parent_id = p.id_mapel
  LEFT JOIN users u ON mk.id_user = u.id_user
  WHERE mk.tahun = ? AND mk.semester = ?
  ORDER BY k.nama_kelas ASC,
    COALESCE(p.urut, m.urut) ASC,
    (m.parent_id IS NULL) DESC,
    m.urut ASC,
    COALESCE(p.nama_mapel, m.nama_mapel) ASC,
    m.id_mapel ASC
`, [sekolah.tahun, sekolah.semester]);
```

`getMapel()` — periode-aware: sembunyikan induk hanya jika pada periode itu sudah ada `mapel_kelas` untuk anaknya. Periode lama tetap menampilkan induk.

```ts
async function getMapel(tahun: number, semester: number) {
  try {
    const [rows]: any = await pool.query(`
      SELECT m.id_mapel, m.nama_mapel, m.parent_id, p.nama_mapel AS nama_induk
      FROM mapel m
      LEFT JOIN mapel p ON m.parent_id = p.id_mapel
      WHERE NOT EXISTS (
          SELECT 1
          FROM mapel c
          JOIN mapel_kelas ck ON ck.id_mapel = c.id_mapel
          WHERE c.parent_id = m.id_mapel
            AND ck.tahun = ? AND ck.semester = ? AND ck.deleted_at IS NULL
        )
      ORDER BY COALESCE(p.urut, m.urut) ASC,
        (m.parent_id IS NULL) DESC,
        m.urut ASC,
        COALESCE(p.nama_mapel, m.nama_mapel) ASC,
        m.id_mapel ASC
    `, [tahun, semester]);
    return rows;
  } catch (error) {
    console.error('Mapel fetch error:', error);
    return [];
  }
}
```

Lalu:

```ts
const sekolah = await getSekolahWithFilter();
const [data, refKelas, refMapel, refUser] = await Promise.all([
  getData(),
  getKelas(),
  getMapel(sekolah.tahun, sekolah.semester),
  getUser(),
]);
```

### Task 3.2 — Modal mapel kelas: label induk + fallback mapel lama

**File:** `src/app/(dashboard)/tu/mapel-kelas/_components/modal-mapel-kelas.tsx`

Untuk mode edit, tambahkan opsi fallback sebelum `refMapel.map`:

```tsx
{mapelKelas && !refMapel.some((m: any) => m.id_mapel === mapelKelas.id_mapel) && (
  <option value={mapelKelas.id_mapel}>
    {mapelKelas.nama_mapel} (induk — data lama)
  </option>
)}
```

Untuk daftar checkbox tambah, ubah label:

```tsx
<label
  key={m.id_mapel}
  className={`flex items-center gap-2 text-sm py-1 px-2 rounded ${
    disabled
      ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
      : 'hover:bg-gray-50 cursor-pointer'
  }`}
>
  <input type="checkbox" name="id_mapel" value={m.id_mapel} disabled={disabled} />
  <span>
    {m.parent_id && m.nama_induk ? (
      <span className="text-gray-400">{m.nama_induk} › </span>
    ) : null}
    {m.nama_mapel}
  </span>
  {disabled && <span className="text-xs text-gray-400 ml-auto">(Sudah ada)</span>}
</label>
```

Untuk select mode edit, label opsi juga memakai prefix yang sama.

### Task 3.3 — Tabel mapel kelas: tampilkan induk di bawah anak

**File:** `src/app/(dashboard)/tu/mapel-kelas/_components/mapel-kelas-client.tsx`

Pada render kolom, sebelum fallback:

```tsx
if (col.key === 'nama_mapel') {
  return (
    <td key={col.key} className="px-4 py-3">
      {row.parent_id ? <span className="text-gray-400 mr-1.5">↳</span> : null}
      {row.nama_mapel}
      {row.parent_id && row.nama_induk ? (
        <span className="block text-[11px] text-gray-400 ml-4">{row.nama_induk}</span>
      ) : null}
    </td>
  );
}
```

### Task 3.4 — `updateMapelKelas`: auto-enroll + tolak induk

**File:** `src/lib/actions/mapel-kelas-actions.ts`

Ganti `updateMapelKelas`:

```ts
export async function updateMapelKelas(formData: FormData) {
  const authResult = await requireTuAdmin();
  if (authResult.error) return { success: false, error: authResult.error } as const;

  const id = formData.get('id_mapel_kelas') as string;
  const idKelas = Number(formData.get('id_kelas'));
  const idMapel = Number(formData.get('id_mapel'));
  const idUser = formData.get('id_user') as string;
  const { tahun, semester } = await getPeriodeAktif();

  if (!Number.isInteger(idKelas) || !Number.isInteger(idMapel)) {
    return { success: false, error: 'Kelas atau mapel tidak valid' } as const;
  }

  try {
    await withTransaction(async (conn) => {
      let perluEnroll = !id;

      if (id) {
        const [currentRows]: any = await conn.query(
          'SELECT id_mapel, id_kelas FROM mapel_kelas WHERE id_mapel_kelas = ?',
          [id]
        );
        const current = currentRows[0];
        const mapelBerubah = current && Number(current.id_mapel) !== idMapel;
        perluEnroll = Boolean(
          current &&
            (Number(current.id_mapel) !== idMapel || Number(current.id_kelas) !== idKelas)
        );

        if (mapelBerubah) {
          const [childRows]: any = await conn.query(
            'SELECT COUNT(*) AS jumlah FROM mapel WHERE parent_id = ?',
            [idMapel]
          );
          if (Number(childRows[0]?.jumlah || 0) > 0) {
            throw new Error('Mapel induk tidak bisa diberi guru atau kelas');
          }
        }

        await conn.query(
          'UPDATE mapel_kelas SET id_kelas = ?, id_mapel = ?, id_user = ? WHERE id_mapel_kelas = ?',
          [idKelas, idMapel, idUser || null, id]
        );
      } else {
        const [childRows]: any = await conn.query(
          'SELECT COUNT(*) AS jumlah FROM mapel WHERE parent_id = ?',
          [idMapel]
        );
        if (Number(childRows[0]?.jumlah || 0) > 0) {
          throw new Error('Mapel induk tidak bisa diberi guru atau kelas');
        }

        await conn.query(
          `INSERT INTO mapel_kelas (tahun, semester, id_kelas, id_mapel, id_user)
           VALUES (?, ?, ?, ?, ?)`,
          [tahun, semester, idKelas, idMapel, idUser || null]
        );
      }

      // Hanya enroll saat mapel/kelas baru. Mengubah guru tidak boleh
      // mengembalikan siswa yang sengaja dikeluarkan lewat mapel-siswa.
      if (perluEnroll) {
        await autoEnrollSiswa(conn, tahun, semester, [
          { id_kelas: idKelas, id_mapel: idMapel },
        ]);
      }
    });

    revalidatePath('/tu/mapel-kelas');
    revalidatePath('/tu/mapel-siswa');
    return { success: true } as const;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menyimpan data',
    } as const;
  }
}
```

Catatan: `autoEnrollSiswa` sudah idempoten (memeriksa `existingSet`), jadi aman dipanggil saat edit guru.

### Task 3.5 — Mapel siswa: sembunyikan induk per periode + tolak enrollment induk

**File:** `src/app/(dashboard)/tu/mapel-siswa/page.tsx`

Ganti `getSubjects`:

```ts
async function getSubjects(kelasId: number, tahun: number, semester: number) {
  try {
    const [rows]: any = await pool.query(`
      SELECT m.id_mapel, m.nama_mapel, m.parent_id, p.nama_mapel AS nama_induk
      FROM mapel_kelas mk
      JOIN mapel m ON mk.id_mapel = m.id_mapel
      LEFT JOIN mapel p ON m.parent_id = p.id_mapel
      WHERE mk.id_kelas = ? AND mk.tahun = ? AND mk.semester = ?
        AND NOT EXISTS (
          SELECT 1
          FROM mapel_siswa ms2
          JOIN mapel c ON c.id_mapel = ms2.id_mapel
          WHERE c.parent_id = m.id_mapel
            AND ms2.tahun = ? AND ms2.semester = ? AND ms2.aktif = 1
        )
      ORDER BY COALESCE(p.urut, m.urut) ASC,
        (m.parent_id IS NULL) DESC,
        m.urut ASC,
        COALESCE(p.nama_mapel, m.nama_mapel) ASC,
        m.id_mapel ASC
    `, [kelasId, tahun, semester, tahun, semester]);
    return rows;
  } catch (error) {
    console.error('Subjects fetch error:', error);
    return [];
  }
}
```

**File:** `src/app/(dashboard)/tu/mapel-siswa/_components/mapel-siswa-grid.tsx`

Ubah interface `Subject`:

```ts
interface Subject {
  id_mapel: number;
  nama_mapel: string;
  parent_id: number | null;
  nama_induk: string | null;
}
```

Pada header kolom:

```tsx
<span className="block text-[11px] leading-tight">
  {mapel.parent_id && mapel.nama_induk ? (
    <span className="block text-[9px] font-normal opacity-80">{mapel.nama_induk}</span>
  ) : null}
  {mapel.nama_mapel}
</span>
```

**File:** `src/lib/actions/mapel-siswa-actions.ts`

Tambahkan helper internal:

```ts
async function pastikanBukanInduk(idMapel: number) {
  const [rows]: any = await pool.query(
    'SELECT COUNT(*) AS jumlah FROM mapel WHERE parent_id = ?',
    [idMapel]
  );
  return Number(rows[0]?.jumlah || 0) === 0;
}
```

Di awal `try` pada `toggleMapelSiswa`:

```ts
if (!(await pastikanBukanInduk(Number(idMapel)))) {
  return { success: false, error: 'Mapel induk tidak punya enrollment siswa' } as const;
}
```

Di `toggleMapelSiswaBatch`, sebelum transaksi:

```ts
if (!(await pastikanBukanInduk(idMapel))) {
  return { success: false, error: 'Mapel induk tidak punya enrollment siswa' } as const;
}
```

### Task 3.6 — Verifikasi manual auto-enroll

Gunakan sub-mapel uji yang dibuat di Task 2.5 (jangan pakai data asli):

1. Buka `/tu/mapel-kelas`, filter kelas `XI RPL`.
2. Tambah `Tes Sub Mapel` dengan guru apa saja.
3. Hitung siswa XI RPL:
   ```sql
   SELECT COUNT(*) FROM siswa_kelas
   WHERE id_kelas = (SELECT id_kelas FROM kelas WHERE nama_kelas = 'XI RPL')
     AND tahun = (SELECT tahun FROM sekolah WHERE id_sekolah = 1)
     AND semester = (SELECT semester FROM sekolah WHERE id_sekolah = 1)
     AND status = 1 AND deleted_at IS NULL;
   ```
4. Bandingkan dengan:
   ```sql
   SELECT COUNT(*) FROM mapel_siswa ms
   JOIN mapel m ON m.id_mapel = ms.id_mapel
   WHERE m.nama_mapel = 'Tes Sub Mapel'
     AND ms.tahun = (SELECT tahun FROM sekolah WHERE id_sekolah = 1)
     AND ms.semester = (SELECT semester FROM sekolah WHERE id_sekolah = 1)
     AND ms.aktif = 1;
   ```
   Angka harus sama.
5. Buka `/tu/mapel-siswa?kelas=<id XI RPL>` — kolom `Tes Sub Mapel` muncul.
6. Bersihkan data uji:
   ```sql
   DELETE ms FROM mapel_siswa ms JOIN mapel m ON m.id_mapel = ms.id_mapel WHERE m.nama_mapel = 'Tes Sub Mapel';
   DELETE mk FROM mapel_kelas mk JOIN mapel m ON m.id_mapel = mk.id_mapel WHERE m.nama_mapel = 'Tes Sub Mapel';
   DELETE FROM mapel WHERE nama_mapel = 'Tes Sub Mapel' AND parent_id IS NOT NULL;
   ```
7. `npm run typecheck`.

### Task 3.7 — Salin mapel tidak menyalin induk

**File:** `src/lib/actions/mapel-kelas-actions.ts`

Pada query sumber `copyMapelKelasFromPreviousYear` dan `copyMapelKelasFromSameYear`, tambahkan filter:

```sql
AND NOT EXISTS (
  SELECT 1 FROM mapel c WHERE c.parent_id = m.id_mapel
)
```

Sisipkan setelah `LEFT JOIN users u ON mk.id_user = u.id_user` dan sebelum `WHERE`. Ini mencegah mapel induk ikut tersalin saat fitur "Dari Tahun Lalu" dipakai, termasuk saat menyalin dari periode 2025-2026 yang masih memakai mapel konsentrasi biasa.

Commit:

```bash
git add "src/app/(dashboard)/tu/mapel-kelas/page.tsx" \
  "src/app/(dashboard)/tu/mapel-kelas/_components/modal-mapel-kelas.tsx" \
  "src/app/(dashboard)/tu/mapel-kelas/_components/mapel-kelas-client.tsx" \
  src/lib/actions/mapel-kelas-actions.ts \
  "src/app/(dashboard)/tu/mapel-siswa/page.tsx" \
  "src/app/(dashboard)/tu/mapel-siswa/_components/mapel-siswa-grid.tsx" \
  src/lib/actions/mapel-siswa-actions.ts
git commit -m "feat(mapel): auto-enroll sub-mapel dan filter induk di mapel kelas/siswa"
```

---

## Task 4 — Rapor tengah semester & semester

### Task 4.1 — Tipe data template

**File:** `src/lib/pdf-templates/tengah-semester-template.ts`

```ts
export interface MapelNilai {
  nama_mapel: string;
  nilai: number | null;
  kktp: number;
  children?: MapelNilai[];
}
```

**File:** `src/lib/pdf-templates/semester-template.ts`

```ts
export interface MapelSemester {
  nama_mapel: string;
  nilai: number;
  deskripsi_max: string;
  tujuan_max: string;
  deskripsi_min: string;
  tujuan_min: string;
  children?: MapelSemester[];
}
```

### Task 4.2 — HTML tengah semester

**File:** `src/lib/pdf-templates/tengah-semester-template.ts`

Ganti bagian `mapelRows`:

```ts
const renderMapelRow = (m: MapelNilai, nomor: number) => {
  const nilai = m.nilai ?? 0;
  const predikat = getPredikat(m.nilai, m.kktp);
  const style = getNilaiStyle(m.nilai, m.kktp);
  return `<tr><td style="width:5%;text-align:center;padding:3px;border:1px solid #000;">${nomor}</td><td style="width:50%;text-align:left;padding:4px;border:1px solid #000;">${escapeHtml(m.nama_mapel)}</td><td style="width:15%;text-align:center;border:1px solid #000;${style}">${nilai || '0'}</td><td style="width:15%;text-align:center;border:1px solid #000;">${predikat}</td></tr>`;
};

const mapelRows = siswa.kelompok_mapels.flatMap((km) => {
  const kelompokHeader = `<tr style="background:#FFFEC5;"><td colspan="4" style="padding:5px;height:10px;font-weight:bold;border:1px solid #000;">${escapeHtml(km.huruf)}. ${escapeHtml(km.kelompok)}</td></tr>`;

  let nomor = 0;
  const subjectRows = km.mapels.flatMap((m) => {
    if (m.children?.length) {
      const indukRow = `<tr><td colspan="4" style="padding:5px;font-weight:bold;border:1px solid #000;">${escapeHtml(m.nama_mapel)}</td></tr>`;
      return [indukRow, ...m.children.map((child, i) => renderMapelRow(child, i + 1))];
    }
    nomor += 1;
    return [renderMapelRow(m, nomor)];
  });

  return kelompokHeader + subjectRows.join('');
});
```

### Task 4.3 — HTML semester

**File:** `src/lib/pdf-templates/semester-template.ts`

Ganti bagian `mapelRows`:

```ts
const renderMapelRows = (m: MapelSemester, nomor: number) => {
  const nilaiDisplay = m.nilai === 0 ? '0' : String(r(m.nilai));
  const nilaiStyle = m.nilai === 0 || m.nilai < 75 ? 'color:red;' : 'color:black;';
  // Salin persis template lama; hanya ganti ${i + 1} menjadi ${nomor}.
  return `<tr>
          <td style="width:5%;text-align:center;vertical-align:middle;border:1px solid #000;" rowspan="2">${nomor}</td>
          <td style="width:25%;text-align:left;height:48px;padding:3px;vertical-align:middle;border:1px solid #000;" rowspan="2">${escapeHtml(m.nama_mapel)}</td>
          <td style="width:10%;text-align:center;vertical-align:middle;border:1px solid #000;${nilaiStyle}" rowspan="2">${nilaiDisplay}</td>
          <td style="width:60%;text-align:left;height:24px;padding:3px;vertical-align:middle;border:1px solid #000;">${escapeHtml(m.deskripsi_max)} ${escapeHtml(m.tujuan_max)}</td>
        </tr>
        <tr><td style="width:60%;text-align:left;height:24px;padding:3px;vertical-align:middle;border:1px solid #000;border-left:none;">${escapeHtml(m.deskripsi_min)} ${escapeHtml(m.tujuan_min)}</td></tr>`;
};

const mapelRows = siswa.kelompok_mapels.flatMap((km) => {
  const kelompokHeader = `<tr><td colspan="4" style="padding:5px;height:10px;font-weight:bold;border:1px solid #000;">${escapeHtml(km.huruf)}. ${escapeHtml(km.kelompok)}</td></tr>`;

  let nomor = 0;
  const subjectRows = km.mapels.flatMap((m) => {
    if (m.children?.length) {
      const indukRow = `<tr><td colspan="4" style="padding:5px;font-weight:bold;border:1px solid #000;">${escapeHtml(m.nama_mapel)}</td></tr>`;
      return [indukRow, ...m.children.map((child, i) => renderMapelRows(child, i + 1))];
    }
    nomor += 1;
    return [renderMapelRows(m, nomor)];
  });

  return kelompokHeader + subjectRows.join('');
});
```

### Task 4.4 — PDF tengah semester

**File:** `src/lib/pdf-templates/tengah-semester-pdfmake.ts`

Di `subjectTable`, ganti loop `kelompok.mapels.forEach(...)`:

```ts
let nomor = 0;
for (const mapel of kelompok.mapels) {
  if (mapel.children?.length) {
    body.push([
      { text: displayValue(mapel.nama_mapel), colSpan: 4, bold: true },
      {},
      {},
      {},
    ]);
    mapel.children.forEach((child, index) => {
      const nilai = child.nilai ?? 0;
      body.push([
        { text: String(index + 1), alignment: 'center' },
        { text: displayValue(child.nama_mapel) },
        {
          text: String(nilai || 0),
          alignment: 'center',
          color: child.nilai === null || nilai < child.kktp ? '#ff0000' : '#000000',
        },
        { text: getPredikat(child.nilai, child.kktp), alignment: 'center' },
      ]);
    });
    continue;
  }

  nomor += 1;
  const nilai = mapel.nilai ?? 0;
  body.push([
    { text: String(nomor), alignment: 'center' },
    { text: displayValue(mapel.nama_mapel) },
    {
      text: String(nilai || 0),
      alignment: 'center',
      color: mapel.nilai === null || nilai < mapel.kktp ? '#ff0000' : '#000000',
    },
    { text: getPredikat(mapel.nilai, mapel.kktp), alignment: 'center' },
  ]);
}
```

### Task 4.5 — PDF semester

**File:** `src/lib/pdf-templates/semester-pdfmake.ts`

Di `subjectTable`, ganti loop `kelompok.mapels.forEach(...)`:

```ts
const pushMapel = (mapel: MapelSemester, nomor: number) => {
  const nilai = Math.round(Number(mapel.nilai) || 0);
  const nilaiColor = nilai === 0 || nilai < 75 ? '#ff0000' : '#000000';
  body.push([
    { text: String(nomor), rowSpan: 2, alignment: 'center', margin: [0, mm(4), 0, 0] },
    {
      text: value(mapel.nama_mapel),
      rowSpan: 2,
      alignment: 'left',
      verticalAlignment: 'middle',
    },
    {
      text: String(nilai),
      rowSpan: 2,
      alignment: 'center',
      color: nilaiColor,
      margin: [0, mm(4), 0, 0],
    },
    { text: competenceText(mapel.deskripsi_max, mapel.tujuan_max) },
  ]);
  body.push([
    {},
    {},
    {},
    { text: competenceText(mapel.deskripsi_min, mapel.tujuan_min) },
  ]);
};

let nomor = 0;
for (const mapel of kelompok.mapels) {
  if (mapel.children?.length) {
    body.push([
      { text: value(mapel.nama_mapel), colSpan: 4, bold: true },
      {},
      {},
      {},
    ]);
    mapel.children.forEach((child, index) => pushMapel(child, index + 1));
    continue;
  }
  nomor += 1;
  pushMapel(mapel, nomor);
}
```

Tambahkan import tipe:

```ts
import type { MapelSemester, SiswaSemesterRapor } from './semester-template';
```

### Task 4.6 — Route rapor: bentuk hierarki per siswa

**File:** `src/app/api/tu/cetak-rapor/route.ts`

1. Tambahkan import:

```ts
import { buildMapelHierarki, type MapelHierarkiRow } from '@/lib/mapel-hierarki';
import type { MapelNilai } from '@/lib/pdf-templates/tengah-semester-template';
```

2. Di cabang `tengah_semester`, setelah query `kelompokRows`, ambil master mapel sekali:

```ts
const [mapelMasterRows]: any = await pool.query(
  'SELECT id_mapel, parent_id, nama_mapel, urut FROM mapel'
);
const mapelById = new Map<number, MapelHierarkiRow>(
  mapelMasterRows.map((m: any) => [
    Number(m.id_mapel),
    {
      id_mapel: Number(m.id_mapel),
      parent_id: m.parent_id == null ? null : Number(m.parent_id),
      nama_mapel: m.nama_mapel,
      urut: Number(m.urut),
    },
  ]),
);
```

3. Ubah query `mapelSiswaRows` (kedua cabang) menjadi:

```sql
SELECT ms.id_siswa, m.id_mapel, m.nama_mapel, m.id_kelompok, m.urut, m.parent_id
FROM mapel_siswa ms
JOIN mapel m ON ms.id_mapel = m.id_mapel
WHERE ms.tahun = ? AND ms.semester = ? AND ms.aktif = 1 AND ms.id_siswa IN (...)
ORDER BY m.id_kelompok ASC, m.urut ASC
```

4. Di mapping `tengah_semester`, ganti `.map(...)` pada `mapels`:

```ts
const hierarki = buildMapelHierarki(
  siswaMapels.filter((m: any) => m.id_kelompok === km.id_kelompok),
  mapelById,
);

const mapels: MapelNilai[] = hierarki.map((node) => {
  if (node.is_parent) {
    return {
      nama_mapel: node.nama_mapel,
      nilai: null,
      kktp: 70,
      children: node.items.map((child) => ({
        nama_mapel: child.nama_mapel,
        nilai: nilaiTsMap.get(`${row.id_siswa}-${child.id_mapel}`) ?? null,
        kktp: kktpMap.get(child.id_mapel) || 70,
      })),
    };
  }

  const m = node.items[0];
  return {
    nama_mapel: m.nama_mapel,
    nilai: nilaiTsMap.get(`${row.id_siswa}-${m.id_mapel}`) ?? null,
    kktp: kktpMap.get(m.id_mapel) || 70,
  };
});
```

5. Di cabang `semester`, tambahkan query master yang sama, lalu ganti mapping `kelompokMapels`:

```ts
const buatMapelSemester = (m: any): MapelSemester => {
  const nilai = nilaiMataMap.get(`${row.id_siswa}-${m.id_mapel}`) || 0;
  const phList = phRows.filter(
    (p: any) => p.id_siswa === row.id_siswa && p.id_mapel === m.id_mapel
  );
  const phMax = phList.length > 0
    ? phList.reduce((a: any, b: any) => (a.nilai >= b.nilai ? a : b))
    : null;
  const phMin = phList.length > 0
    ? phList.reduce((a: any, b: any) => (a.nilai <= b.nilai ? a : b))
    : null;
  return {
    nama_mapel: m.nama_mapel,
    nilai,
    deskripsi_max: phMax ? findDeskripsi(phMax.nilai) : '',
    tujuan_max: phMax?.id_tujuan ? tpMap.get(phMax.id_tujuan)?.tujuan || '' : '',
    deskripsi_min: phMin ? findDeskripsi(phMin.nilai) : '',
    tujuan_min: phMin?.id_tujuan ? tpMap.get(phMin.id_tujuan)?.tujuan || '' : '',
  };
};

const kelompokMapels: KelompokSemester[] = kelompokRows.map((km: any) => {
  const hierarki = buildMapelHierarki(
    siswaMapels.filter((m: any) => m.id_kelompok === km.id_kelompok),
    mapelById,
  );

  return {
    huruf: km.huruf,
    kelompok: km.kelompok,
    mapels: hierarki.map((node) => {
      if (node.is_parent) {
        return {
          nama_mapel: node.nama_mapel,
          nilai: 0,
          deskripsi_max: '',
          tujuan_max: '',
          deskripsi_min: '',
          tujuan_min: '',
          children: node.items.map(buatMapelSemester),
        };
      }
      return buatMapelSemester(node.items[0]);
    }),
  };
}).filter((km: KelompokSemester) => km.mapels.length > 0);
```

Catatan: `mapelById` untuk cabang `semester` harus dideklarasikan sebelum `siswaSemList` dibuat dan sesudah query `mapelSiswaRows`. Nama variabel tidak bentrok karena kedua cabang `if` terpisah.

### Task 4.7 — Tes render hierarki

Tambahkan ke `src/lib/__tests__/rapor-templates-baseline.test.ts`:

```ts
describe('rapor dengan sub-mapel', () => {
  it('tengah semester menampilkan induk sebagai header dan anak bernomor ulang', () => {
    const siswa: SiswaMidRapor = {
      ...midSiswa,
      kelompok_mapels: [
        {
          huruf: 'B',
          kelompok: 'Mata Pelajaran Kejuruan',
          mapels: [
            {
              nama_mapel: 'Rekayasa Perangkat Lunak',
              nilai: null,
              kktp: 70,
              children: [
                { nama_mapel: 'Basis Data', nilai: 82, kktp: 70 },
                { nama_mapel: 'Pemrograman Web', nilai: 88, kktp: 70 },
              ],
            },
          ],
        },
      ],
    };

    const html = generateTengahSemesterRaporHTML(
      [siswa],
      sekolah,
      '2026-2027',
      'Ganjil',
      { nama: 'Wali Kelas', nip: '19800101 200501 1 001' }
    );

    expect(html).toContain(
      '<td colspan="4" style="padding:5px;font-weight:bold;border:1px solid #000;">Rekayasa Perangkat Lunak</td>'
    );
    expect(html).toContain('>Basis Data</td>');
    expect(html).toContain('>Pemrograman Web</td>');
    expect(html).toMatch(/>1<\/td><td[^>]*>Basis Data/);
    expect(html).toMatch(/>2<\/td><td[^>]*>Pemrograman Web/);
  });

  it('semester menampilkan induk tanpa nilai', () => {
    const siswa: SiswaSemesterRapor = {
      ...semesterSiswa,
      kelompok_mapels: [
        {
          huruf: 'B',
          kelompok: 'Mata Pelajaran Kejuruan',
          mapels: [
            {
              nama_mapel: 'Rekayasa Perangkat Lunak',
              nilai: 0,
              deskripsi_max: '',
              tujuan_max: '',
              deskripsi_min: '',
              tujuan_min: '',
              children: [
                {
                  nama_mapel: 'Basis Data',
                  nilai: 82,
                  deskripsi_max: 'Baik dalam',
                  tujuan_max: 'basis data.',
                  deskripsi_min: 'Cukup dalam',
                  tujuan_min: 'dasar basis data.',
                },
              ],
            },
          ],
        },
      ],
    };

    const html = generateSemesterRaporHTML(
      [siswa],
      sekolah,
      '2026-2027',
      'Ganjil',
      { nama: 'Wali Kelas', nip: '19800101 200501 1 001' }
    );

    expect(html).toContain(
      '<td colspan="4" style="padding:5px;font-weight:bold;border:1px solid #000;">Rekayasa Perangkat Lunak</td>'
    );
    expect(html).toContain('>Basis Data</td>');
  });
});
```

Jalankan `npm test` — snapshot baseline harus tetap lulus, tes hierarki lulus.

### Task 4.8 — Verifikasi rapor

1. Pastikan sub-mapel asli sudah diisi TU (lihat `docs/mapel-konsentrasi.md`).
2. Login TU, buka `/tu/laporan-pendidikan/daftar-rapor`, pilih satu siswa XI RPL periode aktif, lalu preview **Rapor Tengah Semester** dan **Rapor Semester** (HTML). Ulangi lewat tombol PDF.
3. Cek:
   - Nama induk muncul sekali sebagai baris tebal.
   - Anak bernilai 1..n.
   - Tidak ada nilai/capaian pada baris induk.
4. Unduh PDF, cek `X-PDF-Renderer: pdfmake` dan tampilan sama.
5. Regression: pilih periode 2025-2026 di sidebar TU, buka rapor siswa Fase F. Tampilan harus sama seperti sebelum perubahan (tidak ada header baru, mapel konsentrasi tetap bernilai).
6. `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

Commit:

```bash
git add src/app/api/tu/cetak-rapor/route.ts \
  src/lib/pdf-templates/tengah-semester-template.ts \
  src/lib/pdf-templates/semester-template.ts \
  src/lib/pdf-templates/tengah-semester-pdfmake.ts \
  src/lib/pdf-templates/semester-pdfmake.ts \
  src/lib/__tests__/rapor-templates-baseline.test.ts \
  src/lib/__tests__/__snapshots__/rapor-templates-baseline.test.ts.snap
git commit -m "feat(rapor): baris induk dan sub-mapel bernilai pada rapor Fase F"
```

---

## Task 5 — Panduan operasional & cutover data periode aktif

### Task 5.1 — Review `docs/mapel-konsentrasi.md`

Dokumen sudah dibuat di `docs/mapel-konsentrasi.md`. Sebelum cutover, pastikan:

- Status "berlaku setelah migrasi" diganti menjadi "aktif" setelah deploy.
- Penomoran `1..n` dan baris induk tebal tanpa latar sudah sesuai.
- ID mapel tidak hardcoded; gunakan query berdasarkan nama + `parent_id IS NULL`.
- Bagian cutover sudah sesuai dengan periode aktif produksi.

Urutan cutover yang harus ada di dokumen:

1. Deploy kode + migrasi `0003_mapel_parent.sql`.
2. TU membuat sub-mapel lewat `/tu/mapel` (tombol + pada baris induk).
3. TU menambahkan guru/kelas lewat `/tu/mapel-kelas`; siswa otomatis ter-enroll.
4. Guru membuat/menyalin TP lewat `/guru/tujuan-pembelajaran`.
5. Verifikasi query di bagian 8.
6. Backup lalu hapus `mapel_kelas` + `mapel_siswa` induk **hanya untuk periode aktif**.
7. Cek rapor HTML + PDF satu siswa baru dan satu siswa lama.

### Task 5.2 — Backup & pembersihan induk (manual, setelah sub-mapel siap)

**Jangan jalankan sebelum langkah 2-6 selesai dan query verifikasi bersih.**

```sql
SET @tahun := (SELECT tahun FROM sekolah WHERE id_sekolah = 1);
SET @semester := (SELECT semester FROM sekolah WHERE id_sekolah = 1);

-- Daftar induk yang sudah punya anak.
DROP TEMPORARY TABLE IF EXISTS tmp_induk_submapel;
CREATE TEMPORARY TABLE tmp_induk_submapel (id_mapel INT PRIMARY KEY);
INSERT INTO tmp_induk_submapel (id_mapel)
SELECT DISTINCT parent_id FROM mapel WHERE parent_id IS NOT NULL;

-- Backup. Jika tabel sudah ada dari percobaan sebelumnya, ganti nama
-- (mis. _20261023_v2) jangan DROP tabel backup lama.
CREATE TABLE backup_mapel_kelas_submapel_20261023 AS
SELECT mk.* FROM mapel_kelas mk
JOIN tmp_induk_submapel t ON t.id_mapel = mk.id_mapel
WHERE mk.tahun = @tahun AND mk.semester = @semester;

CREATE TABLE backup_mapel_siswa_submapel_20261023 AS
SELECT ms.* FROM mapel_siswa ms
JOIN tmp_induk_submapel t ON t.id_mapel = ms.id_mapel
WHERE ms.tahun = @tahun AND ms.semester = @semester;

-- Hapus hanya periode aktif.
DELETE mk FROM mapel_kelas mk
JOIN tmp_induk_submapel t ON t.id_mapel = mk.id_mapel
WHERE mk.tahun = @tahun AND mk.semester = @semester;

DELETE ms FROM mapel_siswa ms
JOIN tmp_induk_submapel t ON t.id_mapel = ms.id_mapel
WHERE ms.tahun = @tahun AND ms.semester = @semester;
```

Verifikasi sebelum dan sesudah:

```sql
-- 1. Tidak ada anak yatim
SELECT c.id_mapel, c.nama_mapel
FROM mapel c
LEFT JOIN mapel p ON c.parent_id = p.id_mapel
WHERE c.parent_id IS NOT NULL AND p.id_mapel IS NULL;

-- 2. Tidak ada 3 level
SELECT c.id_mapel, c.nama_mapel
FROM mapel c
JOIN mapel p ON c.parent_id = p.id_mapel
WHERE p.parent_id IS NOT NULL;

-- 3. Induk tidak punya mapel_kelas di periode aktif
SELECT m.id_mapel, m.nama_mapel, COUNT(mk.id_mapel_kelas) AS jumlah
FROM mapel m
LEFT JOIN mapel_kelas mk
  ON mk.id_mapel = m.id_mapel AND mk.tahun = @tahun AND mk.semester = @semester
WHERE m.id_mapel IN (SELECT id_mapel FROM tmp_induk_submapel)
GROUP BY m.id_mapel, m.nama_mapel;

-- 4. Setiap anak punya siswa
SELECT m.id_mapel, m.nama_mapel, COUNT(ms.id_siswa) AS siswa
FROM mapel m
LEFT JOIN mapel_siswa ms
  ON ms.id_mapel = m.id_mapel AND ms.tahun = @tahun AND ms.semester = @semester AND ms.aktif = 1
WHERE m.parent_id IS NOT NULL
GROUP BY m.id_mapel, m.nama_mapel
ORDER BY m.parent_id, m.urut;

-- 5. Data lama tidak tersentuh
SELECT tahun, semester, COUNT(*) AS jumlah
FROM mapel_kelas
WHERE id_mapel IN (SELECT id_mapel FROM mapel WHERE parent_id IS NOT NULL)
GROUP BY tahun, semester;
```

Catatan: query #3 dan #4 memakai temporary table yang dibuat di blok sebelumnya; jalankan semua query dalam sesi MySQL yang sama. Setelah verifikasi selesai:

```sql
DROP TEMPORARY TABLE tmp_induk_submapel;
```

### Task 5.3 — Update dokumentasi proyek

Tambahkan bagian singkat di `AGENTS.md` pada bagian arsitektur/filter periode:

```markdown
- Mapel konsentrasi Fase F boleh punya sub-mapel (`mapel.parent_id`, maks. 1 level).
  Induk hanya menjadi header rapor jika pada periode itu ada anak yang diikuti siswa.
  Panduan pengisian: `docs/mapel-konsentrasi.md`.
```

Commit:

```bash
git add docs/mapel-konsentrasi.md \
  docs/superpowers/plans/2026-10-23-mapel-konsentrasi-submapel.md \
  AGENTS.md
git commit -m "docs(mapel): panduan sub mapel konsentrasi dan cutover periode aktif"
```

---

## Task 6 — Verifikasi akhir

Jalankan berurutan:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Lalu `graphify update .` (sesuai aturan proyek).

Checklist manual:

- [ ] `/tu/mapel`: induk punya badge, anak terindentasi, tambah/edit/hapus sub-mapel bekerja.
- [ ] `/tu/mapel-kelas`: dropdown tidak menampilkan induk di periode baru, tetapi masih menampilkan induk saat filter periode lama.
- [ ] `/tu/mapel-siswa`: kolom anak muncul; induk tidak muncul di periode baru.
- [ ] Guru sub-mapel melihat kelas di `/guru/kelas-ku`, bisa mengisi TP dan nilai.
- [ ] Rapor tengah semester: induk header, anak bernilai + predikat.
- [ ] Rapor semester: induk header, anak bernilai + capaian.
- [ ] PDF dan HTML sama.
- [ ] Rapor periode 2025-2026 identik dengan sebelum perubahan (bandingkan dengan screenshot/HTML baseline yang disimpan di Task 0).
- [ ] `mapel_kelas` + `mapel_siswa` induk periode aktif = 0 setelah cutover.
- [ ] Tabel backup ada dan jumlah barisnya sama dengan yang dihapus.

## Rollback

Jika terjadi masalah setelah deploy:

1. Kembalikan kode ke commit sebelum fitur.
2. Kembalikan data periode aktif:
   ```sql
   INSERT INTO mapel_kelas SELECT * FROM backup_mapel_kelas_submapel_20261023;
   INSERT INTO mapel_siswa SELECT * FROM backup_mapel_siswa_submapel_20261023;
   ```
3. Hapus sub-mapel yang sudah dibuat (setelah memastikan tidak ada nilai/TP):
   ```sql
   DELETE FROM mapel WHERE parent_id IS NOT NULL;
   ```
4. Skema boleh dibiarkan (kolom nullable tidak mengganggu kode lama). Jika harus dibersihkan:
   ```sql
   ALTER TABLE mapel DROP FOREIGN KEY fk_mapel_parent;
   ALTER TABLE mapel DROP INDEX idx_mapel_parent;
   ALTER TABLE mapel DROP COLUMN parent_id;
   ```

## Definition of Done

- [ ] Migrasi berjalan idempoten di dev dan produksi.
- [ ] Helper hierarki punya tes dan lulus.
- [ ] Baseline rapor lama tidak berubah (snapshot lulus).
- [ ] Master mapel mendukung induk/anak dengan validasi 1 level.
- [ ] Mapel kelas & mapel siswa tidak bisa memakai induk di periode baru, tetapi periode lama tetap bisa dilihat.
- [ ] `updateMapelKelas` otomatis meng-enroll siswa.
- [ ] Rapor tengah semester & semester (HTML + PDF) menampilkan induk sebagai header.
- [ ] Panduan `docs/mapel-konsentrasi.md` tersedia dan ID tidak hardcoded.
- [ ] Cutover data aktif terdokumentasi, di-backup, dan terverifikasi.
- [ ] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` lulus.
