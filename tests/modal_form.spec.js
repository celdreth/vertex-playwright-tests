import { test, expect } from '@playwright/test';
 
// Modal form tests across US, UK, and DE locales.
// Clicks the hero CTA button to open the modal, fills out all fields, and verifies success.
// Note: For UK, selecting United Kingdom as the country auto-fills the State field.
 
const locales = [
  {
    name: 'US',
    url: 'https://test-vertexinc.pantheonsite.io/solutions/tax-type/lodging-and-occupancy-tax',
    countryValue: 'US',
    autoFillsState: false,
    state: 'PA',
  },
  {
    name: 'UK',
    url: 'https://test-vertexinc.pantheonsite.io/en-gb/solutions/tax-type/lodging-and-occupancy-tax',
    countryValue: 'GB',
    autoFillsState: true,
  },
  {
    name: 'DE',
    url: 'https://test-vertexinc.pantheonsite.io/de-de/loesungen/steuer-art/beherbergungssteuer',
    countryValue: 'US',
    autoFillsState: false,
    state: 'PA',
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
 
test.describe('Modal Form', () => {
  test.slow();
 
  for (const locale of locales) {
    test(`[${locale.name}] Modal form can be opened, filled out and submitted`, async ({ page }) => {
      await page.goto(locale.url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      await dismissCookies(page);
 
      // 1. Click the hero button to open the modal
      const triggerBtn = page.locator('button[data-universal-modal-form-trigger="hero"]').first();
      await expect(triggerBtn).toBeVisible({ timeout: 10000 });
      await triggerBtn.click();
      console.log(`[${locale.name}] ✅ Modal trigger clicked`);
 
      // 2. Wait for modal to open, then wait for cookie banner and dismiss it
      await page.locator('#edit-first-name--2').waitFor({ state: 'visible', timeout: 10000 });
      console.log(`[${locale.name}] ✅ Modal opened`);
      await page.waitForTimeout(3000);
      await dismissCookies(page);
 
      // 3. First Name
      await page.locator('#edit-first-name--2').fill(TEST_DATA.firstName);
      console.log(`[${locale.name}] ✅ First Name filled`);
 
      // 4. Last Name
      await page.locator('#edit-last-name--2').fill(TEST_DATA.lastName);
      console.log(`[${locale.name}] ✅ Last Name filled`);
 
      // 5. Job Level dropdown
      await page.locator('[name="job_level"]').nth(1).selectOption({ index: 1 });
      console.log(`[${locale.name}] ✅ Job Level selected`);
 
      // 6. Functional Role dropdown
      await page.locator('[name="functional_role"]').nth(1).selectOption({ index: 1 });
      console.log(`[${locale.name}] ✅ Functional Role selected`);
 
      // 7. Company
      await page.locator('#edit-company--2').fill(TEST_DATA.company);
      console.log(`[${locale.name}] ✅ Company filled`);
 
      // 8. Phone
      await page.locator('#edit-phone-number--2').fill(TEST_DATA.phone);
      console.log(`[${locale.name}] ✅ Phone filled`);
 
      // 9. Company Email
      await page.locator('#edit-email--3').fill(TEST_DATA.email);
      console.log(`[${locale.name}] ✅ Company Email filled`);
 
      // 10. Primary ERP Platform
      await page.locator('#edit-primary-app-technology-provider--2').selectOption({ index: 1 });
      console.log(`[${locale.name}] ✅ Primary ERP Platform selected`);
 
      // 11. Country
      await page.locator('#edit-country--2').selectOption({ value: locale.countryValue });
      console.log(`[${locale.name}] ✅ Country selected: ${locale.countryValue}`);
 
      // 12. State — manual for US and DE, auto-filled for UK
      await page.waitForTimeout(1000);
      if (!locale.autoFillsState) {
        await page.locator('#edit-state--2').selectOption({ value: locale.state });
        console.log(`[${locale.name}] ✅ State selected: ${locale.state}`);
      } else {
        console.log(`[${locale.name}] ✅ State auto-filled by country selection`);
      }
 
      // 13. Terms & Conditions — uses page.evaluate() because the custom
      // GDPR checkbox wrapper does not respond to standard Playwright check methods
      await dismissCookies(page);
      await page.evaluate(() => {
        const checkbox = document.querySelector('#edit-vertexinc-universal-modal-form-terms-conditions--2');
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        checkbox.dispatchEvent(new Event('input', { bubbles: true }));
        checkbox.dispatchEvent(new Event('click', { bubbles: true }));
      });
      console.log(`[${locale.name}] ✅ Terms & Conditions checked`);
 
      // 14. Submit
      await page.locator('#edit-vertexinc-universal-modal-form-submit--2').click();
      console.log(`[${locale.name}] Submitted form...`);
 
      // 15. Verify success — form hides when submission is successful
      await expect(page.getByRole('dialog').locator('[data-lead-modal-form]')).toBeHidden({ timeout: 15000 });
      console.log(`[${locale.name}] ✅ Success message displayed`);
    });
  }
});