import test from 'node:test';
import assert from 'node:assert/strict';
import { expectedScore, recalcAll } from './elo.js';
import { experiencedPlayers } from './playerStatus.mjs';

const game = (game_id, good, evil) => ({
    game_id, winning_team: 'Good', players: [
        { name: good, role: 'Artist', team: 'Good' },
        { name: evil, role: 'Imp', team: 'Evil' }
    ]
});
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('each established player uses their actual rating from their first recorded game', () => {
    assert.equal(experiencedPlayers.size, 13);
    const expectedDelta = 32 * (1 - expectedScore(1500, 1300));
    for (const name of experiencedPlayers) {
        const players = recalcAll([game(1, name, 'New player')]);
        close(players[name].currentRating, 1500 + expectedDelta);
        close(players['New player'].currentRating, 1500 - expectedDelta);
    }
});

test('other players use 1300 for their first three games and their rating from game four', () => {
    const games = [1, 2, 3, 4].map(id => game(id, 'Максим', 'New player'));
    const players = recalcAll(games);
    let goodRating = 1500, evilRating = 1500;
    for (let index = 0; index < 4; index++) {
        const expectation = expectedScore(goodRating, index < 3 ? 1300 : evilRating);
        const delta = 32 * (1 - expectation);
        goodRating += delta;
        evilRating -= delta;
        close(players['Максим'].ratingHistory[index].rating, goodRating);
        close(players['New player'].ratingHistory[index].rating, evilRating);
    }
});

test('filters do not restart a new player provisional period', () => {
    const history = [1, 2, 3, 4].map(id => game(id, 'Максим', 'New player'));
    const players = recalcAll([history[3]], history);
    close(players['Максим'].currentRating, 1516);
    close(players['New player'].currentRating, 1484);
});

