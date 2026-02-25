import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

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

console.log("[ensure-oxc-binding] Installing OXC Linux bindings (npm optional-deps workaround)...");
execSync(
  "npm install --no-save --ignore-scripts @oxc-parser/binding-linux-x64-gnu@0.95.0 @oxc-parser/binding-linux-x64-musl@0.95.0 @oxc-transform/binding-linux-x64-gnu@0.95.0 @oxc-transform/binding-linux-x64-musl@0.95.0",
  { stdio: "inherit" }
);
