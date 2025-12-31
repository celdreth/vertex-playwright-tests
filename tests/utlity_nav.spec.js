import { test, expect } from '@playwright/test';

const locales = [
  { 
    name: 'US', 
    url: 'https://test-vertexinc.pantheonsite.io/',
    exchange: /Exchange|Vertex Exchange/i,
    directory: /Directory|Global Directory/i,
    login: /Log In/i,
    search: /Search/i
  },
  { 
    name: 'UK', 
    url: 'https://test-vertexinc.pantheonsite.io/en-gb/',
    exchange: /Exchange|Vertex Exchange/i,
    directory: /Directory|Global Directory/i,
    login: /Log In/i,
    search: /Search/i
  },
  { 
    name: 'DE', 
    url: 'https://test-vertexinc.pantheonsite.io/de-de/',
    exchange: /Exchange|Vertex Exchange/i,  
    directory: /Verzeichnis|Globales Verzeichnis/i, 
    login: /Einloggen/i,
    search: /Suchen/i
  }
];

test.describe('Utility Nav - Multi-Locale', () => {
  for (const locale of locales) {
    test(`Verify Utility Nav - ${locale.name}`, async ({ page }) => {
      console.log(`[${locale.name}] Navigating to site...`);
      
      await page.goto(locale.url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });

      // Cookie handling
      console.log(`[${locale.name}] Checking for cookie overlays...`);
      const cookieSelectors = [
        '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
        '#onetrust-accept-btn-handler',
        'button:has-text("Accept All")',
        'button:has-text("Allow all")',
        'button:has-text("Agree")',
        'button:has-text("Alle akzeptieren")',  // German
        'button:has-text("Akzeptieren")'        // German variant
      ];

      for (const selector of cookieSelectors) {
        try {
          const btn = page.locator(selector);
          if (await btn.isVisible({ timeout: 5000 })) {
            await btn.click();
            console.log(`[${locale.name}] Accepted cookies via: ${selector}`);
            await page.waitForTimeout(2000);
            break; 
          }
        } catch (e) { }
      }

      await page.waitForLoadState('networkidle');

      // Verify nav items with locale-specific text
      console.log(`[${locale.name}] Checking Utility Navigation items...`);
      
      const items = [
        { 
          label: 'Vertex Exchange', 
          locator: page.getByRole('link', { name: locale.exchange }) 
        },
        { 
          label: 'Global Directory', 
          locator: page.getByRole('link', { name: locale.directory }) 
        },
        { 
          label: 'Log In', 
          locator: page.getByRole('link', { name: locale.login }) 
        }
      ];

      for (const item of items) {
        try {
          const target = item.locator.first();
          await expect(target).toBeVisible({ timeout: 15000 });
          console.log(`✅ [${locale.name}] Found: ${item.label}`);
        } catch (err) {
          console.error(`❌ [${locale.name}] Failed to find: ${item.label}`);
          await page.screenshot({ path: `failure-${locale.name}-${item.label.replace(/\s+/g, '')}.png` });
          throw err;
        }
      }

      // Search button
      const search = page.getByRole('button', { name: locale.search })
        .or(page.getByLabel(locale.search))
        .or(page.locator('.search-toggle'));
        
      await expect(search.first()).toBeVisible({ timeout: 10000 });
      console.log(`✅ [${locale.name}] Found: Search`);

      console.log(`✅ [${locale.name}] Smoke test completed successfully.`);
    });
  }
});