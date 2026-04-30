import { test, expect } from '@playwright/test';

const locales = [
  { 
    name: 'US', 
    url: 'https://test-vertexinc.pantheonsite.io/company/our-leadership', 
    heading: /Leadership/i 
  },
  { 
    name: 'UK', 
    url: 'https://test-vertexinc.pantheonsite.io/en-gb/company/our-leadership', 
    heading: /Leadership/i 
  },
  { 
    name: 'DE', 
    url: 'https://test-vertexinc.pantheonsite.io/de-de/unternehmen/unternehmensleitung', 
    heading: /Führungsteam/i 
  }
];

test.describe('Leadership Cards Functionality', () => {
  for (const locale of locales) {
    test(`Verify card interactions - ${locale.name}`, async ({ page }) => {
      test.setTimeout(60000);
      
      console.log(`[${locale.name}] Starting test for ${locale.url}`);
      
      // 1. Navigate to page
      await page.goto(locale.url, { waitUntil: 'networkidle' });
      console.log(`[${locale.name}] Page loaded`);

      // 2. Handle cookies
      const cookieBtn = page.getByRole('button').filter({ name: /Accept|Agree|Akzeptieren|Zustimmen/i }).first();
      try {
        if (await cookieBtn.isVisible({ timeout: 5000 })) {
          await cookieBtn.click();
          console.log(`[${locale.name}] Cookies accepted`);
          await page.waitForTimeout(1000);
        }
      } catch (e) {
        console.log(`[${locale.name}] No cookie banner`);
      }

      // 3. Verify leadership section heading exists
      const heading = page.getByRole('heading', { name: locale.heading }).first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      console.log(`[${locale.name}] ✅ Leadership heading found`);
      
      // 4. Find first leadership card
      const card = page.locator('article.card, .card, [data-expandable-card]')
        .filter({ has: page.locator('h2, h3, h4') })
        .first();
      
      await expect(card).toBeVisible({ timeout: 10000 });
      console.log(`[${locale.name}] ✅ Leadership card found`);
      
      // 5. Scroll card into view
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
            
      // 6. Verify card is clickable (check it's not disabled/hidden)
      await expect(card).toBeEnabled();
      console.log(`[${locale.name}] ✅ Card is clickable`);
         
      // 7. Click to expand card
      await card.click();
      console.log(`[${locale.name}] Card clicked`);
      await page.waitForTimeout(1000);
      
      // 8. Verify expanded content is visible
      const expandedContent = card.locator('p, .bio, .card__body, [class*="bio"]').first();
      await expect(expandedContent).toBeVisible({ timeout: 7000 });
      console.log(`[${locale.name}] ✅ Card expanded and content visible`);
      
      // 9. Optional: Verify card has aria-expanded=true after clicking
      const isExpanded = await card.getAttribute('aria-expanded');
      if (isExpanded !== null) {
        expect(isExpanded).toBe('true');
        console.log(`[${locale.name}] ✅ Card aria-expanded state correct`);
      }
      // 10. Click again to collapse card
      await card.click();
      console.log(`[${locale.name}] Card clicked to collapse`);
      await page.waitForTimeout(500);
      
      // 11. Verify card is collapsed
      const isCollapsed = await card.getAttribute('aria-expanded');
      if (isCollapsed !== null) {
        expect(isCollapsed).toBe('false');
        console.log(`[${locale.name}] ✅ Card collapsed successfully`);
      }
      
      // Optional: Check if content is hidden (some implementations keep it in DOM)
      const contentHidden = await expandedContent.isHidden().catch(() => false);
      if (contentHidden) {
        console.log(`[${locale.name}] ✅ Expanded content hidden after collapse`);
      } else {
        console.log(`[${locale.name}] ℹ️  Content still in DOM (collapsed via CSS)`);
      }
      
      console.log(`[${locale.name}] ✅ Test completed successfully\n`);
      
    });
  }
});