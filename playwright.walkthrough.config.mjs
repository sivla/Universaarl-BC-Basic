import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/artifacts', testMatch: 'walkthrough-html.spec.mjs', workers: 1, retries: 0,
  reporter: [['line']], outputDir: '.tmp/walkthrough-html', use: { browserName: 'chromium', trace: 'off', video: 'off', screenshot: 'off' }
});
