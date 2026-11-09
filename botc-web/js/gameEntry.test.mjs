import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./gameEntry.js', import.meta.url), 'utf8');
const slice = (start, end) => source.slice(source.indexOf(start), source.indexOf(end));
const code = [
    slice('function linesByPlayerName(', '/**\n * Initialize the game entry'),
    slice('function parseTeamInput(', 'function clearForm('),
].join('\n');

function harness(team1, team2, originalPlayers = []) {
    const submitted = [];
    const errors = [];
    const context = {
        team1Input: { value: team1 }, team2Input: { value: team2 },
        storytellerInput: { value: 'ST' }, fabledInput: { value: '' }, loricsInput: { value: '' },
        scriptSelect: { value: 'Script' }, submitBtn: {}, submitError: {}, submitSuccess: {},
        editMode: true, currentEditGameId: 42,
        originalEditGame: { players: originalPlayers }, originalEditLines: null,
        document: { querySelector: selector => ({ value: selector.includes('evil-team') ? '1' : '2' }) },
        hideError() {}, hideSuccess() {}, showError(_element, message) { errors.push(message); },
        showSuccess() {}, getStoredCode() { return 'code'; },
        async updateGame(id, data) { submitted.push({ id, data }); },
        clearForm() {}, resetToAddMode() {}, setTimeout() {}, window: {}, console,
    };
    vm.runInNewContext(code, context);
    context.originalEditLines = context.linesByPlayerName(team1, team2);
    return { context, submitted, errors };
}

test('editing unrelated fields preserves the original role metadata and spelling', async () => {
    const chair = { name: 'Стул', team: 'Both', role: 'Courtier', roles: ['Courtier'],
        role_assignments: [{ role: 'Courtier', team: 'Good', note: 'first' }, { role: 'Goblin', team: 'Evil' }], source_role: 'original' };
    const player = { name: 'Игрок', team: 'Good', role: 'Al-Hadikhia', roles: ['Al-Hadikhia'], source_role: 'source' };
    const h = harness('Стул Courtier@Good+Goblin@Evil', 'Игрок Al-Hadikhia', [chair, player]);
    await h.context.submitGameForm();
    assert.equal(h.errors.length, 0);
    assert.deepEqual(JSON.parse(JSON.stringify(h.submitted[0].data.players)), [chair, player]);
});

test('invalid simultaneous assignments are rejected rather than silently dropped', async () => {
    const h = harness('Стул Courtier@Good+Goblin', 'Игрок Artist');
    await h.context.submitGameForm();
    assert.equal(h.submitted.length, 0);
    assert.match(h.errors[0], /Invalid simultaneous roles/);
});

test('duplicate player entries are rejected before they affect ratings', async () => {
    const h = harness('Стул Goblin', 'Стул Courtier');
    await h.context.submitGameForm();
    assert.equal(h.submitted.length, 0);
    assert.match(h.errors[0], /only once/);
});

