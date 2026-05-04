import { test, expect } from '@playwright/test';
 
// Contact Us form tests across US, UK, and DE locales.
// Fills out all required fields and verifies the success message.
// Note: For UK and DE, selecting the country auto-fills the State field.
 
const locales = [
  {
    name: 'US',
    url: 'https://test-vertexinc.pantheonsite.io/contact-us',
    countryValue: 'US',
    autoFillsState: false,
    state: 'Pennsylvania',
    successText: /Thank You for Reaching Out/i,
  },
  {
    name: 'UK',
    url: 'https://test-vertexinc.pantheonsite.io/en-gb/contact-us',
    countryValue: 'GB',
    autoFillsState: true,
    successText: /Thank You for Reaching Out/i,
  },
  {
    name: 'DE',
    url: 'https://test-vertexinc.pantheonsite.io/de-de/kontakt-zu-uns',
    countryValue: 'US',
    autoFillsState: false,
    state: 'Pennsylvania',
    successText: /Vielen Dank für Ihre Anfrage/i,
  },
];
 
const TEST_DATA = {
  firstName: 'Test',
  lastName: 'Test',
  company: 'Test',
  email: 'test@o3world.com',
  phone: '215-555-5555',
  comments: 'This is an automated test submission.',
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
 
test.describe('Contact Us Form', () => {
  test.slow();
 
  for (const locale of locales) {
    test(`[${locale.name}] Form can be filled out and submitted`, async ({ page }) => {
      await page.goto(locale.url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      await dismissCookies(page);
 
      // Wait for form to be ready
      await page.locator('#edit-department').waitFor({ state: 'visible', timeout: 15000 });
 
      // 1. Who would you like to hear from?
      await page.locator('#edit-department').selectOption({ value: 'Customer Support' });
      console.log(`[${locale.name}] ✅ Department selected`);
 
      // 2. First Name
      await page.locator('#edit-first-name').fill(TEST_DATA.firstName);
      console.log(`[${locale.name}] ✅ First Name filled`);
 
      // 3. Last Name
      await page.locator('#edit-last-name').fill(TEST_DATA.lastName);
      console.log(`[${locale.name}] ✅ Last Name filled`);
 
      // 4. Job Level dropdown
      await page.locator('#edit-job-level').selectOption({ index: 1 });
      console.log(`[${locale.name}] ✅ Job Level selected`);
 
      // 5. Functional Role dropdown
      await page.locator('[name="functional_role"]').selectOption({ index: 1 });
      console.log(`[${locale.name}] ✅ Functional Role selected`);
 
      // 6. Company
      await page.locator('[name="company"]').fill(TEST_DATA.company);
      console.log(`[${locale.name}] ✅ Company filled`);
 
      // 7. Company Email
      await page.locator('#edit-email').fill(TEST_DATA.email);
      console.log(`[${locale.name}] ✅ Company Email filled`);
 
      // 8. Phone
      await page.locator('[name="phone_number"]').fill(TEST_DATA.phone);
      console.log(`[${locale.name}] ✅ Phone filled`);
 
      // 9. Country
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
 
      // 11. Comments
      await page.locator('#edit-comments').fill(TEST_DATA.comments);
      console.log(`[${locale.name}] ✅ Comments filled`);
 
      // 12. Check Terms & Conditions — uses page.evaluate() because the custom
      // GDPR checkbox wrapper does not respond to standard Playwright check methods.
      // dismissCookies is called first to ensure the banner doesn't block the checkbox.
      await dismissCookies(page);
      await page.evaluate(() => {
        const checkbox = document.querySelector('#edit-terms-conditions');
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        checkbox.dispatchEvent(new Event('input', { bubbles: true }));
        checkbox.dispatchEvent(new Event('click', { bubbles: true }));
      });
      console.log(`[${locale.name}] ✅ Terms & Conditions checked`);
 
      // 13. Submit
      await page.locator('#edit-submit').click();
      console.log(`[${locale.name}] Submitted form...`);
 
      // 14. Verify success message
      await expect(page.getByText(locale.successText)).toBeVisible({ timeout: 15000 });
      console.log(`[${locale.name}] ✅ Success message displayed`);
    });
  }
});