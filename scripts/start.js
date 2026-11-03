const { spawn } = require("child_process");

const port = process.env.PORT || 9090;
const host = process.env.HOST || "0.0.0.0";

console.log(`🚀 Starting production server on http://${host}:${port}`);

const child = spawn("npx", ["next", "start", "-p", String(port), "-H", host], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
