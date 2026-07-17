# Idle Bank - Debugging Context for Claude

## The Problem
The user is experiencing an issue where Tellers 2-8 (and possibly Teller 1) are stuck showing $0 for their stored cash (	.cashStored). 
The game logic appears to be assigning customers to them, and they are supposed to generate cash progressively over time. However, the UI continues to display 0, or the cash is instantly disappearing. The user reports: "The money doesn't update, it says 0 all the time, maybe it's because the guard collects the money very fast".

## What we know:
1. The UI button for collection remains "Yellow" (meaning 	Data.cashStored <= 0 evaluates to alse in ui-draw.js, which implies the value is > 0 OR is NaN).
2. We added heavy isNaN protections in game.js and save-manager.js to ensure NaN defaults to 0 and recovers, but the user still reports it's broken.
3. The Guard's capacity is extremely high (~7.5 Trillion) while the Teller's capacity is lower (~1.8 Billion). The Guard visits each teller for 0.4 seconds and collects Math.min(teller.cashStored, spaceLeft).
4. We suspect there might be an issue where the Guard is instantly zeroing out the Teller before the UI can render it, OR there is a deeper JS type coercion/state mutation bug causing the value to fail formatting in ormatMoney().

## Core Files & Logic
### 1. game.js - The Tick Loop (Teller Cash Generation)
\\\javascript
// finalRewardForTick is roughly ~240M
let baseRewardForTick = this.getCurrentBaseReward();
if (isNaN(baseRewardForTick) || baseRewardForTick < 0) baseRewardForTick = 0;
let totalMult = this.getTotalMultiplier();
if (isNaN(totalMult) || totalMult < 1) totalMult = 1;
const finalRewardForTick = baseRewardForTick * totalMult;

this.state.tellers.forEach(t => {
    if (t.unlocked && t.isProcessing) {
        let speed = this.getTellerSpeed(t.level);
        if (isNaN(speed) || speed <= 0) speed = 1;
        
        if (isNaN(t.processingTimeLeft)) t.processingTimeLeft = 0;
        const actualDt = Math.min(dt, t.processingTimeLeft);
        
        let addedCash = (actualDt / speed) * finalRewardForTick;
        if (isNaN(addedCash)) addedCash = 0;
        
        if (isNaN(t.cashStored)) t.cashStored = 0;
        t.cashStored = Math.round((t.cashStored + addedCash + Number.EPSILON) * 100) / 100;
        
        let cap = this.getTellerCapacity(t.level);
        if (isNaN(cap)) cap = 1000000;
        if (t.cashStored > cap) {
            t.cashStored = cap;
        }
        
        t.processingTimeLeft -= dt;
        if (t.processingTimeLeft <= 0) {
            t.isProcessing = false;
            t.processingTimeLeft = 0;
            this.stats.clientsServed++;
        }
    }
});
\\\

### 2. game.js - Guard Collection Logic
\\\javascript
} else if (g.state.startsWith('collecting_from_teller_')) {
    g.timer -= dt;
    if (g.timer <= 0) {
        const ti = parseInt(g.state.slice('collecting_from_teller_'.length), 10);
        const teller = this.state.tellers[ti];
        if (teller && teller.unlocked && teller.cashStored > 0) {
            const spaceLeft = capacity - g.carriedAmount;
            const taken = Math.min(teller.cashStored, spaceLeft);
            teller.cashStored = Math.round((teller.cashStored - taken + Number.EPSILON) * 100) / 100;
            g.carriedAmount = Math.round((g.carriedAmount + taken + Number.EPSILON) * 100) / 100;
        }
//... transitions to next teller
\\\

### 3. ui-draw.js - Rendering the Cash
\\\javascript
const isDisabled = tData.cashStored <= 0 || vaultSpace <= 0;
if (isDisabled) {
    collectBtn.classList.add('disabled');
    collectBtn.classList.remove('btn-yellow');
} else {
    collectBtn.classList.remove('disabled');
    collectBtn.classList.add('btn-yellow');
}

// Rendering text:
const formattedCash = isNaN(tData.cashStored) ? "NAN!" : formatMoney(tData.cashStored);
const newCashHtml = <span style="...">\</span>\;
cashLabel.innerHTML = newCashHtml;
\\\

## What we need from Claude:
Please analyze the game.js tick loop, the Guard collection logic, and the UI rendering logic. 
Why would a Teller's UI persistently display $0 (with a yellow collection button) when it should be generating roughly 240M cash per tick, knowing that the Guard sweeps the tellers? Is there a race condition, a cache desync, or a floating-point/NaN coercion bug that we missed?
