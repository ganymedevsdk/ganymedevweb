import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('assets/img/portfolio');
fs.mkdirSync(OUT, { recursive: true });

const URL = 'https://nishi-nihongo-gakko.vercel.app/';
const SLUG = 'nishischool';
const SCROLLS = [0, 0.22, 0.45, 0.68, 0.9];
const VIEWPORT = { width: 1440, height: 900 };

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
});

const page = await ctx.newPage();
console.log(`→ ${URL}`);
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);
await page.evaluate(() => document.fonts.ready).catch(() => {});

await page.addStyleTag({
  content: `
    *, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }
    html { scroll-behavior: auto !important; }
  `,
});

const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);

for (let i = 0; i < SCROLLS.length; i++) {
  const y = Math.max(0, Math.floor((fullHeight - VIEWPORT.height) * SCROLLS[i]));
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(800);
  const file = path.join(OUT, `${SLUG}-shot-${i + 1}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 86, fullPage: false, timeout: 60000 });
  console.log(`  ✓ ${path.basename(file)}`);
}

await browser.close();
console.log('done');
