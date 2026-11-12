module.exports = {
  apps: [
    {
      name: "festalgia-api",
      script: "./dist/src/server.js",
      env_file: ".env",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3005,
      },
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      max_memory_restart: "500M",
      kill_timeout: 5000,
      listen_timeout: 3000,
    },
  ],
};
