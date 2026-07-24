const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new'
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    
    const filePath = 'file:///' + path.resolve(__dirname, '../www/index.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    // Check if bottom nav is clickable
    console.log("Clicking missions tab...");
    await page.click('#bnav-missions');
    
    // Wait a bit
    await new Promise(r => setTimeout(r, 500));
    
    // Check what is active
    const activeTab = await page.evaluate(() => {
        const activeBnav = document.querySelector('.bottom-nav-btn.active');
        const activeTabContent = document.querySelector('.tab-pane.active');
        return {
            bnav: activeBnav ? activeBnav.id : null,
            pane: activeTabContent ? activeTabContent.id : null
        };
    });
    
    console.log('Active elements:', activeTab);
    await browser.close();
})();
