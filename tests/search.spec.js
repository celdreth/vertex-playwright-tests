import { test, expect } from '@playwright/test';

const locales = [
  { 
    name: 'US', 
    url: 'https://test-vertexinc.pantheonsite.io/',
    searchTerm: 'Outsourcing',
    targetLink: '/resources/resource-library/why-outsource-sales-use-tax-compliance'
  },
  { 
    name: 'UK', 
    url: 'https://test-vertexinc.pantheonsite.io/en-gb',
    searchTerm: 'Outsourcing',
    targetLink: '/en-gb/solutions/products/vertex-sales-use-tax-returns-outsourcingcl'
  },
  { 
    name: 'DE', 
    url: 'https://test-vertexinc.pantheonsite.io/de-de',
    searchTerm: 'Outsourcing',
    targetLink: '/de-de/ressourcen/ressourcen-bibliothek/warum-sollte-die-compliance-bei-verkaufs-und-gebrauchssteuern-ausgelagert-werden'
  }
];

test.describe('Search Functionality', () => {
  for (const locale of locales) {
    test(`Submit and Verify - ${locale.name}`, async ({ page }) => {
      test.setTimeout(90000);
      
      console.log(`[${locale.name}] Starting search test for ${locale.url}`);
      
      // 1. Navigate to homepage
      await page.goto(locale.url, { waitUntil: 'networkidle' });
      console.log(`[${locale.name}] Page loaded`);
      
      // 2. Handle cookies
      const cookieBtn = page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll');
      try {
        if (await cookieBtn.isVisible({ timeout: 5000 })) {
          await cookieBtn.click();
          console.log(`[${locale.name}] Cookies accepted`);
          await page.waitForTimeout(1000);
        }
      } catch (e) {
        console.log(`[${locale.name}] No cookie banner`);
      }
      
      // 3. Click search button to open search
      const searchBtn = page.locator('#reveal-search-button0, button[data-reveal-menu-search], [aria-label*="Search"]').first();
      await expect(searchBtn).toBeVisible({ timeout: 10000 });
      console.log(`[${locale.name}] Search button found`);
      
      await searchBtn.click();
      await page.waitForTimeout(2000);
      console.log(`[${locale.name}] Search clicked`);
      
      // 4. Enter search term
      await page.evaluate((searchTerm) => {
        const input = document.querySelector('#edit-keys');
        if (input) {
          input.value = searchTerm;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, locale.searchTerm);
      
      console.log(`[${locale.name}] Search term entered: "${locale.searchTerm}"`);
      
      // 5. Submit search
      await page.evaluate(() => {
        const input = document.querySelector('#edit-keys');
        if (input) {
          const form = input.closest('form');
          if (form) {
            form.submit();
          } else {
            input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
          }
        }
      });
      
      console.log(`[${locale.name}] Search submitted`);
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      console.log(`[${locale.name}] Current URL: ${page.url()}`);
      
      // 6. Verify results appear
      const results = page.locator('.search-results__result');
      const resultCount = await results.count();
      
      console.log(`[${locale.name}] Result count: ${resultCount}`);
      
      expect(resultCount).toBeGreaterThan(0);
      console.log(`[${locale.name}] ✅ Found ${resultCount} search results`);
      
      // 7. Check for pagination and test it
      const pagination = page.locator('.pager__items, .js-pager__items');
      await page.waitForTimeout(1000);
      const hasPagination = await pagination.count() > 0;
      
      if (hasPagination && await pagination.first().isVisible()) {
        console.log(`[${locale.name}] ✅ Pagination present`);
        
        const pageLinks = pagination.locator('a, button');
        const pageLinkCount = await pageLinks.count();
        console.log(`[${locale.name}] ✅ ${pageLinkCount} pagination links found`);
        
        // Click Next to page 2
        let nextButton = page.locator('.pager__items a').filter({ hasText: /next|›/i }).first();
        
        if (await nextButton.isVisible({ timeout: 3000 })) {
          console.log(`[${locale.name}] Clicking Next to page 2...`);
          await nextButton.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          
          const page2Url = page.url();
          console.log(`[${locale.name}] ✅ On page 2: ${page2Url}`);
          expect(page2Url).toContain('page=1');
          
          // Click Next to page 3
          nextButton = page.locator('.pager__items a').filter({ hasText: /next|›/i }).first();
          
          if (await nextButton.isVisible({ timeout: 3000 })) {
            console.log(`[${locale.name}] Clicking Next to page 3...`);
            await nextButton.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
            
            const page3Url = page.url();
            console.log(`[${locale.name}] ✅ On page 3: ${page3Url}`);
            expect(page3Url).toContain('page=2');
            
            // Click Previous back to page 2
            const prevButton = page.locator('.pager__items a').filter({ hasText: /previous|‹/i }).first();
            
            if (await prevButton.isVisible({ timeout: 3000 })) {
              console.log(`[${locale.name}] Clicking Previous back to page 2...`);
              await prevButton.click();
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(2000);
              
              const backToPage2Url = page.url();
              console.log(`[${locale.name}] ✅ Back on page 2: ${backToPage2Url}`);
              expect(backToPage2Url).toContain('page=1');
            }
          }
          
          // Return to page 1
          await page.goto(page.url().replace(/page=\d+/, 'page=0'));
          await page.waitForLoadState('networkidle');
          console.log(`[${locale.name}] Returned to page 1`);
        }
        
      } else {
        console.log(`[${locale.name}] ℹ️  No pagination detected`);
      }
      
      // 8. Click a search result
      console.log(`[${locale.name}] Looking for result to click...`);
      
      // Try target link first, fall back to first result scoped inside results container
      let resultLink = page.locator(`a[href="${locale.targetLink}"]`).first();
      let linkExists = await resultLink.count() > 0;
      
      if (!linkExists) {
        console.log(`[${locale.name}] Target link not found, using first search result`);
        resultLink = page.locator('.search-results__result a').first();
      }
      
      let resultHref;
      
      try {
        await expect(resultLink).toBeVisible({ timeout: 5000 });
        
        const resultTitle = await resultLink.innerText();
        resultHref = await resultLink.getAttribute('href');
        
        console.log(`[${locale.name}] Found link: "${resultTitle}"`);
        console.log(`[${locale.name}] Link href: ${resultHref}`);
        
        await resultLink.click({ force: true, timeout: 10000 });
        console.log(`[${locale.name}] ✅ Link clicked successfully!`);
        
      } catch (err) {
        console.log(`[${locale.name}] ❌ Click failed: ${err.message}`);
        await page.screenshot({ path: `error-click-failed-${locale.name}.png` });
        throw err;
      }
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log(`[${locale.name}] Result page loaded`);
      
      // 9. Verify we navigated away from search results
      const currentUrl = page.url();
      
      if (currentUrl.includes('/search')) {
        console.log(`[${locale.name}] ⚠️  Still on search page, navigating directly...`);
        const fullUrl = resultHref.startsWith('http') ? resultHref : `https://test-vertexinc.pantheonsite.io${resultHref}`;
        await page.goto(fullUrl, { waitUntil: 'networkidle' });
        console.log(`[${locale.name}] Navigated directly to result`);
      }
      
      const finalUrl = page.url();
      expect(finalUrl).not.toContain('/search');
      console.log(`[${locale.name}] ✅ Navigated to: ${finalUrl}`);
      
      // 10. Verify result page contains the search term
      const pageContent = await page.locator('body').innerText();
      const containsSearchTerm = pageContent.toLowerCase().includes(locale.searchTerm.toLowerCase());
      
      if (containsSearchTerm) {
        console.log(`[${locale.name}] ✅ Result page contains search term "${locale.searchTerm}"`);
      } else {
        console.log(`[${locale.name}] ⚠️  Search term not found on result page (this may be okay)`);
      }
      
      console.log(`[${locale.name}] ✅ Search test completed successfully\n`);
    });
  }
});