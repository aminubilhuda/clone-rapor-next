-- Migration: Add new education options for parent's last education
-- Add: Tidak Sekolah, SD, SMP, D1

INSERT INTO `pendidikan` (`id_pendidikan`, `pendidikan`, `deleted_at`) VALUES
(6, 'Tidak Sekolah', NULL),
(7, 'SD', NULL),
(8, 'SMP', NULL),
(9, 'D1', NULL);