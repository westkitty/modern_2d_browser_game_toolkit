#!/usr/bin/env node
import process from 'node:process';

function parseArgs(argv) {
  const out = { url: null, timeout: 5000, ready: null, screenshot: null, allowRequestFailure: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!out.url && !a.startsWith('--')) out.url = a;
    else if (a === '--timeout') out.timeout = Number(argv[++i]);
    else if (a === '--ready') out.ready = argv[++i];
    else if (a === '--screenshot') out.screenshot = argv[++i];
    else if (a === '--allow-request-failure') out.allowRequestFailure = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!out.url) throw new Error('Usage: browser_smoke.mjs <url> [--timeout ms] [--ready expression] [--screenshot path]');
  if (!Number.isFinite(out.timeout) || out.timeout <= 0) throw new Error('--timeout must be positive');
  return out;
}

let playwright;
try {
  playwright = await import('playwright');
} catch {
  console.error('SKIP: Playwright is not installed. Install it in the target project, then rerun this smoke harness.');
  process.exit(2);
}

const opts = parseArgs(process.argv);
const browser = await playwright.chromium.launch({ headless: true });
const page = await browser.newPage();
const failures = [];
page.on('pageerror', e => failures.push(`pageerror: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') failures.push(`console: ${m.text()}`); });
page.on('requestfailed', r => { if (!opts.allowRequestFailure) failures.push(`requestfailed: ${r.url()} ${r.failure()?.errorText ?? ''}`); });

try {
  const response = await page.goto(opts.url, { waitUntil: 'domcontentloaded', timeout: opts.timeout });
  if (!response || !response.ok()) failures.push(`navigation status: ${response?.status() ?? 'no response'}`);
  if (opts.ready) {
    await page.waitForFunction(opts.ready, null, { timeout: opts.timeout });
  } else {
    await page.waitForTimeout(Math.min(opts.timeout, 1500));
  }
  if (opts.screenshot) await page.screenshot({ path: opts.screenshot, fullPage: true });
} catch (e) {
  failures.push(`smoke exception: ${e.message}`);
} finally {
  await browser.close();
}

if (failures.length) {
  for (const f of failures) console.error(`FAIL: ${f}`);
  process.exit(1);
}
console.log('PASS: browser smoke completed without captured runtime errors');
