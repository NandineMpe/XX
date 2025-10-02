#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const backendWebuiPath = path.resolve(cwd, 'lightrag', 'api', 'webui');
const backendManifestPath = path.resolve(cwd, 'lightrag', 'api', 'asset-manifest.json');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function ensureDirExists(dir) {
  return fs.mkdir(dir, { recursive: true });
}

async function emptyDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await ensureDirExists(dir);
}

async function flattenWebui(dir) {
  const nested = path.join(dir, 'webui');
  if (!existsSync(nested) || !statSync(nested).isDirectory()) return;
  const entries = await fs.readdir(nested);
  for (const entry of entries) {
    await fs.rename(path.join(nested, entry), path.join(dir, entry));
  }
  await fs.rm(nested, { recursive: true, force: true });
}

async function copyRecursive(source, target) {
  if (typeof fs.cp === 'function') {
    await fs.cp(source, target, { recursive: true, force: true });
    return;
  }

  await ensureDirExists(target);
  const entries = await fs.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      await copyRecursive(sourcePath, targetPath);
    } else if (entry.isSymbolicLink && entry.isSymbolicLink()) {
      const linkTarget = await fs.readlink(sourcePath);
      try {
        await fs.symlink(linkTarget, targetPath);
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
      }
    } else {
      await ensureDirExists(path.dirname(targetPath));
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

async function writeAssetManifest(webuiDir) {
  const htmlPath = path.join(webuiDir, 'index.html');
  if (!existsSync(htmlPath)) {
    throw new Error(`Missing index.html in ${webuiDir}`);
  }

  const html = await fs.readFile(htmlPath, 'utf8');
  // Support absolute "/assets/..." and relative "assets/..." or "./assets/..."
  const jsMatches = [...html.matchAll(/(?:\.|)?\/?(?:webui\/)?assets\/([A-Za-z0-9._-]+\.js)/g)].map((match) => match[1]);
  if (jsMatches.length === 0) {
    throw new Error('Unable to locate any JS entrypoints in WebUI index.html');
  }
  const entryJs = jsMatches.find((name) => name.startsWith('index-')) ?? jsMatches[0];
  if (!entryJs) {
    throw new Error('Unable to determine WebUI entry bundle from index.html');
  }

  let cssMatches = [...html.matchAll(/(?:\.|)?\/?(?:webui\/)?assets\/([A-Za-z0-9._-]+\.css)/g)].map((match) => match[1]);
  const previousManifest = existsSync(backendManifestPath)
    ? JSON.parse(await fs.readFile(backendManifestPath, 'utf8'))
    : null;

  const legacy = new Set(Array.isArray(previousManifest?.legacy_entry_aliases)
    ? previousManifest.legacy_entry_aliases
    : []);
  if (previousManifest?.entry_js && previousManifest.entry_js !== entryJs) {
    legacy.add(previousManifest.entry_js);
  }

  const assetsDir = path.join(webuiDir, 'assets');
  if (!existsSync(assetsDir) || !statSync(assetsDir).isDirectory()) {
    throw new Error(`Expected assets directory at ${assetsDir}`);
  }
  const entryPath = path.join(assetsDir, entryJs);
  if (!existsSync(entryPath)) {
    throw new Error(`Entry bundle ${entryJs} missing in ${assetsDir}`);
  }

  const viteManifestPath = path.join(webuiDir, '.vite', 'manifest.json');
  if (existsSync(viteManifestPath)) {
    try {
      const manifestJson = JSON.parse(await fs.readFile(viteManifestPath, 'utf8'));
      const fromManifest = Object.values(manifestJson)
        .flatMap((meta) => (meta && typeof meta === 'object' && Array.isArray(meta.css)) ? meta.css : []);
      if (fromManifest.length) {
        const normalized = fromManifest.map((cssFile) => cssFile.replace(/^assets\//, ''));
        cssMatches = Array.from(new Set([...cssMatches, ...normalized]));
      }
    } catch (err) {
      console.warn('Unable to enrich CSS list from Vite manifest:', err);
    }
  }

  const assetEntries = await fs.readdir(assetsDir);
  for (const asset of assetEntries) {
    if (asset.startsWith('index-') && asset.endsWith('.js') && asset !== entryJs) {
      legacy.add(asset);
    }
  }

  const manifest = {
    entry_js: entryJs,
    entry_css: Array.from(new Set(cssMatches)).sort(),
    legacy_entry_aliases: Array.from(legacy).sort(),
  };

  await fs.writeFile(backendManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

async function copyViteManifest(distPath, targetDir) {
  const source = path.join(distPath, '.vite', 'manifest.json');
  const target = path.join(targetDir, '.vite', 'manifest.json');
  if (existsSync(source)) {
    await ensureDirExists(path.dirname(target));
    await fs.copyFile(source, target);
  } else {
    await ensureDirExists(path.dirname(target));
    await fs.writeFile(target, '{}\n', 'utf8');
  }
}

async function ensureRelativeAssetPaths(webuiDir) {
  const indexPath = path.join(webuiDir, 'index.html');
  if (!existsSync(indexPath)) return;
  let html = await fs.readFile(indexPath, 'utf8');

  // Rewrite absolute asset URLs to relative
  html = html.replace(/(href|src)=["']\/(?:webui\/)?assets\//g, '$1="./assets/');
  // Also handle bare "assets/" (no leading slash) to ensure it stays relative with ./ prefix
  html = html.replace(/(href|src)=["']assets\//g, '$1="./assets/');

  await fs.writeFile(indexPath, html, 'utf8');
}

function run(command, options) {
  execSync(command, { stdio: 'inherit', ...options });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const frontendPath = args.frontendPath
    || process.env.FRONTEND_PATH
    || path.resolve(cwd, '..', 'Augentik_FrontEnd');

  if (!existsSync(frontendPath) || !statSync(frontendPath).isDirectory()) {
    throw new Error(`Frontend path does not exist: ${frontendPath}`);
  }

  const distPath = args.distPath
    || process.env.FRONTEND_DIST_PATH
    || path.join(frontendPath, 'dist');
  const buildCommand = args.buildCommand
    || process.env.FRONTEND_BUILD_COMMAND
    || 'npm run build';

  const shouldInstall = !(args.skipInstall || process.env.SKIP_FRONTEND_INSTALL === '1');
  const shouldBuild = !(args.skipBuild || process.env.SKIP_FRONTEND_BUILD === '1');
  const shouldStage = !(args.noStage || process.env.SKIP_GIT_STAGE === '1');

  if (shouldInstall) {
    run('npm install', { cwd: frontendPath });
  }

  if (shouldBuild) {
    run(buildCommand, { cwd: frontendPath });
  }

  if (!existsSync(distPath) || !statSync(distPath).isDirectory()) {
    throw new Error(`Expected build output at ${distPath}`);
  }

  await emptyDir(backendWebuiPath);
  await copyRecursive(distPath, backendWebuiPath);
  await flattenWebui(backendWebuiPath);
  await copyViteManifest(distPath, backendWebuiPath);
  await writeAssetManifest(backendWebuiPath);
  await ensureRelativeAssetPaths(backendWebuiPath);

  if (shouldStage) {
    run('git add lightrag/api/webui lightrag/api/asset-manifest.json', { cwd });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
