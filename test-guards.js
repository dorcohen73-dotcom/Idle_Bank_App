const fs = require('fs');
eval(fs.readFileSync('config.js', 'utf8'));
eval(fs.readFileSync('game-test.js', 'utf8'));
const game = new IdleBankGame();
game.initDefaultState();
game.state.managers.operations = { level: 1 };
game.state.vault.cashStored = 0;
// Add cash to teller 0
game.state.tellers[0].cashStored = 1000;
game.state.tellers[0].unlocked = true;

console.log("Start state:", game.state.guards[0].state, game.state.guards[0].segmentPosition);

for(let i=0; i<50; i++) {
    game.update(0.1);
    const g = game.state.guards[0];
    if(g.state !== 'idle') {
        console.log(`Tick ${i}: state=${g.state}, pos=${g.position}, segPos=${g.segmentPosition}, targetTi=${g.targetTellerIndex}`);
    }
}
