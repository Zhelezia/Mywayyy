import assert from 'node:assert/strict';
import test from 'node:test';
import {filterGames, getFilterOptions} from './leaderboardFilters.mjs';

const games = [
    {
        game_id: 1,
        game_mode: 'Trouble Brewing',
        story_teller: 'Alex+Bea',
        players: [
            {name: 'Максим', role: 'Philosopher', roles: ['Artist', 'Philosopher']},
            {name: 'Лиза', role: 'Imp', roles: ['Imp']},
        ],
    },
    {
        game_id: 2,
        game_mode: 'Trouble Brewing',
        story_teller: 'Casey',
        players: [
            {name: 'Максим', role: 'Artist', roles: ['Artist']},
            {name: 'Даня', role: 'Empath', roles: ['Empath']},
        ],
    },
    {
        game_id: 3,
        game_mode: 'Teensyville script',
        story_teller: 'Bea',
        players: [
            {name: 'Максим', role: 'Wraith', roles: ['Wraith']},
            {name: 'Лиза', role: 'Imp', roles: ['Imp']},
        ],
    },
];

const categorizeScript = name => name === 'Teensyville script' ? 'Teensyville' : 'Normal';

test('combines multiple included values within each filter', () => {
    const matches = filterGames(games, {
        gameType: {include: ['Normal', 'Teensyville']},
        script: {include: ['Trouble Brewing', 'Teensyville script']},
        storyteller: {include: ['Bea', 'Casey']},
        player: {include: ['Максим', 'Даня']},
        role: {include: ['Artist', 'Empath', 'Wraith']},
    }, categorizeScript);

    assert.deepEqual(matches.map(game => game.game_id), [1, 2, 3]);
});

test('excludes selected values while included values still use any-match semantics', () => {
    const matches = filterGames(games, {
        gameType: {include: ['Teensyville']},
        script: {exclude: ['Trouble Brewing']},
        storyteller: {exclude: ['Casey']},
        player: {include: ['Лиза', 'Даня']},
        role: {include: ['Wraith', 'Empath']},
    }, categorizeScript);

    assert.deepEqual(matches.map(game => game.game_id), [3]);
});

test('can require all selected players in games while excluding a script and storyteller', () => {
    const matches = filterGames(games, {
        script: {exclude: ['Trouble Brewing']},
        storyteller: {exclude: ['Casey']},
        player: {match: 'all', include: ['Максим', 'Лиза']},
    }, categorizeScript);

    assert.deepEqual(matches.map(game => game.game_id), [3]);
});

test('all-player mode rejects a game containing only one selected player', () => {
    const matches = filterGames(games, {
        player: {match: 'all', include: ['Максим', 'Даня']},
    }, categorizeScript);

    assert.deepEqual(matches.map(game => game.game_id), [2]);
});

test('empty include and exclude lists leave a filter inactive', () => {
    const matches = filterGames(games, {
        gameType: {exclude: []},
        script: {include: []},
    }, categorizeScript);

    assert.deepEqual(matches.map(game => game.game_id), [1, 2, 3]);
});

test('role filter finds a character in a role-change history', () => {
    const matches = filterGames(games, {role: {include: ['Artist']}}, categorizeScript);
    assert.deepEqual(matches.map(game => game.game_id), [1, 2]);
});

test('filter options include co-storytellers and every role in history', () => {
    const options = getFilterOptions(games);
    assert.deepEqual(options.storytellers, ['Alex', 'Bea', 'Casey']);
    assert.deepEqual(options.roles, ['Artist', 'Empath', 'Imp', 'Philosopher', 'Wraith']);
});

test('role spelling and capitalization variants share one Al-Hadikhia filter option', () => {
    const alHadikhiaGames = [
        {
            game_id: 4,
            game_mode: 'Script A',
            story_teller: 'Alex',
            players: [{name: 'Максим', role: 'Al-hadikhia'}],
        },
        {
            game_id: 5,
            game_mode: 'Script B',
            story_teller: 'Bea',
            players: [{name: 'Лиза', role: 'Al-Hadikhia'}],
        },
    ];
    const options = getFilterOptions(alHadikhiaGames);
    const matches = filterGames(alHadikhiaGames, {
        role: {include: ['AL-HADIKHIA']},
    }, categorizeScript);

    assert.deepEqual(options.roles, ['Al-Hadikhia']);
    assert.deepEqual(matches.map(game => game.game_id), [4, 5]);
});

test('returns no games when exclusions remove every matching game', () => {
    const matches = filterGames(games, {
        gameType: {include: ['Teensyville']},
        script: {exclude: ['Teensyville script']},
    }, categorizeScript);
    assert.deepEqual(matches, []);
});

test('includes and excludes different players in the same group', () => {
    const matches = filterGames(games, {
        player: {include: ['Максим'], exclude: ['Лиза']},
    }, categorizeScript);
    assert.deepEqual(matches.map(game => game.game_id), [2]);
});

test('all-player matching applies to includes; any excluded player vetoes a game', () => {
    const matches = filterGames(games, {
        player: {match: 'all', include: ['Максим', 'Лиза'], exclude: ['Даня', 'Nobody']},
    }, categorizeScript);
    assert.deepEqual(matches.map(game => game.game_id), [1, 3]);
});

test('any-player matching still respects excluded players', () => {
    const matches = filterGames(games, {
        player: {match: 'any', include: ['Лиза', 'Даня'], exclude: ['Лиза']},
    }, categorizeScript);
    assert.deepEqual(matches.map(game => game.game_id), [2]);
});

test('an excluded co-storyteller vetoes an included co-storyteller', () => {
    const matches = filterGames(games, {
        storyteller: {include: ['Bea'], exclude: ['Alex']},
    }, categorizeScript);
    assert.deepEqual(matches.map(game => game.game_id), [3]);
});

test('role exclusions inspect history even when another role is included', () => {
    const matches = filterGames(games, {
        role: {include: ['Imp', 'Empath'], exclude: ['Artist']},
    }, categorizeScript);
    assert.deepEqual(matches.map(game => game.game_id), [3]);
});

test('exclusions canonicalize role spellings and take precedence over includes', () => {
    const matches = filterGames([{
        game_mode: 'Trouble Brewing',
        players: [{name: 'Максим', role: 'Al-hadikhia'}],
    }], {role: {include: ['Al-Hadikhia'], exclude: ['AL-HADIKHIA']}}, categorizeScript);
    assert.deepEqual(matches, []);
});

test('all neutral filters return the full game history', () => {
    assert.deepEqual(filterGames(games, {}, categorizeScript), games);
});
