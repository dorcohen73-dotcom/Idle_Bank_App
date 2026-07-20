import { beforeEach, describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

global.window = {
    location: { search: '' }
};

global.document = {
    body: {
        classList: {
            add: (c) => { global.document.body.classes.add(c); },
            remove: (c) => { global.document.body.classes.delete(c); }
        },
        classes: new Set()
    }
};

if (!global.navigator) {
    global.navigator = {};
}
Object.defineProperty(global.navigator, 'deviceMemory', { value: undefined, writable: true });
Object.defineProperty(global.navigator, 'hardwareConcurrency', { value: undefined, writable: true });

const pmCode = fs.readFileSync(path.resolve(__dirname, '..', 'performance-manager.js'), 'utf8');
new Function('window', 'document', 'navigator', pmCode + '\nwindow.PerformanceManager = PerformanceManager;')(global.window, global.document, global.navigator);

const PerformanceManager = global.window.PerformanceManager;

describe('PerformanceManager auto logic', () => {
    beforeEach(() => {
        global.document.body.classes.clear();
        global.window.location.search = '';
        global.navigator.deviceMemory = undefined;
        global.navigator.hardwareConcurrency = undefined;
    });

    test('auto should use eco if fps < 45', () => {
        PerformanceManager.apply('auto', 44);
        expect(PerformanceManager.isEco()).toBe(true);
        expect(global.document.body.classes.has('perf-eco')).toBe(true);
    });

    test('auto should use full if fps >= 45', () => {
        PerformanceManager.apply('auto', 60);
        expect(PerformanceManager.isEco()).toBe(false);
        expect(global.document.body.classes.has('perf-eco')).toBe(false);
    });

    test('auto should use eco if memory <= 2 and cores <= 4', () => {
        global.navigator.deviceMemory = 2;
        global.navigator.hardwareConcurrency = 4;
        PerformanceManager.apply('auto', undefined);
        expect(PerformanceManager.isEco()).toBe(true);
    });

    test('auto should use full if memory > 2 or cores > 4', () => {
        global.navigator.deviceMemory = 4;
        global.navigator.hardwareConcurrency = 8;
        PerformanceManager.apply('auto', undefined);
        expect(PerformanceManager.isEco()).toBe(false);
    });
});
