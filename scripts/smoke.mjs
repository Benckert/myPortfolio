/**
 * Browser smoke test: builds are verified by exercising the real site —
 * the flows unit tests can't cover (lazy terminal chunk, chip taps on a
 * mobile viewport, hash/back-button persistence, dark first paint).
 *
 * Usage: `npm run build && node scripts/smoke.mjs`
 * Env:   PLAYWRIGHT_CHROMIUM_PATH — optional explicit browser executable.
 */
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const failures = [];
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '  ok' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(name);
};

// serve the production build
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
});
try {
  for (let i = 0; ; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) break;
    } catch {
      /* not up yet */
    }
    if (i > 60) throw new Error('preview server did not start');
    await new Promise((r) => setTimeout(r, 500));
  }

  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const errors = [];

  // desktop flows
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE);
  await page.waitForTimeout(2000);
  check('hero heading renders', (await page.locator('h1').count()) === 1);

  await page.keyboard.press('Control+k');
  await page.waitForSelector('.term-root', { timeout: 5000 });
  check('Ctrl+K opens terminal (lazy chunk loads)', true);
  await page.keyboard.type('help');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  check('help lists commands', (await page.locator('.term-screen').innerText()).includes('Available commands'));

  await page.goBack();
  await page.waitForTimeout(300);
  check(
    'back button closes terminal and persists mode',
    (await page.locator('.term-root').count()) === 0 &&
      (await page.evaluate(() => localStorage.getItem('portfolio-mode'))) === 'standard',
  );
  await page.close();

  // mobile: command chips
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mob.on('pageerror', (e) => errors.push(e.message));
  await mob.goto(`${BASE}/#terminal`);
  await mob.waitForSelector('.term-root', { timeout: 5000 });
  await mob.locator('.term-chip', { hasText: 'skills' }).click();
  await mob.waitForTimeout(200);
  check('mobile chip runs its command', (await mob.locator('.term-screen').innerText()).includes('languages:'));
  await mob.close();

  // first paint stays dark even before any stylesheet/script arrives
  const bare = await browser.newPage();
  await bare.route('**/*', (route) => {
    const t = route.request().resourceType();
    return t === 'script' || t === 'stylesheet' || t === 'font' ? route.abort() : route.continue();
  });
  await bare.goto(BASE, { waitUntil: 'domcontentloaded' }).catch(() => {});
  const bg = await bare.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
  check('pre-CSS first paint is dark', bg === 'rgb(11, 15, 23)', bg);
  await bare.close();

  await browser.close();
  check('no page errors', errors.length === 0, errors.join('; '));
} finally {
  server.kill();
}

if (failures.length > 0) {
  console.error(`\n${failures.length} smoke check(s) failed`);
  process.exit(1);
}
console.log('\nsmoke: all checks passed');
