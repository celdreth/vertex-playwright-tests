import { test, expect } from '@playwright/test';
 
// CPA Refer a Client form test - US only.
// Fills out all required fields and verifies the success message.
 
const TEST_DATA = {
  firmName: 'Test',
  firmContactName: 'Test',
  firmContactEmail: 'test@o3world.com',
  clientFirstName: 'Test',
  clientLastName: 'Test',
  clientCompany: 'Test',
  clientEmail: 'test@o3world.com',
  clientPhone: '215-555-5555',
  state: 'PA',
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
 
test.describe('CPA Refer a Client Form', () => {
  test.slow();
 
  test('US - Form can be filled out and submitted', async ({ page }) => {
    await page.goto('https://test-vertexinc.pantheonsite.io/referral/cpa-refer-client', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await dismissCookies(page);
 
    // Wait for form to be ready
    await page.locator('#edit-accounting-firm-name').waitFor({ state: 'visible', timeout: 15000 });
 
    // 1. Accounting Firm Name
    await page.locator('#edit-accounting-firm-name').fill(TEST_DATA.firmName);
    console.log('✅ Accounting Firm Name filled');
 
    // 2. Accounting Firm Contact Name
    await page.locator('#edit-accounting-firm-contact-name').fill(TEST_DATA.firmContactName);
    console.log('✅ Accounting Firm Contact Name filled');
 
    // 3. Accounting Firm Contact Email
    await page.locator('[name="accounting_firm_contact_email"]').fill(TEST_DATA.firmContactEmail);
    console.log('✅ Accounting Firm Contact Email filled');
 
    // 4. Client Contact First Name
    await dismissCookies(page);
    await page.locator('#edit-client-contact-first-name').fill(TEST_DATA.clientFirstName);
    console.log('✅ Client Contact First Name filled');
 
    // 5. Client Contact Last Name
    await page.locator('[name="client_contact_last_name"]').fill(TEST_DATA.clientLastName);
    console.log('✅ Client Contact Last Name filled');
 
    // 6. Client Contact Company
    await page.locator('[name="client_contact_company"]').fill(TEST_DATA.clientCompany);
    console.log('✅ Client Contact Company filled');
 
    // 7. Client Contact Email
    await dismissCookies(page);
    await page.locator('[name="client_contact_email"]').fill(TEST_DATA.clientEmail);
    console.log('✅ Client Contact Email filled');
 
    // 8. Client Contact Phone
    await dismissCookies(page);
    await page.locator('[name="client_contact_phone_number"]').fill(TEST_DATA.clientPhone);
    console.log('✅ Client Contact Phone filled');
 
    // 9. State
    await page.locator('[name="state"]').selectOption({ value: TEST_DATA.state });
    console.log('✅ State selected');
 
    // 10. Terms & Conditions
    await dismissCookies(page);
    await page.evaluate(() => {
      const checkbox = document.querySelector('#edit-terms-conditions');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      checkbox.dispatchEvent(new Event('input', { bubbles: true }));
      checkbox.dispatchEvent(new Event('click', { bubbles: true }));
    });
    console.log('✅ Terms & Conditions checked');
 
    // 11. Submit
    await page.locator('#edit-submit').click();
    console.log('Submitted form...');
 
    // 12. Verify success message
    await expect(page.getByText(/Thank You for Reaching Out/i)).toBeVisible({ timeout: 15000 });
    console.log('✅ Success message displayed');
  });
});