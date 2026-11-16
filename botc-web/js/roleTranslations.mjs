import { fanRoleNames } from './fanRoleNames.mjs';
import { canonicalCharacterName } from './roleNames.mjs?v=monsta-2026-11-16';

// Standard character names follow the Russian BOTC fan wiki; custom names
// come from the supplied Russian script files.
export const roleNamesRu = {
    Washerwoman:'Прачка', Librarian:'Библиотекарь', Investigator:'Сыщик', Chef:'Повар', Empath:'Эмпат',
    Fortune_Teller:'Гадалка', Undertaker:'Гробовщик', Monk:'Монах', Ravenkeeper:'Смотритель воронов',
    Virgin:'Девственница', Slayer:'Истребитель', Soldier:'Солдат', Mayor:'Мэр', Butler:'Дворецкий',
    Drunk:'Пьяница', Recluse:'Затворник', Saint:'Святой', Poisoner:'Отравитель', Spy:'Шпион',
    Scarlet_Woman:'Блудница', Baron:'Барон', Imp:'Черт',
    Grandmother:'Бабушка', Sailor:'Моряк', Chambermaid:'Горничная', Exorcist:'Экзорцист',
    Innkeeper:'Трактирщик', Gambler:'Азартный игрок', Gossip:'Сплетница', Courtier:'Придворный',
    Professor:'Профессор', Minstrel:'Менестрель', Tea_Lady:'Травница', Pacifist:'Пацифист', Fool:'Шут',
    Tinker:'Механик', Moonchild:'Дитя луны', Goon:'Наемник', Lunatic:'Безумец', Godfather:'Крестный отец',
    "Devil's_Advocate":'Адвокат дьявола', Assassin:'Убийца', Mastermind:'Кукловод', Zombuul:'Зомбул',
    Pukka:'Пукка', Shabaloth:'Шабалот', Po:'По', Clockmaker:'Часовщик', Dreamer:'Сновидец',
    Snake_Charmer:'Заклинатель змей', Mathematician:'Математик', Flowergirl:'Цветочница',
    Town_Crier:'Глашатай', Oracle:'Пророк', Savant:'Савант', Seamstress:'Швея', Philosopher:'Философ',
    Artist:'Художник', Juggler:'Жонглер', Sage:'Мудрец', Mutant:'Уродец', Klutz:'Растяпа',
    Sweetheart:'Душечка', Barber:'Парикмахер', Evil_Twin:'Злой близнец', Witch:'Ведьма',
    Cerenovus:'Цереновус', 'Pit-Hag':'Яга', Yaga:'Яга', Vigormortis:'Вигормортис', Fang_Gu:'Фан Гу',
    No_Dashii:'Но Даши', Vortox:'Вортокс', Acrobat:'Акробат', Alchemist:'Алхимик', Alsaahir:'Аль-Сахер',
    Amnesiac:'Амнезиак', Noble:'Аристократ', Atheist:'Атеист', Balloonist:'Аэронавт', Banshee:'Банши',
    High_Priestess:'Верховная жрица', General:'Генерал', Village_Idiot:'Дурачок', Cannibal:'Каннибал',
    King:'Король', Pixie:'Пикси', Princess:'Принцесса', Preacher:'Проповедник', Fisherman:'Рыбак',
    Knight:'Рыцарь', Steward:'Управляющий', Farmer:'Фермер', Magician:'Фокусник', Choirboy:'Хорист',
    Shugenja:'Сюгэндзя', Nightwatchman:'Стражник', Golem:'Голем', Puzzlemaster:'Головоломщик',
    Damsel:'Дамочка', Heretic:'Еретик', Ogre:'Огр', Hermit:'Отшельник', Politician:'Политик',
    Plague_Doctor:'Чумной доктор', Widow:'Вдова', Vizier:'Визирь', Wizard:'Волшебник', Harpy:'Гарпия',
    Goblin:'Гоблин', Xaan:'Ксаан', Marionette:'Марионетка', Mezepheles:'Мецефель', Boffin:'Умник',
    Boomdandy:'Бомбардир', Wraith:'Призрак', Summoner:'Призыватель', Psychopath:'Психопат',
    'Al-Hadikhia':'Аль-Адихия', Lord_Of_Typhon:'Владыка Тифона', Kazali:'Казали', Leviathan:'Левиафан',
    Legion:'Легион', Riot:'Мятежник', Ojo:'Охо', Lleech:'Пиявица', Yaggababble:'Ягатрёп', "Lil'_Monsta":'Монстренок',
    Apprentice:'Ученик', Judge:'Судья', Barista:'Бариста', Harlot:'Распутница',
    Angel:'Ангел', Djinn:'Джинн', Bootlegger:'Бутлегер', Storm_Catcher:'Ловец бури',
    Actor:'Актер', Mortician:'Могильщик', Physician:'Лекарь', Standard_Bearer:'Знаменосец',
    Spartacus:'Спартак', Haruspex:'Гаруспик', Cleopatra:'Клеопатра',
    Anger:'Злоба', Anxiety:'Тревожность', Boredom:'Скука', Disappointment:'Разочарование',
    Faith:'Вера', Fear:'Страх', Gratitude:'Благодарность', Grief:'Скорбь', Guilt:'Вина',
    Happiness:'Счастье', Hope:'Надежда', Love:'Любовь', Joy:'Восторг', Sadness:'Грусть',
    ...fanRoleNames,
    Internal_Wiretap:'Внутренняя прослушка', External_Wiretap:'Внешняя прослушка'
};

const key = value => String(value || '').normalize('NFKC').toLocaleLowerCase('ru')
    .replace(/ё/g, 'е').replace(/[\s_\-'’.,!]/g, '');
const byEnglish = new Map(Object.entries(roleNamesRu).map(([en, ru]) => [key(en), { en, ru }]));
const byRussian = new Map();
for (const [en, ru] of Object.entries(roleNamesRu)) {
    if (!byRussian.has(key(ru))) byRussian.set(key(ru), en);
}
// Common alternate spellings used by this group.
byRussian.set(key('оракул'), 'Oracle');
byRussian.set(key('хранитель ворона'), 'Ravenkeeper');
byRussian.set(key('алая женщина'), 'Scarlet_Woman');
byRussian.set(key('вдохновитель'), 'Mastermind');
byRussian.set(key('головоломщик'), 'Puzzlemaster');
byRussian.set(key('внутренняя прослушка'), 'Internal_Wiretap');
byRussian.set(key('внешняя прослушка'), 'External_Wiretap');

export function translateRole(role, language = 'en') {
    const value = canonicalCharacterName(role);
    if (language !== 'ru') return value.replace(/_/g, ' ');
    return byEnglish.get(key(value))?.ru || value.replace(/_/g, ' ');
}

export function canonicalRoleInput(role) {
    const value = String(role || '').trim();
    return canonicalCharacterName(byRussian.get(key(value)) || byEnglish.get(key(value))?.en || value);
}
