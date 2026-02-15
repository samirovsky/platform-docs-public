import { test, expect } from '@playwright/test';

test.describe('Products Section Navigation', () => {
  test('should display correct structure for Products', async ({ page }) => {
    // Navigate to Products page (using one of the sub-pages to ensure sidebar is active)
    await page.goto('/products/ai-models');

    // Verify Sidebar Sections
    const sidebar = page.locator('[data-slot="sidebar"]');
    
    // 1. AI MODELS
    // Check section header
    await expect(sidebar.getByText('AI MODELS')).toBeVisible();
    // Check items
    await expect(sidebar.getByRole('link', { name: 'Mistral Large 2' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Mixtral-8x22B' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Codestral' })).toBeVisible();

    // 2. DEVELOPER TOOLS
    await expect(sidebar.getByText('DEVELOPER TOOLS')).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Mistral Code Enterprise' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Mistral Vibe' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Mistral API' })).toBeVisible();

    // 3. AI TOOLS
    await expect(sidebar.getByText('AI TOOLS')).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Le Chat Pro' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Le Chat Enterprise' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Mistral AI Studio' })).toBeVisible();

    // 4. ENTERPRISE INFRASTRUCTURE
    await expect(sidebar.getByText('ENTERPRISE INFRASTRUCTURE')).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Mistral Compute' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'On-Premises Solutions' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Hybrid Deployment' })).toBeVisible();
  });
});
