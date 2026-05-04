import { test, expect } from '@playwright/test';
 
// Right Networks Referral form test - US only.
// Fills out all required fields and verifies the success message.
 
const TEST_DATA = {
  partnerName: 'Test',
  partnerEmail: 'test@o3world.com',
  partnerPhone: '215-555-5555',
  clientFirstName: 'Test',
  clientLastName: 'Test',
  clientCompany: 'Test',
  clientEmail: 'test@o3world.com',
  clientPhone: '215-555-5555',
  state: 'PA',
  annualRevenue: 'N/A',
  filingEntities: '10',
  message: 'QA testing',
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
 
test.describe('Right Networks Referral Form', () => {
  test.slow();
 
  test('US - Form can be filled out and submitted', async ({ page }) => {
    await page.goto('https://test-vertexinc.pantheonsite.io/referral/right-networks-refer-client', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await dismissCookies(page);
 
    // Wait for form to be ready
    await page.locator('#edit-referral-partner-contact-name').waitFor({ state: 'visible', timeout: 15000 });
 
    // 1. Referral Partner Contact Name
    await page.locator('#edit-referral-partner-contact-name').fill(TEST_DATA.partnerName);
    console.log('✅ Referral Partner Contact Name filled');
 
    // 2. Referral Partner Contact Email
    await page.locator('#edit-referral-partner-contact-email').fill(TEST_DATA.partnerEmail);
    console.log('✅ Referral Partner Contact Email filled');
 
    // 3. Referral Partner Contact Phone
    await page.locator('[name="referral_partner_contact_phone"]').fill(TEST_DATA.partnerPhone);
    console.log('✅ Referral Partner Contact Phone filled');
 
    // 4. Client Contact First Name
    await page.locator('[name="client_contact_first_name"]').fill(TEST_DATA.clientFirstName);
    console.log('✅ Client Contact First Name filled');
 
    // 5. Client Contact Last Name
    await page.locator('[name="client_contact_last_name"]').fill(TEST_DATA.clientLastName);
    console.log('✅ Client Contact Last Name filled');
 
    // 6. Client Contact Company
    await page.locator('[name="client_contact_company"]').fill(TEST_DATA.clientCompany);
    console.log('✅ Client Contact Company filled');
 
    // 7. Client Contact Email
    await page.locator('[name="client_contact_email"]').fill(TEST_DATA.clientEmail);
    console.log('✅ Client Contact Email filled');
 
    // 8. Client Contact Phone
    await page.locator('[name="client_contact_phone"]').fill(TEST_DATA.clientPhone);
    console.log('✅ Client Contact Phone filled');
 
    // 9. State
    await page.locator('[name="state"]').selectOption({ value: TEST_DATA.state });
    console.log('✅ State selected');
 
    // 10. Client Annual Revenue
    await dismissCookies(page);
    await page.locator('#edit-client-annual-revenue').fill(TEST_DATA.annualRevenue);
    console.log('✅ Client Annual Revenue filled');
 
    // 11. Client Number of Filing Entities
    await dismissCookies(page);
    await page.locator('[name="client_number_filing_entities"]').fill(TEST_DATA.filingEntities);
    console.log('✅ Client Number of Filing Entities filled');
 
    // 12. Client Current Ecommerce Platform (Optional)
    await dismissCookies(page);
    await page.locator('[name="client_current_platform"]').selectOption({ value: 'Amazon' });
    console.log('✅ Client Current Ecommerce Platform selected');
 
    // 13. Does your client have an automated sales tax solution today?
    await dismissCookies(page);
    await page.locator('#edit-message').fill(TEST_DATA.message);
    console.log('✅ Message filled');
 
    // 14. Terms & Conditions
    await dismissCookies(page);
    await page.evaluate(() => {
      const checkbox = document.querySelector('#edit-terms-conditions');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      checkbox.dispatchEvent(new Event('input', { bubbles: true }));
      checkbox.dispatchEvent(new Event('click', { bubbles: true }));
    });
    console.log('✅ Terms & Conditions checked');
 
    // 15. Submit
    await page.locator('#edit-submit').click();
    console.log('Submitted form...');
 
    // 16. Verify success message
    await expect(page.getByText(/Thank You for Reaching Out/i)).toBeVisible({ timeout: 15000 });
    console.log('✅ Success message displayed');
  });
});