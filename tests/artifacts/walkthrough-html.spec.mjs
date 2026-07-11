import { test, expect } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let server; let baseURL;
test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname).replace(/^\/+/, '');
    const file = path.resolve(root, pathname);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.vtt': 'text/vtt', '.webm': 'video/webm', '.webp': 'image/webp', '.png': 'image/png' };
    res.setHeader('content-type', types[path.extname(file)] ?? 'application/octet-stream'); fs.createReadStream(file).pipe(res);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseURL = `http://127.0.0.1:${server.address().port}/artifacts/walkthrough/generated/UABC-WT-ENV-001`;
});
test.afterAll(async () => new Promise((resolve) => server.close(resolve)));

for (const [name, viewport] of [['Desktop', { width: 1280, height: 900 }], ['Mobil', { width: 390, height: 844 }]]) {
  test(`${name}: generierter Walkthrough ist funktional und responsiv`, async ({ page, request }) => {
    await page.setViewportSize(viewport); const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); }); page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${baseURL}/index.html`); await expect(page.locator('h1')).toBeVisible();
    for (const [mode, marker] of [['beginner', 'Warum:'], ['consultant', 'Fachliche Wirkung:'], ['evidence-review', 'Nachweis:']]) { await page.selectOption('#mode', mode); await expect(page.locator('#why')).toContainText(marker); }
    const first = await page.locator('#title').textContent(); await page.click('#next'); expect(await page.locator('#title').textContent()).not.toBe(first); await page.click('#previous'); expect(await page.locator('#title').textContent()).toBe(first);
    await page.click('#play'); await expect(page.locator('#play')).toHaveText('Pause'); await page.click('#play'); await expect(page.locator('#play')).toHaveText('Abspielen');
    for (const file of ['manifest.json', 'captions.vtt', 'walkthrough.webm']) expect((await request.get(`${baseURL}/${file}`)).ok()).toBeTruthy();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
    const boxes = await page.locator('.controls button').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) expect(boxes[i].right <= boxes[j].left || boxes[j].right <= boxes[i].left || boxes[i].bottom <= boxes[j].top || boxes[j].bottom <= boxes[i].top).toBeTruthy();
    expect(errors).toEqual([]);
  });
}
