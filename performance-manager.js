class PerformanceManager {
    static _isEco = false;

    static probe() {
        return new Promise((resolve) => {
            let frames = 0;
            let startTime = performance.now();
            let lastTime = startTime;
            const duration = 1500; // 1.5 seconds

            const tick = (now) => {
                frames++;
                if (now - startTime < duration) {
                    requestAnimationFrame(tick);
                } else {
                    const elapsed = now - startTime;
                    const fps = Math.round((frames / elapsed) * 1000);
                    resolve(fps);
                }
            };
            requestAnimationFrame(tick);
        });
    }

    static apply(mode, fps) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlMode = urlParams.get('perf');
        if (urlMode === 'eco' || urlMode === 'full') {
            mode = urlMode;
        }

        if (mode === 'eco') {
            this._isEco = true;
        } else if (mode === 'full') {
            this._isEco = false;
        } else {
            // 'auto'
            const memory = navigator.deviceMemory || Infinity;
            const cores = navigator.hardwareConcurrency || Infinity;
            
            if ((fps !== undefined && fps < 45) || (memory <= 2 && cores <= 4)) {
                this._isEco = true;
            } else {
                this._isEco = false;
            }
        }

        if (this._isEco) {
            document.body.classList.add('perf-eco');
        } else {
            document.body.classList.remove('perf-eco');
        }
    }

    static isEco() {
        return this._isEco;
    }
}

window.PerformanceManager = PerformanceManager;
