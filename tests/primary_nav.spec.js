import { test, expect } from '@playwright/test';

// Primary navigation mega menu tests across US, UK, and DE locales.
// Flyouts are forced open via page.evaluate() because CSS :hover can't
// be triggered programmatically in Playwright.

const locales = [
  {
    name: 'US',
    url: 'https://test-vertexinc.pantheonsite.io/',
    navSections: {
      platform: 'Platform',
      solutions: 'Solutions',
      partners: 'Partners',
      resources: 'Resources',
      company: 'Company',
      getInTouch: 'Get in Touch',
    },
    sampleLinks: {
      platform: { text: /^Vertex Cloud$/i, url: /solutions\/platform/ },
      solutions: { text: /Real-time tax calculation/i, url: /real-time-tax-calculation/ },
      partners: { text: /Technology partners/i, url: /technology-partners/ },
      resources: { text: /Customer support/i, url: /customer-support/ },
      company: { text: /^About us$/i, url: /company\/about-us/ },
    },
    contactUrl: /request-information/,
  },
  {
    name: 'UK',
    url: 'https://test-vertexinc.pantheonsite.io/en-gb',
    navSections: {
      platform: 'Platform',
      solutions: 'Solutions',
      partners: 'Partners',
      resources: 'Resources',
      company: 'Company',
      getInTouch: 'Get in Touch',
    },
    sampleLinks: {
      platform: { text: /^Vertex Cloud$/i, url: /solutions\/platform/ },
      solutions: { text: /Real-time tax calculation/i, url: /real-time-tax-calculation/ },
      partners: { text: /Technology partners/i, url: /technology-providers/ },
      resources: { text: /Customer support/i, url: /customer-support/ },
      company: { text: /^About us$/i, url: /company\/about-us/ },
    },
    contactUrl: /request-information/,
  },
  {
    name: 'DE',
    url: 'https://test-vertexinc.pantheonsite.io/de-de',
    navSections: {
      platform: 'Plattform',
      solutions: 'Lösungen',
      partners: 'Partner',
      resources: 'Ressourcen',
      company: 'Unternehmen',
      getInTouch: 'Kontaktieren Sie uns',
    },
    sampleLinks: {
      platform: { text: /^Vertex Cloud$/i, url: /loesungen\/plattform/ },
      solutions: { text: /Steuerberechnung in Echtzeit/i, url: /steuern-genau-berechnen/ },
      partners: { text: /Technologiepartner/i, url: /technologieanbieter/ },
      resources: { text: /Kundensupport/i, url: /kundensupport/ },
      company: { text: /Über uns/i, url: /unternehmen\/uber-uns/ },
    },
    contactUrl: /informationen-anfordern/,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

async function goToPage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await dismissCookies(page);
}

// CSS :hover cannot be triggered by JS events — only real mouse position sets it.
// Instead we force the flyout DOM node visible directly via page.evaluate().
async function openFlyout(page, section) {
  await page.evaluate((sel) => {
    const flyout = document.querySelector(
      `[data-ga4-nav-section="${sel}"] [class*="mega-nav"]`
    );
    if (!flyout) throw new Error(`Flyout not found for section: ${sel}`);
    flyout.style.display = 'block';
    flyout.style.visibility = 'visible';
    flyout.style.opacity = '1';
    flyout.style.pointerEvents = 'auto';
  }, section);

  await page.waitForTimeout(300);
}

async function clickFlyoutLink(page, linkText) {
  const link = page
    .locator('a.mega-nav-2__highlight-list-item-link')
    .filter({ hasText: linkText })
    .first();
  await expect(link).toBeVisible({ timeout: 10000 });
  await link.click();
}

// ─── Tests ───────────────────────────────────────────────────────────────────

for (const locale of locales) {
  test.describe(`Primary Nav - ${locale.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await goToPage(page, locale.url);
    });

    test(`[${locale.name}] Platform flyout opens and sample link navigates correctly`, async ({ page }) => {
      await openFlyout(page, locale.navSections.platform);
      await clickFlyoutLink(page, locale.sampleLinks.platform.text);
      await expect(page).toHaveURL(locale.sampleLinks.platform.url, { timeout: 10000 });
      console.log(`✅ [${locale.name}] Platform flyout sample link navigated correctly`);
    });

    test(`[${locale.name}] Solutions flyout opens and sample link navigates correctly`, async ({ page }) => {
      await openFlyout(page, locale.navSections.solutions);
      await clickFlyoutLink(page, locale.sampleLinks.solutions.text);
      await expect(page).toHaveURL(locale.sampleLinks.solutions.url, { timeout: 10000 });
      console.log(`✅ [${locale.name}] Solutions flyout sample link navigated correctly`);
    });

    test(`[${locale.name}] Partners flyout opens and sample link navigates correctly`, async ({ page }) => {
      await openFlyout(page, locale.navSections.partners);
      await clickFlyoutLink(page, locale.sampleLinks.partners.text);
      await expect(page).toHaveURL(locale.sampleLinks.partners.url, { timeout: 10000 });
      console.log(`✅ [${locale.name}] Partners flyout sample link navigated correctly`);
    });

    test(`[${locale.name}] Resources flyout opens and sample link navigates correctly`, async ({ page }) => {
      await openFlyout(page, locale.navSections.resources);
      await clickFlyoutLink(page, locale.sampleLinks.resources.text);
      await expect(page).toHaveURL(locale.sampleLinks.resources.url, { timeout: 10000 });
      console.log(`✅ [${locale.name}] Resources flyout sample link navigated correctly`);
    });

    test(`[${locale.name}] Company flyout opens and sample link navigates correctly`, async ({ page }) => {
      await openFlyout(page, locale.navSections.company);
      await clickFlyoutLink(page, locale.sampleLinks.company.text);
      await expect(page).toHaveURL(locale.sampleLinks.company.url, { timeout: 10000 });
      console.log(`✅ [${locale.name}] Company flyout sample link navigated correctly`);
    });

    test(`[${locale.name}] GET IN TOUCH navigates correctly`, async ({ page }) => {
      await dismissCookies(page);
      const getInTouch = page
        .locator(`[data-ga4-nav-section="${locale.navSections.getInTouch}"] a`)
        .first();
      await expect(getInTouch).toBeVisible({ timeout: 10000 });
      await getInTouch.click();
      await expect(page).toHaveURL(locale.contactUrl, { timeout: 10000 });
      console.log(`✅ [${locale.name}] GET IN TOUCH navigated correctly`);
    });
  });
}