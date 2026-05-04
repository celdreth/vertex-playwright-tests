import { test, expect } from '@playwright/test';
 
// Lead Gen Right Rail form tests across US, UK, and DE locales.
// Form is embedded directly on the page (no modal trigger needed).
 
const locales = [
  {
    name: 'US',
    url: 'https://test-vertexinc.pantheonsite.io/campaign/workday-vertex',
    countryValue: 'US',
    autoFillsState: false,
    state: 'Pennsylvania',
    successText: /Thanks for your interest/i,
  },
  {
    name: 'UK',
    url: 'https://test-vertexinc.pantheonsite.io/en-gb/campaign/workday-vertex',
    countryValue: 'GB',
    autoFillsState: true,
    successText: /Thanks for your interest/i,
  },
  {
    name: 'DE',
    url: 'https://test-vertexinc.pantheonsite.io/de-de/campaign/workday-vertex',
    countryValue: 'US',
    autoFillsState: false,
    state: 'Pennsylvania',
    successText: /Vielen Dank für Ihr Interesse/i,
  },
];
 
const TEST_DATA = {
  firstName: 'Test',
  lastName: 'Test',
  company: 'Test',
  email: 'test@o3world.com',
  phone: '215-555-5555',
};
 
async function dismissCookies(page) {
  try {
    const cookieBtn = page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll');
    if (await cookieBtn.isVisible({ timeout: 3000 })) {
      await cookieBtn.click();
      await page.locator('#CybotCookiebotDialog').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
  } catch (e) {
    // No cookie banner present
  }
}
 
test.describe('Lead Gen Right Rail Form', () => {
  test.slow();
 
  for (const locale of locales) {
    test(`[${locale.name}] Form can be filled out and submitted`, async ({ page }) => {
      await page.goto(locale.url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      await dismissCookies(page);
 
      // Wait for form to be ready
      await page.locator('#edit-first-name').waitFor({ state: 'visible', timeout: 15000 });
 
      // 1. First Name
      await page.locator('#edit-first-name').fill(TEST_DATA.firstName);
      console.log(`[${locale.name}] ✅ First Name filled`);
 
      // 2. Last Name
      await page.locator('#edit-last-name').fill(TEST_DATA.lastName);
      console.log(`[${locale.name}] ✅ Last Name filled`);
 
      // 3. Job Level dropdown
      await page.locator('#edit-job-level').selectOption({ index: 1 });
      console.log(`[${locale.name}] ✅ Job Level selected`);
 
      // 4. Functional Role dropdown
      await page.locator('[name="functional_role"]').selectOption({ index: 1 });
      console.log(`[${locale.name}] ✅ Functional Role selected`);
 
      // 5. Company
      await page.locator('[name="company"]').fill(TEST_DATA.company);
      console.log(`[${locale.name}] ✅ Company filled`);
 
      // 6. Phone
      await page.locator('[name="phone_number"]').fill(TEST_DATA.phone);
      console.log(`[${locale.name}] ✅ Phone filled`);
 
      // 7. Company Email
      await page.locator('[name="email"]').first().fill(TEST_DATA.email);
      console.log(`[${locale.name}] ✅ Company Email filled`);
 
      // 8. Country
      await page.locator('#edit-country').selectOption({ value: locale.countryValue });
      console.log(`[${locale.name}] ✅ Country selected: ${locale.countryValue}`);
 
      // 9. State — manual for US and DE, auto-filled for UK
      await page.waitForTimeout(1000);
      if (!locale.autoFillsState) {
        await page.locator('[name="state"]').selectOption({ label: locale.state });
        console.log(`[${locale.name}] ✅ State selected: ${locale.state}`);
      } else {
        console.log(`[${locale.name}] ✅ State auto-filled by country selection`);
      }
 
      // 10. Terms & Conditions — uses page.evaluate() because the custom
      // GDPR checkbox wrapper does not respond to standard Playwright check methods
      await dismissCookies(page);
      await page.evaluate(() => {
        const checkbox = document.querySelector('#edit-vertexinc-campaign-lead-generation-ajax-terms-conditions');
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        checkbox.dispatchEvent(new Event('input', { bubbles: true }));
        checkbox.dispatchEvent(new Event('click', { bubbles: true }));
      });
      console.log(`[${locale.name}] ✅ Terms & Conditions checked`);
 
      // 11. Submit
      await page.locator('#edit-vertexinc-campaign-lead-generation-ajax-submit').click();
      console.log(`[${locale.name}] Submitted form...`);
 
      // 12. Verify success message
      await expect(page.getByText(locale.successText)).toBeVisible({ timeout: 15000 });
      console.log(`[${locale.name}] ✅ Success message displayed`);
    });
  }
});