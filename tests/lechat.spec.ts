import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('LeChat Panel', () => {
    test.beforeEach(async ({ page }) => {
        // Mock the API response to avoid hitting the real LLM
        await page.route('/api/lechat', async route => {
            const request = route.request();
            const postData = request.postDataJSON();

            // Default response
            let response: { content: string; navigateTo: string | null; setContext: string | null } = {
                content: "I'm a mocked LeChat response.",
                navigateTo: null,
                setContext: null
            };

            // Handle navigation request
            if (postData.messages && postData.messages.some((m: any) => m.content.includes('go to Mistral OCR'))) {
                response = {
                    content: "Navigating you to Mistral OCR Document Understanding...",
                    navigateTo: "/cookbooks/mistral-ocr-document_understanding",
                    setContext: null
                };
            }

            // Handle context request
            if (postData.messages && postData.messages.some((m: any) => m.content.includes('use context'))) {
                response = {
                    content: "Context updated.",
                    navigateTo: null,
                    setContext: "/getting-started/quickstart"
                };
            }

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(response)
            });
        });

        await page.goto('/');

        // Inject CSS to hide sticky elements/overlays reliably
        await page.addStyleTag({
            content: `
                #axeptio_overlay, .axeptio_mount, [data-nosnippet], .needsclick {
                    display: none !important;
                    pointer-events: none !important;
                    visibility: hidden !important;
                }
            `
        });
    });

    test('should open and close the panel', async ({ page }) => {
        // Use first() to avoid strict mode violation if multiple buttons exist
        const triggerButton = page.getByRole('button', { name: 'Ask LeChat' }).first();
        await expect(triggerButton).toBeVisible();
        await triggerButton.click();

        const panel = page.locator('#lechat-panel-container');
        await expect(panel).toBeVisible();

        const closeButton = page.getByRole('button', { name: 'Close chat panel' });
        // If title attribute is not present, try finding by icon or other means
        if (await closeButton.count() === 0) {
            // Fallback to finding the close button inside the header
            await page.locator('#lechat-panel-container button').first().click();
        } else {
            await closeButton.click();
        }
        // Use toBeHidden which waits for element to disappear
        await expect(panel).toBeHidden();
    });

    test('should send a message and receive a response', async ({ page }) => {
        // Open panel
        await page.getByRole('button', { name: 'Ask LeChat' }).first().click();

        // Type and send message
        const input = page.locator('input[placeholder="Ask a question..."]');
        await input.fill('Hello LeChat');
        await page.keyboard.press('Enter');

        // Verify user message appears
        await expect(page.getByText('Hello LeChat', { exact: true })).toBeVisible();

        // Verify assistant response appears (mocked)
        await expect(page.getByText("I'm a mocked LeChat response.")).toBeVisible();
    });

    test('should handle navigation commands', async ({ page }) => {
        // Open panel
        await page.getByRole('button', { name: 'Ask LeChat' }).first().click();

        // Send navigation command
        const input = page.locator('input[placeholder="Ask a question..."]');
        await input.fill('go to Mistral OCR');
        await page.keyboard.press('Enter');

        // Verify navigation response
        await expect(page.getByText("Navigating you to Mistral OCR Document Understanding...")).toBeVisible();

        // Verify URL change with increased timeout for animation
        await expect(page).toHaveURL(/\/cookbooks\/mistral-ocr-document_understanding/, { timeout: 10000 });
        // Verify success message (if implemented in UI)
        // await expect(page.getByText('You are at Mistral OCR Document Understanding')).toBeVisible();
    });

    test('should handle context updates', async ({ page }) => {
        // Open panel
        await page.getByRole('button', { name: 'Ask LeChat' }).first().click();

        // Send context command
        const input = page.locator('input[placeholder="Ask a question..."]');
        await input.fill('use context /getting-started/quickstart');
        await page.keyboard.press('Enter');

        // Verify response
        await expect(page.getByText("Context updated.")).toBeVisible();

        // Verify context indicator (if visible in UI)
        // This depends on UI implementation details, might need adjustment
    });

    test('should persist sessions', async ({ page }) => {
        // Open panel
        await page.getByRole('button', { name: 'Ask LeChat' }).first().click();

        // Send a message
        const input = page.locator('input[placeholder="Ask a question..."]');
        await input.fill('Session Test Message');
        await page.keyboard.press('Enter');
        await expect(page.getByText('Session Test Message')).toBeVisible();

        // Reload page
        await page.reload();

        // Open panel again
        await page.getByRole('button', { name: 'Ask LeChat' }).first().click();

        // Verify message is still there
        await expect(page.getByText('Session Test Message')).toBeVisible();
    });

    test('should allow stopping a generation and return to ready state', async ({ page }) => {
        // Override the API route with a delayed response to simulate a long generation
        await page.unroute('/api/lechat');
        await page.route('/api/lechat', async route => {
            // Delay to give time to click stop
            await new Promise(resolve => setTimeout(resolve, 2000));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    content: "This response should not appear if stopped.",
                    navigateTo: null,
                    setContext: null,
                })
            });
        });

        // Open panel
        await page.getByRole('button', { name: 'Ask LeChat' }).first().click();

        // Send a message to start generation
        const input = page.locator('input[placeholder="Ask a question..."]');
        await input.fill('Generate something and I will stop you');
        await page.keyboard.press('Enter');

        // Stop button should appear while loading
        const stopButton = page.getByRole('button', { name: 'Stop generation' });
        await expect(stopButton).toBeVisible();

        // Click stop to abort
        await stopButton.click();

        // After stop, the stop button should disappear and the send button should be back
        await expect(stopButton).toBeHidden();
        const sendButton = page.locator('#lechat-panel-container button:has(svg)');
        await expect(sendButton).toBeVisible();

        // Ensure no assistant response was added (wait a bit to confirm)
        await page.waitForTimeout(2500);
        await expect(page.getByText('This response should not appear if stopped.')).toHaveCount(0);
    });
    test('should show trigger on text selection', async ({ page }) => {
        // Select some text on the page
        await page.getByText('Mistral AI').first().selectText();

        // Verify selection menu appears
        const selectionMenu = page.locator('button:has-text("Ask LeChat")');
        // Note: Selector might need adjustment based on exact implementation of TextSelectionMenu
        // Assuming it renders a button with "Ask LeChat" text

        // Wait for it to appear (it has a small delay/animation)
        await expect(selectionMenu).toBeVisible({ timeout: 5000 });

        // Click it
        await selectionMenu.click();

        // Verify panel opens
        await expect(page.locator('#lechat-panel-container')).toBeVisible();
    });

    test('should verify route knowledge contains critical pages', async ({ request }) => {
        // Read the generated file directly from the filesystem
        const routesPath = path.join(process.cwd(), 'src/generated/lechat-routes.json');
        const generatedRoutes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));

        // Verify Root Page exists
        const rootRoute = generatedRoutes.allRoutes.find((r: string) => r === '/');
        expect(rootRoute).toBeDefined();

        // Verify Prompting Page exists
        const promptingRoute = generatedRoutes.allRoutes.find((r: string) => r === '/capabilities/completion/prompting_capabilities');
        expect(promptingRoute).toBeDefined();

        // Verify Prompting Page has correct title in categories
        let foundTitle = false;
        for (const cat of generatedRoutes.categories) {
            const route = cat.routes.find((r: any) => r.path === '/capabilities/completion/prompting_capabilities');
            if (route && route.title === 'Prompting') {
                foundTitle = true;
                break;
            }
        }
        expect(foundTitle).toBe(true);
    });

    test('should navigate to prompting page when asked', async ({ page }) => {
        // Mock specific response for prompting navigation
        await page.route('/api/lechat', async route => {
            const postData = route.request().postDataJSON();
            if (postData.messages && postData.messages.some((m: any) => m.content.toLowerCase().includes('go to prompting'))) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        content: "Navigating you to Prompting capabilities...",
                        navigateTo: "/capabilities/completion/prompting_capabilities",
                        setContext: null
                    })
                });
            } else {
                await route.continue();
            }
        });

        // Open panel
        await page.getByRole('button', { name: 'Ask LeChat' }).first().click();

        // Send navigation command
        const input = page.locator('input[placeholder="Ask a question..."]');
        await input.fill('go to prompting');
        await page.keyboard.press('Enter');

        // Verify navigation response
        await expect(page.getByText("Navigating you to Prompting capabilities...")).toBeVisible();

        // Verify URL change
        await expect(page).toHaveURL(/\/capabilities\/completion\/prompting_capabilities/, { timeout: 10000 });
    });
});
