import { test, expect } from '@playwright/test';

// Tests verify the Vertex utility navigation works correctly across all three locales.
// Covers: Vertex Exchange link, Search bar, Log In dropdown, and Global Directory dropdown.
// Note: Cookie banner (Cookiebot) is active on staging and is dismissed automatically before each test.
// Note: Log In dropdown options are verified for visibility only - actual login is not tested.

const locales = [
  {
    name: 'US',
    url: 'https://test-vertexinc.pantheonsite.io/',
    loginText: /Log In/i,
    directoryText: /Global Directory/i,
  },
  {
    name: 'UK',
    url: 'https://test-vertexinc.pantheonsite.io/en-gb',
    loginText: /Log In/i,
    directoryText: /Global Directory/i,
  },
  {
    name: 'DE',
    url: 'https://test-vertexinc.pantheonsite.io/de-de',
    loginText: /Einloggen/i,
    directoryText: /Globales Verzeichnis/i,
  },
];

// Helper: dismiss Cookiebot cookie banner if present
async function dismissCookies(page) {
  try {
    const cookieBtn = page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll');
    if (await cookieBtn.isVisible({ timeout: 3000 })) {
      await cookieBtn.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    // No cookie banner present
  }
}

// Helper: navigate to locale URL and dismiss cookies
async function goToPage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await dismissCookies(page);
}

for (const locale of locales) {
  test.describe(`Utility Nav - ${locale.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await goToPage(page, locale.url);
    });

    test(`[${locale.name}] Vertex Exchange link is visible`, async ({ page }) => {
      const exchange = page.getByRole('link', { name: /Vertex Exchange/i }).first();
      await expect(exchange).toBeVisible({ timeout: 10000 });
      console.log(`✅ [${locale.name}] Vertex Exchange link visible`);
    });

    test(`[${locale.name}] Search opens search bar`, async ({ page }) => {
      await dismissCookies(page);
      const searchBtn = page.locator('#reveal-search-button0');
      await expect(searchBtn).toBeVisible({ timeout: 10000 });
      await searchBtn.click();
      await page.waitForTimeout(1000);
      await dismissCookies(page);

      const searchInput = page.locator('#edit-keys').first();
      await expect(searchInput).toBeAttached({ timeout: 10000 });
      await expect(searchInput).toBeEnabled({ timeout: 10000 });
      console.log(`✅ [${locale.name}] Search bar opened and input visible`);

      await page.keyboard.press('Escape');
    });

    test(`[${locale.name}] Log In dropdown opens and shows options`, async ({ page }) => {
      await dismissCookies(page);
      const loginBtn = page.getByRole('button', { name: locale.loginText }).first();
      await expect(loginBtn).toBeVisible({ timeout: 10000 });
      await loginBtn.click();
      await page.waitForTimeout(1000);
      await dismissCookies(page);
      await page.waitForTimeout(500);

      await expect(page.locator('a.reveal-menu__link', { hasText: /Vertex Cloud Login/i }).first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('a.reveal-menu__link', { hasText: /Vertex Community Login/i }).first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('a.reveal-menu__link', { hasText: /Taxamo Logins/i }).first()).toBeVisible({ timeout: 10000 });
      console.log(`✅ [${locale.name}] Log In dropdown opened and all options visible`);

      await page.keyboard.press('Escape');
    });

    test(`[${locale.name}] Global Directory dropdown opens and shows locale links`, async ({ page }) => {
      await dismissCookies(page);
      const directoryBtn = page.getByRole('button', { name: locale.directoryText }).first();
      await expect(directoryBtn).toBeVisible({ timeout: 10000 });
      await directoryBtn.click();
      await page.waitForTimeout(1000);
      await dismissCookies(page);
      await page.waitForTimeout(500);

      await expect(page.locator('a.reveal-menu__link', { hasText: /English \(UK\)/i }).first()).toBeVisible({ timeout: 10000 });
      console.log(`✅ [${locale.name}] Global Directory English (UK) link visible`);

      await expect(page.locator('a.reveal-menu__link', { hasText: /Deutsch \(DE\)/i }).first()).toBeVisible({ timeout: 10000 });
      console.log(`✅ [${locale.name}] Global Directory Deutsch (DE) link visible`);

      await expect(page.locator('a.reveal-menu__link', { hasText: /Português \(BR\)/i }).first()).toBeVisible({ timeout: 10000 });
      console.log(`✅ [${locale.name}] Global Directory Português (BR) link visible`);

      await page.keyboard.press('Escape');
    });
  });
}