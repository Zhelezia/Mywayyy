import test from 'node:test';
import assert from 'node:assert/strict';
import { gameSeatCount, nightKillOutcomes, teensyExpectedGoodProbability, expectedGoodWinPct, evilTeamLabel } from './gameSize.mjs';

test('game sizes exclude Travellers and count independent seats, not simultaneous roles', () => {
    const game={players:[
        {name:'A',role:'Artist'},
        {name:'B',role:'Libertine',roles_in_play:['Libertine','Truther']},
        {name:'C',role:'Apprentice'},
        {name:'D',role:'Judge'},
        {name:'Chair',role_assignments:[{role:'Courtier',team:'Good'},{role:'Goblin',team:'Evil'}]},
        {name:'E',role_assignments:[{role:'Barista',team:'Good'},{role:'Savant',team:'Good'}]},
        {name:'F',role:'Artist',roles:['Apprentice','Artist']}
    ]};
    assert.equal(gameSeatCount(game),5);
    assert.equal(gameSeatCount({players:[{role:'Unknown_Custom_Role'}]}),1);
});

test('five- and six-player toy model excludes the Demon but can hit the Minion', () => {
    assert.deepEqual(nightKillOutcomes(2,1),[
        {good:1,minions:1,probability:2/3},
        {good:2,minions:0,probability:1/3}
    ]);
    assert(Math.abs(teensyExpectedGoodProbability(5)-7/15)<1e-12);
    assert(Math.abs(teensyExpectedGoodProbability(6)-4/9)<1e-12);
    assert.equal(expectedGoodWinPct(5),47);
    assert.equal(expectedGoodWinPct(6),44);
    assert.equal(expectedGoodWinPct(9),59);
});

test('standard setup is one Demon and one Minion for nine players', () => {
    assert.equal(evilTeamLabel(9),'1 Demon, 1 Minion');
    assert.equal(evilTeamLabel(10),'1 Demon, 2 Minions');
    assert.equal(evilTeamLabel(13),'1 Demon, 3 Minions');
});
