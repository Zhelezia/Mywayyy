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
 * Return games matching every active filter. Values within each game field
 * match exactly; selecting a player or role includes games containing either.
 */
export function filterGames(games, filters, categorizeScript) {
    const {
        gameType = 'all',
        script = '',
        storyteller = '',
        player = '',
        role = '',
    } = filters;
    const targetCategory = gameType === 'normal'
        ? 'Normal'
        : gameType === 'teensyville'
            ? 'Teensyville'
            : null;

    return games.filter(game => {
        if (targetCategory && categorizeScript(game.game_mode) !== targetCategory) return false;
        if (script && game.game_mode !== script) return false;
        if (storyteller && !storytellerNames(game.story_teller).includes(storyteller)) return false;

        const gamePlayers = game.players || [];
        if (player && !gamePlayers.some(gamePlayer => gamePlayer.name === player)) return false;
        if (role && !gamePlayers.some(gamePlayer => rolesForPlayer(gamePlayer).has(role))) return false;
        return true;
    });
}
