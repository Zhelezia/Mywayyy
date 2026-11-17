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
    const expectedDelta = 16 * (1 - expectedScore(1500, 1300));
    for (const name of experiencedPlayers) {
        const players = recalcAll([game(1, name, 'New player')]);
        close(players[name].currentRating, 1500 + expectedDelta);
        close(players['New player'].currentRating, 1500 - expectedDelta);
    }
});

test('newcomer discounts taper against the current rating and expire after game four', () => {
    const discounts = [200, 150, 100, 50, 0, 0];
    const games = discounts.map((_, i) => game(i + 1, 'Максим', 'New player'));
    const players = recalcAll(games);
    let goodRating = 1500, evilRating = 1500;
    for (const [index, discount] of discounts.entries()) {
        const expectation = expectedScore(goodRating, evilRating - discount);
        const delta = 16 * (1 - expectation);
        goodRating += delta;
        evilRating -= delta;
        close(players['Максим'].ratingHistory[index].rating, goodRating);
        close(players['New player'].ratingHistory[index].rating, evilRating);
    }
});

test('filters do not restart a new player provisional period', () => {
    const history = [1, 2, 3, 4, 5].map(id => game(id, 'Максим', 'New player'));
    const fourth = recalcAll([history[3]], history);
    close(fourth['New player'].currentRating, 1500 - 16 * (1 - expectedScore(1500, 1450)));
    const fifth = recalcAll([history[4]], history);
    close(fifth['Максим'].currentRating, 1508);
    close(fifth['New player'].currentRating, 1492);
});

test('the Politician counts toward Good expectations and earns the final team result', () => {
    const base = game(1, 'Максим', 'Лиза');
    for (const seat of [
        { role: 'Politician' },
        { roles: ['Artist', 'Politician'] },
        { role: 'Artist', roles_in_play: ['Artist', 'Политик'] },
        { role_assignments: [{ role: 'Politician', team: 'Evil' }] }
    ]) {
        const politician = { name: 'New player', initial_team: 'Good', team: 'Evil', ...seat };
        const players = recalcAll([{ ...base, winning_team: 'Evil', players: [...base.players, politician] }]);
        const gain = 16 * expectedScore(1400, 1500);
        close(players['New player'].currentRating, 1500 + gain);
        close(players['Лиза'].currentRating, 1500 + gain);
        close(players['Максим'].currentRating, 1500 - gain);
        assert.equal(players['New player'].winsEvil, 1);
        assert.equal(players['New player'].gamesGood, 0);
    }
});

test('other switches and former Politicians count on their final team', () => {
    const base = game(1, 'Максим', 'Лиза');
    for (const firstRole of ['Snake_Charmer', 'Politician']) {
        const demon = { name: 'New player', team: 'Evil', initial_team: 'Good', role: 'Imp', roles: [firstRole, 'Imp'] };
        const players = recalcAll([{ ...base, winning_team: 'Evil', players: [...base.players, demon] }]);
        close(players['New player'].currentRating, 1500 + 16 * expectedScore(1500, 1400));
    }
});

test('every chair seat contributes the baseline while its displayed Elo follows its seat results', () => {
    const prior = game(1, 'Стул', 'Костя');
    const next = game(2, 'New player', 'Максим');
    const chair = { name: 'Стул', team: 'Good', role_assignments: [
        { role: 'Savant', team: 'Good' }, { role: 'Slayer', team: 'Good' }
    ] };
    next.players.push(chair);
    const gain = 16 * (1 - expectedScore((1300 + 2 * 1500) / 3, 1500));
    for (const winner of ['Good', 'Evil']) {
        const players = recalcAll([{ ...prior, winning_team: winner }, next]);
        close(players['New player'].currentRating, 1500 + gain);
        close(players['Максим'].currentRating, 1500 - gain);
        close(players['Стул'].currentRating, (winner === 'Good' ? 1508 : 1492) + 2 * gain);
    }
    const split = { ...chair, team: 'Both', role_assignments: [
        { role: 'Dreamer', team: 'Good' }, { role: 'Leviathan', team: 'Evil' }
    ] };
    const mixed = recalcAll([prior, { ...next, players: [next.players[0], next.players[1], split] }]);
    close(mixed['Стул'].currentRating, 1508);
});

