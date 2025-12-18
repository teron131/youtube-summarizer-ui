import { spawnSync } from "node:child_process";
import { cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const sourceDir = path.join(repoRoot, "chrome-extension");
const buildEntry = path.join(sourceDir, "app", "index.html");

async function ensureBuilt() {
  try {
    await stat(buildEntry);
  } catch {
    throw new Error(
      "Extension UI build missing at chrome-extension/app/index.html. Run `npm run build:extension` first.",
    );
  }
}

function zipAvailable() {
  const result = spawnSync("zip", ["-v"], { stdio: "ignore" });
  return result.status === 0;
}

async function main() {
  await ensureBuilt();

  const releaseDir = path.join(repoRoot, "extension-release");
  const unpackedDir = path.join(releaseDir, "unpacked");
  const zipPath = path.join(releaseDir, "youtube-summarizer-extension.zip");

  await rm(releaseDir, { recursive: true, force: true });
  await mkdir(unpackedDir, { recursive: true });

  await cp(sourceDir, unpackedDir, { recursive: true });
  await rm(path.join(unpackedDir, "README.md"), { force: true });
  await rm(path.join(unpackedDir, ".gitignore"), { force: true });

  await writeFile(
    path.join(releaseDir, "INSTALL.txt"),
    [
      "YouTube Summarizer Extension (local build)",
      "",
      "Install steps:",
      "1) Unzip youtube-summarizer-extension.zip",
      "2) In Chrome, open chrome://extensions/",
      "3) Enable Developer mode (top-right)",
      "4) Click “Load unpacked”",
      "5) Select the unzipped folder (it contains manifest.json)",
      "",
      "Notes:",
      "- This build expects a backend at http://localhost:8080 (or rebuild with a different VITE_API_BASE_URL).",
      "- For true one-click installs for non-technical users, publish the extension on the Chrome Web Store.",
      "",
    ].join("\n"),
    "utf8",
  );

  if (!zipAvailable()) {
    // Still useful: the unpacked folder is ready.
    // eslint-disable-next-line no-console
    console.log(`Created unpacked extension at ${unpackedDir}`);
    // eslint-disable-next-line no-console
    console.log("`zip` command not found; skipping .zip creation.");
    return;
  }

  const zipResult = spawnSync("zip", ["-r", "-q", zipPath, "."], {
    cwd: unpackedDir,
    stdio: "inherit",
  });
  if (zipResult.status !== 0) {
    throw new Error("Failed to create zip file (zip exited non-zero).");
  }

  // eslint-disable-next-line no-console
  console.log(`Created ${zipPath}`);
}

await main();

