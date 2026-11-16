import test from 'node:test';
import assert from 'node:assert/strict';
import { StorytellerAnalytics, analyzeHeadToHead, getCharacterScriptBreakdown, calculateCharacterElo, getCharacterRoleType } from './analytics.js';
import { setScriptCategories } from './config.js?v=monsta-2026-11-16';
import { recalcAll } from './elo.js';

const chair = { name: 'Chair', role: 'Courtier', team: 'Both', roles: ['Courtier'],
    role_assignments: [{ role: 'Courtier', team: 'Good' }, { role: 'Goblin', team: 'Evil' }] };
const good = { name: 'A', role: 'Al-hadikhia', roles: ['Al-Hadikhia', 'Al-hadikhia'], team: 'Good' };
const evil = { name: 'B', role: 'Imp', team: 'Evil' };
const games = [
    { game_id: 1, game_mode: 'Trouble Brewing', story_teller: 'ST', winning_team: 'Good', players: [chair, good, evil], modifiers: { fabled: ['Angel'], lorics: [] } },
    { game_id: 2, game_mode: 'Small', story_teller: 'ST', winning_team: 'Evil', players: [good, evil], modifiers: { fabled: ['Angel'], lorics: [] } },
    { game_id: 3, game_mode: 'Trouble Brewing', story_teller: 'Other', winning_team: 'Good', players: [good, evil], modifiers: null }
];
setScriptCategories([{ name: 'Trouble Brewing', category: 'Normal' }, { name: 'Small', category: 'Teensyville' }]);

test('mixed-team players are counted together without inventing a matchup result', () => {
    const result = analyzeHeadToHead(games, 'Chair', 'A');
    assert.equal(result.total_together, 1);
    assert.equal(result.unclassified_games, 1);
    assert.equal(result.same_team.games, 0);
    assert.equal(result.opposite_teams.games, 0);
    const normal = analyzeHeadToHead(games, 'A', 'B');
    assert.equal(normal.opposite_teams.games, 3);
    assert.equal(normal.opposite_teams.A.wins, 2);
});

test('modifier totals honor storyteller and game type while ignoring modifier selection', () => {
    const normal = new StorytellerAnalytics(games, 'ST', 'none', 'normal');
    assert.equal(normal.games.length, 0);
    assert.equal(normal.getModifierSummary(games, 'ST').totalMod, 1);
    assert.equal(normal.modifierStats.fabled.Angel.games, 1);
    assert.deepEqual(normal.modifierGames.map(g => g.game_id), [1]);
});

test('role aliases count once per player and the detail matches the table', () => {
    const analytics = new StorytellerAnalytics(games);
    const player = analytics.getPlayerStats('A');
    assert.deepEqual(player.roles['Al-Hadikhia'], { games: 3, wins: 2 });
    for (const filter of ['All', 'Normal', 'Teensyville', 'Small']) {
        const row = analytics.getCharacterStats(filter).find(item => item.character === 'Al-Hadikhia');
        const detail = getCharacterScriptBreakdown(analytics.getCharacterGames(filter), 'Al-Hadikhia');
        assert.equal(row.games, detail.totalGames);
        assert.equal(row.wins, detail.totalWins);
    }
});

test('simultaneous seats both contribute to a player rating change', () => {
    const result = recalcAll(games);
    assert.equal(result.Chair.gamesOverall, 1);
    assert.equal(result.Chair.gamesGood, 1);
    assert.equal(result.Chair.gamesEvil, 1);
    assert.equal(result.Chair.gameHistory[0].roleAssignments.length, 2);
});

test('an unassigned Lil Monsta counts once for role win rates and never as a player or rating participant', () => {
    const modified = games.map((game, index) => index < 2 ? { ...game, modifiers: { unassigned_roles: [{role: "Lil'_Monsta", team: 'Evil'}] } } : game);
    const analytics = new StorytellerAnalytics(modified);
    const row = analytics.getCharacterStats().find(item => item.character === "Lil'_Monsta");
    const detail = getCharacterScriptBreakdown(modified, "Lil'_Monsta");
    assert.equal(row.games, 2);
    assert.equal(row.wins, 1);
    assert.equal(detail.totalGames, 2);
    assert.equal(detail.totalWins, 1);
    assert.deepEqual(detail.players, []);
    assert.equal(calculateCharacterElo(modified)["Lil'_Monsta"], undefined);
    assert.deepEqual(recalcAll(modified), recalcAll(games));
});

test('Yaga is grouped and classified as Pit-Hag', () => {
    const g = [{ game_id: 1, game_mode: 'Small', winning_team: 'Evil', players: [{name:'A', role:'Yaga', team:'Evil'}] }];
    const row = new StorytellerAnalytics(g).getCharacterStats()[0];
    assert.equal(row.character, 'Pit-Hag');
    assert.equal(row.role_type, 'Minions');
});

test('homebrew character types come from the supplied scripts and Emotions reference', () => {
    for (const [name, type] of Object.entries({Faith:'Demons', Hope:'Demons', Love:'Demons',
        Gratitude:'Minions', Happiness:'Minions', Joy:'Minions', Boredom:'Outsiders',
        Disappointment:'Outsiders', Guilt:'Townsfolk', Sadness:'Townsfolk', Fear:'Townsfolk',
        Scrounger:'Townsfolk', Occultist:'Outsiders', Miasma:'Minions', "Au'Wre":'Demons',
        Defector:'Townsfolk', Internal_Wiretap:'Townsfolk', Haruspex:'Minions',
        Spartacus:'Outsiders', Cleopatra:'Demons', Aristocrat:'Townsfolk'})) {
        assert.equal(getCharacterRoleType(name), type, name);
    }
});

test('good Minions in Hope games retain their type and win with their actual team', () => {
    const g=[{game_id:1, game_mode:'Emotions', winning_team:'Good', players:[
        {name:'A',role:'Gratitude',team:'Good'}, {name:'B',role:'Hope',team:'Evil'}]}];
    const row=new StorytellerAnalytics(g).getCharacterStats().find(item=>item.character==='Gratitude');
    assert.equal(row.role_type,'Minions');
    assert.equal(row.wins,1);
});
