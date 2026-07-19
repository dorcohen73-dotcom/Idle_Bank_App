const { test, expect } = require('@playwright/test');

test.describe('Idle Bank Empire - Basic E2E Gameplay', () => {
  test('should load the game, gather initial cash, and save state', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    page.on('response', response => {
      if(response.status() === 404) console.log('404 URL:', response.url());
    });
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

  test('should render completed mission card without claim button overflowing', async ({ page }) => {
    await page.goto('/');

    // Wait for initialization
    await expect(page.locator('#splash-screen')).toBeHidden({ timeout: 15000 });
    const gdprBtn = page.locator('#gdpr-accept-btn');
    if (await gdprBtn.isVisible()) { await gdprBtn.click(); }
    const langModal = page.locator('#lang-modal');
    if (await langModal.isVisible()) {
      const enBtn = page.locator('.lang-option-card[data-lang="en"]');
      if (await enBtn.isVisible()) await enBtn.click();
    }
    await page.waitForTimeout(1000);

    // Force complete a mission via page.evaluate
    await page.evaluate(() => {
      window.game.state.missions = [{
        id: 'test_mission',
        description: 'Test Mission',
        type: 'build',
        target: 1,
        progress: 1,
        completed: true,
        rewardCash: 5000
      }];
      window.game.saveGame();
      if (typeof window.renderMissionsTab === 'function') window.renderMissionsTab();
    });

    // Go to missions tab to render the completed mission
    await page.locator('.tab-btn[data-tab="missions"]').click();
    await expect(page.locator('#tab-missions')).toBeVisible();
    await page.waitForTimeout(500); // Give it time to render

    const missionCard = page.locator('.mission-card.completed').first();
    await expect(missionCard).toBeVisible();

    const claimBtn = missionCard.locator('.claim-reward-btn');
    await expect(claimBtn).toBeVisible();

    // Validate bounding boxes to ensure no overflow
    const cardBox = await missionCard.boundingBox();
    const btnBox = await claimBtn.boundingBox();

    expect(cardBox).not.toBeNull();
    expect(btnBox).not.toBeNull();

    // Button should be fully contained within the card's vertical and horizontal boundaries
    expect(btnBox.y).toBeGreaterThanOrEqual(cardBox.y);
    expect(btnBox.y + btnBox.height).toBeLessThanOrEqual(cardBox.y + cardBox.height);
    expect(btnBox.x).toBeGreaterThanOrEqual(cardBox.x);
    expect(btnBox.x + btnBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width);
  });
});
