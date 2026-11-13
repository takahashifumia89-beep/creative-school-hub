import { rmSync } from "node:fs";
import { spawnSync, spawn } from "node:child_process";
const state = ".wrangler/e2e-state";
rmSync(state, { recursive: true, force: true });
const setup = spawnSync(
  "npx",
  [
    "wrangler",
    "d1",
    "migrations",
    "apply",
    "creative-school",
    "--local",
    "--persist-to",
    state,
  ],
  { stdio: "inherit" },
);
if (setup.status !== 0) process.exit(setup.status ?? 1);
const server = spawn(
  "npx",
  ["wrangler", "dev", "--port", "8787", "--persist-to", state],
  { stdio: "inherit" },
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    server.kill(signal);
    process.exit();
  });
server.on("exit", (code) => process.exit(code ?? 0));
