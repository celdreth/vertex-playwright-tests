import { test, expect } from '@playwright/test';
 
// Get in Touch form tests across US, UK, and DE locales.
// Fills out all required fields and verifies the success message.
// Note: For UK and DE, selecting the country auto-fills the State field.
 
const locales = [
  {
    name: 'US',
    url: 'https://test-vertexinc.pantheonsite.io/request-information',
    countryValue: 'US',
    autoFillsState: false,
    state: 'Pennsylvania',
  },
  {
    name: 'UK',
    url: 'https://test-vertexinc.pantheonsite.io/en-gb/request-information',
    countryValue: 'GB',
    autoFillsState: true,
  },
  {
    name: 'DE',
    url: 'https://test-vertexinc.pantheonsite.io/de-de/informationen-anfordern',
    countryValue: 'US',
    autoFillsState: false,
    state: 'Pennsylvania',
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
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    // No cookie banner present
  }
}
 
test.describe('Get in Touch Form', () => {
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
 
      // 6. Company Email
      await page.locator('#edit-email').fill(TEST_DATA.email);
      console.log(`[${locale.name}] ✅ Company Email filled`);
 
      // 7. Primary App/Tech Provider dropdown
      await page.locator('[name="primary_app_technology_provider"]').selectOption({ index: 1 });
      console.log(`[${locale.name}] ✅ Primary App/Tech Provider selected`);
 
      // 8. Phone
      await page.locator('[name="phone_number"]').fill(TEST_DATA.phone);
      console.log(`[${locale.name}] ✅ Phone filled`);
 
      // 9. Country dropdown — use value (country code) to work across all locales
      await page.locator('#edit-country').selectOption({ value: locale.countryValue });
      console.log(`[${locale.name}] ✅ Country selected: ${locale.countryValue}`);
 
      // 10. State — manual for US and DE, auto-filled for UK
      await page.waitForTimeout(1000);
      if (!locale.autoFillsState) {
        await page.locator('[name="state"]').selectOption({ label: locale.state });
        console.log(`[${locale.name}] ✅ State selected: ${locale.state}`);
      } else {
        console.log(`[${locale.name}] ✅ State auto-filled by country selection`);
      }
 
      // 11. Check Terms & Conditions checkbox
      await page.evaluate(() => {
        const checkbox = document.querySelector('#edit-vertexinc-request-info-full-terms-conditions');
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        checkbox.dispatchEvent(new Event('input', { bubbles: true }));
        checkbox.dispatchEvent(new Event('click', { bubbles: true }));
      });
      console.log(`[${locale.name}] ✅ Terms & Conditions checked`);
 
      // 12. Submit the form
      await page.locator('#edit-vertexinc-request-info-full-submit').click();
      console.log(`[${locale.name}] Submitted form...`);
 
      // 13. Verify success message using class selector — works across all locales
      await expect(page.locator('.form-container__success')).toBeVisible({ timeout: 15000 });
      console.log(`[${locale.name}] ✅ Success message displayed`);
    });
  }
});