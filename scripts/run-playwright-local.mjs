import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { playwrightBrowserPath } from './playwright-browser-path.mjs';

const result = spawnSync(process.execPath, [path.resolve('node_modules/playwright/cli.js'), ...process.argv.slice(2)], {
  stdio: 'inherit', env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: playwrightBrowserPath }
});
process.exit(result.status ?? 1);
