const { parse } = require('dotenv');
const fs = require('fs');

// ponytail: load .env.local so PM2 passes DB_* and NODE_ENV to the app
let env = {};
try {
  env = parse(fs.readFileSync('.env.local'));
} catch (e) {
  // ponytail: .env.local missing on server -> rely on system env
}

module.exports = {
  apps: [
    {
      name: 'clone-rapor-next',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        ...env,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
