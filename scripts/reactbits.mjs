#!/usr/bin/env node
// Vendor React Bits components without reaching reactbits.dev.
//
// Why this exists: reactbits.dev (and ui.shadcn.com) are not reachable from
// Claude Code web sessions — the egress proxy allows github.com and the npm
// registry, so `npx shadcn@latest add https://reactbits.dev/r/...` fails there.
// The upstream repo carries the *same* shadcn registry JSON it serves, under
// public/r/<Component>-<LANG>-<STYLE>.json, so we read it from a local clone.
//
//   node scripts/reactbits.mjs sync
//   node scripts/reactbits.mjs list [--category Backgrounds] [--json]
//   node scripts/reactbits.mjs view <Component>
//   node scripts/reactbits.mjs add <Component...> [--variant TS-CSS] [--force]
//
// `add` writes into src/components/reactbits/ (matching how ClickSpark,
// LogoLoop, StarBorder and TiltedCard were vendored) and prints the npm
// dependencies to install — it never installs or mutates package.json itself.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIRROR = process.env.REACT_BITS_MIRROR || join(ROOT, '.cache', 'react-bits');
const UPSTREAM = 'https://github.com/DavidHDev/react-bits';
const DEST = join(ROOT, 'src', 'components', 'reactbits');
const DEFAULT_VARIANT = 'TS-TW';

const git = (args, opts = {}) =>
  execFileSync('git', args, { stdio: 'inherit', env: { ...process.env, GIT_LFS_SKIP_SMUDGE: '1' }, ...opts });

function sync({ quiet = false } = {}) {
  if (existsSync(join(MIRROR, '.git'))) {
    if (!quiet) console.log(`Updating mirror at ${MIRROR}`);
    git(['-C', MIRROR, 'fetch', '--depth', '1', 'origin', 'HEAD']);
    git(['-C', MIRROR, 'checkout', '--force', 'FETCH_HEAD']);
  } else {
    if (!quiet) console.log(`Cloning ${UPSTREAM} into ${MIRROR}`);
    mkdirSync(dirname(MIRROR), { recursive: true });
    git(['clone', '--depth', '1', UPSTREAM, MIRROR]);
  }
  return MIRROR;
}

function ensureMirror() {
  if (!existsSync(join(MIRROR, 'public', 'r'))) sync();
  return MIRROR;
}

/** Display name ("Shape Waves") -> registry/component name ("ShapeWaves"). */
const pascal = name => name.replace(/[^A-Za-z0-9]/g, '');

/** Component name -> category, derived from upstream's own sidebar metadata. */
function categories() {
  const src = readFileSync(join(ensureMirror(), 'src', 'constants', 'Categories.js'), 'utf8');
  const body = src.slice(src.indexOf('export const CATEGORIES'));
  const map = new Map();
  for (const m of body.matchAll(/name:\s*'([^']+)',\s*subcategories:\s*\[([^\]]*)\]/g)) {
    const category = m[1];
    for (const raw of m[2].matchAll(/'([^']+)'/g)) map.set(pascal(raw[1]), category);
  }
  return map;
}

/** Every component that has a registry entry, with its category and variants. */
function inventory() {
  const dir = join(ensureMirror(), 'public', 'r');
  const cats = categories();
  const items = new Map();
  for (const file of readdirSync(dir)) {
    const m = /^(.+)-((?:TS|JS)-(?:CSS|TW))\.json$/.exec(file);
    if (!m) continue;
    const [, name, variant] = m;
    if (!items.has(name)) items.set(name, { name, category: cats.get(name) || 'Uncategorized', variants: [] });
    items.get(name).variants.push(variant);
  }
  for (const item of items.values()) item.variants.sort();
  return [...items.values()].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

function readItem(name, variant) {
  const file = join(ensureMirror(), 'public', 'r', `${name}-${variant}.json`);
  if (!existsSync(file)) {
    const known = inventory().filter(i => i.name.toLowerCase() === name.toLowerCase());
    const hint = known.length ? ` Did you mean "${known[0].name}" (variants: ${known[0].variants.join(', ')})?` : '';
    throw new Error(`No registry entry for ${name}-${variant}.${hint}`);
  }
  return JSON.parse(readFileSync(file, 'utf8'));
}

function list({ category, json }) {
  let items = inventory();
  if (category) items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
  if (json) return console.log(JSON.stringify(items, null, 2));
  if (!items.length) {
    const all = [...new Set(inventory().map(i => i.category))].sort();
    return console.log(`No components in category "${category}". Known categories: ${all.join(', ')}`);
  }
  let current = null;
  for (const item of items) {
    if (item.category !== current) console.log(`\n${(current = item.category)}`);
    console.log(`  ${item.name}`);
  }
  console.log(`\n${items.length} component(s).`);
}

function view(name, variant) {
  const item = readItem(name, variant);
  console.log(`${item.title || item.name} (${name}-${variant})`);
  if (item.description) console.log(`  ${item.description}`);
  console.log(`  files:        ${item.files.map(f => basename(f.path)).join(', ')}`);
  console.log(`  dependencies: ${item.dependencies?.length ? item.dependencies.join(', ') : '(none)'}`);
}

function add(names, { variant, force }) {
  mkdirSync(DEST, { recursive: true });
  const deps = new Set();
  for (const name of names) {
    const item = readItem(name, variant);
    for (const file of item.files) {
      // Registry paths are sometimes nested (Aurora/Aurora.tsx); we vendor flat.
      const target = join(DEST, basename(file.path));
      if (existsSync(target) && !force) {
        console.log(`  skip  src/components/reactbits/${basename(file.path)} (exists; pass --force to overwrite)`);
        continue;
      }
      writeFileSync(target, file.content);
      console.log(`  write src/components/reactbits/${basename(file.path)}`);
    }
    for (const dep of item.dependencies || []) deps.add(dep);
  }
  if (deps.size) console.log(`\nInstall dependencies:\n  npm install ${[...deps].join(' ')}`);
  console.log('\nVendored from the upstream registry — review the source before shipping it.');
}

function main(argv) {
  const [command, ...rest] = argv;
  const flag = name => {
    const i = rest.indexOf(`--${name}`);
    return i === -1 ? undefined : rest.splice(i, 2)[1];
  };
  const bool = name => {
    const i = rest.indexOf(`--${name}`);
    return i !== -1 && (rest.splice(i, 1), true);
  };
  const json = bool('json');
  const force = bool('force');
  const category = flag('category');
  const variant = flag('variant') || DEFAULT_VARIANT;

  switch (command) {
    case 'sync':
      return void sync();
    case 'list':
      return list({ category, json });
    case 'view':
      if (!rest.length) throw new Error('Usage: view <Component>');
      return view(rest[0], variant);
    case 'add':
      if (!rest.length) throw new Error('Usage: add <Component...>');
      return add(rest, { variant, force });
    default:
      console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 18).join('\n'));
      process.exitCode = command ? 1 : 0;
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(`reactbits: ${error.message}`);
  process.exitCode = 1;
}
