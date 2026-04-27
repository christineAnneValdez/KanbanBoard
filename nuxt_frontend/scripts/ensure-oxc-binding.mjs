import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const installOptionalDeps = (packages, reason) => {
  console.log(`[ensure-oxc-binding] Installing ${reason}...`);
  execSync(`npm install --no-save --ignore-scripts --force ${packages.join(" ")}`, {
    stdio: "inherit",
  });
};

if (process.platform === "win32") {
  const windowsWasiBindings = [
    ["@oxc-parser", "binding-wasm32-wasi", "parser.wasi-browser.js"],
    ["@oxc-transform", "binding-wasm32-wasi", "transform.wasi-browser.js"],
    ["@oxc-minify", "binding-wasm32-wasi", "minify.wasi-browser.js"],
  ];

  const hasAllWindowsWasiBindings = windowsWasiBindings.every(([scope, binding, entry]) =>
    existsSync(path.join(root, "node_modules", scope, binding, entry))
  );

  if (hasAllWindowsWasiBindings) {
    console.log("[ensure-oxc-binding] OXC WASI bindings already present for Windows.");
    process.exit(0);
  }

  installOptionalDeps(
    [
      "@oxc-parser/binding-wasm32-wasi@0.95.0",
      "@oxc-transform/binding-wasm32-wasi@0.95.0",
      "@oxc-minify/binding-wasm32-wasi@0.95.0",
    ],
    "OXC WASI bindings for Windows"
  );
  process.exit(0);
}

if (process.platform !== "linux") {
  console.log("[ensure-oxc-binding] Platform does not need extra OXC bindings.");
  process.exit(0);
}

const parserGnuBinding = path.join(
  root,
  "node_modules",
  "@oxc-parser",
  "binding-linux-x64-gnu",
  "parser.linux-x64-gnu.node"
);

const parserMuslBinding = path.join(
  root,
  "node_modules",
  "@oxc-parser",
  "binding-linux-x64-musl",
  "parser.linux-x64-musl.node"
);

const transformGnuBinding = path.join(
  root,
  "node_modules",
  "@oxc-transform",
  "binding-linux-x64-gnu",
  "transform.linux-x64-gnu.node"
);

const transformMuslBinding = path.join(
  root,
  "node_modules",
  "@oxc-transform",
  "binding-linux-x64-musl",
  "transform.linux-x64-musl.node"
);

if (
  (existsSync(parserGnuBinding) || existsSync(parserMuslBinding)) &&
  (existsSync(transformGnuBinding) || existsSync(transformMuslBinding))
) {
  console.log("[ensure-oxc-binding] OXC Linux binding already present.");
  process.exit(0);
}

installOptionalDeps(
  [
    "@oxc-parser/binding-linux-x64-gnu@0.95.0",
    "@oxc-parser/binding-linux-x64-musl@0.95.0",
    "@oxc-transform/binding-linux-x64-gnu@0.95.0",
    "@oxc-transform/binding-linux-x64-musl@0.95.0",
  ],
  "OXC Linux bindings (npm optional-deps workaround)"
);
