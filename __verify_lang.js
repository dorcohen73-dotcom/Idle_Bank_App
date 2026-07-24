const { chromium } = require('playwright-core');

(async () => {
    console.log('launching...');
    const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    console.log('launched');
    const results = {};

    for (const lang of ['en', 'es', 'ru']) {
        console.log('lang', lang, 'start');
        const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
        await page.goto('http://localhost:8934/index.html', { timeout: 15000 });
        console.log('lang', lang, 'loaded');

        // Fresh state + preset language, then reload so init logic runs organically.
        await page.evaluate((l) => {
            localStorage.clear();
            localStorage.setItem('idle_bank_language_chosen', 'true');
            localStorage.setItem('idle_bank_lang', l);
        }, lang);
        await page.reload();
        await page.waitForTimeout(1500);

        // Force game state language directly too, in case storage key name differs, then re-render tabs.
        await page.evaluate((l) => {
            if (window.game && window.game.state) {
                window.game.state.language = l;
                if (typeof window.applyLanguage === 'function') window.applyLanguage(l);
            }
        }, lang);
        await page.waitForTimeout(300);

        // Give some cash so branch prestige math doesn't error, then open branches tab.
        await page.evaluate(() => {
            if (window.game) {
                window.game.state.cash = 100;
                if (typeof window.renderBranchesTab === 'function') window.renderBranchesTab();
            }
        });
        await page.waitForTimeout(300);

        // Click branches tab button if present.
        const branchesBtn = await page.$('[data-tab="branches"], #tab-btn-branches, .tab-btn[data-tab-target="branches"]');
        if (branchesBtn) await branchesBtn.click().catch(()=>{});
        await page.waitForTimeout(500);

        const branchesHtml = await page.evaluate(() => {
            const el = document.getElementById('tab-branches');
            return el ? el.innerText : null;
        });

        // Upgrades tab (teller/guard locked + queue badge)
        const upgradesBtn = await page.$('[data-tab="upgrades"], #tab-btn-upgrades, .tab-btn[data-tab-target="upgrades"]');
        if (upgradesBtn) await upgradesBtn.click().catch(()=>{});
        await page.waitForTimeout(500);
        const upgradesHtml = await page.evaluate(() => {
            const el = document.getElementById('tab-upgrades');
            return el ? el.innerText : null;
        });

        results[lang] = { branchesHtml, upgradesHtml };
        await page.screenshot({ path: `__verify_${lang}_branches.png` });
        await page.close();
    }

    console.log(JSON.stringify(results, null, 2));
    await browser.close();
    process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
