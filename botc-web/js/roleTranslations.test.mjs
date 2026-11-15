import test from 'node:test';
import assert from 'node:assert/strict';
import { translateRole, canonicalRoleInput } from './roleTranslations.mjs';
import { tr } from './i18n.mjs';

test('Russian names use the fan wiki and distinguish similar characters', () => {
    assert.equal(translateRole('Oracle', 'ru'), 'Пророк');
    assert.equal(translateRole('Tea_Lady', 'ru'), 'Травница');
    assert.equal(translateRole('Goon', 'ru'), 'Наемник');
    assert.equal(translateRole('Boffin', 'ru'), 'Умник');
    assert.equal(translateRole('Wraith', 'ru'), 'Призрак');
    assert.equal(translateRole('Al-hadikhia', 'ru'), 'Аль-Адихия');
});

test('the supplied fan scripts provide their Russian character names', () => {
    assert.equal(translateRole('Scrounger', 'ru'), 'Собиратель');
    assert.equal(translateRole("Au'Wre", 'ru'), "Ау'Врэ");
    assert.equal(translateRole('Black_Ops', 'ru'), 'Оперативник');
    assert.equal(translateRole('Internal_Wiretap', 'ru'), 'Внутренняя прослушка');
    assert.equal(canonicalRoleInput('Внутренняя прослушка'), 'Internal_Wiretap');
    assert.equal(canonicalRoleInput('Заклинатель_змей'), 'Snake_Charmer');
});

test('untranslated roles remain readable and English remains available', () => {
    assert.equal(translateRole('Custom_Role', 'ru'), 'Custom Role');
    assert.equal(translateRole('Snake_Charmer', 'en'), 'Snake Charmer');
    assert.equal(tr('Leaderboard', 'ru'), 'Рейтинг');
    assert.equal(tr('Leaderboard', 'en'), 'Leaderboard');
});
