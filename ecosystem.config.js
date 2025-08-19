module.exports = {
  apps: [{
    name: 'validacion-app-dev',
    script: './start-expo.js',
    cwd: 'C:\\Validador\\validacionApp',
    instances: 1,
    autorestart: false,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      EXPO_DEVTOOLS: 'false',
      FORCE_COLOR: '0'
    },
    log_file: './logs/dev.log',
    out_file: './logs/dev-out.log',
    error_file: './logs/dev-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    interpreter: 'node',
    exec_mode: 'fork'
  }]
};