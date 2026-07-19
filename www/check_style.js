const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/index.html');
  await page.waitForTimeout(1000);
  const rects = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#tab-missions .mission-card'));
    return cards.map(c => ({
      id: c.dataset.missionId,
      height: c.offsetHeight,
      cssHeight: window.getComputedStyle(c).height,
      cssMaxHeight: window.getComputedStyle(c).maxHeight,
      isFlex: window.getComputedStyle(c).display,
      flexDirection: window.getComputedStyle(c).flexDirection,
      children: Array.from(c.children).map(child => ({
        className: child.className,
        top: child.getBoundingClientRect().top - c.getBoundingClientRect().top,
        height: child.offsetHeight,
        isAbsolute: window.getComputedStyle(child).position === 'absolute'
      }))
    }));
  });
  console.log(JSON.stringify(rects, null, 2));
  await browser.close();
})();
