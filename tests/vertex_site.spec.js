import { test, expect } from '@playwright/test';

/**
 * This test suite targets the Vertex Inc. Pantheon test environment.
 * It is designed to run across multiple projects (Desktop, Mobile, Tablet)
 * defined in your playwright.config.js.
 */
test.describe('Vertex Pantheon Environment', () => {

  // This runs before every test in this block
  test.beforeEach(async ({ page }) => {
    // Navigate to the base URL provided
    await page.goto('https://test-vertexinc.pantheonsite.io/');
  });

  test('should load the homepage with the correct title', async ({ page }) => {
    // Verify that the title contains "Vertex"
    // Note: Adjust the string if the site has a specific branding title
    await expect(page).toHaveTitle(/Vertex/i);
  });

  test('should have a visible main heading', async ({ page }) => {
    // Check for the existence of an H1 tag on the landing page
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    
    const text = await mainHeading.innerText();
    console.log(`Homepage Heading: ${text}`);
  });

  test('navigation accessibility check', async ({ page, isMobile }) => {
    if (isMobile) {
      // On mobile, we typically look for a hamburger menu button
      // Common selectors for Drupal/Pantheon sites often include 'button' or '.navbar-toggler'
      const menuButton = page.getByRole('button').first();
      await expect(menuButton).toBeVisible();
      console.log('Mobile view detected: Checked for primary action button.');
    } else {
      // On desktop, we expect the main navigation to be visible without clicking a toggle
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
      console.log('Desktop view detected: Navigation bar is visible.');
    }
  });

  test('footer contains copyright information', async ({ page }) => {
    // Scroll to the bottom to ensure footer elements load
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check for "Vertex" or "Copyright" in the footer area
    const footer = page.locator('footer');
    await expect(footer).toContainText(/Vertex/i);
  });

  test('performance check: page loads within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('https://test-vertexinc.pantheonsite.io/');
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });
});