import { fetchGames } from './supabase.js?v=audit-v2-2026-11-09';
import { getLanguage, tr } from './i18n.mjs?v=monsta-2026-11-16';
import { translateRole } from './roleTranslations.mjs?v=monsta-2026-11-16';

const $ = id => document.getElementById(id);
let games = [];
let loading = true;
let failed = false;

const copy = {
    search: ['Search', 'Поиск'], searchHint: ['Player, role, script, storyteller, or game number', 'Игрок, роль, сценарий, рассказчик или номер игры'],
    script: ['Script', 'Сценарий'], storyteller: ['Storyteller', 'Рассказчик'], winner: ['Winner', 'Победитель'],
    allScripts: ['All scripts', 'Все сценарии'], allStorytellers: ['All storytellers', 'Все рассказчики'],
    allWinners: ['All winners', 'Любой победитель'], heading: ['Game history', 'История игр'],
    players: ['Players', 'Игроки'], noGames: ['No games match these filters.', 'Нет игр по выбранным фильтрам.'],
    loading: ['Loading games…', 'Загрузка игр…'], error: ['Could not load games. Please reload the page.', 'Не удалось загрузить игры. Обновите страницу.'],
    source: ['Original note', 'Исходная запись'], history: ['Role history', 'История ролей'],
    simultaneous: ['Roles in play', 'Роли одновременно'], seats: ['Seats', 'Места'],
    teamChange: ['Team change', 'Смена стороны'], modifiers: ['Modifiers', 'Модификаторы'], unassigned: ['Roles in play, unassigned', 'Роли в игре без привязки к игроку'],
    none: ['None', 'Нет'], goodWon: ['Good won', 'Победа добра'], evilWon: ['Evil won', 'Победа зла'],
    unknown: ['Unknown', 'Неизвестно'], noDate: ['Date not recorded', 'Дата не указана']
};
const label = key => copy[key][getLanguage() === 'ru' ? 1 : 0];
const node = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
};
const role = value => translateRole(value, getLanguage());
const team = value => tr(value || 'Unknown');
const clean = value => String(value || '').replace(/_/g, ' ');
const distinct = values => [...new Set(values.filter(Boolean))];

function setOptions(select, values, firstLabel) {
    const desired = [['', firstLabel], ...values];
    if (select.options.length === desired.length && desired.every(([value, text], index) =>
        select.options[index].value === value && select.options[index].textContent === text)) return;
    const selected = select.value;
    select.replaceChildren();
    const all = document.createElement('option'); all.value = ''; all.textContent = firstLabel; select.appendChild(all);
    for (const [value, text] of values) {
        const option = document.createElement('option'); option.value = value; option.textContent = text; select.appendChild(option);
    }
    select.value = [...select.options].some(option => option.value === selected) ? selected : '';
}

function updateLabels() {
    $('games-search-label').textContent = label('search'); $('games-search').placeholder = label('searchHint');
    $('games-script-label').textContent = label('script'); $('games-storyteller-label').textContent = label('storyteller');
    $('games-winner-label').textContent = label('winner'); $('games-heading').textContent = label('heading');
    const scripts = distinct(games.map(game => game.game_mode)).sort((a, b) => a.localeCompare(b));
    const storytellers = distinct(games.flatMap(game => String(game.story_teller || '').split('+').map(name => name.trim())))
        .sort((a, b) => a.localeCompare(b));
    setOptions($('games-script'), scripts.map(value => [value, value]), label('allScripts'));
    setOptions($('games-storyteller'), storytellers.map(value => [value, clean(value)]), label('allStorytellers'));
    setOptions($('games-winner'), [['Good', label('goodWon')], ['Evil', label('evilWon')]], label('allWinners'));
}

function playerDetails(player) {
    const assignmentList = Array.isArray(player.role_assignments) ? player.role_assignments : [];
    const teams = distinct(assignmentList.map(item => item?.team).filter(value => value === 'Good' || value === 'Evil'));
    const alignment = teams.length > 1 ? 'Both' : (teams[0] || player.team || 'Unknown');
    const card = node('div', 'game-player ' + ({ Good: 'good', Evil: 'evil', Both: 'both' }[alignment] || ''));
    const head = node('div', 'game-player-head');
    head.append(node('span', '', clean(player.name) || label('unknown')), node('span', 'game-player-team', team(alignment)));
    card.appendChild(head);
    card.appendChild(node('div', 'game-player-role', role(player.role) || '—'));
    const line = (title, value) => card.appendChild(node('div', 'game-player-detail', `${title}: ${value}`));
    const simultaneousRoles = new Set([
        ...(Array.isArray(player.roles_in_play) ? player.roles_in_play : []),
        ...assignmentList.map(item => item.role)
    ].filter(Boolean).map(value => String(value).toLocaleLowerCase()));
    if (Array.isArray(player.roles) && player.roles.length > 1 &&
        (!simultaneousRoles.size || player.roles.some(value => !simultaneousRoles.has(String(value).toLocaleLowerCase())))) {
        line(label('history'), player.roles.map(role).join(' → '));
    }
    if (Array.isArray(player.roles_in_play) && player.roles_in_play.length > 1) line(label('simultaneous'), player.roles_in_play.map(role).join(' + '));
    if (assignmentList.length) line(label('seats'), assignmentList.map(item => {
        const change = item.initial_team && item.initial_team !== item.team ? `${team(item.initial_team)} → ` : '';
        const extra = Object.entries(item).filter(([key]) => !['role', 'team', 'initial_team'].includes(key))
            .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`).join(', ');
        return `${role(item.role)} (${change}${team(item.team)}${extra ? `; ${extra}` : ''})`;
    }).join(' · '));
    if (player.initial_team && player.initial_team !== player.team) line(label('teamChange'), `${team(player.initial_team)} → ${team(player.team)}`);
    if (player.source_role) line(label('source'), player.source_role);
    const known = new Set(['name', 'role', 'roles', 'roles_in_play', 'role_assignments', 'team', 'initial_team', 'source_role']);
    for (const [key, value] of Object.entries(player)) {
        if (!known.has(key) && value !== null && value !== undefined && value !== '') {
            line(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
    }
    return card;
}

function gameCard(game, expanded) {
    const card = node('details', 'game-card'); card.dataset.gameId = game.game_id; card.open = expanded;
    const summary = node('summary');
    const title = node('div', 'game-title'); title.append(node('span', 'game-id', `#${game.game_id}`), document.createTextNode(game.game_mode || label('unknown')));
    const result = node('span', 'game-result ' + (game.winning_team === 'Good' ? 'good' : 'evil'), game.winning_team === 'Good' ? label('goodWon') : label('evilWon'));
    const date = game.date && !Number.isNaN(Date.parse(game.date)) ? new Date(game.date).toLocaleDateString(getLanguage() === 'ru' ? 'ru-RU' : undefined) : label('noDate');
    const playerCount = (game.players || []).length;
    const seats = (game.players || []).reduce((sum, player) => sum + (Array.isArray(player.role_assignments) && player.role_assignments.length ? player.role_assignments.length : 1), 0);
    const seatsText = seats !== playerCount ? ` · ${label('seats')}: ${seats}` : '';
    const meta = node('div', 'game-meta', `${date} · ${label('storyteller')}: ${clean(game.story_teller).replace(/\+/g, ', ') || '—'} · ${label('players')}: ${playerCount}${seatsText}`);
    summary.append(title, result, meta); card.appendChild(summary);
    const body = node('div', 'game-details'); body.appendChild(node('h3', '', label('players')));
    const players = node('div', 'game-players');
    for (const player of game.players || []) players.appendChild(playerDetails(player));
    body.appendChild(players);
    const mods = game.modifiers || {};
    const looseRoles = Array.isArray(mods.unassigned_roles) ? mods.unassigned_roles : [];
    if (looseRoles.length) body.appendChild(node('div', 'game-modifiers', `${label('unassigned')}: ${looseRoles.map(item => `${role(item.role)} (${team(item.team)})`).join(', ')}`));
    const entries = Object.entries(mods).filter(([name, value]) => name !== 'unassigned_roles' && (Array.isArray(value) ? value.length : value != null && value !== ''));
    const modifierText = entries.length ? entries.map(([name, value]) => `${tr(name === 'fabled' ? 'Fabled' : name === 'lorics' ? 'Lorics' : name)}: ${Array.isArray(value) ? value.map(role).join(', ') : String(value)}`).join(' · ') : label('none');
    body.appendChild(node('div', 'game-modifiers', `${label('modifiers')}: ${modifierText}`));
    card.appendChild(body); return card;
}

function render() {
    updateLabels();
    const list = $('games-list');
    const expanded = new Set([...list.querySelectorAll('details[open]')].map(item => item.dataset.gameId));
    list.replaceChildren(); $('games-error').hidden = !failed;
    if (failed) $('games-error').textContent = label('error');
    if (loading) { list.appendChild(node('div', 'games-empty', label('loading'))); return; }
    const query = $('games-search').value.trim().replace(/_/g, ' ').toLocaleLowerCase();
    const script = $('games-script').value, storyteller = $('games-storyteller').value, winner = $('games-winner').value;
    const filtered = games.filter(game => {
        if (script && game.game_mode !== script) return false;
        if (winner && game.winning_team !== winner) return false;
        if (storyteller && !String(game.story_teller || '').split('+').map(s => s.trim()).includes(storyteller)) return false;
        if (!query) return true;
        const searchable = [game.game_id, game.game_mode, game.story_teller, game.winning_team];
        for (const item of game.modifiers?.unassigned_roles || []) searchable.push(item.role, translateRole(item.role, 'ru'));
        for (const p of game.players || []) {
            const roles = distinct([p.role, ...(p.roles || []), ...(p.roles_in_play || []), ...(p.role_assignments || []).map(item => item.role)]);
            searchable.push(p.name, p.source_role, ...roles, ...roles.map(value => translateRole(value, 'ru')));
        }
        return searchable.some(value => String(value || '').replace(/_/g, ' ').toLocaleLowerCase().includes(query));
    }).sort((a, b) => b.game_id - a.game_id);
    $('games-count').textContent = getLanguage() === 'ru' ? `Показано ${filtered.length} из ${games.length}` : `Showing ${filtered.length} of ${games.length}`;
    if (!filtered.length && !failed) list.appendChild(node('div', 'games-empty', label('noGames')));
    else for (const game of filtered) list.appendChild(gameCard(game, expanded.has(String(game.game_id))));
}

for (const id of ['games-search', 'games-script', 'games-storyteller', 'games-winner']) {
    $(id).addEventListener(id === 'games-search' ? 'input' : 'change', render);
}
window.addEventListener('botc:languagechange', render);
render();
try { games = await fetchGames(); } catch (error) { console.error('Unable to load game history:', error); failed = true; }
loading = false; render();
