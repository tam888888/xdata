module.exports = {
  apps: [
    {
      name: "websocket",
      script: "./websocket3.js",
      exec_mode: "cluster",
      cwd: "/home/hungtv/server/dist",
      instances: "1",
      env: {
        NODE_ENV: "production",
        HOME: "/home/hungtv/server/dist/"
      }
    },
    {
      name: "app",
      script: "./app.js",
      exec_mode: "cluster",
      cwd: "/home/hungtv/server/dist/dist",
      instances: "1",
      node_args: "--max-old-space-size=6192",
      env: {
        NODE_ENV: "production",
        HOME: "/home/hungtv/server/dist/dist"
      }
    }
  ]
}
