export const SEKOLAH_ID = 1 as const;

export const JABATAN = {
  SUPER_ADMIN: 1,
  TU_ADMIN: 2,
  GURU: 3,
} as const;

export type Jabatan = (typeof JABATAN)[keyof typeof JABATAN];
