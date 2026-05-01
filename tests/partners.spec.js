import { test, expect } from '@playwright/test';
 
// Partners page tests across US, UK, and DE locales.
// Covers: page load, search, filters, pills, clear all, displaying count, and load more.
 
const locales = [
  {
    name: 'US',
    url: 'https://test-vertexinc.pantheonsite.io/partners/browse',
    searchTerm: 'Adobe',
  },
  {
    name: 'UK',
    url: 'https://test-vertexinc.pantheonsite.io/en-gb/partners/search',
    searchTerm: 'Adobe',
  },
  {
    name: 'DE',
    url: 'https://test-vertexinc.pantheonsite.io/de-de/partner/durchsuche',
    searchTerm: 'Adobe',
  },
];
 
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
 
// Click the filter label then Apply — the Apply button triggers the AJAX filter update
async function clickFilterCheckbox(page) {
  const label = page.locator('label[for="tf_cbgroup0_239"]').first();
  await expect(label).toBeVisible({ timeout: 10000 });
  await label.click();
  await page.waitForTimeout(500);
 
  const applyBtn = page.locator('[data-taxonomy-filter-ui-submit="flyout-checkbox"]').first();
  await expect(applyBtn).toBeVisible({ timeout: 5000 });
  await applyBtn.click();
  await page.waitForTimeout(2000);
}
 
test.describe('Partners Page', () => {
  for (const locale of locales) {
    test.describe(`Locale: ${locale.name}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(locale.url, { waitUntil: 'networkidle', timeout: 30000 });
        await dismissCookies(page);
      });
 
      // ── 1. Page loads and partner cards are visible ───────────────────────
      test(`[${locale.name}] Partner cards are visible on load`, async ({ page }) => {
        const cards = page.locator('article.partner-card');
        await expect(cards.first()).toBeVisible({ timeout: 10000 });
        const count = await cards.count();
        console.log(`[${locale.name}] Partner cards visible: ${count}`);
        expect(count).toBeGreaterThan(0);
      });
 
      // ── 2. Displaying count above Load More is visible ────────────────────
      test(`[${locale.name}] Displaying count is visible above Load More`, async ({ page }) => {
        const displayCount = page.locator('[data-taxonomy-filter-display-count]').first();
        const totalCount = page.locator('[data-taxonomy-filter-total-result-count]').first();
        await expect(displayCount).toBeVisible({ timeout: 10000 });
        await expect(totalCount).toBeVisible({ timeout: 10000 });
        const displayed = await displayCount.innerText();
        const total = await totalCount.innerText();
        console.log(`[${locale.name}] Displaying ${displayed} of ${total}`);
      });
 
      // ── 3. Search returns results ─────────────────────────────────────────
      test(`[${locale.name}] Search filters partner results`, async ({ page }) => {
        const searchInput = page.locator('input[data-taxonomy-filter-search-input]').first();
        await expect(searchInput).toBeVisible({ timeout: 10000 });
 
        await searchInput.fill(locale.searchTerm);
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
 
        const cards = page.locator('article.partner-card');
        const count = await cards.count();
        console.log(`[${locale.name}] Search results for "${locale.searchTerm}": ${count}`);
        expect(count).toBeGreaterThan(0);
      });
 
      // ── 4. Filter checkbox shows results count and pill ───────────────────
      test(`[${locale.name}] Filter checkbox shows results count and pill`, async ({ page }) => {
        await clickFilterCheckbox(page);
 
        // Verify filter results count appears
        const filterCount = page.locator('.partner-pills__results-count p').first();
        await expect(filterCount).toBeVisible({ timeout: 10000 });
        const countText = await filterCount.innerText();
        console.log(`[${locale.name}] Filter count text: ${countText}`);
 
        // Verify pill appears
        const pill = page.locator('.partner-pills__pills-list').first();
        await expect(pill).toBeVisible({ timeout: 5000 });
        console.log(`[${locale.name}] ✅ Filter pill visible`);
      });
 
      // ── 5. Pill X dismisses the filter ────────────────────────────────────
      test(`[${locale.name}] Pill X clears the filter`, async ({ page }) => {
        await clickFilterCheckbox(page);
 
        // Click the X on the pill
        const pillClose = page.locator('button.pill__remove').first();
        await expect(pillClose).toBeVisible({ timeout: 10000 });
        await pillClose.click();
        await page.waitForTimeout(2000);
 
        // Filter count should be gone
        const filterCount = await page.locator('.partner-pills__results-count p').count();
        console.log(`[${locale.name}] Filter count visible after pill dismiss: ${filterCount}`);
        expect(filterCount).toBe(0);
      });
 
      // ── 6. Clear all resets filters ───────────────────────────────────────
      test(`[${locale.name}] Clear all resets filters`, async ({ page }) => {
        await clickFilterCheckbox(page);
 
        // Click Clear all — data attribute works across all locales
        const clearAll = page.locator('[data-taxonomy-filter-ui-submit="clear-filters"]').first();
        await expect(clearAll).toBeVisible({ timeout: 5000 });
        await clearAll.click();
        await page.waitForTimeout(2000);
 
        // Filter count should be gone
        const filterCount = await page.locator('.partner-pills__results-count p').count();
        expect(filterCount).toBe(0);
        console.log(`[${locale.name}] ✅ Clear all reset filters`);
      });
 
      // ── 7. Load More loads additional cards ───────────────────────────────
      test(`[${locale.name}] Load More loads additional cards`, async ({ page }) => {
        const cards = page.locator('article.partner-card');
        const initialCount = await cards.count();
        console.log(`[${locale.name}] Initial card count: ${initialCount}`);
 
        const loadMore = page.locator('a.pager__link--ajax-load-more').first();
        await expect(loadMore).toBeVisible({ timeout: 10000 });
        await loadMore.click();
        await page.waitForTimeout(2000);
 
        const newCount = await cards.count();
        console.log(`[${locale.name}] Card count after Load More: ${newCount}`);
        expect(newCount).toBeGreaterThan(initialCount);
      });
 
      // ── 8. Learn More links have valid hrefs ──────────────────────────────
      test(`[${locale.name}] Learn More links have valid hrefs`, async ({ page }) => {
        const learnMoreLinks = page.locator('.partner-card__link a');
        const count = await learnMoreLinks.count();
        console.log(`[${locale.name}] Learn More links found: ${count}`);
        expect(count).toBeGreaterThan(0);
 
        const href = await learnMoreLinks.first().getAttribute('href');
        console.log(`[${locale.name}] First Learn More href: ${href}`);
        expect(href).toBeTruthy();
        expect(href).not.toBe('#');
      });
    });
  }
});