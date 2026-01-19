import { test, expect } from '@playwright/test';

test.describe('Navigation Structure', () => {
    const baseURL = 'http://localhost:3004'; // Using 3004 for fresh verification

    test('Getting Started redirect works', async ({ page }) => {
        await page.goto(`${baseURL}/getting-started`);
        await expect(page).toHaveURL(/.*\/getting-started\/introduction/);
    });

    test('Products redirect works and sidebar is visible', async ({ page }) => {
        await page.goto(`${baseURL}/products`);
        await expect(page).toHaveURL(/.*\/products\/introduction/);
        await expect(page.locator('aside')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Introduction' })).toBeVisible();
    });

    test('Platform redirect works and sidebar is visible', async ({ page }) => {
        await page.goto(`${baseURL}/platform`);
        await expect(page).toHaveURL(/.*\/platform\/introduction/);
        await expect(page.locator('aside')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Introduction' })).toBeVisible();
    });

    test('Operations redirect works and sidebar is visible', async ({ page }) => {
        await page.goto(`${baseURL}/operations`);
        await expect(page).toHaveURL(/.*\/operations\/introduction/);
        await expect(page.locator('aside')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Introduction' })).toBeVisible();
    });

    test('Resources redirect works and sidebar is visible', async ({ page }) => {
        await page.goto(`${baseURL}/resources`);
        await expect(page).toHaveURL(/.*\/resources\/introduction/);
        await expect(page.locator('aside')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Introduction' })).toBeVisible();
    });

    test('Community redirect works and sidebar is visible', async ({ page }) => {
        await page.goto(`${baseURL}/community`);
        await expect(page).toHaveURL(/.*\/community\/introduction/);
        await expect(page.locator('aside')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Introduction' })).toBeVisible();
    });
});
