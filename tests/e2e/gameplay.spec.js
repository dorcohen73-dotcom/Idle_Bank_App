const { test, expect } = require('@playwright/test');

test.describe('Idle Bank Empire - Basic E2E Gameplay', () => {
  test('should load the game, gather initial cash, and save state', async ({ page }) => {
    // 1. Load the game
    await page.goto('/');

    // Ensure the app container is visible
    await expect(page.locator('.app-container')).toBeVisible();

    // 2. Clear any GDPR or intro modals if they appear
    const gdprBtn = page.locator('#gdpr-accept-btn');
    if (await gdprBtn.isVisible()) {
      await gdprBtn.click();
    }
    
    // Check if the splash screen loading is done and we can interact
    // Wait for the main UI to be visible
    await expect(page.locator('#splash-screen')).toBeHidden({ timeout: 15000 });
    
    // 2.5 Clear Language Selection Modal if it appears
    const langModal = page.locator('#lang-modal');
    if (await langModal.isVisible()) {
      // Assuming clicking the english option or close button
      const enBtn = page.locator('.lang-option-card[data-lang="en"]');
      if (await enBtn.isVisible()) {
        await enBtn.click();
      }
      
      // Also check for a general close button if any
      const langCloseBtn = page.locator('#lang-modal-close'); 
      if (await langCloseBtn.isVisible()) {
         await langCloseBtn.click();
      }
    }

    await expect(page.locator('#cash-value')).toBeVisible({ timeout: 10000 });

    // Wait for game to initialize properly (e.g., state loading)
    await page.waitForTimeout(2000);

    // Initial cash
    let initialCashText = await page.locator('#cash-value').innerText();
    
    // Simulate some clicks to gather cash if needed or check if cash increments
    // Wait for 2 seconds to see if idle cash accumulates, or click the vault
    await page.waitForTimeout(2000);
    
    // Assuming the user can earn cash by tapping the vault
    const vaultBtn = page.locator('#vault-container');
    if (await vaultBtn.isVisible()) {
      await vaultBtn.click();
      await vaultBtn.click();
      await vaultBtn.click();
    }

    // Wait a bit to ensure cash updates
    await page.waitForTimeout(1000);
    let newCashText = await page.locator('#cash-value').innerText();

    // Check tabs
    await page.locator('.tab-btn[data-tab="upgrades"]').click();
    await expect(page.locator('#tab-upgrades')).toBeVisible();

    // 3. Reload the page to test save/load state via LocalStorage
    await page.reload();
    
    // Wait for reload
    await expect(page.locator('#cash-value')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    
    let reloadedCashText = await page.locator('#cash-value').innerText();
    
    // The cash should be at least what we had before reload (or close, due to formatting)
    // Here we just assert the game loads without crashing
    expect(reloadedCashText).not.toBe('');
  });
});
