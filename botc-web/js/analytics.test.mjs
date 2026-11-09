import test from 'node:test';
import assert from 'node:assert/strict';
import { StorytellerAnalytics, analyzeHeadToHead, getCharacterScriptBreakdown } from './analytics.js';
import { setScriptCategories } from './config.js';
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

