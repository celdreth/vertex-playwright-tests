import { test, expect } from '@playwright/test';
 
const locales = [
  { 
    name: 'US', 
    url: 'https://test-vertexinc.pantheonsite.io/', 
    successText: /Thank you for subscribing/i 
  },
  { 
    name: 'UK', 
    url: 'https://test-vertexinc.pantheonsite.io/en-gb', 
    successText: /Thank you for subscribing/i 
  },
  { 
    name: 'DE', 
    url: 'https://test-vertexinc.pantheonsite.io/de-de', 
    successText: /Vielen Dank/i
  }
];
 
// Helper: dismiss Cookiebot cookie banner if present
async function dismissCookies(page) {
  try {
    const cookieBtn = page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll');
    if (await cookieBtn.isVisible({ timeout: 3000 })) {
      await cookieBtn.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    // No cookie banner present
  }
}
 
test.describe('Newsletter Form', () => {
  for (const locale of locales) {
    test(`[${locale.name}] Newsletter form can be filled out and submitted`, async ({ page }) => {
      await page.goto(locale.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await dismissCookies(page);
 
      // Scroll to footer where newsletter form is
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      await dismissCookies(page);
 
      // Check for iframe
      const iframeCount = await page.locator('footer iframe').count();
      console.log(`[${locale.name}] Iframes found: ${iframeCount}`);
 
      const email = 'test@o3world.com';
      let context;
 
      if (iframeCount > 0) {
        context = page.frameLocator('footer iframe').first();
        await context.locator('input[type="email"]').first().fill(email);
        console.log(`[${locale.name}] Email filled in iframe: ${email}`);
 
        await context.locator('input[type="checkbox"]').first().evaluate(el => el.checked = true).catch((e) => {});
 
        try {
          await context.locator('input[type="submit"], button[type="submit"]').first().click({ force: true, timeout: 5000 });
          console.log(`[${locale.name}] Submit clicked (iframe)`);
        } catch (e) {
          await context.locator('form').first().evaluate(form => form.submit());
          console.log(`[${locale.name}] Form.submit() called (iframe)`);
        }
      } else {
        context = page;
        await page.locator('footer input[type="email"]').first().fill(email);
        console.log(`[${locale.name}] Email filled on page: ${email}`);
 
        await page.locator('footer input[type="checkbox"]').first().evaluate(el => el.checked = true).catch((e) => {});
 
        try {
          await page.locator('footer input[type="submit"], footer button[type="submit"]').first().click({ force: true, timeout: 5000 });
          console.log(`[${locale.name}] Submit clicked (page)`);
        } catch (e) {
          await page.locator('footer form').first().evaluate(form => form.submit());
          console.log(`[${locale.name}] Form.submit() called (page)`);
        }
      }
 
      await page.waitForTimeout(5000);
 
      const successFound = await context.getByText(locale.successText).isVisible({ timeout: 10000 }).catch((e) => false);
 
      if (successFound) {
        console.log(`✅ [${locale.name}] Success message found`);
      } else {
        throw new Error(`[${locale.name}] Success message not found. Expected: ${locale.successText}`);
      }
    });
  }
});