import { spawn } from "node:child_process";
import process from "node:process";

const [, , command, ...args] = process.argv;

if (!command) {
  console.error("[run-nuxt] Missing Nuxt command.");
  process.exit(1);
}

const env = { ...process.env };

if (process.platform === "win32") {
  env.NAPI_RS_FORCE_WASI = env.NAPI_RS_FORCE_WASI || "1";
}

const child = spawn(
  process.execPath,
  ["./node_modules/nuxt/bin/nuxt.mjs", command, ...args],
  {
    stdio: "inherit",
    env,
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
