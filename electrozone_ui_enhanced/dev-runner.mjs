// Runs the API and Web dev servers together in ONE terminal.
// Usage: npm run dev
import { spawn } from "node:child_process";

const targets = [
  { name: "api", color: "\x1b[36m", args: ["run", "dev:api"] },
  { name: "web", color: "\x1b[35m", args: ["run", "dev:web"] },
];
const RESET = "\x1b[0m";

function prefixWrite(stream, color, name, buf) {
  const tag = `${color}[${name}]${RESET} `;
  buf
    .toString()
    .split(/\r?\n/)
    .forEach((line) => { if (line.length) stream.write(tag + line + "\n"); });
}

const children = targets.map(({ name, color, args }) => {
  const child = spawn("npm", args, { shell: true, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.on("data", (d) => prefixWrite(process.stdout, color, name, d));
  child.stderr.on("data", (d) => prefixWrite(process.stderr, color, name, d));
  child.on("exit", (code) => {
    console.log(`${color}[${name}]${RESET} exited with code ${code}. Stopping all.`);
    shutdown();
  });
  return child;
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) { try { c.kill(); } catch {} }
  process.exit();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
console.log("Starting ElectroZone (API :4000 + Web :5173). Press Ctrl+C to stop both.");
