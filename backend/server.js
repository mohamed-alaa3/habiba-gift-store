const http = require("http");
const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");

async function start() {
  await connectDB();

  const server = http.createServer(app);

  server.listen(env.port, () => {
    console.log(
      `[server] Habiba API running on ${env.apiBaseUrl} (${env.nodeEnv})`,
    );
  });

  const shutdown = (signal) => {
    console.log(`[server] ${signal} received — shutting down`);
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start();
