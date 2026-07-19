const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Just load the exact same HTML the user is loading
  await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/index.html');
  
  // wait for it to render
  await page.waitForTimeout(2000);
  
  // Try to click the missions tab
  await page.evaluate(() => {
    const tabBtn = document.querySelector('.tab-btn[data-target="missions"]');
    if (tabBtn) tabBtn.click();
  });
  
  await page.waitForTimeout(2000);
  
  // take screenshot of the first completed card
  const card = await page.$('#tab-missions .mission-card.completed');
  if (card) {
      await card.screenshot({ path: 'card_test.png' });
      console.log('Saved card_test.png');
  } else {
      console.log('No completed card found. Maybe no missions are complete?');
      // Set a mission to complete and click claim!
      await page.evaluate(() => {
          if (window.game && window.game.state) {
             const m = window.game.state.missions[0];
             m.progress = m.target;
             m.completed = true;
          }
      });
      // Click a different tab and back to force re-render
      await page.evaluate(() => {
          document.querySelector('.tab-btn[data-target="achievements"]').click();
      });
      await page.waitForTimeout(500);
      await page.evaluate(() => {
          document.querySelector('.tab-btn[data-target="missions"]').click();
      });
      await page.waitForTimeout(1000);
      const card2 = await page.$('#tab-missions .mission-card.completed');
      if (card2) {
          await card2.screenshot({ path: 'card_test.png' });
          console.log('Saved card_test.png after forcing completion');
      } else {
          console.log('Still no completed card found.');
      }
  }
  await browser.close();
})();
