import { translateRole } from './roleTranslations.mjs';

const storageKey = 'botc-language';
const dictionary = {
    'Leaderboard':'Рейтинг', 'Analytics':'Аналитика', 'Games':'Игры',
    'ELO Rankings & Game Statistics':'Рейтинг Эло и статистика игр',
    'Game Statistics & Player Analysis':'Статистика игр и игроков', 'BOTC Analytics':'Аналитика BOTC',
    'BOTC Games':'Игры BOTC', 'Browse the game history':'Просмотр истории игр',
    'Blood on the Clocktower Stats':'Статистика Blood on the Clocktower',
    'Demo Mode — showing sample data.':'Демонстрационный режим — показаны примеры.', 'Set up your own':'Настроить свой сайт',
    'Failed to load data':'Не удалось загрузить данные', 'Retry':'Повторить', 'Reload':'Обновить',
    'Win Percentages':'Процент побед', 'games |':'игр |', 'players':'игроков',
    'No games logged yet':'Игр пока нет', 'No games match the selected filters':'Нет игр по выбранным фильтрам',
    'good wins':'побед добра', 'evil wins':'побед зла', 'Player Rankings':'Рейтинг игроков',
    'Range:':'Диапазон:', 'Clear':'Очистить', '+ Add Game':'+ Добавить игру', 'Edit Game':'Изменить игру',
    'Click to cycle:':'Нажмите, чтобы выбрать:', '□ Any':'□ Любой', '✓ Include':'✓ Включить',
    '✕ Exclude':'✕ Исключить', 'Script type':'Тип сценария', 'All':'Все', '✓ Visible':'✓ Видимые',
    '✕ Visible':'✕ Видимые', 'No options found':'Ничего не найдено', 'Script':'Сценарий', 'Full scripts':'Полные сценарии',
    'Storyteller':'Рассказчик', 'Storyteller:':'Рассказчик:', 'Player in game':'Игрок в игре',
    'Include players':'Включать игроков', 'All checked players':'Всех отмеченных игроков',
    'Any checked player':'Любого отмеченного игрока', 'Role in play':'Роль в игре',
    'Hide players with fewer than 10 games':'Скрыть игроков с менее чем 10 играми', 'Reset filters':'Сбросить фильтры',
    'Combine filters to narrow the games. ✓ includes matches; ✕ always excludes matches; an empty square ignores that option. The player selector applies to checked players. Everyone in matching games is ranked.':'Объединяйте фильтры: ✓ включает совпадения, ✕ исключает, пустая клетка не учитывается. В рейтинге остаются все участники подходящих игр.',
    'Rank':'Место', 'Name':'Имя', 'Rating':'Рейтинг', 'Delta':'Изменение', 'Overall Win %':'Победы, всего %',
    'Good Win %':'Победы добра %', 'Evil Win %':'Победы зла %', 'Good Wins':'Победы добра',
    'Evil Wins':'Победы зла', 'Data tracked with love for the Town.':'Статистика записана с любовью к городу.',
    'View on GitHub':'Открыть на GitHub', 'Player Name - Rating History':'Игрок — история рейтинга',
    'Enter Confirmation Code':'Введите код подтверждения', 'Enter the code to add games':'Введите код для добавления игр',
    'Verify':'Проверить', 'Invalid code. Please try again.':'Неверный код. Попробуйте еще раз.',
    'Add New Game':'Добавить игру', 'Enter game details below':'Введите данные игры', 'Input Format Help':'Формат ввода',
    'Player format:':'Формат игрока:', 'Name Role [TeamHint]':'Имя Роль [Сторона]',
    'Name Role&Role':'Имя Роль&Роль', 'Name Role@Good+Role@Evil':'Имя Роль@Добро+Роль@Зло',
    'Jane Imp':'Даша Черт', 'Jane_Doe Imp':'Даша_Иванова Черт', 'JaneD Imp':'ДашаИ Черт',
    'John Snake_Charmer+Witch':'Иван Заклинатель_змей+Ведьма', 'Jane+Mike':'Даша+Иван',
    'One player per line. Autocomplete suggests names and roles as you type.':'Один игрок в строке. При вводе появляются подсказки имен и ролей.',
    'Names:':'Имена:', 'Names can be anything — just be consistent so stats track correctly. Use underscores for spaces.':'Используйте одинаковые имена во всех играх. Вместо пробелов в именах используйте нижнее подчеркивание.',
    'First name only':'Только имя', 'Full name (underscore = space)':'Полное имя (подчеркивание вместо пробела)',
    'Nickname — whatever your group uses':'Любое привычное прозвище', 'Roles & team changes:':'Роли и смена стороны:',
    'Multiple roles (use':'Несколько ролей (используйте', 'Team change (use':'Смена стороны (используйте',
    "Put team-changers in their FINAL team's section.":'Игроков, сменивших сторону, указывайте в разделе их конечной стороны.',
    'Multiple storytellers? Use':'Несколько рассказчиков? Используйте', '(e.g.,':'(например,',
    'Fabled & Lorics:':'Сказочники и летописцы:',
    'Optional comma-separated fields below the script. These are game-level modifiers, not player roles.':'Необязательные поля под сценарием. Перечисляйте через запятую.',
    'Team 1 Players':'Игроки команды 1', 'Team 2 Players':'Игроки команды 2',
    'One player with simultaneous roles: use':'Если у игрока одновременно несколько ролей, используйте',
    '. For separate Good/Evil seats played by one person, put the name once and use':'. Если один человек играет за добрую и злую стороны одновременно, укажите имя один раз и используйте',
    '. Use':'. Для смены ролей используйте', 'between role changes as before.':'как раньше.',
    'Which team is Evil?':'Какая команда злая?', 'Team 1':'Команда 1', 'Team 2':'Команда 2',
    'Which team won?':'Какая команда победила?', 'Fabled':'Сказочники', 'Lorics':'Летописцы', 'Fabled:':'Сказочник:', 'Loric:':'Летописец:',
    '(optional)':'(необязательно)', 'Submit Game':'Сохранить игру', 'Delete Game':'Удалить игру',
    'Enter Edit Code':'Введите код редактирования', 'Edit access requires a special code':'Для редактирования нужен специальный код',
    'Invalid code. Edit access required.':'Неверный код. Нужен доступ для редактирования.',
    'Search for Game to Edit':'Найти игру для редактирования', 'Search by game number, storyteller, or script':'Поиск по номеру игры, рассказчику или сценарию',
    'Search':'Поиск', 'Add New Script':'Добавить сценарий', 'Add a custom script to the database':'Добавить свой сценарий',
    'Script Name':'Название сценария', 'Category':'Категория', 'Normal (7+ players)':'Полный (7+ игроков)',
    'Teensyville (5-6 players)':'Тинсивилль (5–6 игроков)', 'Save Script':'Сохранить сценарий', 'Existing Scripts':'Существующие сценарии',
    'Search options...':'Поиск...', 'Search script types':'Поиск типов сценариев', 'Include visible options':'Включить видимые варианты',
    'Exclude visible options':'Исключить видимые варианты', 'Clear this group':'Очистить группу', 'Search scripts...':'Поиск сценариев...',
    'Search scripts':'Поиск сценариев', 'Search storytellers...':'Поиск рассказчиков...', 'Search storytellers':'Поиск рассказчиков',
    'Search players...':'Поиск игроков...', 'Search players':'Поиск игроков', 'Search roles...':'Поиск ролей...', 'Search roles':'Поиск ролей',
    'Enter code...':'Введите код...', 'Enter edit code...':'Введите код редактирования...',
    'e.g., 67-69':'Например, 67-69', 'e.g., Alex_Rivera':'Например, Иван',
    'e.g., Djinn, Angel':'Например, Джинн, Ангел', 'e.g., Bootlegger':'Например, Бутлегер',
    'Name Role\ne.g., Sarah_Lin Imp\nTom_Nguyen Poisoner':'Имя Роль\nНапример, Даша Черт\nИван Отравитель',
    'Name Role\ne.g., Mike_Chen Chef\nPriya_Patel Empath':'Имя Роль\nНапример, Маша Повар\nКостя Эмпат',
    'e.g., 42 or Trouble Brewing':'Например, 42 или Trouble Brewing', 'e.g., My Custom Script':'Например, мой сценарий',
    'All Games':'Все игры', 'Game Type:':'Тип сценария:', 'Normal Only':'Только полные', 'Teensyville Only':'Только Тинсивилль',
    'Modifiers:':'Модификаторы:', 'No Modifiers':'Без модификаторов', 'Has Any Modifier':'С модификаторами',
    'Has Fabled':'Со сказочниками', 'Has Lorics':'С летописцами', 'Scripts':'Сценарии', 'Characters':'Роли',
    'Players':'Игроки', 'Head-to-Head':'Личные встречи', 'Modifiers':'Модификаторы', 'Game Size':'Размер игры',
    'Storytellers':'Рассказчики', 'Hide scripts with fewer than 5 games':'Скрыть сценарии с менее чем 5 играми',
    'w/ Modifiers':'С модификаторами', 'Script:':'Сценарий:', 'All Scripts':'Все сценарии',
    'Normal Total':'Все полные', 'Teensyville Total':'Все Тинсивилль', 'Role Type:':'Тип роли:',
    'Townsfolk':'Горожане', 'Outsiders':'Изгои', 'Minions':'Приспешники', 'Demons':'Демоны',
    'Travellers':'Странники', 'Unknown':'Неизвестно', 'Hide roles with fewer than 5 games':'Скрыть роли с менее чем 5 играми',
    'Character':'Роль', 'Role Type':'Тип роли', 'Win %':'Победы %', 'Wins':'Победы',
    'Select Player:':'Выберите игрока:', '-- Choose a player --':'-- Выберите игрока --', 'Total Games':'Всего игр',
    'Per-Script Breakdown':'Статистика по сценариям', 'Good Games':'Игр за добро', 'Evil Games':'Игр за зло',
    'Role History':'История ролей', 'Role':'Роль', 'Type':'Тип', 'Player 1:':'Игрок 1:',
    '-- Select player --':'-- Выберите игрока --', 'Player 2:':'Игрок 2:', 'Analyze':'Сравнить', 'VS':'ПРОТИВ', 'vs':'против',
    'Player 1':'Игрок 1', 'Player 2':'Игрок 2', 'games together':'совместных игр', 'Same Team':'В одной команде',
    'Overall':'Всего', 'games':'игр', 'wins':'побед', 'Both Good':'Оба добрые', 'Both Evil':'Оба злые',
    'Opposite Teams':'В разных командах', 'games on opposite teams':'игр в разных командах',
    'As Good':'За добро', 'As Evil':'За зло', 'Select two players and click "Analyze" to see their matchup history.':'Выберите двух игроков и нажмите «Сравнить».',
    'No games with Fabled or Lorics recorded yet.':'Игр со сказочниками или летописцами пока нет.',
    'Games with Modifiers':'Игры с модификаторами', 'Games with Fabled':'Игры со сказочниками',
    'Games with Lorics':'Игры с летописцами', 'Loric':'Летописец', 'Player:':'Игрок:', 'All Players':'Все игроки',
    'Expected':'Ожидаемые значения', 'Methodology':'Методика', 'Evil Team':'Злая команда',
    'Expected Good %':'Ожидаемые победы добра %', 'Expected Evil %':'Ожидаемые победы зла %',
    'Games Run':'Проведено игр', 'Δ from 50%':'Отклонение от 50%', 'Good Win % Over Time':'Победы добра по времени',
    'View Game History':'История игр', 'Normal':'Полный', 'Teensyville':'Тинсивилль', 'Game History':'История игр',
    'Game':'Игра', 'Date':'Дата', 'Winner':'Победитель', 'Good Team':'Добрая команда', 'Player':'Игрок',
    'Character Name':'Название роли', 'ELO Rating':'Рейтинг Эло', 'Win Rate':'Процент побед',
    'W-L Record':'Победы–поражения', 'Performance by Script':'Результаты по сценариям', 'Loading...':'Загрузка...',
    'Losses':'Поражения', 'Played By':'Играли', 'Settings':'Настройки', 'Colorblind mode':'Режим для дальтоников',
    'Good':'Добро', 'Evil':'Зло', 'Both':'Обе стороны', 'No games found':'Игры не найдены',
    'No data yet':'Данных пока нет', 'No storytellers found':'Рассказчики не найдены', 'No wins yet':'Побед пока нет',
    'No losses yet':'Поражений пока нет', 'No players found':'Игроки не найдены', 'None':'Нет',
    '+ Add New Script...':'+ Добавить сценарий...', 'Please enter a code':'Введите код',
    'Verifying...':'Проверка...', 'Please enter players for both teams':'Введите игроков обеих команд',
    'Please select which team is Evil and which team won':'Выберите злую команду и победителя',
    'Please enter the storyteller name':'Введите имя рассказчика', 'Please enter at least one player per team':'Укажите хотя бы одного игрока в каждой команде',
    'Error verifying code. Please try again.':'Не удалось проверить код. Попробуйте еще раз.',
    'This code only allows adding games, not editing. Use the edit code.':'Этот код позволяет добавлять игры. Для редактирования нужен другой код.',
    'Game submitted successfully!':'Игра сохранена!', 'Failed to submit game. Please try again.':'Не удалось сохранить игру. Попробуйте еще раз.',
    'Searching...':'Поиск...', 'Error searching games. Please try again.':'Не удалось найти игры. Попробуйте еще раз.',
    'Modify the game details below':'Измените данные игры', 'Update Game':'Обновить игру', 'Delete':'Удалить',
    'EDITING':'РЕДАКТИРОВАНИЕ', 'Failed to load game for editing. Please try again.':'Не удалось загрузить игру для редактирования.',
    'Please enter a script name':'Введите название сценария', 'A script with this name already exists':'Сценарий с таким названием уже существует',
    'Access code required. Please enter a code via "Add Game" first.':'Сначала введите код через «Добавить игру».',
    'Saving...':'Сохранение...', 'Failed to add script. Please try again.':'Не удалось добавить сценарий.',
    'Failed to delete game.':'Не удалось удалить игру.', 'Failed to delete script.':'Не удалось удалить сценарий.',
    'Please select both players.':'Выберите обоих игроков.', 'Please select two different players.':'Выберите двух разных игроков.',
    'Game Number':'Номер игры', '50% Balance Line':'Линия баланса 50%',
    'No roles have 5 or more games in this selection.':'В выбранных играх нет ролей с 5 и более играми.',
    'No players have 10 or more games in this selection':'В выбранных играх нет игроков с 10 и более играми',
    'No players match the selected games':'Нет игроков в выбранных играх',
    'Distance of Good Win % from 50%. Lower = more balanced games. 0 = perfect 50/50 split.':'Отклонение побед добра от 50%. Чем меньше, тем ближе результат к равному.',
    'rates assume random executions, no character abilities, and optimal skip-at-4 strategy.\n                        Differences from expected reflect your group\'s skill, character choices, and meta.':'предполагают случайные казни, отсутствие способностей и оптимальный пропуск казни при четырех живых игроках. Разница может зависеть от навыков, ролей и привычек группы.'
};

const dynamicRules = [
    [/^(\d+) games$/, (_, n) => `Игр: ${n}`], [/^(\d+) game$/, (_, n) => `Игр: ${n}`],
    [/^Good: (.+)$/, (_, v) => `Добро: ${v}`], [/^Evil: (.+)$/, (_, v) => `Зло: ${v}`],
    [/^Game #(\d+)$/, (_, n) => `Игра №${n}`],
    [/^(.+) Analytics$/, (_, name) => `${name} — аналитика`],
    [/^(.+) - Rating History$/, (_, name) => `${name} — история рейтинга`],
    [/^(\d+) Demon, (\d+) Minions?$/, (_, demons, minions) => `${demons} демон, ${minions} ${minions === '1' ? 'приспешник' : 'приспешника'}`],
    [/^Game #(\d+) updated successfully!$/, (_, n) => `Игра №${n} обновлена!`],
    [/^Game #(\d+) deleted\.$/, (_, n) => `Игра №${n} удалена.`],
    [/^Edit Game #(\d+)$/, (_, n) => `Редактирование игры №${n}`],
    [/^Are you sure you want to delete Game #(\d+)\? This cannot be undone\.$/, (_, n) => `Удалить игру №${n}? Это действие нельзя отменить.`],
    [/^Delete script "(.+)"\? This cannot be undone\.$/, (_, name) => `Удалить сценарий «${name}»? Это действие нельзя отменить.`],
    [/^Script "(.+)" added successfully!$/, (_, name) => `Сценарий «${name}» добавлен!`],
    [/^Enter (.+) only once\. For simultaneous seats, use Role@Good\+Role@Evil\.$/, (_, name) => `Укажите ${name} один раз. Для одновременных мест используйте Роль@Добро+Роль@Зло.`],
    [/^Invalid simultaneous roles for (.+)\. Use Role@Good\+Role@Evil\.$/, (_, name) => `Некорректные одновременные роли у ${name}. Используйте Роль@Добро+Роль@Зло.`],
    [/^Showing (\d+) of (\d+) games · (\d+) players? ranked$/, (_, n, total, p) => `Показано игр: ${n} из ${total} · игроков в рейтинге: ${p}`],
    [/^(\d+) game\(s\) involve mixed or unknown teams and are omitted from team comparisons\.$/, (_, n) => `В играх с обеими или неизвестными сторонами (${n}) сравнение команд не учитывается.`],
    [/^No games found matching your search$/, () => 'Игры по вашему запросу не найдены'],
    [/^Please enter a search term$/, () => 'Введите поисковый запрос'],
    [/^No options found$/, () => 'Ничего не найдено']
];

let language = 'en';
try { language = localStorage.getItem(storageKey) === 'ru' ? 'ru' : 'en'; } catch {}
const originalTitle = typeof document !== 'undefined' ? document.title : '';
export const getLanguage = () => language;
export function tr(text, lang = language) {
    if (lang !== 'ru') return String(text ?? '');
    const value = String(text ?? '');
    if (dictionary[value] !== undefined) return dictionary[value];
    for (const [pattern, transform] of dynamicRules) {
        const match = value.match(pattern);
        if (match) return transform(...match);
    }
    return value;
}

export function localizeChart(chart) {
    if (!chart) return;
    for (const dataset of chart.data?.datasets || []) {
        dataset.botcOriginalLabel ||= dataset.label;
        dataset.label = tr(dataset.botcOriginalLabel);
    }
    for (const scale of Object.values(chart.options?.scales || {})) {
        const title = scale.title;
        if (title?.text) { title.botcOriginalText ||= title.text; title.text = tr(title.botcOriginalText); }
    }
    chart.update('none');
}

const textState = new WeakMap();
const attrState = new WeakMap();
const roleSelector = '#characters-body td:first-child, #player-roles-body td:first-child, #char-detail-name, #role-filter .filter-option-name, .ac-role-name, .char-player-chip';
const roleSequenceSelector = '#game-detail-good-body td:nth-child(2), #game-detail-evil-body td:nth-child(2)';
function translateNode(node) {
    const parent = node.parentElement;
    if (!parent || parent.closest('[data-i18n-skip], script, style, textarea, input')) return;
    const current = node.nodeValue;
    let state = textState.get(node);
    if (!state || (current !== state.original && current !== state.rendered)) state = { original: current, rendered: current };
    const trimmed = state.original.trim();
    let translated = tr(trimmed);
    if (language === 'ru' && parent.matches(roleSelector)) translated = translateRole(trimmed, 'ru');
    if (language === 'ru' && parent.matches(roleSequenceSelector)) {
        translated = trimmed.split(/(\s*[+→]\s*)/).map(part => /[+→]/.test(part) ? part : translateRole(part.trim(), 'ru')).join('');
    }
    const rendered = state.original.replace(trimmed, translated);
    state.rendered = rendered;
    textState.set(node, state);
    if (node.nodeValue !== rendered) node.nodeValue = rendered;
}
function translateAttributes(element) {
    if (element.closest('[data-i18n-skip]')) return;
    let state = attrState.get(element) || {};
    for (const attr of ['placeholder', 'title', 'aria-label', 'data-tip']) {
        if (!element.hasAttribute(attr)) continue;
        const value = element.getAttribute(attr);
        let entry = state[attr];
        if (!entry || (value !== entry.original && value !== entry.rendered)) entry = { original: value, rendered: value };
        entry.rendered = tr(entry.original);
        if (language === 'ru' && element.matches('.filter-option') && (attr === 'title' || attr === 'aria-label')) {
            const name = element.closest('#role-filter')
                ? translateRole(element.dataset.filterValue, 'ru')
                : tr(element.dataset.filterLabel || element.dataset.filterValue || '');
            const descriptions = {
                neutral: 'не учитывается; нажмите, чтобы включить',
                include: 'включено; нажмите, чтобы исключить',
                exclude: 'исключено; нажмите, чтобы сбросить'
            };
            entry.rendered = `${name}: ${descriptions[element.dataset.filterState] || descriptions.neutral}.`;
        }
        state[attr] = entry;
        if (value !== entry.rendered) element.setAttribute(attr, entry.rendered);
    }
    attrState.set(element, state);
}
function applyTranslations(root = document.body) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) return translateNode(root);
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.nodeType === Node.TEXT_NODE) translateNode(node);
        else translateAttributes(node);
    }
}

function setLanguage(value) {
    language = value === 'ru' ? 'ru' : 'en';
    try { localStorage.setItem(storageKey, language); } catch {}
    document.documentElement.lang = language;
    document.title = tr(originalTitle);
    const toggle = document.getElementById('language-toggle');
    if (toggle) { toggle.textContent = language === 'ru' ? '🌐 English' : '🌐 Русский'; toggle.setAttribute('aria-label', language === 'ru' ? 'Switch to English' : 'Переключить на русский'); }
    document.getElementById('language-choice')?.remove();
    applyTranslations();
    if (window.Chart?.instances) Object.values(window.Chart.instances).forEach(localizeChart);
    window.dispatchEvent(new CustomEvent('botc:languagechange', { detail: language }));
}

function initialize() {
    document.documentElement.lang = language;
    document.title = tr(originalTitle);
    const toggle = document.createElement('button');
    toggle.id = 'language-toggle'; toggle.className = 'language-toggle'; toggle.type = 'button';
    toggle.dataset.i18nSkip = '';
    toggle.addEventListener('click', () => setLanguage(language === 'ru' ? 'en' : 'ru'));
    document.body.appendChild(toggle);
    let saved = null;
    try { saved = localStorage.getItem(storageKey); } catch {}
    if (saved !== 'en' && saved !== 'ru') {
        const choice = document.createElement('div');
        choice.id = 'language-choice'; choice.className = 'language-choice'; choice.dataset.i18nSkip = '';
        choice.innerHTML = '<div class="language-choice-card" role="dialog" aria-modal="true" aria-labelledby="language-choice-title"><h2 id="language-choice-title">Choose your language / Выберите язык</h2><p>You can change this later. / Язык можно изменить в любой момент.</p><div><button type="button" data-language="en">English</button><button type="button" data-language="ru">Русский</button></div></div>';
        choice.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
        document.body.appendChild(choice);
        choice.querySelector('[data-language="ru"]').focus();
    }
    toggle.textContent = language === 'ru' ? '🌐 English' : '🌐 Русский';
    toggle.setAttribute('aria-label', language === 'ru' ? 'Switch to English' : 'Переключить на русский');
    applyTranslations();
    new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'characterData') translateNode(mutation.target);
            else if (mutation.type === 'attributes') translateAttributes(mutation.target);
            else mutation.addedNodes.forEach(applyTranslations);
        }
    }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true,
        attributeFilter: ['placeholder', 'title', 'aria-label', 'data-tip'] });
}
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
    else initialize();
}
