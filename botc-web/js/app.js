/**
 * Blood on the Clocktower Stats - Main Application
 */

import { recalcAll, getLeaderboard, pctToStr, getRatingDelta } from './elo.js?v=provisional-rating-1300-2026-11-04';
import { fetchGames, fetchScripts, isDemoMode } from './supabase.js';
import { initGameEntry, updatePlayerNames } from './gameEntry.js';
import { categorizeScript, setScriptCategories } from './config.js';
import { filterGames, getFilterOptions } from './leaderboardFilters.mjs?v=tri-state-2026-11-04';
import SITE_CONFIG from './site-config.js';

// Global state
let gameLog = [];
let players = {};
let leaderboard = [];
let currentSort = { column: 'rating', ascending: false };

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const contentEl = document.getElementById('content');
const tableBodyEl = document.getElementById('leaderboard-body');
const gameRangeInput = document.getElementById('game-range');
const clearRangeBtn = document.getElementById('clear-range');
const gameTypeFilterEl = document.getElementById('game-type-filter');
const scriptFilterEl = document.getElementById('script-filter');
const storytellerFilterEl = document.getElementById('storyteller-filter');
const playerFilterEl = document.getElementById('player-filter');
const roleFilterEl = document.getElementById('role-filter');
const leaderboardFilterEls = [gameTypeFilterEl, scriptFilterEl, storytellerFilterEl, playerFilterEl, roleFilterEl].filter(Boolean);
const resetFiltersBtn = document.getElementById('reset-leaderboard-filters');
const filterResultCountEl = document.getElementById('filter-result-count');
const hideUnder10GamesEl = document.getElementById('hide-under-10-games');

// Stats elements
const totalGamesEl = document.getElementById('total-games');
const totalPlayersEl = document.getElementById('total-players');
const goodWinsEl = document.getElementById('good-wins');
const evilWinsEl = document.getElementById('evil-wins');
const goodWinsCountEl = document.getElementById('good-wins-count');
const evilWinsCountEl = document.getElementById('evil-wins-count');
const winBarGoodEl = document.getElementById('win-bar-good');
const winBarEvilEl = document.getElementById('win-bar-evil');

/**
 * Initialize the application
 */
async function init() {
    try {
        showLoading();

        // Apply community name from config
        const h1 = document.querySelector('header h1');
        if (h1 && SITE_CONFIG.communityName) {
            h1.textContent = SITE_CONFIG.communityName;
        }

        // Show demo banner if in demo mode
        if (isDemoMode()) {
            const banner = document.createElement('div');
            banner.className = 'demo-banner';
            banner.innerHTML = 'Demo Mode — showing sample data. <a href="https://github.com/RossFW/botc-stats#quick-start-5-steps" target="_blank">Set up your own</a>';
            document.querySelector('.container').prepend(banner);
        }

        // Fetch scripts first so categorizeScript() knows custom categories
        try {
            const scripts = await fetchScripts();
            setScriptCategories(scripts);
        } catch (e) {
            console.warn('Could not load scripts for categorization:', e);
        }

        // Fetch game data
        gameLog = await fetchGames();
        populateLeaderboardFilters();

        // Calculate ELO ratings based on current filter
        recalcForFilter();

        // Update stats summary
        updateStatsSummary();

        // Render the leaderboard
        renderLeaderboard();

        // Set up event listeners
        setupEventListeners();

        // Initialize game entry module with refresh callback and player names from Supabase
        const playerNames = [...new Set(gameLog.flatMap(g => g.players.map(p => p.name)))].sort();
        initGameEntry(refreshData, playerNames);

        showContent();
    } catch (error) {
        console.error('Failed to initialize:', error);
        showError(error.message);
    }
}

/**
 * Show loading state
 */
function showLoading() {
    loadingEl.style.display = 'flex';
    errorEl.style.display = 'none';
    contentEl.style.display = 'none';
}

/**
 * Show error state
 */
function showError(message) {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
    errorEl.querySelector('.error-text').textContent = message;
    contentEl.style.display = 'none';

    // A "Failed to fetch" / network error usually means Supabase is unreachable —
    // most often a paused free project or a wrong URL/key. Add guidance.
    const isConnError = /failed to fetch|networkerror|load failed/i.test(message || '');
    let hint = errorEl.querySelector('.error-hint');
    if (isConnError) {
        if (!hint) {
            hint = document.createElement('div');
            hint.className = 'error-hint';
            hint.style.cssText = 'margin-top:14px;font-size:0.9rem;color:var(--text-secondary);line-height:1.6;text-align:left;max-width:560px;';
            errorEl.appendChild(hint);
        }
        hint.innerHTML =
            "Couldn't reach your Supabase project. Common causes:" +
            '<ul style="margin:8px 0 0;padding-left:20px;">' +
            '<li><strong>Project paused</strong> — free Supabase projects pause after ~1 week of inactivity. Open your Supabase dashboard and resume it.</li>' +
            '<li><strong>Wrong URL or key</strong> — double-check your Project URL and anon key in <code>site-config.js</code>.</li>' +
            '</ul>';
    } else if (hint) {
        hint.remove();
    }
}

/**
 * Show main content
 */
function showContent() {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
    contentEl.style.display = 'block';
}

/**
 * Refresh data from the database (called after game is added)
 */
async function refreshData() {
    try {
        // Refetch scripts (in case new ones were added) and games
        try {
            const scripts = await fetchScripts();
            setScriptCategories(scripts);
        } catch (e) {
            console.warn('Could not refresh scripts:', e);
        }

        // Refetch games
        gameLog = await fetchGames();
        populateLeaderboardFilters();

        // Recalculate ELO ratings based on current filter
        recalcForFilter();

        // Update display
        updateStatsSummary();
        renderLeaderboard();

        // Update autocomplete with any new player names from Supabase
        const updatedNames = [...new Set(gameLog.flatMap(g => g.players.map(p => p.name)))].sort();
        updatePlayerNames(updatedNames);
    } catch (error) {
        console.error('Failed to refresh data:', error);
    }
}

/**
 * Filter games using all selected leaderboard filters.
 * @returns {Array} Filtered game log
 */
function getFilteredGames() {
    return filterGames(gameLog, {
        gameType: getFilterSelection(gameTypeFilterEl),
        script: getFilterSelection(scriptFilterEl),
        storyteller: getFilterSelection(storytellerFilterEl),
        player: getFilterSelection(playerFilterEl),
        role: getFilterSelection(roleFilterEl),
    }, categorizeScript);
}

/**
 * Fill three-state choices from the loaded history, preserving valid selections.
 */
function populateLeaderboardFilters() {
    const options = getFilterOptions(gameLog);
    setFilterOptions(gameTypeFilterEl, [
        { value: 'Normal', label: 'Full scripts' },
        { value: 'Teensyville', label: 'Teensyville' },
    ]);
    setFilterOptions(scriptFilterEl, options.scripts.map(value => ({ value, label: value })));
    setFilterOptions(storytellerFilterEl, options.storytellers.map(value => ({ value, label: formatPlayerName(value) })));
    setFilterOptions(playerFilterEl, options.players.map(value => ({ value, label: formatPlayerName(value) })));
    setFilterOptions(roleFilterEl, options.roles.map(value => ({ value, label: formatPlayerName(value) })));
    updateFilterSummaries();
}

function setFilterOptions(filterEl, options) {
    const optionsEl = filterEl?.querySelector('[data-filter-options]');
    if (!optionsEl) return;

    const previousStates = new Map([...optionsEl.querySelectorAll('[data-filter-value]')]
        .map(option => [option.dataset.filterValue, option.dataset.filterState]));
    optionsEl.replaceChildren();
    options.forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'filter-option';
        button.dataset.filterValue = option.value;

        const mark = document.createElement('span');
        mark.className = 'filter-option-mark';
        mark.setAttribute('aria-hidden', 'true');

        const name = document.createElement('span');
        name.className = 'filter-option-name';
        name.textContent = option.label;

        button.append(mark, name);
        setFilterOptionState(button, previousStates.get(option.value) || 'neutral');
        optionsEl.appendChild(button);
    });
    applyFilterSearch(filterEl);
}

function setFilterOptionState(optionEl, state) {
    const states = {
        neutral: { mark: '', label: 'Any', next: 'include' },
        include: { mark: '✓', label: 'Included', next: 'exclude' },
        exclude: { mark: '✕', label: 'Excluded', next: 'clear' },
    };
    const current = states[state] || states.neutral;
    optionEl.dataset.filterState = states[state] ? state : 'neutral';
    optionEl.querySelector('.filter-option-mark').textContent = current.mark;
    const label = optionEl.querySelector('.filter-option-name').textContent;
    const description = `${label}: ${current.label}. Click to ${current.next}.`;
    optionEl.setAttribute('aria-label', description);
    optionEl.title = description;
}

function getFilterSelection(filterEl) {
    if (!filterEl) return { include: [], exclude: [] };
    const matchControl = filterEl.querySelector('[data-filter-match]');
    const valuesFor = state => [...filterEl.querySelectorAll(`[data-filter-state="${state}"]`)]
        .map(option => option.dataset.filterValue);
    return {
        match: matchControl ? matchControl.value : 'any',
        include: valuesFor('include'),
        exclude: valuesFor('exclude'),
    };
}

function applyFilterSearch(filterEl) {
    const query = filterEl?.querySelector('[data-filter-search]')?.value.trim().toLocaleLowerCase() || '';
    filterEl?.querySelectorAll('.filter-option').forEach(optionEl => {
        optionEl.hidden = !optionEl.querySelector('.filter-option-name').textContent.toLocaleLowerCase().includes(query);
    });
    const options = [...filterEl.querySelectorAll('.filter-option')];
    const empty = filterEl.querySelector('[data-filter-empty]');
    if (empty) empty.hidden = options.some(option => !option.hidden);
    filterEl.querySelectorAll('[data-filter-action$="-visible"]').forEach(button => {
        button.disabled = !options.some(option => !option.hidden);
    });
}

function updateFilterSummaries() {
    leaderboardFilterEls.forEach(filterEl => {
        const { include, exclude } = getFilterSelection(filterEl);
        const summary = filterEl.querySelector('[data-filter-summary]');
        if (summary) {
            summary.textContent = [include.length ? `✓ ${include.length}` : '', exclude.length ? `✕ ${exclude.length}` : '']
                .filter(Boolean).join(' · ') || 'All';
            summary.setAttribute('aria-label', include.length || exclude.length
                ? `${include.length} included, ${exclude.length} excluded` : 'All');
        }
        filterEl.classList.toggle('has-selection', include.length + exclude.length > 0);
    });
}

function updateFilterResultCount() {
    if (!filterResultCountEl) return;
    const filteredGames = getFilteredGames();
    const visiblePlayers = getVisibleLeaderboard().length;
    const playerLabel = visiblePlayers === 1 ? 'player ranked' : 'players ranked';
    filterResultCountEl.textContent = `Showing ${filteredGames.length} of ${gameLog.length} games · ${visiblePlayers} ${playerLabel}`;
}

function getVisibleLeaderboard() {
    const visible = leaderboard.filter(player => !hideUnder10GamesEl?.checked || player.gamesPlayed >= 10);
    const ratingOrder = [...visible].sort((a, b) => b.rating - a.rating);
    const rankByName = new Map(ratingOrder.map((player, index) => [player.name, index + 1]));
    return visible.map(player => ({ ...player, rank: rankByName.get(player.name) }));
}

/**
 * Recalculate ELO and leaderboard based on current game type filter.
 */
function recalcForFilter() {
    const filteredGames = getFilteredGames();
    players = recalcAll(filteredGames, gameLog);
    leaderboard = getLeaderboard(players);
    updateFilterSummaries();
    updateFilterResultCount();
}

/**
 * Update the stats summary cards
 */
function updateStatsSummary() {
    const filteredGames = getFilteredGames();
    const totalGames = filteredGames.length;
    const noGamesMsg = document.getElementById('no-games-msg');

    if (totalGames === 0) {
        totalGamesEl.textContent = 0;
        totalPlayersEl.textContent = 0;
        goodWinsEl.textContent = '0%';
        evilWinsEl.textContent = '0%';
        if (goodWinsCountEl) goodWinsCountEl.textContent = '0';
        if (evilWinsCountEl) evilWinsCountEl.textContent = '0';
        if (winBarGoodEl) winBarGoodEl.style.display = 'none';
        if (winBarEvilEl) winBarEvilEl.style.display = 'none';
        if (noGamesMsg) {
            noGamesMsg.textContent = gameLog.length ? 'No games match the selected filters' : 'No games logged yet';
            noGamesMsg.style.display = 'block';
        }
        return;
    }

    // Hide message
    if (noGamesMsg) {
        noGamesMsg.textContent = 'No games logged yet';
        noGamesMsg.style.display = 'none';
    }

    const goodWins = filteredGames.filter(g => g.winning_team === 'Good').length;
    const evilWins = filteredGames.filter(g => g.winning_team === 'Evil').length;
    const uniquePlayers = new Set(filteredGames.flatMap(g => g.players.map(p => p.name))).size;

    totalGamesEl.textContent = totalGames;
    totalPlayersEl.textContent = uniquePlayers;
    const goodPct = ((goodWins / totalGames) * 100).toFixed(1);
    const evilPct = ((evilWins / totalGames) * 100).toFixed(1);
    goodWinsEl.textContent = `${goodPct}%`;
    evilWinsEl.textContent = `${evilPct}%`;
    if (goodWinsCountEl) goodWinsCountEl.textContent = goodWins;
    if (evilWinsCountEl) evilWinsCountEl.textContent = evilWins;

    // Hide bar segment when 0%, show when > 0%
    if (winBarGoodEl) {
        winBarGoodEl.style.display = goodWins > 0 ? '' : 'none';
        winBarGoodEl.style.width = `${goodPct}%`;
    }
    if (winBarEvilEl) {
        winBarEvilEl.style.display = evilWins > 0 ? '' : 'none';
        winBarEvilEl.style.width = `${evilPct}%`;
    }
}

/**
 * Parse game range input
 * @returns {{start: number|null, end: number|null}}
 */
function parseGameRange() {
    const rangeStr = gameRangeInput.value.trim();
    if (!rangeStr) {
        return { start: null, end: null };
    }

    try {
        if (rangeStr.includes('-')) {
            const parts = rangeStr.split('-');
            if (parts.length === 2) {
                const start = parts[0].trim() ? parseInt(parts[0].trim()) : null;
                const end = parts[1].trim() ? parseInt(parts[1].trim()) : null;
                return { start, end };
            }
        } else {
            const gameNum = parseInt(rangeStr);
            return { start: gameNum, end: gameNum };
        }
    } catch {
        return { start: null, end: null };
    }

    return { start: null, end: null };
}

/**
 * Render the leaderboard table
 */
function renderLeaderboard() {
    const { start, end } = parseGameRange();

    // Sort the leaderboard
    const sortedLeaderboard = getVisibleLeaderboard().sort((a, b) => {
        let aVal, bVal;

        switch (currentSort.column) {
            case 'rank':
                aVal = a.rank;
                bVal = b.rank;
                break;
            case 'name':
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                return currentSort.ascending
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            case 'rating':
                aVal = a.rating;
                bVal = b.rating;
                break;
            case 'overall':
                aVal = a.overallWinPct || 0;
                bVal = b.overallWinPct || 0;
                break;
            case 'good':
                aVal = a.goodWinPct || 0;
                bVal = b.goodWinPct || 0;
                break;
            case 'evil':
                aVal = a.evilWinPct || 0;
                bVal = b.evilWinPct || 0;
                break;
            case 'games':
                aVal = a.gamesPlayed;
                bVal = b.gamesPlayed;
                break;
            default:
                aVal = a.rating;
                bVal = b.rating;
        }

        return currentSort.ascending ? aVal - bVal : bVal - aVal;
    });

    // Clear existing rows
    tableBodyEl.innerHTML = '';

    if (!sortedLeaderboard.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 8;
        cell.className = 'leaderboard-empty';
        cell.textContent = hideUnder10GamesEl?.checked
            ? 'No players have 10 or more games in this selection'
            : 'No players match the selected games';
        row.appendChild(cell);
        tableBodyEl.appendChild(row);
    }

    // Add rows
    sortedLeaderboard.forEach((player, index) => {
        const delta = getRatingDelta(player, start, end);
        const deltaStr = delta !== null ? (delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)) : '-';
        const deltaClass = delta !== null ? (delta > 0 ? 'delta-positive' : delta < 0 ? 'delta-negative' : '') : '';
        const deltaTextClass = delta !== null ? (delta > 0 ? 'delta-positive-text' : delta < 0 ? 'delta-negative-text' : '') : '';

        const row = document.createElement('tr');
        row.className = `clickable ${deltaClass}`;
        row.dataset.playerName = player.name;

        // Rank styling
        let rankClass = '';
        if (player.rank === 1) rankClass = 'rank-1';
        else if (player.rank === 2) rankClass = 'rank-2';
        else if (player.rank === 3) rankClass = 'rank-3';

        row.innerHTML = `
            <td class="rank ${rankClass}">${player.rank}</td>
            <td class="player-name">${formatPlayerName(player.name)}</td>
            <td class="rating">${player.rating.toFixed(1)}</td>
            <td class="delta ${deltaTextClass}">${deltaStr}</td>
            <td class="pct">
                <div class="pct-bar">
                    <span>${pctToStr(player.overallWinPct)}%</span>
                    <div class="bar">
                        <div class="bar-fill overall" style="width: ${player.overallWinPct || 0}%"></div>
                    </div>
                </div>
            </td>
            <td class="pct">
                <div class="pct-bar">
                    <span>${pctToStr(player.goodWinPct)}%</span>
                    <div class="bar">
                        <div class="bar-fill good" style="width: ${player.goodWinPct || 0}%"></div>
                    </div>
                </div>
            </td>
            <td class="pct">
                <div class="pct-bar">
                    <span>${pctToStr(player.evilWinPct)}%</span>
                    <div class="bar">
                        <div class="bar-fill evil" style="width: ${player.evilWinPct || 0}%"></div>
                    </div>
                </div>
            </td>
            <td class="games">${player.gamesPlayed}</td>
        `;

        row.addEventListener('click', () => showPlayerModal(player));
        tableBodyEl.appendChild(row);
    });

    // Update column headers for sort indicators
    updateSortIndicators();
}

/**
 * Format player name for display (replace underscores with spaces)
 */
function formatPlayerName(name) {
    return name.replace(/_/g, ' ');
}

/**
 * Update sort indicators on column headers
 */
function updateSortIndicators() {
    document.querySelectorAll('.leaderboard-table th[data-sort]').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (th.dataset.sort === currentSort.column) {
            th.classList.add(currentSort.ascending ? 'sorted-asc' : 'sorted-desc');
        }
    });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Game range input
    gameRangeInput.addEventListener('input', () => {
        renderLeaderboard();
    });

    // Clear range button
    clearRangeBtn.addEventListener('click', () => {
        gameRangeInput.value = '';
        renderLeaderboard();
    });

    // Recalculate ratings, summary cards, and leaderboard whenever filters change.
    leaderboardFilterEls.forEach(filterEl => {
        filterEl.addEventListener('change', event => {
            if (!event.target.matches('[data-filter-match]')) return;
            recalcForFilter();
            updateStatsSummary();
            renderLeaderboard();
        });

        filterEl.querySelector('[data-filter-search]')?.addEventListener('input', () => applyFilterSearch(filterEl));

        filterEl.addEventListener('click', event => {
            const option = event.target.closest('[data-filter-value]');
            const action = event.target.closest('[data-filter-action]')?.dataset.filterAction;
            if (!option && !action) return;

            if (option) {
                const nextState = { neutral: 'include', include: 'exclude', exclude: 'neutral' };
                setFilterOptionState(option, nextState[option.dataset.filterState]);
            } else {
                filterEl.querySelectorAll('[data-filter-value]').forEach(optionEl => {
                    if (action === 'clear') setFilterOptionState(optionEl, 'neutral');
                    else if (!optionEl.hidden) setFilterOptionState(optionEl, action === 'include-visible' ? 'include' : 'exclude');
                });
            }

            recalcForFilter();
            updateStatsSummary();
            renderLeaderboard();
        });

        filterEl.addEventListener('keydown', event => {
            if (event.key !== 'Escape') return;
            filterEl.open = false;
            filterEl.querySelector('summary').focus();
        });

        filterEl.addEventListener('toggle', () => {
            if (filterEl.open) leaderboardFilterEls.forEach(other => {
                if (other !== filterEl) other.open = false;
            });
        });
    });

    document.addEventListener('click', event => {
        leaderboardFilterEls.forEach(filterEl => {
            if (!filterEl.contains(event.target)) filterEl.open = false;
        });
    });

    resetFiltersBtn?.addEventListener('click', () => {
        leaderboardFilterEls.forEach(filterEl => {
            const match = filterEl.querySelector('[data-filter-match]');
            if (match) match.value = 'all';
            const search = filterEl.querySelector('[data-filter-search]');
            if (search) search.value = '';
            filterEl.querySelectorAll('[data-filter-value]').forEach(option => {
                setFilterOptionState(option, 'neutral');
            });
            filterEl.open = false;
            applyFilterSearch(filterEl);
        });
        if (hideUnder10GamesEl) hideUnder10GamesEl.checked = false;
        gameRangeInput.value = '';
        recalcForFilter();
        updateStatsSummary();
        renderLeaderboard();
    });

    hideUnder10GamesEl?.addEventListener('change', () => {
        updateFilterResultCount();
        renderLeaderboard();
    });

    // Column sorting
    document.querySelectorAll('.leaderboard-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            if (currentSort.column === column) {
                currentSort.ascending = !currentSort.ascending;
            } else {
                currentSort.column = column;
                currentSort.ascending = column === 'name'; // Default ascending for name
            }
            renderLeaderboard();
        });
    });

    // Modal close
    document.querySelector('.modal-close').addEventListener('click', closePlayerModal);
    document.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closePlayerModal();
        }
    });

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePlayerModal();
        }
    });
}

/**
 * Show player details modal with rating chart
 */
function showPlayerModal(player) {
    const modal = document.querySelector('.modal-overlay');
    const modalTitle = document.querySelector('.modal h3');
    const chartContainer = document.getElementById('rating-chart');

    modalTitle.textContent = `${formatPlayerName(player.name)} - Rating History`;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Render chart using Chart.js
    renderRatingChart(player, chartContainer);
}

/**
 * Close player modal
 */
function closePlayerModal() {
    const modal = document.querySelector('.modal-overlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Destroy existing chart
    const chartContainer = document.getElementById('rating-chart');
    if (chartContainer.chart) {
        chartContainer.chart.destroy();
    }
}

/**
 * Render rating history chart
 */
function renderRatingChart(player, container) {
    // Destroy existing chart if any
    if (container.chart) {
        container.chart.destroy();
    }

    const history = player.ratingHistory;
    const gameNumbers = history.map(h => h.gameNumber);
    const ratings = history.map(h => h.rating);
    const overallPcts = history.map(h => h.overallWinPct);
    const goodPcts = history.map(h => h.goodWinPct);
    const evilPcts = history.map(h => h.evilWinPct);

    const ctx = container.getContext('2d');

    container.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: gameNumbers,
            datasets: [
                {
                    label: 'Rating',
                    data: ratings,
                    borderColor: '#60a5fa',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    yAxisID: 'y',
                    tension: 0.1,
                    pointRadius: 3,
                },
                {
                    label: 'Overall Win %',
                    data: overallPcts,
                    borderColor: '#a78bfa',
                    borderDash: [5, 5],
                    yAxisID: 'y1',
                    tension: 0.1,
                    pointRadius: 2,
                },
                {
                    label: 'Good Win %',
                    data: goodPcts,
                    borderColor: '#4ade80',
                    borderDash: [5, 5],
                    yAxisID: 'y1',
                    tension: 0.1,
                    pointRadius: 2,
                },
                {
                    label: 'Evil Win %',
                    data: evilPcts,
                    borderColor: '#f87171',
                    borderDash: [5, 5],
                    yAxisID: 'y1',
                    tension: 0.1,
                    pointRadius: 2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#eaeaea',
                    },
                },
                tooltip: {
                    backgroundColor: '#1a1a2e',
                    titleColor: '#eaeaea',
                    bodyColor: '#a0a0a0',
                    borderColor: '#2d3748',
                    borderWidth: 1,
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Game Number',
                        color: '#a0a0a0',
                    },
                    ticks: {
                        color: '#a0a0a0',
                    },
                    grid: {
                        color: '#2d3748',
                    },
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Rating',
                        color: '#60a5fa',
                    },
                    ticks: {
                        color: '#60a5fa',
                    },
                    grid: {
                        color: '#2d3748',
                    },
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Win %',
                        color: '#a78bfa',
                    },
                    ticks: {
                        color: '#a78bfa',
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    min: 0,
                    max: 100,
                },
            },
        },
    });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
