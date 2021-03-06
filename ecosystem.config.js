module.exports = {
  apps: [
    {
      name: "preview",
      script: "server.js",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],

  // Deployment Configuration
  deploy: {
    production: {
      user: "ubuntu",
      host: "18.222.127.242",
      ref: "origin/main",
      // repo: "git@github.com:aslamjon/preview.git",
      repo: "https://github.com/aslamjon/preview.git",
      path: "/home/ubuntu/deploy",
      "pre-setup": "pwd",
      "pre-deploy-local": "echo 'This is a local deployment'",
      // "post-deploy": "cp ../.env ./ && npm install && pm2 startOrRestart ecosystem.config.js --env production",
      "post-deploy": "npm install && pm2 startOrRestart ecosystem.config.js --env production",
    },
  },
};
