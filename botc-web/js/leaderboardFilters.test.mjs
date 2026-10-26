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

test('combines script type, script, storyteller, player, and role filters', () => {
    const matches = filterGames(games, {
        gameType: 'normal',
        script: 'Trouble Brewing',
        storyteller: 'Bea',
        player: 'Максим',
        role: 'Artist',
    }, categorizeScript);

    assert.deepEqual(matches.map(game => game.game_id), [1]);
});

test('role filter finds a character in a role-change history', () => {
    const matches = filterGames(games, {role: 'Artist'}, categorizeScript);
    assert.deepEqual(matches.map(game => game.game_id), [1, 2]);
});

test('filter options include co-storytellers and every role in history', () => {
    const options = getFilterOptions(games);
    assert.deepEqual(options.storytellers, ['Alex', 'Bea', 'Casey']);
    assert.deepEqual(options.roles, ['Artist', 'Empath', 'Imp', 'Philosopher', 'Wraith']);
});

test('returns no games when the combined filters do not intersect', () => {
    const matches = filterGames(games, {
        gameType: 'teensyville',
        script: 'Trouble Brewing',
    }, categorizeScript);
    assert.deepEqual(matches, []);
});
