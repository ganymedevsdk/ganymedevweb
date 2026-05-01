import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('assets/img/portfolio');
fs.mkdirSync(OUT, { recursive: true });

const SHOTS = [
  {
    slug: 'kroneker',
    url: 'https://www.kroneker.com.ar/',
    waitMs: 1800,
    scrolls: [0, 0.18, 0.40, 0.65, 0.88],
  },
  {
    slug: 'nextlevel',
    url: 'https://www.nextlevelcctv.com.ar/',
    waitMs: 2200,
    scrolls: [0, 0.20, 0.45, 0.70, 0.92],
  },
];

const VIEWPORT = { width: 1440, height: 900 };

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
});

for (const shot of SHOTS) {
  const page = await ctx.newPage();
  console.log(`→ ${shot.url}`);
  try {
    await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 60000 });
  } catch (e) {
    console.error(`  goto failed for ${shot.url}: ${e.message}`);
  }
  await page.waitForTimeout(shot.waitMs);

  // Disable animations / sticky headers for clean shots
  await page.addStyleTag({
    content: `
      *, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }
      html { scroll-behavior: auto !important; }
    `,
  });

  const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  for (let i = 0; i < shot.scrolls.length; i++) {
    const ratio = shot.scrolls[i];
    const y = Math.max(0, Math.floor((fullHeight - VIEWPORT.height) * ratio));
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(700);
    const file = path.join(OUT, `${shot.slug}-shot-${i + 1}.jpg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 86, fullPage: false });
    console.log(`  ✓ ${path.basename(file)}`);
  }
  await page.close();
}

await browser.close();
console.log('done');
