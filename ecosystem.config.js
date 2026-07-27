const fs = require('fs');

// ponytail: load .env.local so PM2 passes DB_* and NODE_ENV to the app without external dependencies
let env = {};
try {
  const content = fs.readFileSync('.env.local', 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      // Hapus tanda kutip jika ada di awal dan akhir nilai env
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  });
} catch (e) {
  // ponytail: .env.local missing on server -> rely on system env
}

module.exports = {
  apps: [
    {
      name: 'clone-rapor-next',
      script: 'node_modules/next/dist/bin/next', //local
      // script: 'npm', online
      args: 'start',
      env: {
        NODE_ENV: 'production',
        ...env,
        PORT: '31213',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
