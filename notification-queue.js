// Central coordinator for automatic (non-user-initiated) pop-ups: language modal,
// offline earnings, daily login reward, weekly reward, random events.
// Ensures they show one at a time instead of stacking on first load.
(function () {
    const PRIORITY = { CRITICAL: 0, IMPORTANT: 1, CASUAL: 2 };
    const POLL_MS = 1200;
    const BREATHE_MS = 15000;

    const queue = [];
    let activeId = null;
    let pollTimer = null;

    function isAnyModalOpen() {
        return !!document.querySelector('.modal-overlay.active');
    }

    function schedulePoll() {
        if (pollTimer) return;
        pollTimer = setTimeout(() => {
            pollTimer = null;
            tryProcessNext();
        }, POLL_MS);
    }

    function tryProcessNext() {
        if (activeId) return;
        if (queue.length === 0) return;
        if (isAnyModalOpen()) { schedulePoll(); return; }

        queue.sort((a, b) => a.priority - b.priority);
        const next = queue.shift();
        activeId = next.id;
        next.showFn();
    }

    // Request to show a pop-up identified by `id`. `showFn` must itself add the
    // 'active' class to the relevant .modal-overlay once it's this item's turn.
    // opts.dropIfBusy: silently drop instead of queueing (for low-value/casual pop-ups
    // whose content would go stale if shown minutes later, e.g. random events).
    function request(id, priority, showFn, opts) {
        opts = opts || {};
        if (activeId === id) return false;
        if (queue.some(q => q.id === id)) return false;
        if (opts.dropIfBusy && (activeId !== null || queue.length > 0 || isAnyModalOpen())) return false;

        queue.push({ id, priority, showFn });
        tryProcessNext();
        return true;
    }

    // Called whenever a tracked modal-overlay loses its 'active' class, so the
    // queue can move on to the next item. Wired generically via MutationObserver
    // in ui-events.js — no need to call this manually from individual close handlers.
    function notifyClosed(id) {
        if (activeId !== id) return;
        activeId = null;
        setTimeout(tryProcessNext, BREATHE_MS);
    }

    window.NotificationQueue = { PRIORITY, request, notifyClosed };
})();
