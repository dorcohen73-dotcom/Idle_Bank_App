const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/index.html');
  await page.waitForTimeout(1000);
  
  // Try to click the missions tab using the text "משימות" or id
  await page.evaluate(() => {
    const tabBtn = document.querySelector('.tab-btn[data-target="missions"]');
    if (tabBtn) tabBtn.click();
  });
  
  await page.waitForTimeout(1000);
  
  const rects = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#tab-missions .mission-card'));
    return cards.map(c => {
      const rect = c.getBoundingClientRect();
      const actionZone = c.querySelector('.mission-action-zone');
      const actionRect = actionZone ? actionZone.getBoundingClientRect() : null;
      return {
        id: c.dataset.missionId,
        cardHeight: c.offsetHeight,
        cardCssHeight: window.getComputedStyle(c).height,
        cardIsFlex: window.getComputedStyle(c).display === 'flex',
        cardFlexDirection: window.getComputedStyle(c).flexDirection,
        border: window.getComputedStyle(c).border,
        rect: { top: rect.top, bottom: rect.bottom, height: rect.height },
        actionZone: actionRect ? {
           top: actionRect.top,
           bottom: actionRect.bottom,
           height: actionRect.height,
           isInsideParent: actionRect.bottom <= rect.bottom
        } : null,
        children: Array.from(c.children).map(child => ({
          className: child.className,
          top: child.getBoundingClientRect().top - rect.top,
          height: child.offsetHeight,
          isAbsolute: window.getComputedStyle(child).position === 'absolute'
        }))
      };
    });
  });
  console.log(JSON.stringify(rects, null, 2));
  await browser.close();
})();
