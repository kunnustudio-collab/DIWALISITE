const { spawn, execSync } = require("child_process");

console.log("⚙️  Running database schema synchronization (prisma db push)...");
try {
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("✅ Database schema synchronized successfully.");
} catch (err) {
  console.error("⚠️  Prisma db push encountered an issue, proceeding:", err.message);
}

console.log("🌱 Verifying and seeding initial product & site data...");
try {
  execSync("node scripts/seed.mjs", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("✅ Seed completed successfully.");
} catch (err) {
  console.error("⚠️  Seed script encountered an issue, proceeding:", err.message);
}

const port = process.env.PORT || 9090;
const host = process.env.HOST || "0.0.0.0";

console.log(`🚀 Starting Next.js production server on http://${host}:${port}`);

const child = spawn("npx", ["next", "start", "-p", String(port), "-H", host], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
