import { test, expect } from '@playwright/test';
 
// Resources Library page tests across US, UK, and DE locales.
// Covers: page load, search, dropdown filters, pills, clear filters, displaying count, and load more.
 
const locales = [
  {
    name: 'US',
    url: 'https://test-vertexinc.pantheonsite.io/resources/resource-library',
    searchTerm: 'tax',
  },
  {
    name: 'UK',
    url: 'https://test-vertexinc.pantheonsite.io/en-gb/resources/resources-library',
    searchTerm: 'tax',
  },
  {
    name: 'DE',
    url: 'https://test-vertexinc.pantheonsite.io/de-de/ressourcen/ressourcen-bibliothek',
    searchTerm: 'steuer',
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
 
// Open the first filter dropdown, check the first option, and click Apply filters
async function applyFirstFilter(page) {
  // Open the first dropdown toggle
  const toggle = page.locator('button.taxonomy-filter__flyout-toggle').first();
  await expect(toggle).toBeVisible({ timeout: 10000 });
  await toggle.click();
  await page.waitForTimeout(500);
 
  // Check the first checkbox option inside the flyout
  const label = page.locator('.taxonomy-filter__flyout label.option').first();
  await expect(label).toBeVisible({ timeout: 5000 });
  await label.click();
  await page.waitForTimeout(500);
 
  // Click Apply filters
  const applyBtn = page.locator('[data-taxonomy-filter-ui-submit="flyout-checkbox"]').first();
  await expect(applyBtn).toBeVisible({ timeout: 5000 });
  await applyBtn.click();
  await page.waitForTimeout(2000);
}
 
test.describe('Resources Library Page', () => {
  for (const locale of locales) {
    test.describe(`Locale: ${locale.name}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(locale.url, { waitUntil: 'networkidle', timeout: 30000 });
        await dismissCookies(page);
      });
 
      // ── 1. Page loads and resource cards are visible ──────────────────────
      test(`[${locale.name}] Resource cards are visible on load`, async ({ page }) => {
        const cards = page.locator('.card__title').first();
        await expect(cards).toBeVisible({ timeout: 10000 });
        const count = await page.locator('.card__title').count();
        console.log(`[${locale.name}] Resource cards visible: ${count}`);
        expect(count).toBeGreaterThan(0);
      });
 
      // ── 2. Displaying count is visible ────────────────────────────────────
      test(`[${locale.name}] Displaying count is visible`, async ({ page }) => {
        const displayCount = page.locator('[data-taxonomy-filter-display-count]').first();
        const totalCount = page.locator('[data-taxonomy-filter-total-result-count]').first();
        await expect(displayCount).toBeVisible({ timeout: 10000 });
        await expect(totalCount).toBeVisible({ timeout: 10000 });
        const displayed = await displayCount.innerText();
        const total = await totalCount.innerText();
        console.log(`[${locale.name}] Displaying ${displayed} of ${total}`);
      });
 
      // ── 3. Search returns results ─────────────────────────────────────────
      test(`[${locale.name}] Search filters resource results`, async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"], input[data-taxonomy-filter-search-input]').first();
        await expect(searchInput).toBeVisible({ timeout: 10000 });
 
        await searchInput.fill(locale.searchTerm);
 
        const searchBtn = page.locator('button[type="submit"], .btn--search').first();
        if (await searchBtn.isVisible({ timeout: 2000 })) {
          await searchBtn.click();
        } else {
          await searchInput.press('Enter');
        }
 
        await page.waitForTimeout(3000);
 
        const count = await page.locator('.card__title').count();
        console.log(`[${locale.name}] Search results for "${locale.searchTerm}": ${count}`);
        expect(count).toBeGreaterThan(0);
      });
 
      // ── 4. Dropdown filter shows pill and updates results ─────────────────
      test(`[${locale.name}] Filter dropdown shows pill and updates results`, async ({ page }) => {
        await applyFirstFilter(page);
 
        // Verify pill appears
        const pill = page.locator('button.pill__remove').first();
        await expect(pill).toBeVisible({ timeout: 10000 });
        console.log(`[${locale.name}] ✅ Filter pill visible`);
 
        // Verify results updated
        const displayCount = page.locator('[data-taxonomy-filter-display-count]').first();
        await expect(displayCount).toBeVisible({ timeout: 5000 });
        const count = await displayCount.innerText();
        console.log(`[${locale.name}] Displaying count after filter: ${count}`);
      });
 
      // ── 5. Pill X dismisses the filter ────────────────────────────────────
      test(`[${locale.name}] Pill X clears the filter`, async ({ page }) => {
        await applyFirstFilter(page);
 
        // Click the X on the pill
        const pillClose = page.locator('button.pill__remove').first();
        await expect(pillClose).toBeVisible({ timeout: 10000 });
        await pillClose.click();
        await page.waitForTimeout(2000);
 
        // Pill should be gone
        const pillCount = await page.locator('button.pill__remove').count();
        console.log(`[${locale.name}] Pills remaining after dismiss: ${pillCount}`);
        expect(pillCount).toBe(0);
      });
 
      // ── 6. Clear filters resets all filters ───────────────────────────────
      test(`[${locale.name}] Clear filters resets all filters`, async ({ page }) => {
        await applyFirstFilter(page);
 
        // Click Clear filters
        const clearFilters = page.locator('li.pills__list-item--clear-filters a, li.pills__list-item--clear-filters button').first();
        await expect(clearFilters).toBeVisible({ timeout: 5000 });
        await clearFilters.click();
        await page.waitForTimeout(2000);
 
        // Pills should be gone
        const pillCount = await page.locator('button.pill__remove').count();
        expect(pillCount).toBe(0);
        console.log(`[${locale.name}] ✅ Clear filters reset all filters`);
      });
 
      // ── 7. Load More loads additional cards ───────────────────────────────
      test(`[${locale.name}] Load More loads additional cards`, async ({ page }) => {
        const initialCount = await page.locator('.card__title').count();
        console.log(`[${locale.name}] Initial card count: ${initialCount}`);
 
        const loadMore = page.locator('a.pager__link--ajax-load-more').first();
        await expect(loadMore).toBeVisible({ timeout: 10000 });
        await loadMore.click();
        await page.waitForTimeout(2000);
 
        const newCount = await page.locator('.card__title').count();
        console.log(`[${locale.name}] Card count after Load More: ${newCount}`);
        expect(newCount).toBeGreaterThan(initialCount);
      });
 
      // ── 8. Read More links have valid hrefs ───────────────────────────────
      test(`[${locale.name}] Read More links have valid hrefs`, async ({ page }) => {
        const readMoreLinks = page.locator('h2.card__title a');
        const count = await readMoreLinks.count();
        console.log(`[${locale.name}] Read More links found: ${count}`);
        expect(count).toBeGreaterThan(0);
 
        const href = await readMoreLinks.first().getAttribute('href');
        console.log(`[${locale.name}] First Read More href: ${href}`);
        expect(href).toBeTruthy();
        expect(href).not.toBe('#');
      });
    });
  }
}); 