// Screenshot a URL with Puppeteer and save to ./temporary screenshots/.
// Usage:
//   node screenshot.mjs http://localhost:3000
//   node screenshot.mjs http://localhost:3000 label
// Files are auto-incremented (screenshot-1.png, screenshot-2.png, ...) and never overwritten.
// Optional label suffix: screenshot-N-label.png
import puppeteer from 'puppeteer';
import { mkdir, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const OUT_DIR = join(ROOT, 'temporary screenshots');

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';

// Viewport: defaults to a desktop size; override with WIDTH/HEIGHT env vars.
const width = Number(process.env.WIDTH) || 1440;
const height = Number(process.env.HEIGHT) || 900;
const fullPage = process.env.FULL_PAGE !== '0';

async function nextIndex() {
  await mkdir(OUT_DIR, { recursive: true });
  const files = await readdir(OUT_DIR);
  let max = 0;
  for (const f of files) {
    const m = f.match(/^screenshot-(\d+)/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

async function main() {
  const n = await nextIndex();
  const outPath = join(OUT_DIR, `screenshot-${n}${label}.png`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    // MOTION=reduce emulates prefers-reduced-motion so scroll-reveal animations
    // settle to their final state instantly — gives clean, flake-free QA captures.
    if (process.env.MOTION === 'reduce') {
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    }
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Scroll through the whole page so scroll-triggered animations / IntersectionObservers
    // fire before we capture, then return to the top. Set SCROLL=0 to disable.
    if (process.env.SCROLL !== '0') {
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let y = 0;
          const step = Math.max(200, window.innerHeight * 0.8);
          const timer = setInterval(() => {
            window.scrollBy(0, step);
            y += step;
            if (y >= document.body.scrollHeight) { clearInterval(timer); resolve(); }
          }, 90);
        });
      });
      await new Promise((r) => setTimeout(r, 700)); // let reveals settle
      const to = Number(process.env.SCROLL_TO);
      await page.evaluate((y) => window.scrollTo(0, y || 0), Number.isFinite(to) ? to : 0);
      await new Promise((r) => setTimeout(r, 350));
    }

    await page.screenshot({ path: outPath, fullPage });
    console.log(`Saved ${outPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
