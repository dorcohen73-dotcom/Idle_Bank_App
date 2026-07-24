const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 500, height: 900 } });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));

  await page.goto('http://localhost:8934/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: '__verify_initial.png' });
  const activeModals = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.modal-overlay.active')).map(m => m.id || m.className);
  });
  console.log('ACTIVE MODALS:', activeModals);
  const bottomNavHtml = await page.evaluate(() => {
    const nav = document.querySelector('.bottom-nav, #bottom-nav, .tabs, .tab-bar');
    return nav ? nav.outerHTML.slice(0, 2000) : 'NO NAV FOUND';
  });
  console.log('NAV HTML:', bottomNavHtml);

  const html = await page.content();
  require('fs').writeFileSync('__verify_dump.html', html);

  const cardInfo = await page.evaluate(() => {
    const cards = document.querySelectorAll('.upg-v2-stats-glass-box');
    if (!cards.length) return { count: 0 };
    const first = cards[0];
    return {
      count: cards.length,
      html: first.outerHTML
    };
  });
  console.log('CARD INFO:', JSON.stringify(cardInfo, null, 2));

  await page.screenshot({ path: '__verify_screenshot.png', fullPage: false });
  await browser.close();
})();
