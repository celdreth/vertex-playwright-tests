import { test, expect } from '@playwright/test';

const locales = [
  { 
    name: 'US', 
    url: 'https://test-vertexinc.pantheonsite.io/',
    expectedTitle: /Vertex/i,
    footerText: /Vertex/i
  },
  { 
    name: 'UK', 
    url: 'https://test-vertexinc.pantheonsite.io/en-gb',
    expectedTitle: /Vertex/i,
    footerText: /Vertex/i
  },
  { 
    name: 'DE', 
    url: 'https://test-vertexinc.pantheonsite.io/de-de',
    expectedTitle: /Vertex/i,
    footerText: /Vertex/i
  }
];

test.describe('Homepage Smoke Tests', () => {
  for (const locale of locales) {
    test(`Homepage loads correctly - ${locale.name}`, async ({ page }) => {
      console.log(`[${locale.name}] Starting homepage test for ${locale.url}`);
      
      // 1. Navigate to homepage
      await page.goto(locale.url, { waitUntil: 'networkidle' });
      console.log(`[${locale.name}] Page loaded`);
      
      // 2. Handle cookies
      const cookieBtn = page.getByRole('button').filter({ 
        name: /Accept|Agree|Akzeptieren|Zustimmen/i 
      }).first();
      
      try {
        if (await cookieBtn.isVisible({ timeout: 5000 })) {
          await cookieBtn.click();
          console.log(`[${locale.name}] Cookies accepted`);
          await page.waitForTimeout(1000);
        }
      } catch (e) {
        console.log(`[${locale.name}] No cookie banner`);
      }
      
      // 3. Verify page title
      await expect(page).toHaveTitle(locale.expectedTitle);
      console.log(`[${locale.name}] ✅ Page title correct`);
      
      // 4. Verify main heading exists
      const mainHeading = page.locator('h1').first();
      await expect(mainHeading).toBeVisible({ timeout: 10000 });
      
      const headingText = await mainHeading.innerText();
      console.log(`[${locale.name}] ✅ Main heading found: "${headingText}"`);
      
      // 5. Verify navigation is visible
      const nav = page.locator('nav, header nav').first();
      await expect(nav).toBeVisible({ timeout: 10000 });
      console.log(`[${locale.name}] ✅ Navigation visible`);
      
      // 6. Scroll to footer and verify it contains branding
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      const footer = page.locator('footer');
      await expect(footer).toContainText(locale.footerText);
      console.log(`[${locale.name}] ✅ Footer contains branding`);
      
      console.log(`[${locale.name}] ✅ Homepage test completed successfully\n`);
    });
  }
});