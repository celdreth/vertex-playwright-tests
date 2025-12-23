import { test, expect } from '@playwright/test';

test('Basic Smoke Test: Verify Utility Nav', async ({ page }) => {
  console.log('Navigating to site...');
  
  // 1. Navigate to the site
  await page.goto('https://test-vertexinc.pantheonsite.io/', { 
    waitUntil: 'domcontentloaded', 
    timeout: 60000 
  });

  // 2. Aggressive Cookie/Overlay Handling
  // Your logs show 'Consent' and 'Details' links, which indicates a Cookiebot-style popup.
  console.log('Checking for cookie/consent overlays...');
  const cookieSelectors = [
    '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll', // Cookiebot
    '#onetrust-accept-btn-handler',                          // OneTrust
    'button:has-text("Accept All")',
    'button:has-text("Allow all")',
    'button:has-text("Agree")'
  ];

  for (const selector of cookieSelectors) {
    try {
      const btn = page.locator(selector);
      if (await btn.isVisible({ timeout: 5000 })) {
        await btn.click();
        console.log(`Accepted cookies via: ${selector}`);
        // Wait for the overlay to actually disappear from the DOM
        await page.waitForTimeout(2000);
        break; 
      }
    } catch (e) {
      // Continue to next selector
    }
  }

  // 3. Ensure we are looking at the main content
  // Sometimes the header is hidden until a scroll happens or overlay clears
  await page.waitForLoadState('networkidle');

  // 4. Verification of the 4 key items
  console.log('Checking for Utility Navigation items...');
  
  const items = [
    { label: 'Vertex Exchange', locator: page.getByRole('link', { name: /Exchange/i }).or(page.getByText(/Vertex Exchange/i)) },
    { label: 'Global Directory', locator: page.getByRole('link', { name: /Directory/i }).or(page.getByText(/Global Directory/i)) },
    { label: 'Log In', locator: page.getByRole('link', { name: /Log In/i }).or(page.getByText(/Log In/i)) }
  ];

  for (const item of items) {
    try {
      // We use .first() because sometimes hidden mobile versions of these links exist in the DOM
      const target = item.locator.first();
      await expect(target).toBeVisible({ timeout: 15000 });
      console.log(`✅ Found: ${item.label}`);
    } catch (err) {
      console.error(`❌ Failed to find: ${item.label}`);
      // Take a screenshot on failure to see what's blocking the view
      await page.screenshot({ path: `failure-${item.label.replace(/\s+/g, '')}.png` });
      throw err;
    }
  }

  // 5. Search locator check
  const search = page.getByRole('button', { name: /search/i })
    .or(page.getByLabel(/search/i))
    .or(page.locator('.search-toggle'))
    .or(page.getByText(/search/i));
    
  await expect(search.first()).toBeVisible({ timeout: 10000 });
  console.log('✅ Found: Search');

  console.log('Smoke test completed successfully.');
});