const AL_HADIKHIA = 'alhadikhia';

function compactName(name) {
    return String(name || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

function isAlHadikhiaVariant(name) {
    const candidate = compactName(name);
    if (!candidate.startsWith('al') || Math.abs(candidate.length - AL_HADIKHIA.length) > 2) {
        return false;
    }

    let previous = Array.from({length: candidate.length + 1}, (_, index) => index);
    for (let row = 1; row <= AL_HADIKHIA.length; row++) {
        const current = [row];
        let rowMinimum = row;
        for (let column = 1; column <= candidate.length; column++) {
            const cost = AL_HADIKHIA[row - 1] === candidate[column - 1] ? 0 : 1;
            current[column] = Math.min(
                current[column - 1] + 1,
                previous[column] + 1,
                previous[column - 1] + cost
            );
            rowMinimum = Math.min(rowMinimum, current[column]);
        }
        if (rowMinimum > 2) return false;
        previous = current;
    }
    return previous[candidate.length] <= 2;
}

export function canonicalCharacterName(name) {
    const trimmed = String(name || '').trim().replace(/\s+/g, ' ');
    return isAlHadikhiaVariant(trimmed) ? 'Al-Hadikhia' : trimmed;
}

export function characterRoleKey(name) {
    return canonicalCharacterName(name).toLowerCase();
}
