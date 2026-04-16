/**
 * Vercel Build Output API build script.
 * Bundles all API functions with esbuild (local deps inlined) and outputs
 * the correct .vercel/output/ structure that Vercel deploys directly.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const esbinPath = path.join(root, "node_modules", ".bin", "esbuild");
const outputDir = path.join(root, ".vercel", "output");

// ─── Clean ───────────────────────────────────────────────────────────────────
fs.rmSync(outputDir, { recursive: true, force: true });

// ─── 1. Vite frontend build ──────────────────────────────────────────────────
console.log("[1/3] Building frontend...");
execSync(path.join(root, "node_modules", ".bin", "vite") + " build", {
  stdio: "inherit",
  cwd: root,
});

// ─── 2. Copy static output ───────────────────────────────────────────────────
console.log("[2/3] Copying static files...");
const staticDir = path.join(outputDir, "static");
fs.mkdirSync(staticDir, { recursive: true });
fs.cpSync(path.join(root, "dist", "public"), staticDir, { recursive: true });

// ─── 3. Bundle API functions ─────────────────────────────────────────────────
console.log("[3/3] Bundling API functions...");

const funcs = [
  { entry: "api/auth/login.ts",     route: "api/auth/login" },
  { entry: "api/auth/signup.ts",    route: "api/auth/signup" },
  { entry: "api/trpc/[trpc].ts",    route: "api/trpc/[trpc]" },
  { entry: "api/stripe/webhook.ts", route: "api/stripe/webhook" },
];

for (const { entry, route } of funcs) {
  const funcDir = path.join(outputDir, "functions", `${route}.func`);
  fs.mkdirSync(funcDir, { recursive: true });

  // Bundle: all local imports + all npm packages inlined into one self-contained file.
  // --platform=node keeps Node.js built-ins (fs, path, crypto…) as external.
  execSync(
    `"${esbinPath}" ${entry} --bundle --platform=node --format=esm --outfile=${path.join(funcDir, "index.js")}`,
    { stdio: "inherit", cwd: root }
  );

  // Mark as ESM so Node.js uses import/export
  fs.writeFileSync(path.join(funcDir, "package.json"), JSON.stringify({ type: "module" }));

  // Vercel function config
  fs.writeFileSync(
    path.join(funcDir, ".vc-config.json"),
    JSON.stringify({ runtime: "nodejs20.x", handler: "index.js", launcherType: "Nodejs" }, null, 2)
  );

  console.log(`  ✓ ${route}`);
}

// ─── 4. Vercel output config ──────────────────────────────────────────────────
// Function routes MUST come before the SPA catch-all, otherwise /(.*) → /index.html
// intercepts all /api/* requests. Static file serving goes between them.
fs.writeFileSync(
  path.join(outputDir, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // API function routes — explicit paths routed to their .func bundles
        { src: "/api/auth/login",     dest: "/api/auth/login" },
        { src: "/api/auth/signup",    dest: "/api/auth/signup" },
        { src: "/api/stripe/webhook", dest: "/api/stripe/webhook" },
        { src: "/api/trpc/(.*)",      dest: "/api/trpc/[trpc]" },
        // Serve static files (JS, CSS, images) from dist/public
        { handle: "filesystem" },
        // SPA fallback — all remaining paths → index.html
        { src: "/(.*)", dest: "/index.html" },
      ],
    },
    null,
    2
  )
);

console.log("\nBuild complete ✓");
