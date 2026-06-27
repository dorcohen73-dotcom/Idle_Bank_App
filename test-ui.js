const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            defaultViewport: { width: 390, height: 844, isMobile: true } // iPhone 12 Pro dimensions
        });
        const page = await browser.newPage();
        
        // Log console messages from the page
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        
        console.log('Loading page...');
        await page.goto('file:///' + __dirname.replace(/\\/g, '/') + '/index.html', { waitUntil: 'networkidle0' });
        
        console.log('Waiting for game to initialize...');
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('Hiring operations manager to trigger guard movement...');
        await page.evaluate(() => {
            if (window.game) {
                window.game.state.cash = 100000;
                window.game.state.managers.operations = { level: 1 };
                // Add money to tellers to trigger collection
                window.game.state.tellers.forEach(t => t.cashStored = 1000);
            }
        });
        
        console.log('Waiting for guard to move...');
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('Taking screenshot...');
        await page.screenshot({ path: 'test_screenshot.png', fullPage: true });
        
        console.log('Checking guard DOM...');
        const guardInfo = await page.evaluate(() => {
            return `Guards length: ${window.game.state.guards.length}, Unlocked: ${window.game.state.guards.filter(g => g.unlocked).length}`;
        });
        console.log('Guard State Info:', guardInfo);
        
        const guardDOMInfo = await page.evaluate(() => {
            const runner = document.querySelector('.guard-runner');
            if (!runner) return 'NO GUARD FOUND IN DOM';
            const rect = runner.getBoundingClientRect();
            return `Guard found. Rect: x=${rect.x}, y=${rect.y}, w=${rect.width}, h=${rect.height}. Display: ${window.getComputedStyle(runner).display}, Visibility: ${window.getComputedStyle(runner).visibility}, Z-index: ${window.getComputedStyle(runner).zIndex}`;
        });
        console.log('Guard DOM Info:', guardDOMInfo);
        
        const pathInfo = await page.evaluate(() => {
            const p = document.getElementById('security-path');
            if (!p) return 'NO PATH FOUND';
            const rect = p.getBoundingClientRect();
            return `Path Rect: x=${rect.x}, y=${rect.y}, w=${rect.width}, h=${rect.height}. Display: ${window.getComputedStyle(p).display}`;
        });
        console.log('Path Info:', pathInfo);

        await browser.close();
        console.log('Done!');
    } catch (err) {
        console.error('Error:', err);
    }
})();
