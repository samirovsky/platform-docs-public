import { test, expect } from '@playwright/test';

test.describe('Chat RAG Agent Smoke Test', () => {
  test('should display the floating chat button and open chat window', async ({ page }) => {
    // Navigate to the index page
    await page.goto('http://localhost:3000');

    // Wait for the floating button to be attached
    const openChatBtn = page.getByRole('button', { name: /open chat/i });
    await expect(openChatBtn).toBeVisible({ timeout: 10000 });

    // Click the button to open chat window
    await openChatBtn.click();

    // Verify chat window is open
    const chatTitle = page.getByText('Mistral AI Assistant');
    await expect(chatTitle).toBeVisible();

    // Verify input box exists
    const input = page.getByPlaceholder('Ask something...');
    await expect(input).toBeVisible();

    // Close the chat
    // Find the first SVG in a button close to the header (the X button)
    // The button has a class that usually indicates hover properties, we can find it by finding the button that contains an X icon (or no text with svg).
    const closeBtn = page.locator('.lucide-x').locator('..');
    await closeBtn.click();

    // Verify it closed
    await expect(chatTitle).not.toBeVisible();
  });
});
