import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3002',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'NODE_OPTIONS="--max-old-space-size=4096" pnpm cookbook:build && pnpm rawmdx:export && npx next dev -p 3005 --webpack',
        url: 'http://localhost:3002',
        reuseExistingServer: true,
        timeout: 120 * 1000,
    },
});
