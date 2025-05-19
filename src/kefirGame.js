/**
 * Модуль kefirGame.js - запуск игры "Кефирчик и пропавшие очки"
 */

import TextGame from './game.js';

// Глобальное состояние игры
const gameState = {
    foundClues: {
        catHair: false,       // Кошачьи волосы на книжной полке
        pawPrints: false,     // Следы лап на подоконнике
        chewedCase: false,    // Погрызенный уголок футляра
        scratchedCurtains: false, // Зацепки на шторах
        movedVase: false      // Сдвинутая ваза
    },
    hunger: 0,                // Уровень голода хозяина (0-5)
    kefirLocation: 'bedroom', // Где сейчас находится Кефирчик
    timeElapsed: 0,           // Прошедшее время (в условных единицах)
    falseAccusations: 0,      // Сколько раз обвинили не того
    hasFoundPhone: false,     // Нашел ли телефон (для вызова соседки)
    kefirMood: 'playful',     // Настроение кота: playful, sleepy, hungry
    gotPhoneHint: false       // Получена ли подсказка от соседки
};

// Сохранение состояния
function saveGameState() {
    try {
        localStorage.setItem('kefirGameState', JSON.stringify(gameState));
        console.log("Сохранено состояние:", gameState);
    } catch (e) {
        console.error("Ошибка при сохранении состояния:", e);
    }
}

// Загрузка сохраненного состояния
function loadGameState() {
    try {
        const saved = localStorage.getItem('kefirGameState');
        if (saved) {
            const loadedState = JSON.parse(saved);
            Object.assign(gameState, loadedState);
            console.log("Загружено состояние:", gameState);
        }
    } catch (e) {
        console.error("Ошибка при загрузке состояния:", e);
    }
}

// Сброс игрового состояния
function resetGameState() {
    gameState.foundClues = {
        catHair: false,
        pawPrints: false,
        chewedCase: false,
        scratchedCurtains: false,
        movedVase: false
    };
    gameState.hunger = 0;
    gameState.kefirLocation = 'bedroom';
    gameState.timeElapsed = 0;
    gameState.falseAccusations = 0;
    gameState.hasFoundPhone = false;
    gameState.kefirMood = 'playful';
    gameState.gotPhoneHint = false;
    
    saveGameState();
}

// Подсчет найденных улик
function countFoundClues() {
    let count = 0;
    for (const clue in gameState.foundClues) {
        if (gameState.foundClues[clue]) count++;
    }
    return count;
}

// Проверка и обновление голода
function checkAndUpdateHunger() {
    // С каждым действием есть шанс проголодаться
    if (Math.random() < 0.3) {
        gameState.hunger += 1;
        saveGameState();
    }
    
    // Если голод достиг максимума, показываем сообщение
    if (gameState.hunger >= 5) {
        alert("Вы чувствуете сильный голод. Возможно, стоит перекусить на кухне.");
        gameState.hunger = 4; // Снижаем уровень, чтобы не спамить сообщениями
        saveGameState();
    }
}

// Определение сцен
const kefirScenes = {
    // Начальная сцена
    start: {
        text: 'Вы просыпаетесь от звука будильника и пытаетесь нащупать на тумбочке очки. Их нет на привычном месте. Вы садитесь в кровати и щуритесь, пытаясь разглядеть размытые контуры комнаты.\n\nВсё расплывается. Без очков вы видите лишь смутные очертания предметов. Похоже, придется искать очки практически вслепую.\n\nГде-то в ногах кровати вы чувствуете теплый пушистый комок — это ваш кот Кефирчик, который, кажется, очень доволен собой.',
        choices: [
            { text: 'Попытаться найти очки на тумбочке', nextScene: 'search_nightstand' },
            { text: 'Осмотреть спальню', nextScene: 'bedroom' },
            { text: 'Поговорить с Кефирчиком', nextScene: 'talk_to_kefir' }
        ]
    },
    
    // Разговор с котом
    talk_to_kefir: {
        text: 'Вы смотрите на размытое белое пятно в ногах кровати.\n\n"Кефирчик, ты не видел мои очки?" — спрашиваете вы.\n\nКот приподнимает голову и мяукает. Вам кажется, что в его мяуканье слышится самодовольство.\n\n"Мрр-мяу!" — отвечает Кефирчик, что, видимо, на кошачьем означает "Понятия не имею" или "Я их спрятал и ни за что не скажу где".',
        choices: [
            { text: 'Попытаться поймать Кефирчика', nextScene: 'catch_kefir' },
            { text: 'Вернуться к поискам', nextScene: 'bedroom' }
        ],
        onLoad: function() {
            // Обновляем положение Кефирчика
            gameState.kefirLocation = Math.random() > 0.5 ? 'kitchen' : 'living_room';
            saveGameState();
        }
    },
    
    // Попытка поймать кота
    catch_kefir: {
        text: 'Вы делаете резкое движение, пытаясь схватить Кефирчика, но он ловко уворачивается и с громким "Мяу!" скрывается из спальни. Без очков вы не успеваете заметить, куда именно он побежал.\n\nНа месте, где только что лежал Кефирчик, вы замечаете несколько белых шерстинок.',
        choices: [
            { text: 'Вернуться к осмотру спальни', nextScene: 'bedroom' },
            { text: 'Пойти на кухню', nextScene: 'kitchen' },
            { text: 'Пойти в гостиную', nextScene: 'living_room' }
        ]
    },
    
    // Поиск на тумбочке
    search_nightstand: {
        text: 'Вы тщательно ощупываете тумбочку. Там лежит ваш телефон, книга, которую вы читали перед сном, стакан с водой, но очков нет. Вы выдвигаете ящик тумбочки и проверяете его содержимое — лекарства, салфетки, зарядка от телефона. Очков нигде нет.\n\nОднако вы замечаете несколько белых шерстинок на краю тумбочки. Похоже, Кефирчик был здесь недавно.',
        choices: [
            { text: 'Взять телефон', nextScene: 'take_phone' },
            { text: 'Вернуться к осмотру спальни', nextScene: 'bedroom' }
        ]
    },
    
    // Взять телефон
    take_phone: {
        text: 'Вы берёте телефон. Хотя без очков экран выглядит размытым, вы всё же можете различить время — 8:15 утра. До выхода на работу осталось 45 минут. \n\nТелефон может пригодиться в поисках, например, чтобы позвонить соседке Анне Петровне, которая иногда помогает с Кефирчиком.',
        choices: [
            { text: 'Вернуться к осмотру спальни', nextScene: 'bedroom' }
        ],
        onLoad: function() {
            gameState.hasFoundPhone = true;
            saveGameState();
            // Добавляем новый выбор, если есть телефон
            this.choices.push({ 
                text: 'Позвонить соседке Анне Петровне', 
                nextScene: 'call_neighbor' 
            });
        }
    },
    
    // Звонок соседке
    call_neighbor: {
        text: 'Вы с трудом находите контакт Анны Петровны в телефоне и звоните ей.\n\n"Алло, Анна Петровна? Доброе утро! Извините за ранний звонок. У меня небольшая проблема — я не могу найти свои очки, а мне скоро на работу. Кажется, их спрятал Кефирчик..."\n\nАнна Петровна сочувственно вздыхает: "О, этот проказник! Знаете, он обожает высокие места. Проверьте верхние полки и шкафы. И еще он любит все блестящее — может, отнес их к своим игрушкам?"',
        choices: [
            { text: 'Поблагодарить и продолжить поиски', nextScene: 'bedroom' }
        ],
        onLoad: function() {
            // Даём подсказку после звонка
            gameState.gotPhoneHint = true;
            saveGameState();
        }
    },
    
    // Спальня
    bedroom: {
        text: 'Вы стоите посреди спальни. Размытые очертания кровати, тумбочки, шкафа и комода окружают вас. Утреннее солнце пробивается сквозь шторы, создавая теплый, но не очень-то полезный для поисков свет.\n\nБез очков вы плохо различаете детали, но всё же можете передвигаться по дому и искать свои очки методом ощупывания поверхностей.',
        choices: [
            { text: 'Искать под кроватью', nextScene: 'under_bed' },
            { text: 'Проверить шкаф', nextScene: 'wardrobe' },
            { text: 'Пойти на кухню', nextScene: 'kitchen' },
            { text: 'Пойти в гостиную', nextScene: 'living_room' },
            { text: 'Заглянуть в ванную', nextScene: 'bathroom' },
            { text: 'Пойти в прихожую', nextScene: 'hallway' }
        ],
        getChoices: function() {
            const choices = [...this.choices]; // копируем базовые выборы
            
            // Если Кефирчик в спальне, добавляем выбор
            if (gameState.kefirLocation === 'bedroom') {
                choices.push({ 
                    text: 'Поговорить с Кефирчиком (он здесь!)', 
                    nextScene: 'talk_to_kefir_again' 
                });
            }
            
            // Если достаточно улик найдено и есть подсказка от соседки
            if (countFoundClues() >= 3 && gameState.gotPhoneHint) {
                choices.push({ 
                    text: 'Проверить высокие полки (с подсказки Анны Петровны)', 
                    nextScene: 'check_high_shelves_bedroom' 
                });
            }
            
            return choices;
        }
    },
    
    // Повторный разговор с котом
    talk_to_kefir_again: {
        text: 'Кефирчик сидит на подоконнике и лениво умывается. Увидев, что вы обращаете на него внимание, он прекращает умывание и смотрит на вас ясными глазами.\n\n"Кефирчик, ну правда, где мои очки?" — спрашиваете вы с нотками отчаяния в голосе.\n\nКот склоняет голову набок и издает серию мяуканий, которые можно перевести как: "Я сделал для тебя интересное утро, а ты не ценишь!"',
        choices: [
            { text: 'Погладить Кефирчика', nextScene: 'pet_kefir' },
            { text: 'Продолжить поиски', nextScene: 'bedroom' }
        ],
        onLoad: function() {
            // Кот перемещается после разговора
            const locations = ['kitchen', 'living_room', 'balcony', 'hallway'];
            gameState.kefirLocation = locations[Math.floor(Math.random() * locations.length)];
            saveGameState();
        }
    },
    
    // Гладим кота
    pet_kefir: {
        text: 'Вы нежно гладите Кефирчика, и он мурчит от удовольствия. Его шерсть мягкая и теплая. Вы чувствуете, как ваше раздражение немного утихает. В конце концов, как можно долго сердиться на это пушистое чудо?\n\nВнезапно Кефирчик перестает мурчать и начинает внимательно смотреть в сторону гостиной, словно там происходит что-то интересное для него.',
        choices: [
            { text: 'Пойти в гостиную', nextScene: 'living_room' },
            { text: 'Продолжить поиски в спальне', nextScene: 'bedroom' }
        ],
        onLoad: function() {
            // Кот даёт подсказку - теперь он точно в гостиной
            gameState.kefirLocation = 'living_room';
            gameState.kefirMood = 'friendly'; // Кот стал дружелюбнее
            saveGameState();
        }
    },
    
    // Поиск под кроватью
    under_bed: {
        text: 'Вы опускаетесь на четвереньки и заглядываете под кровать. В полумраке вы видите лишь пыльные очертания. Вытянув руку, вы ощупываете пространство под кроватью.\n\nВаши пальцы натыкаются на что-то маленькое и твердое. На момент ваше сердце замирает — неужели очки? Вы достаете предмет и разочарованно вздыхаете. Это всего лишь игрушечная мышь Кефирчика.\n\nОднако рядом с мышью вы нащупываете что-то еще — футляр от очков! Вы достаете его и видите, что один угол явно погрызен маленькими острыми зубками.',
        choices: [
            { text: 'Вернуться к осмотру спальни', nextScene: 'bedroom' }
        ],
        onLoad: function() {
            gameState.foundClues.chewedCase = true;
            // Увеличиваем время поисков
            gameState.timeElapsed += 1;
            saveGameState();
            
            // Проверяем, не проголодался ли хозяин
            checkAndUpdateHunger();
        }
    },
    
    // Проверка шкафа
    wardrobe: {
        text: 'Вы открываете дверцы шкафа и начинаете ощупывать полки. Одежда, постельное белье, какие-то коробки... Очков нет нигде.\n\nОднако на нижней полке вы замечаете еще одну игрушечную мышь Кефирчика и несколько белых шерстинок. Похоже, ваш питомец любит забираться в шкаф, когда вы не видите.',
        choices: [
            { text: 'Вернуться к осмотру спальни', nextScene: 'bedroom' }
        ],
        onLoad: function() {
            // Увеличиваем время поисков
            gameState.timeElapsed += 1;
            saveGameState();
            
            // Проверяем, не проголодался ли хозяин
            checkAndUpdateHunger();
        }
    },
    
    // Проверка высоких полок в спальне
    check_high_shelves_bedroom: {
        text: 'Вспомнив подсказку Анны Петровны, вы решаете проверить высокие полки в шкафу. Встав на цыпочки, вы ощупываете верхнюю полку, но находите там только пыль и какую-то забытую коробку.\n\nПохоже, в спальне нет ничего интересного на высоких местах. Может быть, стоит поискать в других комнатах?',
        choices: [
            { text: 'Вернуться к осмотру спальни', nextScene: 'bedroom' }
        ],
        onLoad: function() {
            // Увеличиваем время поисков
            gameState.timeElapsed += 1;
            saveGameState();
        }
    },
    
    // Кухня
    kitchen: {
        text: 'Вы входите на кухню. Размытые контуры холодильника, плиты и кухонных шкафчиков окружают вас. На столе вы смутно различаете какие-то предметы, а на полу — миски Кефирчика.\n\nВаш желудок напоминает, что пора бы позавтракать, но без очков приготовление пищи может превратиться в настоящее приключение.',
        choices: [
            { text: 'Проверить стол', nextScene: 'kitchen_table' },
            { text: 'Осмотреть холодильник', nextScene: 'refrigerator' },
            { text: 'Проверить подоконник', nextScene: 'kitchen_windowsill' },
            { text: 'Вернуться в спальню', nextScene: 'bedroom' },
            { text: 'Пойти в гостиную', nextScene: 'living_room' }
        ],
        getChoices: function() {
            const choices = [...this.choices]; // копируем базовые выборы
            
            // Если Кефирчик на кухне, добавляем выбор
            if (gameState.kefirLocation === 'kitchen') {
                choices.push({ 
                    text: 'Погладить Кефирчика (он здесь!)', 
                    nextScene: 'pet_kefir_kitchen' 
                });
            }
            
            // Если голоден, можно перекусить
            if (gameState.hunger >= 3) {
                choices.push({ 
                    text: 'Попытаться что-нибудь съесть', 
                    nextScene: 'try_to_eat' 
                });
            }
            
            return choices;
        }
    },
    
    // Гладим кота на кухне
    pet_kefir_kitchen: {
        text: 'Кефирчик сидит возле своей миски и выразительно смотрит на вас. Когда вы наклоняетесь, чтобы погладить его, он начинает громко мурчать и тереться о вашу руку.\n\n"Ты голоден, малыш?" — спрашиваете вы.\n\nВ ответ кот издает требовательное "Мяу!" и смотрит на свою пустую миску.',
        choices: [
            { text: 'Покормить Кефирчика', nextScene: 'feed_kefir' },
            { text: 'Продолжить поиски', nextScene: 'kitchen' }
        ],
        onLoad: function() {
            gameState.kefirMood = 'hungry'; // Кот голоден
            saveGameState();
        }
    },
    
    // Кормим кота
    feed_kefir: {
        text: 'Вы с трудом находите кошачий корм в одном из шкафчиков и насыпаете его в миску Кефирчика. Кот с благодарным мурчанием приступает к еде.\n\nНаблюдая за ним, вы вдруг замечаете, что после трапезы Кефирчик начинает умываться, а затем, словно в благодарность, смотрит в сторону гостиной и тихонько мяукает. Может быть, это подсказка?',
        choices: [
            { text: 'Пойти в гостиную', nextScene: 'living_room' },
            { text: 'Продолжить осмотр кухни', nextScene: 'kitchen' }
        ],
        onLoad: function() {
            gameState.kefirMood = 'grateful'; // Кот благодарен и дает подсказку
            gameState.kefirLocation = 'living_room'; // Кот перемещается в гостиную
            saveGameState();
        }
    },
    
    // Пытаемся поесть
    try_to_eat: {
        text: 'Вы решаете, что поиски на голодный желудок - не лучшая идея. Осторожно ощупывая холодильник, вы находите йогурт и какой-то фрукт, кажется, яблоко. \n\nБез очков процесс еды становится настоящим приключением, но вам удается утолить голод, не создав слишком большого беспорядка. Вы чувствуете прилив энергии.',
        choices: [
            { text: 'Продолжить осмотр кухни', nextScene: 'kitchen' }
        ],
        onLoad: function() {
            gameState.hunger = 0; // Сбрасываем уровень голода
            gameState.timeElapsed += 1; // Но тратим время
            saveGameState();
        }
    },
    
    // Проверка стола
    kitchen_table: {
        text: 'Вы ощупываете поверхность стола. Чашка, какие-то бумаги, солонка... Но очков нет. Вы случайно опрокидываете чашку и слышите характерный звук пустой керамической кружки, катящейся по столу. К счастью, она не была наполнена.',
        choices: [
            { text: 'Вернуться к осмотру кухни', nextScene: 'kitchen' }
        ],
        onLoad: function() {
            gameState.timeElapsed += 1;
            saveGameState();
            checkAndUpdateHunger();
        }
    },
    
    // Проверка холодильника
    refrigerator: {
        text: 'От отчаяния вы даже заглядываете в холодильник. Еда расплывается цветными пятнами, но очков, разумеется, там нет. Хотя эта странная форма в контейнере... А, нет, это просто вчерашнее рагу.',
        choices: [
            { text: 'Вернуться к осмотру кухни', nextScene: 'kitchen' }
        ],
        onLoad: function() {
            gameState.timeElapsed += 1;
            // Тут еда перед глазами, становимся голоднее
            gameState.hunger += 1;
            saveGameState();
        }
    },
    
    // Проверка подоконника на кухне
    kitchen_windowsill: {
        text: 'Вы проверяете подоконник на кухне и замечаете отчетливые следы кошачьих лап! Похоже, Кефирчик недавно прыгал здесь. Рядом со следами вы замечаете смутный силуэт какого-то комнатного растения, слегка покосившегося, словно кто-то в него врезался.',
        choices: [
            { text: 'Вернуться к осмотру кухни', nextScene: 'kitchen' }
        ],
        onLoad: function() {
            gameState.foundClues.pawPrints = true;
            gameState.timeElapsed += 1;
            saveGameState();
            checkAndUpdateHunger();
        }
    },
    
    // Гостиная
    living_room: {
        text: 'Вы входите в гостиную. Расплывчатые силуэты дивана, кресел, журнального столика и книжного шкафа окружают вас. На стене висит нечто, что вы опознаете как телевизор, а рядом с диваном стоит торшер.\n\nГде-то на полу валяются игрушки Кефирчика, а на диване лежит его любимый плед.',
        choices: [
            { text: 'Проверить диван', nextScene: 'check_couch' },
            { text: 'Осмотреть книжные полки', nextScene: 'check_bookshelves' },
            { text: 'Проверить за телевизором', nextScene: 'check_behind_tv' },
            { text: 'Осмотреть шторы', nextScene: 'check_curtains' },
            { text: 'Вернуться в спальню', nextScene: 'bedroom' },
            { text: 'Пойти на кухню', nextScene: 'kitchen' },
            { text: 'Выйти на балкон', nextScene: 'balcony' }
        ],
        getChoices: function() {
            const choices = [...this.choices]; // копируем базовые выборы
            
            // Если Кефирчик в гостиной, добавляем выбор
            if (gameState.kefirLocation === 'living_room') {
                choices.push({ 
                    text: 'Поиграть с Кефирчиком (он здесь!)', 
                    nextScene: 'play_with_kefir' 
                });
            }
            
            // Если найдено достаточно улик и есть подсказка от соседки
            if (countFoundClues() >= 3 && gameState.gotPhoneHint) {
                choices.push({ 
                    text: 'Проверить высокие места в гостиной', 
                    nextScene: 'check_high_places_living_room' 
                });
            }
            
            return choices;
        }
    },
    
    // Играем с Кефирчиком
    play_with_kefir: {
        text: 'Кефирчик лежит на диване, свернувшись клубком. Когда вы подходите, он потягивается и выжидающе смотрит на вас. Вы берете его игрушечную мышку с пола и шевелите ею перед котом.\n\nКефирчик мгновенно оживляется! Его глаза широко раскрываются, он припадает к дивану, готовясь к прыжку. Через мгновение он уже атакует игрушку, ловко ловя её лапками.\n\nПосле короткой игры Кефирчик весело прыгает на книжную полку, словно приглашая вас посмотреть туда.',
        choices: [
            { text: 'Осмотреть книжные полки', nextScene: 'check_bookshelves' },
            { text: 'Продолжить осмотр гостиной', nextScene: 'living_room' }
        ],
        onLoad: function() {
            gameState.kefirMood = 'playful'; // Кот игривый и дает подсказку
            gameState.kefirLocation = 'bookshelf'; // Кот на книжной полке
            saveGameState();
        }
    },
    
    // Проверка дивана
    check_couch: {
        text: 'Вы тщательно ощупываете диван, забираясь руками между подушками и под них. Находите несколько монет, ручку, пульт от телевизора и... много-много кошачьей шерсти. Похоже, Кефирчик проводит на диване немало времени.\n\nОчков здесь нет, зато вы нашли еще одну игрушечную мышь. У Кефирчика их, похоже, целая коллекция, разбросанная по всей квартире.',
        choices: [
            { text: 'Вернуться к осмотру гостиной', nextScene: 'living_room' }
        ],
        onLoad: function() {
            gameState.timeElapsed += 1;
            saveGameState();
            checkAndUpdateHunger();
        }
    },
    
    // Проверка книжных полок
    check_bookshelves: {
        text: 'Вы подходите к книжным полкам и начинаете ощупывать их поверхность. На второй полке снизу ваши пальцы натыкаются на что-то пушистое — белые кошачьи волоски! Их довольно много, похоже, Кефирчик часто запрыгивает сюда.\n\nРядом с местом, где вы нашли шерсть, вы замечаете, что несколько книг сдвинуты, словно кто-то пробирался за них.',
        choices: [
            { text: 'Вернуться к осмотру гостиной', nextScene: 'living_room' }
        ],
        onLoad: function() {
            gameState.foundClues.catHair = true;
            gameState.timeElapsed += 1;
            saveGameState();
            checkAndUpdateHunger();
        }
    },
    
    // Проверка за телевизором
    check_behind_tv: {
        text: 'Вы с трудом отодвигаете телевизор от стены и заглядываете за него. Темно и пыльно, но очков там нет. Зато вы нашли потерянный месяц назад USB-кабель и несколько кошачьих игрушек. Как они попали за телевизор — загадка, которую может разрешить только Кефирчик.',
        choices: [
            { text: 'Вернуться к осмотру гостиной', nextScene: 'living_room' }
        ],
        onLoad: function() {
            gameState.timeElapsed += 1;
            saveGameState();
            checkAndUpdateHunger();
        }
    },
    
    // Проверка штор
    check_curtains: {
        text: 'Вы проводите рукой по тяжелым шторам в гостиной и замечаете, что на них есть зацепки и растяжки, явно оставленные кошачьими когтями. Похоже, Кефирчик любит карабкаться по шторам, используя их как импровизированную лестницу!\n\nПотянув за шнурок, вы открываете шторы, чтобы впустить больше света, но это не особо помогает в поисках — без очков мир все равно остается размытым.',
        choices: [
            { text: 'Вернуться к осмотру гостиной', nextScene: 'living_room' }
        ],
        onLoad: function() {
            gameState.foundClues.scratchedCurtains = true;
            gameState.timeElapsed += 1;
            saveGameState();
            checkAndUpdateHunger();
        }
    },
    
    // Проверка высоких мест в гостиной
    check_high_places_living_room: {
        text: 'Вспомнив подсказку Анны Петровны о любви Кефирчика к высоким местам, вы решаете проверить верхнюю часть книжного шкафа и другие высокие поверхности в гостиной.\n\nНа самой верхней полке книжного шкафа стоит старинная ваза, которую вам подарила бабушка. Вы замечаете, что она немного сдвинута со своего обычного места, а рядом с ней видны следы кошачьих лап в пыли!',
        choices: [
            { text: 'Проверить вазу', nextScene: 'check_vase' },
            { text: 'Вернуться к осмотру гостиной', nextScene: 'living_room' }
        ],
        onLoad: function() {
            gameState.foundClues.movedVase = true;
            gameState.timeElapsed += 1;
            saveGameState();
            checkAndUpdateHunger();
        }
    },
    
    // Проверка вазы (истинная концовка)
    check_vase: {
        text: 'Вы осторожно снимаете вазу с полки и заглядываете внутрь. И вот они! Ваши очки лежат на дне вазы, совершенно целые и невредимые!\n\nВы с облегчением надеваете их, и мир мгновенно обретает чёткость. Теперь вы можете ясно видеть всё вокруг: комнату, мебель и Кефирчика, который сидит на диване и смотрит на вас с таким видом, словно хочет сказать: "Ну наконец-то! Я думал, ты никогда не найдешь!"\n\nНа часах 8:40 — у вас еще есть время, чтобы спокойно собраться на работу.',
        choices: [
            { text: 'Погладить Кефирчика', nextScene: 'true_ending' }
        ]
    },
    
    // Истинная концовка
    true_ending: {
        text: 'Вы подходите к Кефирчику и нежно гладите его по голове. Он довольно мурчит и прикрывает глаза от удовольствия.\n\n"Ах ты, маленький проказник," — говорите вы с улыбкой. — "Решил устроить мне утреннее приключение?"\n\nКефирчик отвечает особенно мелодичным "Мрррряу!", которое можно перевести примерно как "Конечно! Иначе твоя жизнь была бы слишком скучной!"\n\nВы качаете головой, но не можете сдержать улыбку. С Кефирчиком в доме действительно никогда не бывает скучно. И пока вы собираетесь на работу, кот с довольным видом наблюдает за вами, возможно, уже планируя свою следующую проделку.',
        choices: [
            { text: 'Начать заново', nextScene: 'start' }
        ],
        onLoad: function() {
            // Тут можно добавить достижение или что-то подобное
            alert('🏆 Достижение разблокировано: "Кошачий детектив"\nВы успешно нашли очки и раскрыли проделку Кефирчика!');
            // Сбрасываем игровое состояние для новой игры
            resetGameState();
        }
    },
    
    // Ванная комната
    bathroom: {
        text: 'Вы входите в ванную комнату. Без очков вы видите размытые очертания раковины, ванны, унитаза и полочек с туалетными принадлежностями. Вы двигаетесь осторожно, чтобы не наткнуться на что-нибудь.',
        choices: [
            { text: 'Проверить раковину', nextScene: 'check_sink' },
            { text: 'Осмотреть полочки', nextScene: 'check_shelves' },
            { text: 'Вернуться в спальню', nextScene: 'bedroom' }
        ]
    },
    
    // Проверка раковины
    check_sink: {
        text: 'Вы ощупываете раковину и пространство вокруг нее. Очков здесь нет. Однако вы замечаете, что ваша зубная щетка лежит не там, где вы ее оставили вечером. Возможно, это работа Кефирчика?',
        choices: [
            { text: 'Вернуться к осмотру ванной', nextScene: 'bathroom' }
        ],
        onLoad: function() {
            gameState.timeElapsed += 1;
            saveGameState();
            checkAndUpdateHunger();
        }
    },
    
    // Проверка полочек
    check_shelves: {
        text: 'Вы проверяете полочки с туалетными принадлежностями. На одной из них вы нащупываете что-то, похожее на зубной порошок, шампунь, ваши таблетки... но очков нигде нет.\n\nОднако вы замечаете пару кошачьих шерстинок на бортике ванны. Похоже, Кефирчик иногда запрыгивает сюда, хотя вы никогда не заставали его за этим занятием.',
        choices: [
            { text: 'Вернуться к осмотру ванной', nextScene: 'bathroom' }
        ],
        onLoad: function() {
            gameState.timeElapsed += 1;
            saveGameState();
            checkAndUpdateHunger();
        }
    },
    
    // Прихожая
    hallway: {
        text: 'Вы стоите в прихожей. Здесь находится входная дверь, вешалка для одежды и обувная полка. Без очков всё это представляется размытыми силуэтами.\n\nВы вспоминаете, что вам нужно идти на работу, и чувствуете лёгкую панику — без очков будет сложно.',
        choices: [
            { text: 'Проверить обувную полку', nextScene: 'check_shoe_rack' },
            { text: 'Посмотреть на вешалке', nextScene: 'check_coat_hanger' },
            { text: 'Вернуться в спальню', nextScene: 'bedroom' },
            { text: 'Пойти в гостиную', nextScene: 'living_room' }
        ],
        getChoices: function() {
            const choices = [...this.choices]; // копируем базовые выборы
            
            // Если Кефирчик в прихожей, добавляем выбор
            if (gameState.kefirLocation === 'hallway') {
                choices.push({ 
                    text: 'Проследить за Кефирчиком (он здесь!)', 
                    nextScene: 'follow_kefir_hallway' 
                });
            }
            
            // Если прошло много времени, добавляем опцию выхода без очков
            if (gameState.timeElapsed >= 5) {
                choices.push({ 
                    text: 'Сдаться и пойти на работу без очков', 
                    nextScene: 'go_without_glasses' 
                });
            }
            
            return choices;
        }
    },
    
    // Следуем за котом в прихожей
    follow_kefir_hallway: {
        text: 'Кефирчик сидит у входной двери и внимательно смотрит на вас, как будто пытается сказать что-то важное. Когда вы делаете шаг к нему, он разворачивается и бежит в гостиную, останавливаясь на пороге и оглядываясь, словно ждет, что вы последуете за ним.',
        choices: [
            { text: 'Пойти за Кефирчиком в гостиную', nextScene: 'living_room' },
            { text: 'Остаться в прихожей', nextScene: 'hallway' }
        ],
        onLoad: function() {
            // Кот дает явную подсказку
            gameState.kefirLocation = 'living_room';
            saveGameState();
        }
    },
    
    // Проверка обувной полки
    check_shoe_rack: {
        text: 'Вы ощупываете обувную полку, но находите только свои ботинки, кроссовки и домашние тапочки. Очков здесь нет. Хотя... на одном из ботинок вы замечаете отчетливые кошачьи волоски. Похоже, Кефирчик недавно решил вздремнуть на вашей обуви.',
        choices: [
            { text: 'Вернуться к осмотру прихожей', nextScene: 'hallway' }
        ],
        onLoad: function() {
            gameState.timeElapsed += 1;
            saveGameState();
            checkAndUpdateHunger();
        }
    },
    
    // Проверка вешалки
    check_coat_hanger: {
        text: 'Вы проверяете карманы своего пальто и других вещей на вешалке. Очков там нет. Однако в кармане пальто вы находите кошачье лакомство, которое, скорее всего, припрятал там Кефирчик для будущего перекуса.',
        choices: [
            { text: 'Вернуться к осмотру прихожей', nextScene: 'hallway' }
        ],
        onLoad: function() {
            gameState.timeElapsed += 1;
            saveGameState();
            checkAndUpdateHunger();
        }
    },
    
    // Идем на работу без очков
    go_without_glasses: {
        text: 'Отчаявшись найти очки и видя, что время поджимает, вы решаете отправиться на работу без них. Вы кое-как собираетесь, прощаетесь с Кефирчиком и выходите из квартиры.\n\nДень без очков превращается в настоящее испытание. Вы щуритесь, пытаясь разобрать текст на экране компьютера, путаете людей и промахиваетесь мимо кнопок в лифте. Коллеги смотрят на вас с удивлением.\n\nВечером, вернувшись домой совершенно измотанным, вы обнаруживаете Кефирчика, сидящего на диване с самодовольным видом. Позже вы всё-таки находите свои очки и обещаете себе впредь хранить их в футляре в недоступном для кота месте.',
        choices: [
            { text: 'Начать заново', nextScene: 'start' }
        ],
        onLoad: function() {
            // Тут можно добавить "плохую" концовку или что-то подобное
            alert('🏆 Достижение разблокировано: "День вслепую"\nВы сдались и отправились на работу без очков. Кефирчик победил в этот раз!');
            // Сбрасываем игровое состояние для новой игры
            resetGameState();
        }
    },
    
    // Балкон
    balcony: {
        text: 'Вы выходите на балкон. Свежий утренний воздух бодрит. Несмотря на нечеткость зрения, вы можете различить силуэты соседних домов и деревьев внизу. На балконе стоит небольшой столик, несколько растений в горшках и лежанка Кефирчика — он любит наблюдать за птицами.',
        choices: [
            { text: 'Проверить лежанку Кефирчика', nextScene: 'check_cat_bed' },
            { text: 'Осмотреть растения', nextScene: 'check_plants' },
            { text: 'Вернуться в гостиную', nextScene: 'living_room' }
        ],
        getChoices: function() {
            const choices = [...this.choices]; // копируем базовые выборы
            
            // Если Кефирчик на балконе, добавляем выбор
            if (gameState.kefirLocation === 'balcony') {
                choices.push({ 
                    text: 'Погладить Кефирчика (он здесь!)', 
                    nextScene: 'pet_kefir_balcony' 
                });
            }
            
            return choices;
        }
    },
    
    // Гладим кота на балконе
    pet_kefir_balcony: {
        text: 'Кефирчик сидит на своей лежанке, наблюдая за птицами. Когда вы подходите, чтобы погладить его, он мурчит, но не отводит взгляда от пролетающих мимо воробьев.\n\n"Наблюдаешь за завтраком?" — шутите вы.\n\nКот в ответ бросает на вас быстрый взгляд, словно говоря: "Очень смешно. Лучше бы очки свои поискал."',
        choices: [
            { text: 'Вернуться к осмотру балкона', nextScene: 'balcony' }
        ],
        onLoad: function() {
            // Кот переместится, когда вы уйдете с балкона
            gameState.kefirMood = 'distracted'; // Кот отвлечен птицами
            saveGameState();
        }
    },
    
    // Проверка лежанки
    check_cat_bed: {
        text: 'Вы проверяете мягкую лежанку Кефирчика. Она полна белой шерсти — явное доказательство того, что кот проводит здесь много времени. Под подстилкой вы нащупываете что-то маленькое и твердое. Это... заколка для волос, которую вы потеряли месяц назад! Похоже, Кефирчик коллекционирует ваши вещи.',
        choices: [
            { text: 'Вернуться к осмотру балкона', nextScene: 'balcony' }
        ],
        onLoad: function() {
            gameState.timeElapsed += 1;
            saveGameState();
            checkAndUpdateHunger();
        }
    },
    
    // Проверка растений
    check_plants: {
        text: 'Вы осматриваете растения на балконе. В одном из горшков вы замечаете небольшую ямку — похоже, Кефирчик пытался закопать там что-то. К счастью, это не ваши очки, а всего лишь кошачье лакомство, которое он, вероятно, решил сохранить на будущее.',
        choices: [
            { text: 'Вернуться к осмотру балкона', nextScene: 'balcony' }
        ],
        onLoad: function() {
            gameState.timeElapsed += 1;
            saveGameState();
            checkAndUpdateHunger();
        }
    }
};

// Класс игры для "Кефирчика и пропавших очков"
class KefirGame extends TextGame {
    constructor() {
        super(kefirScenes);
        this.currentScene = 'start';
        
        // Загружаем сохраненное состояние
        loadGameState();
    }
    
    // Переопределяем метод загрузки сцены
    loadScene(sceneId) {
        const scene = this.scenes[sceneId];
        if (!scene) return;
        
        this.currentScene = sceneId;
        
        // Проверяем наличие обработчика onLoad
        if (scene.onLoad) {
            scene.onLoad();
        }
        
        // Получаем текст сцены
        let processedText = scene.text;
        
        // Получаем варианты выбора с учетом динамического метода getChoices
        const choices = scene.getChoices ? scene.getChoices() : scene.choices;
        
        // Отображаем интерфейс
        this.storyTextElement.innerHTML = processedText;
        this.renderKefirChoices(choices);
        
        // Обновляем отображение найденных улик
        this.renderClues();
    }
    
    // Метод для отображения выборов
    renderKefirChoices(choices) {
        this.choicesElement.innerHTML = '';
        
        if (!choices || choices.length === 0) return;
        
        choices.forEach(choice => {
            const choiceButton = document.createElement('button');
            choiceButton.className = 'choice';
            choiceButton.textContent = choice.text;
            
            choiceButton.addEventListener('click', () => {
                this.loadScene(choice.nextScene);
            });
            
            this.choicesElement.appendChild(choiceButton);
        });
    }
    
    // Метод для отображения найденных улик и состояния
    renderClues() {
        this.inventoryElement.innerHTML = '';
        
        // Создаем список улик
        const clueItems = [];
        if (gameState.foundClues.catHair) clueItems.push('Кошачьи волосы на книжной полке');
        if (gameState.foundClues.pawPrints) clueItems.push('Следы лап на подоконнике');
        if (gameState.foundClues.chewedCase) clueItems.push('Погрызенный футляр от очков');
        if (gameState.foundClues.scratchedCurtains) clueItems.push('Зацепки на шторах');
        if (gameState.foundClues.movedVase) clueItems.push('Сдвинутая ваза');
        
        if (clueItems.length === 0) {
            this.inventoryElement.textContent = 'Пока не найдено ни одной улики.';
            return;
        }
        
        // Создаем элементы для каждой улики
        clueItems.forEach(clue => {
            const clueElement = document.createElement('div');
            clueElement.className = 'clue-item';
            clueElement.textContent = clue;
            this.inventoryElement.appendChild(clueElement);
        });
        
        // Добавляем информацию о времени и голоде
        const statusElement = document.createElement('div');
        statusElement.style.marginTop = '10px';
        statusElement.innerHTML = `Время: ${8 + Math.floor(gameState.timeElapsed / 4)}:${(gameState.timeElapsed % 4) * 15} | `;
        
        // Отображаем уровень голода
        let hungerText = 'Голод: ';
        for (let i = 0; i < gameState.hunger; i++) {
            hungerText += '🍽️';
        }
        for (let i = gameState.hunger; i < 5; i++) {
            hungerText += '⚪';
        }
        
        statusElement.innerHTML += hungerText;
        
        this.inventoryElement.appendChild(statusElement);
        
        // Если есть телефон, показываем это
        if (gameState.hasFoundPhone) {
            const phoneElement = document.createElement('div');
            phoneElement.className = 'clue-item';
            phoneElement.textContent = 'У вас есть телефон';
            phoneElement.style.backgroundColor = '#e8f4ff';
            this.inventoryElement.appendChild(phoneElement);
        }
    }
}

// Запуск игры при загрузке документа
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем игру
    const game = new KefirGame();
    
    // Добавляем обработчик для кнопки сброса
    document.getElementById('reset-game').addEventListener('click', () => {
        resetGameState();
        alert('Игра сброшена. Начинаем заново!');
        game.loadScene('start');
    });
    
    // Запускаем игру
    game.loadScene(game.currentScene);
});
