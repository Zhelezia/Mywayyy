import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./supabase.js', import.meta.url), 'utf8');
const code = source.slice(source.indexOf('export async function fetchGames()'), source.indexOf('export async function validateAccessCode('))
    .replace('export async function', 'async function');

test('loads all pages instead of stopping at the database row limit', async () => {
    const records = Array.from({ length: 1001 }, (_, i) => ({ game_id: i + 1, players: [], winning_team: 'Good' }));
    const ranges = [];
    const query = { select() { return this; }, order() { return this; },
        async range(start, end) { ranges.push([start, end]); return { data: records.slice(start, end + 1), error: null }; } };
    const context = { IS_DEMO: false, async initSupabase() {}, supabase: { from() { return query; } }, console };
    vm.runInNewContext(code, context);
    const games = await context.fetchGames();
    assert.equal(games.length, 1001);
    assert.equal(games[1000].game_id, 1001);
    assert.deepEqual(ranges, [[0, 499], [500, 999], [1000, 1499]]);
});

