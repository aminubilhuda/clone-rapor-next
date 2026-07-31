CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  jabatan INT NOT NULL DEFAULT 0,
  id_siswa INT DEFAULT NULL,
  endpoint VARCHAR(500) NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_endpoint (endpoint(191)),
  KEY idx_user (user_id),
  KEY idx_jabatan (jabatan),
  KEY idx_id_siswa (id_siswa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;