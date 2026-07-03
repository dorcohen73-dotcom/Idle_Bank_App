const fs = require('fs');

// We need to simulate the game environment
const configCode = fs.readFileSync('./config.js', 'utf8');
const gameCode = fs.readFileSync('./game.js', 'utf8');
const economyManagerCode = fs.readFileSync('./economy-manager.js', 'utf8');
const saveManagerCode = fs.readFileSync('./save-manager.js', 'utf8');
const missionControllerCode = fs.readFileSync('./mission-controller.js', 'utf8');

// Mock window and other DOM objects
global.window = {
    gameAudio: { playClick: () => {}, playUnlock: () => {}, playChaChing: () => {} },
    localStorage: { getItem: () => null, setItem: () => {} }
};

eval(configCode);
eval(saveManagerCode);
eval(economyManagerCode);
eval(missionControllerCode);
eval(gameCode);

// Start game
const game = new IdleBankGame();
console.log("Starting branch:", game.state.currentBranch);

// Give 2.5 million cash and try to prestige to branch 2 (HSBC)
game.state.cash = 2500000;
game.state.lifetimeCash = 2500000;
let success = game.prestige(1, false, false);
console.log("Prestige to branch 2 with 2.5M cash:", success ? "SUCCESS" : "FAILED");
console.log("Current Branch:", game.state.currentBranch);
console.log("Shares after first prestige:", game.state.shares);

// Give 250 billion cash and try to prestige to branch 4 (JP Morgan)
game.state.cash = 250000000000;
game.state.lifetimeCash = 250000000000;
success = game.prestige(3, false, false);
console.log("Prestige to branch 4 with 250B cash:", success ? "SUCCESS" : "FAILED");
console.log("Current Branch:", game.state.currentBranch);
console.log("Shares after reaching 250B:", game.state.shares);

// Test Trillion scale
game.state.cash = 100000000000000;
game.state.lifetimeCash = 100000000000000;
success = game.prestige(4, false, false);
console.log("Prestige to branch 5 with 100T cash:", success ? "SUCCESS" : "FAILED");
console.log("Shares after reaching 100T:", game.state.shares);

console.log("Game balancing test complete.");
