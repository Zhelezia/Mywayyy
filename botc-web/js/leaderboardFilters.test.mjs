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
        gameType: {mode: 'include', values: ['Normal', 'Teensyville']},
        script: {mode: 'include', values: ['Trouble Brewing', 'Teensyville script']},
        storyteller: {mode: 'include', values: ['Bea', 'Casey']},
        player: {mode: 'include', values: ['Максим', 'Даня']},
        role: {mode: 'include', values: ['Artist', 'Empath', 'Wraith']},
    }, categorizeScript);

    assert.deepEqual(matches.map(game => game.game_id), [1, 2, 3]);
});

test('excludes selected values while included values still use any-match semantics', () => {
    const matches = filterGames(games, {
        gameType: {mode: 'include', values: ['Teensyville']},
        script: {mode: 'exclude', values: ['Trouble Brewing']},
        storyteller: {mode: 'exclude', values: ['Casey']},
        player: {mode: 'include', values: ['Лиза', 'Даня']},
        role: {mode: 'include', values: ['Wraith', 'Empath']},
    }, categorizeScript);

    assert.deepEqual(matches.map(game => game.game_id), [3]);
});

test('can require all selected players in games while excluding a script and storyteller', () => {
    const matches = filterGames(games, {
        script: {mode: 'exclude', values: ['Trouble Brewing']},
        storyteller: {mode: 'exclude', values: ['Casey']},
        player: {mode: 'include', match: 'all', values: ['Максим', 'Лиза']},
    }, categorizeScript);

    assert.deepEqual(matches.map(game => game.game_id), [3]);
});

test('all-player mode rejects a game containing only one selected player', () => {
    const matches = filterGames(games, {
        player: {mode: 'include', match: 'all', values: ['Максим', 'Даня']},
    }, categorizeScript);

    assert.deepEqual(matches.map(game => game.game_id), [2]);
});

test('empty include and exclude lists both leave a filter inactive', () => {
    const matches = filterGames(games, {
        gameType: {mode: 'exclude', values: []},
        script: {mode: 'include', values: []},
    }, categorizeScript);

    assert.deepEqual(matches.map(game => game.game_id), [1, 2, 3]);
});

test('role filter finds a character in a role-change history', () => {
    const matches = filterGames(games, {role: {mode: 'include', values: ['Artist']}}, categorizeScript);
    assert.deepEqual(matches.map(game => game.game_id), [1, 2]);
});

test('filter options include co-storytellers and every role in history', () => {
    const options = getFilterOptions(games);
    assert.deepEqual(options.storytellers, ['Alex', 'Bea', 'Casey']);
    assert.deepEqual(options.roles, ['Artist', 'Empath', 'Imp', 'Philosopher', 'Wraith']);
});

test('returns no games when exclusions remove every matching game', () => {
    const matches = filterGames(games, {
        gameType: {mode: 'include', values: ['Teensyville']},
        script: {mode: 'exclude', values: ['Teensyville script']},
    }, categorizeScript);
    assert.deepEqual(matches, []);
});
