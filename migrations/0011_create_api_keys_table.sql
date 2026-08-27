-- ============================================================================
-- Migration: 0011_create_api_keys_table.sql
-- Deskripsi: Membuat tabel api_keys untuk integrasi REST API & API Key auth
-- Idempotent: Aman dijalankan berulang kali (CREATE TABLE IF NOT EXISTS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `api_keys` (
  `id_api_key` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `key_value` varchar(100) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `deskripsi` text DEFAULT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_api_key`),
  UNIQUE KEY `key_value` (`key_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
