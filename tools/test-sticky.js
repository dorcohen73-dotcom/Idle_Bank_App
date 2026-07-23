const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new'
    });
    const page = await browser.newPage();
    
    // Add custom styles to force sticky
    await page.evaluateOnNewDocument(() => {
        const style = document.createElement('style');
        style.textContent = 
            .bottom-nav {
                position: sticky !important;
                bottom: 45px !important;
                margin-top: auto !important;
            }
        ;
        document.head.appendChild(style);
    });

    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    const filePath = 'file:///' + path.resolve(__dirname, '../www/index.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    const rect = await page.evaluate(() => {
        return document.querySelector('.bottom-nav').getBoundingClientRect();
    });
    
    console.log('Sticky Bottom Nav Rect at scroll Y=0:', rect);
    
    // Scroll down 500px
    await page.evaluate(() => window.scrollBy(0, 500));
    
    const rect2 = await page.evaluate(() => {
        return document.querySelector('.bottom-nav').getBoundingClientRect();
    });
    console.log('Sticky Bottom Nav Rect at scroll Y=500:', rect2);
    
    await browser.close();
})();
