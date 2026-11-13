import { rmSync } from "node:fs";
import { spawn } from "node:child_process";
const state = ".wrangler/e2e-state";
rmSync(state, { recursive: true, force: true });
const server = spawn(
  "npx",
  ["wrangler", "dev", "--port", "8790", "--persist-to", state],
  { stdio: "inherit" },
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    server.kill(signal);
    process.exit();
  });
server.on("exit", (code) => process.exit(code ?? 0));
