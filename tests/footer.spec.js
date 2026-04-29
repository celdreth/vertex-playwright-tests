import { test, expect } from '@playwright/test';

// Tests verify the Vertex footer loads correctly and all functionality works as expected.
// Covers all three locales: US, UK (en-gb), and DE (de-de).
// Each locale is tested for: footer visibility, column links, Contact Us CTA,
// social icons, phone numbers, Global Directory, legal links, and copyright text.
// Note: Cookie banner (Cookiebot) is active on staging and is dismissed automatically before each test.

const locales = [
  {
    name: 'US',
    url: 'https://test-vertexinc.pantheonsite.io/',
    contactText: /CONTACT US/i,
    contactUrlPattern: /contact/,
    exploreLink: '/company/about-us',
    solutionsLink: '/solutions/real-time-tax-calculation',
    companyLink: '/about-us',
    supportLink: '/support-services/customer-support',
    legalLinks: [
      '/terms-of-use',
      '/vertex-privacy-policy',
      '/digital-accessibility-statement',
      '/cookie-policy',
      '/modern-slavery-act-statement',
    ],
  },
  {
    name: 'UK',
    url: 'https://test-vertexinc.pantheonsite.io/en-gb',
    contactText: /CONTACT US/i,
    contactUrlPattern: /contact/,
    exploreLink: '/en-gb/company/about-us',
    solutionsLink: '/en-gb/solutions/real-time-tax-calculation',
    companyLink: '/en-gb/company/about-us',
    supportLink: '/en-gb/support-services/customer-support',
    legalLinks: [
      '/en-gb/terms-of-use',
      '/en-gb/vertex-privacy-policy',
      '/en-gb/digital-accessibility-statement',
      '/en-gb/cookie-policy',
      '/en-gb/modern-slavery-act-statement',
      '/en-gb/impressum',
    ],
  },
  {
    name: 'DE',
    url: 'https://test-vertexinc.pantheonsite.io/de-de',
    contactText: /Kontakt/i,
    contactUrlPattern: /kontakt/,
    exploreLink: '/de-de/unternehmen/uber-uns',
    solutionsLink: '/de-de/loesungen/steuern-genau-berechnen',
    companyLink: '/de-de/unternehmen/uber-uns',
    supportLink: '/de-de/support-leistungen/kundensupport',
    legalLinks: [
      '/de-de/terms-of-use',
      '/de-de/vertex-privacy-policy',
      '/de-de/digital-accessibility-statement',
      '/de-de/cookie-policy',
      '/de-de/erklaerung-zum-modern-slavery-act',
      '/de-de/impressum',
    ],
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

// Helper: navigate to locale URL, dismiss cookies, and scroll to footer
async function goToFooter(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await dismissCookies(page);
  await page.locator('footer').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
}

for (const locale of locales) {
  test.describe(`Footer - ${locale.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await goToFooter(page, locale.url);
    });

    test(`[${locale.name}] Footer is visible`, async ({ page }) => {
      await expect(page.locator('footer').first()).toBeVisible({ timeout: 10000 });
      console.log(`✅ [${locale.name}] Footer is visible`);
    });

    test(`[${locale.name}] Footer links have valid hrefs`, async ({ page }) => {
      const footerLinks = page.locator('footer').first().locator('a');
      const linkCount = await footerLinks.count();
      expect(linkCount).toBeGreaterThan(20);

      for (let i = 0; i < linkCount; i++) {
        const href = await footerLinks.nth(i).getAttribute('href');
        expect(href).toBeTruthy();
      }
      console.log(`✅ [${locale.name}] All ${linkCount} footer links have valid hrefs`);
    });

    test(`[${locale.name}] Explore column - sample link navigates correctly`, async ({ page }) => {
      const link = page.locator('footer').first().locator(`a[href*="${locale.exploreLink}"]`).first();
      await expect(link).toBeVisible({ timeout: 5000 });
      await link.click();
      await expect(page).toHaveURL(new RegExp(locale.exploreLink), { timeout: 10000 });
      console.log(`✅ [${locale.name}] Explore column link navigated correctly`);
    });

    test(`[${locale.name}] Solutions column - sample link navigates correctly`, async ({ page }) => {
      const link = page.locator('footer').first().locator(`a[href*="${locale.solutionsLink}"]`).first();
      await expect(link).toBeVisible({ timeout: 5000 });
      await link.click();
      await expect(page).toHaveURL(new RegExp(locale.solutionsLink), { timeout: 10000 });
      console.log(`✅ [${locale.name}] Solutions column link navigated correctly`);
    });

    test(`[${locale.name}] Company column - sample link navigates correctly`, async ({ page }) => {
      const link = page.locator('footer').first().locator(`a[href*="${locale.companyLink}"]`).first();
      await expect(link).toBeVisible({ timeout: 5000 });
      await link.click();
      await expect(page).toHaveURL(new RegExp(locale.companyLink), { timeout: 10000 });
      console.log(`✅ [${locale.name}] Company column link navigated correctly`);
    });

    test(`[${locale.name}] Support column - sample link navigates correctly`, async ({ page }) => {
      const link = page.locator('footer').first().locator(`a[href*="${locale.supportLink}"]`).first();
      await expect(link).toBeVisible({ timeout: 5000 });
      await link.click();
      await expect(page).toHaveURL(new RegExp(locale.supportLink), { timeout: 10000 });
      console.log(`✅ [${locale.name}] Support column link navigated correctly`);
    });

    test(`[${locale.name}] Contact Us CTA navigates correctly`, async ({ page }) => {
      const contactCTA = page.locator('footer').first()
        .locator('a')
        .filter({ hasText: locale.contactText })
        .first();
      await expect(contactCTA).toBeVisible({ timeout: 5000 });
      await contactCTA.click();
      await expect(page).toHaveURL(locale.contactUrlPattern, { timeout: 10000 });
      console.log(`✅ [${locale.name}] Contact Us CTA navigated correctly`);
    });

    test(`[${locale.name}] Social icons are visible and have correct URLs`, async ({ page }) => {
      const socialIcons = [
        { name: 'Facebook', urlFragment: 'facebook.com' },
        { name: 'X/Twitter', urlFragment: 'twitter.com' },
        { name: 'LinkedIn', urlFragment: 'linkedin.com' },
        { name: 'YouTube', urlFragment: 'youtube.com' },
        { name: 'Instagram', urlFragment: 'instagram.com' },
      ];

      for (const social of socialIcons) {
        const socialLink = page.locator('footer').first().locator(`a[href*="${social.urlFragment}"]`).first();
        await expect(socialLink).toBeVisible({ timeout: 5000 });
        const href = await socialLink.getAttribute('href');
        expect(href).toContain(social.urlFragment);
        console.log(`✅ [${locale.name}] ${social.name} icon visible: ${href}`);
      }
    });

    test(`[${locale.name}] Phone numbers are present and valid`, async ({ page }) => {
      const phoneLinks = page.locator('footer').first().locator('a[href^="tel:"]');
      const phoneCount = await phoneLinks.count();
      expect(phoneCount).toBeGreaterThan(0);

      for (let i = 0; i < phoneCount; i++) {
        const href = await phoneLinks.nth(i).getAttribute('href');
        expect(href).toMatch(/^tel:/);
        console.log(`✅ [${locale.name}] Phone link verified: ${href}`);
      }
    });

    test(`[${locale.name}] Global Directory - English (UK) link is present`, async ({ page }) => {
      await dismissCookies(page);
      const trigger = page.locator('#reveal-menu-button-4');
      await expect(trigger).toBeVisible({ timeout: 5000 });
      await trigger.click();
      await page.waitForTimeout(500);

      const ukLink = page.locator('#reveal-menu-list-4').locator('a[href*="/en-gb"]').first();
      await expect(ukLink).toBeVisible({ timeout: 5000 });
      const href = await ukLink.getAttribute('href');
      expect(href).toContain('/en-gb');
      console.log(`✅ [${locale.name}] Global Directory English (UK) link verified: ${href}`);
    });

    test(`[${locale.name}] Global Directory - Deutsch (DE) link is present`, async ({ page }) => {
      await dismissCookies(page);
      const trigger = page.locator('#reveal-menu-button-4');
      await expect(trigger).toBeVisible({ timeout: 5000 });
      await trigger.click();
      await page.waitForTimeout(500);

      const deLink = page.locator('#reveal-menu-list-4').locator('a[href*="/de-de"]').first();
      await expect(deLink).toBeVisible({ timeout: 5000 });
      const href = await deLink.getAttribute('href');
      expect(href).toContain('/de-de');
      console.log(`✅ [${locale.name}] Global Directory Deutsch (DE) link verified: ${href}`);
    });

    test(`[${locale.name}] Global Directory - Português (BR) link is present`, async ({ page }) => {
      await dismissCookies(page);
      const trigger = page.locator('#reveal-menu-button-4');
      await expect(trigger).toBeVisible({ timeout: 5000 });
      await trigger.click();
      await page.waitForTimeout(500);

      const brLink = page.locator('#reveal-menu-list-4').locator('a[href*="systax"]').first();
      await expect(brLink).toBeVisible({ timeout: 5000 });
      const href = await brLink.getAttribute('href');
      expect(href).toContain('systax');
      console.log(`✅ [${locale.name}] Global Directory Português (BR) link verified: ${href}`);
    });

    test(`[${locale.name}] Legal links have valid hrefs`, async ({ page }) => {
      for (const path of locale.legalLinks) {
        const link = page.locator('footer').first().locator(`a[href*="${path}"]`).first();
        await expect(link).toBeVisible({ timeout: 5000 });
        const href = await link.getAttribute('href');
        expect(href).toContain(path);
        console.log(`✅ [${locale.name}] Legal link verified: ${href}`);
      }
    });

    test(`[${locale.name}] Copyright text is visible`, async ({ page }) => {
      const copyright = page.locator('footer').first().locator('text=/Copyright|©|Alle Rechte/i').first();
      await expect(copyright).toBeVisible({ timeout: 5000 });
      const copyrightText = await copyright.innerText();
      console.log(`✅ [${locale.name}] Copyright text: "${copyrightText.trim()}"`);
    });
  });
}