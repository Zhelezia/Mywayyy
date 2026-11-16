import { getCharacterRoleType } from './config.js?v=monsta-2026-11-16';

// Role assignments represent separate seats; simultaneous roles on one seat do not.
export function gameSeatCount(game) {
    return (game.players || []).reduce((count, player) => {
        const assignments = Array.isArray(player.role_assignments) ? player.role_assignments.filter(Boolean) : [];
        if (assignments.length) {
            return count + assignments.filter(seat => getCharacterRoleType(seat.role) !== 'Travellers').length;
        }
        const roles = Array.isArray(player.roles) ? player.roles : [];
        const startingRole = roles.find(role => typeof role === 'string' && role.trim()) || player.role;
        return count + (getCharacterRoleType(startingRole) === 'Travellers' ? 0 : 1);
    }, 0);
}

// On a small-game night, all living players except the Demon are equally likely targets.
export function nightKillOutcomes(good, minions) {
    const targets = good + minions;
    if (!targets) return [];
    const outcomes = [];
    if (good > 0) outcomes.push({good: good - 1, minions, probability: good / targets});
    if (minions > 0) outcomes.push({good, minions: minions - 1, probability: minions / targets});
    return outcomes;
}

// Matches the existing toy model: random daily execution, skip at four,
// no abilities, immediate evil win if no good remains, and no first-night kill.
export function teensyExpectedGoodProbability(size) {
    if (size !== 5 && size !== 6) return null;
    const memo = new Map();
    function night(good, minions) {
        if (good <= 0) return 0;
        return nightKillOutcomes(good, minions).reduce((sum, next) =>
            sum + next.probability * day(next.good, next.minions), 0);
    }
    function day(good, minions) {
        if (good <= 0) return 0;
        const total = good + minions + 1;
        if (total <= 2) return 0;
        if (total === 3) return 1 / 3;
        const key = `${good}:${minions}`;
        if (memo.has(key)) return memo.get(key);
        const result = total === 4 ? night(good, minions) :
            1 / total + (good / total) * night(good - 1, minions) +
            (minions ? (minions / total) * night(good, minions - 1) : 0);
        memo.set(key, result);
        return result;
    }
    return day(size - 2, 1);
}

// Larger-game benchmarks use the same published model with night kills restricted to good players.
const LARGER_GAME_EXPECTED_GOOD_PCT = {7:54, 8:51, 9:59, 10:49, 11:59, 12:54, 13:59, 14:53, 15:62};
export function expectedGoodWinPct(size) {
    const small = teensyExpectedGoodProbability(size);
    return small === null ? (LARGER_GAME_EXPECTED_GOOD_PCT[size] ?? null) : Math.round(small * 100);
}

export function evilTeamLabel(size) {
    if (size >= 5 && size <= 9) return '1 Demon, 1 Minion';
    if (size >= 10 && size <= 12) return '1 Demon, 2 Minions';
    if (size >= 13 && size <= 15) return '1 Demon, 3 Minions';
    return '?';
}
