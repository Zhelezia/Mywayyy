import {canonicalCharacterName, characterRoleKey} from './roleNames.mjs';

function storytellerNames(value) {
    return String(value || '')
        .split('+')
        .map(name => name.trim())
        .filter(Boolean);
}

function rolesForPlayer(player) {
    const history = Array.isArray(player.roles) ? player.roles : [];
    const inPlay = Array.isArray(player.roles_in_play) ? player.roles_in_play : [];
    const assigned = Array.isArray(player.role_assignments)
        ? player.role_assignments.map(assignment => assignment.role)
        : [];
    return new Set([...history, ...inPlay, ...assigned, player.role]
        .filter(role => typeof role === 'string' && role.trim()));
}

function roleKey(role) {
    return characterRoleKey(role);
}

function roleFilterLabel(role) {
    return canonicalCharacterName(role);
}



/**
 * Build stable filter choices from all games, including roles in a player's
 * recorded role history and individual storytellers from co-ST games.
 */
export function getFilterOptions(games) {
    const scripts = new Set();
    const storytellers = new Set();
    const players = new Set();
    const roles = new Map();

    for (const game of games) {
        if (game.game_mode) scripts.add(game.game_mode);
        storytellerNames(game.story_teller).forEach(name => storytellers.add(name));
        for (const player of game.players || []) {
            if (player.name) players.add(player.name);
            rolesForPlayer(player).forEach(role => {
                const key = roleKey(role);
                if (!roles.has(key)) roles.set(key, roleFilterLabel(role));
            });
        }
    }

    const sort = values => [...values].sort((a, b) => a.localeCompare(b));
    return {
        scripts: sort(scripts),
        storytellers: sort(storytellers),
        players: sort(players),
        roles: sort(roles.values()),
    };
}

/**
 * Return games matching every active filter. Includes use OR by default, or AND
 * for an all-player selection. Any excluded value always rules a game out.
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
        const gameRoles = new Set(gamePlayers.flatMap(gamePlayer => [...rolesForPlayer(gamePlayer)].map(roleKey)));

        return matchesSelection(selections.gameType, [categorizeScript(game.game_mode)])
            && matchesSelection(selections.script, game.game_mode ? [game.game_mode] : [])
            && matchesSelection(selections.storyteller, storytellerNames(game.story_teller))
            && matchesSelection(selections.player, gamePlayers.map(gamePlayer => gamePlayer.name).filter(Boolean))
            && matchesSelection(selections.role, [...gameRoles], roleKey);
    });
}

function normalizeSelection(selection) {
    if (Array.isArray(selection)) return { include: selection, exclude: [], match: 'any' };
    return {
        include: Array.isArray(selection?.include) ? selection.include : [],
        exclude: Array.isArray(selection?.exclude) ? selection.exclude : [],
        match: selection?.match === 'all' ? 'all' : 'any',
    };
}

function matchesSelection(selection, gameValues, normalize = value => value) {
    const available = new Set(gameValues.map(normalize));
    if (selection.exclude.some(value => available.has(normalize(value)))) return false;
    if (!selection.include.length) return true;
    return selection.match === 'all'
        ? selection.include.every(value => available.has(normalize(value)))
        : selection.include.some(value => available.has(normalize(value)));
}

