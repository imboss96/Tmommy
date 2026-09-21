module.exports = {
  apps: [
    {
      name: 'mommycare-api',
      script: 'npm',
      args: 'run server',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      watch: false,
      time: true,
      restart_delay: 3000
    }
  ]
};
