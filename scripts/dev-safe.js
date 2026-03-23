const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, ".next");

try {
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log(
      "[dev-safe] Cleared .next cache to avoid Windows OneDrive readlink errors.",
    );
  }
} catch (err) {
  console.warn("[dev-safe] Could not fully clear .next. Continuing anyway.");
  console.warn(err instanceof Error ? err.message : String(err));
}

const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, "dev"], {
  stdio: "inherit",
  shell: false,
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
