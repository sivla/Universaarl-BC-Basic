import { defineConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const runId = process.env.UABC_RUN_ID ?? 'local-check';
const authFile = path.resolve('playwright/.auth/playthru.json');
const authOnly = process.env.UABC_AUTH_ONLY === '1';

export default defineConfig({
  testDir: './tests/playwright',
  testMatch: 'environment-baseline.spec.mjs',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: authOnly ? 360_000 : 180_000,
  expect: { timeout: 10_000 },
  outputDir: path.resolve('.tmp/playwright-artifacts', runId),
  reporter: [['line']],
  use: {
    browserName: 'chromium',
    viewport: { width: 1600, height: 1000 },
    storageState: fs.existsSync(authFile) ? authFile : undefined,
    trace: 'off',
    video: authOnly ? 'off' : 'on',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 45_000
  }
});
