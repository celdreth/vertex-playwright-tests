import { test, expect } from '@playwright/test';
 
// CPA Referral Firm form test - US only.
// Fills out all required fields and verifies the success message.
 
const TEST_DATA = {
  firmName: 'Test',
  firstName: 'Test',
  lastName: 'Test',
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
 
test.describe('CPA Referral Firm Form', () => {
  test.slow();
 
  test('US - Form can be filled out and submitted', async ({ page }) => {
    await page.goto('https://test-vertexinc.pantheonsite.io/referral/cpa-referral-firm', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await dismissCookies(page);
 
    // Wait for form to be ready
    await page.locator('#edit-firm-name').waitFor({ state: 'visible', timeout: 15000 });
 
    // 1. Accounting Firm Name
    await page.locator('#edit-firm-name').fill(TEST_DATA.firmName);
    console.log('✅ Accounting Firm Name filled');
 
    // 2. Accounting Firm Contact First Name
    await page.locator('[name="first_name"]').fill(TEST_DATA.firstName);
    console.log('✅ First Name filled');
 
    // 3. Accounting Firm Contact Last Name
    await page.locator('[name="last_name"]').fill(TEST_DATA.lastName);
    console.log('✅ Last Name filled');
 
    // 4. Accounting Firm Contact Email
    await page.locator('[name="email"]').first().fill(TEST_DATA.email);
    console.log('✅ Email filled');
 
    // 5. Accounting Firm Contact Phone Number
    await page.locator('[name="phone_number"]').fill(TEST_DATA.phone);
    console.log('✅ Phone filled');
 
    // 6. How did you first hear about this program?
    await page.locator('[name="how_did_you_hear"]').selectOption({ index: 1 });
    console.log('✅ How did you hear selected');
 
    // 7. Terms & Conditions
    await dismissCookies(page);
    await page.evaluate(() => {
      const checkbox = document.querySelector('#edit-terms-conditions');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      checkbox.dispatchEvent(new Event('input', { bubbles: true }));
      checkbox.dispatchEvent(new Event('click', { bubbles: true }));
    });
    console.log('✅ Terms & Conditions checked');
 
    // 8. Submit
    await page.locator('#edit-submit').click();
    console.log('Submitted form...');
 
    // 9. Verify success message
    await expect(page.getByText(/Thank You for Reaching Out/i)).toBeVisible({ timeout: 15000 });
    console.log('✅ Success message displayed');
  });
});