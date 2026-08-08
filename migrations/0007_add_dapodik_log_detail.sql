-- Detail per record hasil sinkronisasi DAPODIK + pengelompokan run.
CREATE TABLE IF NOT EXISTS dapodik_log_detail (
  id INT AUTO_INCREMENT PRIMARY KEY,
  run_id VARCHAR(40) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  status ENUM('inserted','updated','skipped') NOT NULL,
  label VARCHAR(255) NOT NULL,
  keterangan VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_run_status (run_id, status)
);

ALTER TABLE dapodik_log ADD COLUMN run_id VARCHAR(40) DEFAULT NULL AFTER id;
