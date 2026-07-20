const { test, expect } = require('@playwright/test');

test.describe('Performance Mode URL Overrides', () => {
  test('loading with ?perf=eco should add perf-eco class to body', async ({ page }) => {
    await page.goto('/?perf=eco');
    await expect(page.locator('body')).toHaveClass(/perf-eco/);
  });

  test('loading with ?perf=full should not have perf-eco class on body', async ({ page }) => {
    await page.goto('/?perf=full');
    await expect(page.locator('body')).not.toHaveClass(/perf-eco/);
  });
});
