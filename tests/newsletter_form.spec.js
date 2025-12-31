import { test, expect } from '@playwright/test';
/**
 * Test: Vertex Pulse Newsletter Subscription (Multi-Locale)
 * Site: Vertex Multi-Regional Environments
 * Update: Added specific German success message for the DE locale.
 */
// 1. Define your locales with their full unique URLs and success criteria
const locales = [
  { 
    name: 'US', 
    url: 'https://test-vertexinc.pantheonsite.io/', 
    successText: /1-800-355-3500/i 
  },
  { 
    name: 'UK', 
    url: 'https://test-vertexinc.pantheonsite.io/en-gb/', 
    successText: /thank you/i 
  },
  { 
    name: 'DE', 
    url: 'https://test-vertexinc.pantheonsite.io/de-de/', 
    // Updated with the specific German success message and phone number
    successText: /Vielen Dank.*1-800-355-3500/i 
  }
];
test.describe('Newsletter Form Submission - Multi-Locale', () => {
  // Global configuration for the file
  test.describe.configure({ timeout: 180000 }); 
  test.use({ navigationTimeout: 100000, actionTimeout: 60000 });
  // 2. Loop through each locale to generate a test case for each
  for (const locale of locales) {
    test(`Verify Vertex Pulse Newsletter Form in Footer - ${locale.name}`, async ({ page, browserName }) => {
      test.setTimeout(180000);
      console.log(`[${locale.name}] Running on ${browserName}. Navigating to: ${locale.url}`);
      await page.goto(locale.url, { 
        waitUntil: 'load',
        timeout: 120000
      });
      // 3. Aggressive Cookie/Overlay Handling
      console.log(`[${locale.name}] Clearing cookie overlays...`);
      await page.waitForTimeout(2000); 
      const cookieSelectors = [
        '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll', 
        '#onetrust-accept-btn-handler',                          
        'button:has-text("Accept All")',
        'button:has-text("Allow all")',
        'button:has-text("Agree")',
        'button:has-text("Alle akzeptieren")', // German
        'button:has-text("Akzeptieren")'        // German variant
      ];
      for (const selector of cookieSelectors) {
        try {
          const btn = page.locator(selector);
          if (await btn.isVisible({ timeout: 5000 })) {
            await btn.click();
            console.log(`[${locale.name}] Accepted cookies via: ${selector}`);
            await page.waitForTimeout(2000);
            break; 
          }
        } catch (e) { }
      }
      // 4. Scroll to the Footer
      const footer = page.locator('footer').first();
      await footer.scrollIntoViewIfNeeded();
      const iframeSelector = 'footer iframe';
      try {
        await page.waitForSelector(iframeSelector, { state: 'attached', timeout: 30000 });
      } catch (e) {
        console.log(`[${locale.name}] Iframe not found, checking for standard footer form...`);
      }
      // 5. Locate Form Context
      const formIframe = page.frameLocator('footer iframe').first();
      const iframeCount = await page.locator('footer iframe').count();
      let interactionContext = iframeCount > 0 ? formIframe : page.locator('footer');
      try {
        // 6. Fill Email
        const emailInput = interactionContext.locator('input[type="email"], #email, input[name*="email" i]').first();
        await emailInput.waitFor({ state: 'visible', timeout: 45000 });
        await emailInput.fill('test@o3world.com');
        // 7. Fixed Checkbox Interaction
        console.log(`[${locale.name}] Handling Terms checkbox...`);
        const checkboxInput = interactionContext.locator('input[type="checkbox"]').first();
        // Multi-language label filtering
        const checkboxLabel = interactionContext.locator('label')
          .filter({ hasText: /terms|privacy|agree|Datenschutz|Zustimmung|Ich stimme zu/i })
          .first();
        const isChecked = await checkboxInput.isChecked().catch(() => false);
        if (!isChecked) {
          if (await checkboxLabel.count() > 0) {
            console.log(`[${locale.name}] Clicking label to check the box...`);
            await checkboxLabel.click({ force: true });
          } else if (await checkboxInput.count() > 0) {
            console.log(`[${locale.name}] Checking input directly...`);
            await checkboxInput.check({ force: true });
          }
          // Verify it actually checked
            await expect(checkboxInput).toBeChecked({ timeout: 5000 });
          }
        }
        // 8. Submit
        const submitBtn = interactionContext.locator('input[type="submit"], button[type="submit"], .submit').first();
        await submitBtn.click();
        console.log(`[${locale.name}] Form submission triggered.`);
        // 9. Locale-Specific Success Verification
        console.log(`[${locale.name}] Waiting for success message...`);
        const successMessage = interactionContext.getByText(locale.successText);
        await expect(successMessage).toBeVisible({ timeout: 30000 });
        console.log(`✅ [${locale.name}] Success message detected!`);
        if (!process.env.CI) {
          await page.waitForTimeout(3000);
        }
      } catch (error) {
        console.error(`❌ [${locale.name}] Test failed: ${error.message}`);
        await page.screenshot({ path: `failure-${locale.name}-${Date.now()}.png` });
        throw error;
      }
    });
  }
});