function storytellerNames(value) {
    return String(value || '')
        .split('+')
        .map(name => name.trim())
        .filter(Boolean);
}

function rolesForPlayer(player) {
    const history = Array.isArray(player.roles) ? player.roles : [];
    return new Set([...history, player.role].filter(role => typeof role === 'string' && role.trim()));
}

/**
 * Build stable filter choices from all games, including roles in a player's
 * recorded role history and individual storytellers from co-ST games.
 */
export function getFilterOptions(games) {
    const scripts = new Set();
    const storytellers = new Set();
    const players = new Set();
    const roles = new Set();

    for (const game of games) {
        if (game.game_mode) scripts.add(game.game_mode);
        storytellerNames(game.story_teller).forEach(name => storytellers.add(name));
        for (const player of game.players || []) {
            if (player.name) players.add(player.name);
            rolesForPlayer(player).forEach(role => roles.add(role));
        }
    }

    const sort = values => [...values].sort((a, b) => a.localeCompare(b));
    return {
        scripts: sort(scripts),
        storytellers: sort(storytellers),
        players: sort(players),
        roles: sort(roles),
    };
}

/**
 * Return games matching every active filter. Selected values use OR by default;
 * a filter can opt into matching all values. Exclude mode inverts that match.
 */
export function filterGames(games, filters, categorizeScript) {
    const selections = {
        gameType: normalizeSelection(filters.gameType),
        script: normalizeSelection(filters.script),
        storyteller: normalizeSelection(filters.storyteller),
        player: normalizeSelection(filters.player),
        role: normalizeSelection(filters.role),
    };

    return games.filter(game => {
        const gamePlayers = game.players || [];
        const gameRoles = new Set(gamePlayers.flatMap(gamePlayer => [...rolesForPlayer(gamePlayer)]));

        return matchesSelection(selections.gameType, [categorizeScript(game.game_mode)])
            && matchesSelection(selections.script, game.game_mode ? [game.game_mode] : [])
            && matchesSelection(selections.storyteller, storytellerNames(game.story_teller))
            && matchesSelection(selections.player, gamePlayers.map(gamePlayer => gamePlayer.name).filter(Boolean))
            && matchesSelection(selections.role, [...gameRoles]);
    });
}

function normalizeSelection(selection) {
    if (Array.isArray(selection)) return { mode: 'include', match: 'any', values: selection };
    return {
        mode: selection?.mode === 'exclude' ? 'exclude' : 'include',
        match: selection?.match === 'all' ? 'all' : 'any',
        values: Array.isArray(selection?.values) ? selection.values : [],
    };
}

function matchesSelection(selection, gameValues) {
    if (!selection.values.length) return true;
    const hasMatch = selection.match === 'all'
        ? selection.values.every(value => gameValues.includes(value))
        : gameValues.some(value => selection.values.includes(value));
    return selection.mode === 'exclude' ? !hasMatch : hasMatch;
}
