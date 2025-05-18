/**
 * Модуль pirogGame.js - запуск игры "Загадка волшебного пирога"
 */

import TextGame from './game.js';

// Глобальное состояние игры
const gameState = {
    accusedOnce: false,
    foundClues: {
        dobrynya: false,
        agafya: false,
        yaropolck: false,
        recipe: false,
        crumbs: false
    }
};

// Загрузка сохраненного состояния
function loadGameState() {
    try {
        const saved = localStorage.getItem('pirogGameState');
        if (saved) {
            const loadedState = JSON.parse(saved);
            gameState.accusedOnce = loadedState.accusedOnce || false;
            gameState.foundClues = loadedState.foundClues || {
                dobrynya: false,
                agafya: false,
                yaropolck: false,
                recipe: false,
                crumbs: false
            };
            console.log("Загружено состояние:", gameState);
        }
    } catch (e) {
        console.error("Ошибка при загрузке состояния:", e);
    }
}

// Сохранение состояния
function saveGameState() {
    try {
        localStorage.setItem('pirogGameState', JSON.stringify(gameState));
        console.log("Сохранено состояние:", gameState);
    } catch (e) {
        console.error("Ошибка при сохранении состояния:", e);
    }
}

// Проверка, собраны ли все улики
function allCluesFound() {
    return gameState.foundClues.dobrynya && 
           gameState.foundClues.agafya && 
           gameState.foundClues.yaropolck && 
           gameState.foundClues.recipe && 
           gameState.foundClues.crumbs;
}

// Определение сцен
const pirogScenes = {
    // Начальная сцена
    pirog_start: {
        text: 'В сердце Шепчущего леса, в избушке, увитой диким хмелем, живет ведьма Берта. Славится она своими волшебными пирогами, от которых даже лешие танцуют, а русалки выходят на берег петь песни.\n\nВ день Купалы Берта испекла свой особенный пирог для праздничного пира, но обнаружила, что он пропал. В гневе она призвала тебя - Милаву, свою верную помощницу из Пустоты.\n\n"Милава! Мой пирог пропал, а без него весь праздник испорчен! Найди виновного, чтобы я могла воздать ему по заслугам!" — приказала Берта.',
        choices: [
            { text: 'Отправиться к Радимиру, седобородому лесовику', nextScene: 'pirog_radimir' },
            { text: 'Посетить Любаву, красавицу-русалку', nextScene: 'pirog_lubava' },
            { text: 'Заглянуть к Зоряне, старой ведунье', nextScene: 'pirog_zoryana' },
            { text: 'Поговорить с Добрыней, домовым', nextScene: 'pirog_dobrynya' },
            { text: 'Навестить Агафью, молодую травницу', nextScene: 'pirog_agafya' },
            { text: 'Разыскать Ярополка, лесного стражника', nextScene: 'pirog_yaropolck' }
        ],
        // Функция для добавления дополнительных выборов на основе состояния
        getChoices: function() {
            const choices = [...this.choices]; // копируем базовые выборы
            
            // Если уже было обвинение, добавляем возможность осмотреть дом
            if (gameState.accusedOnce) {
                choices.push({ 
                    text: 'Осмотреть дом Берты более внимательно', 
                    nextScene: 'pirog_search_house' 
                });
                
                // Меняем текст, добавляя подсказку
                this.text = 'В сердце Шепчущего леса, в избушке, увитой диким хмелем, живет ведьма Берта. Славится она своими волшебными пирогами, от которых даже лешие танцуют, а русалки выходят на берег петь песни.\n\nВ день Купалы Берта испекла свой особенный пирог для праздничного пира, но обнаружила, что он пропал. В гневе она призвала тебя - Милаву, свою верную помощницу из Пустоты.\n\n"Милава! Мой пирог пропал, а без него весь праздник испорчен! Найди виновного, чтобы я могла воздать ему по заслугам!" — приказала Берта.\n\nЧто-то подсказывает тебе, что стоит более внимательно осмотреть дом Берты, прежде чем идти к соседям.';
            }
            
            // Если собраны все улики и было обвинение, добавляем истинную концовку
            if (gameState.accusedOnce && allCluesFound()) {
                choices.push({ 
                    text: 'Рассказать Берте всю правду (истинная концовка)', 
                    nextScene: 'pirog_true_ending' 
                });
            }
            
            return choices;
        }
    },
    
    // Дом Берты
    pirog_search_house: {
        text: 'Ты решаешь более внимательно осмотреть дом Берты. В кухне на полке стоит старая книга рецептов, а доски пола в углу кухни выглядят странно - как будто их недавно поднимали.',
        choices: [
            { text: 'Посмотреть книгу рецептов', nextScene: 'pirog_recipe_clue' },
            { text: 'Осмотреть подозрительные половицы', nextScene: 'pirog_floor_clue' },
            { text: 'Вернуться к расследованию', nextScene: 'pirog_start' }
        ]
    },
    
    // Улика - книга рецептов
    pirog_recipe_clue: {
        text: 'Ты открываешь старую книгу рецептов и листаешь её, пока не находишь рецепт праздничного пирога. На полях есть заметка, подчеркнутая красными чернилами:\n\n"ВАЖНО! Травы Агафьи добавлять в остывшее тесто! При нагреве выше семидесяти градусов возможно изменение свойств!"',
        choices: [
            { text: 'Вернуться к осмотру дома', nextScene: 'pirog_search_house' }
        ],
        onLoad: function() {
            gameState.foundClues.recipe = true;
            saveGameState();
            console.log("Найдена улика - рецепт!");
        }
    },
    
    // Улика - крошки под половицей
    pirog_floor_clue: {
        text: 'Ты поднимаешь скрипучие половицы и обнаруживаешь маленький погреб. Внутри него на земляном полу разбросаны свежие крошки пирога и даже кусочек начинки - похоже, кто-то спрятал здесь пирог совсем недавно.',
        choices: [
            { text: 'Вернуться к осмотру дома', nextScene: 'pirog_search_house' }
        ],
        onLoad: function() {
            gameState.foundClues.crumbs = true;
            saveGameState();
            console.log("Найдена улика - крошки пирога!");
        }
    },
    
    // Радимир
    pirog_radimir: {
        text: 'Старый лесовик Радимир сидит на пне у своего дупла, перебирая какие-то коренья. Увидев тебя, он хмурит косматые брови.\n\n"Чего тебе, Пустотная? Берта опять за своими пирогами послала?"',
        choices: [
            { text: 'Спросить о пироге Берты', nextScene: 'pirog_radimir_talk' },
            { text: 'Обвинить Радимира в краже пирога', nextScene: 'pirog_accuse_radimir' },
            { text: 'Вернуться к выбору', nextScene: 'pirog_start' }
        ]
    },
    
    pirog_radimir_talk: {
        text: 'Радимир хмыкает: "Пирог, значит? Нет, не видел я его. Хотя... вчера видел, как Добрыня что-то нёс завёрнутое в тряпицу. А ещё Любава на берег выходила, может, она чего знает. А вообще, я в дела ведьм не лезу - себе дороже."',
        choices: [
            { text: 'Вернуться к Радимиру', nextScene: 'pirog_radimir' }
        ]
    },
    
    // Любава
    pirog_lubava: {
        text: 'Любава расчёсывает свои длинные зеленоватые волосы на берегу озера. Заметив тебя, она улыбается и машет рукой.\n\n"Милава! Какими судьбами? Присаживайся, расскажи, что у вас там на суше творится."',
        choices: [
            { text: 'Спросить о пироге Берты', nextScene: 'pirog_lubava_talk' },
            { text: 'Обвинить Любаву в краже пирога', nextScene: 'pirog_accuse_lubava' },
            { text: 'Вернуться к выбору', nextScene: 'pirog_start' }
        ]
    },
    
    pirog_lubava_talk: {
        text: 'Любава задумчиво крутит прядь волос: "Пирог? О, я бы с удовольствием попробовала пирог Берты! Но не видела его, клянусь глубинами озера. Зато видела вчера Зоряну, которая кралась вдоль берега к дому Берты. Она давно завидует кулинарным талантам Берты, ты же знаешь."',
        choices: [
            { text: 'Вернуться к Любаве', nextScene: 'pirog_lubava' }
        ]
    },
    
    // Зоряна
    pirog_zoryana: {
        text: 'Зоряна помешивает что-то в большом котле. Её избушка на курьих ножках поворачивается к тебе входом, когда ты приближаешься.\n\n"А, посланница Берты! Небось опять хвастаться своими пирогами пришла? Или у Берточки что-то стряслось?" — язвительно спрашивает старая ведунья.',
        choices: [
            { text: 'Спросить о пироге Берты', nextScene: 'pirog_zoryana_talk' },
            { text: 'Обвинить Зоряну в краже пирога', nextScene: 'pirog_accuse_zoryana' },
            { text: 'Вернуться к выбору', nextScene: 'pirog_start' }
        ]
    },
    
    pirog_zoryana_talk: {
        text: 'Зоряна смеётся: "Пирог пропал? Вот незадача! Но я тут ни при чём, у меня своих дел по горло. Могу лишь сказать, что видела, как Ярополк что-то нёс от дома Берты. Очень подозрительный молодой человек, если хочешь знать моё мнение."',
        choices: [
            { text: 'Вернуться к Зоряне', nextScene: 'pirog_zoryana' }
        ]
    },
    
    // Добрыня
    pirog_dobrynya: {
        text: 'Добрыня суетливо протирает посуду в сенях дома Берты. Увидев тебя, он подпрыгивает от неожиданности.\n\n"Ох, Милава! Напугала! Ты так неожиданно появилась... что-то нужно?"',
        choices: [
            { text: 'Спросить о пироге Берты', nextScene: 'pirog_dobrynya_talk' },
            { text: 'Обвинить Добрыню в краже пирога', nextScene: 'pirog_accuse_dobrynya' },
            { text: 'Вернуться к выбору', nextScene: 'pirog_start' }
        ],
        getChoices: function() {
            const choices = [...this.choices];
            
            // При втором прохождении добавляем дополнительный вариант
            if (gameState.accusedOnce) {
                choices.splice(1, 0, { 
                    text: 'Спросить о помощи при выпечке пирога', 
                    nextScene: 'pirog_dobrynya_clue' 
                });
            }
            
            return choices;
        }
    },
    
    pirog_dobrynya_talk: {
        text: 'Добрыня нервно теребит край своей рубашки: "Пирог? Какой пирог? А, тот самый! Нет-нет, я не видел. Может, Агафья знает? Она тут недавно заходила, травы приносила для пирога..."',
        choices: [
            { text: 'Вернуться к Добрыне', nextScene: 'pirog_dobrynya' }
        ]
    },
    
    // Улика Добрыни
    pirog_dobrynya_clue: {
        text: 'Добрыня внезапно краснеет и опускает глаза: "Я... я помогал Берте готовить пирог. Она использовала особую муку из синих колосьев, а в конце добавила травы от Агафьи. Но когда она отвернулась, я случайно насыпал лишнего... Трав должно быть всего щепотка, а не целая горсть! Я боялся признаться..."',
        choices: [
            { text: 'Вернуться к Добрыне', nextScene: 'pirog_dobrynya' }
        ],
        onLoad: function() {
            gameState.foundClues.dobrynya = true;
            saveGameState();
            console.log("Найдена улика от Добрыни!");
        }
    },
    
    // Агафья
    pirog_agafya: {
        text: 'Агафья собирает травы в своём саду. Заметив тебя, она улыбается и приветственно машет рукой.\n\n"Милава! Рада тебя видеть. Чем могу помочь? У Берты всё в порядке?"',
        choices: [
            { text: 'Спросить о пироге Берты', nextScene: 'pirog_agafya_talk' },
            { text: 'Обвинить Агафью в краже пирога', nextScene: 'pirog_accuse_agafya' },
            { text: 'Вернуться к выбору', nextScene: 'pirog_start' }
        ],
        getChoices: function() {
            const choices = [...this.choices];
            
            // При втором прохождении добавляем дополнительный вариант
            if (gameState.accusedOnce) {
                choices.splice(1, 0, { 
                    text: 'Спросить о травах для пирога', 
                    nextScene: 'pirog_agafya_clue' 
                });
            }
            
            return choices;
        }
    },
    
    pirog_agafya_talk: {
        text: 'Агафья задумчиво качает головой: "Пирог пропал? Странно... Я давала Берте особые травы для него, но пирога не видела. Может быть, Добрыня что-то знает? Он всегда крутится на кухне. Или спроси Ярополка, он собирал для меня травы на этот пирог."',
        choices: [
            { text: 'Вернуться к Агафье', nextScene: 'pirog_agafya' }
        ]
    },
    
    // Улика Агафьи
    pirog_agafya_clue: {
        text: 'Агафья внимательно осматривает свои мешочки с травами и вдруг хмурится: "Постой-ка... Я, кажется, дала Берте \'Семицветник счастья\'. Но теперь я вижу, что мешочек был не тот! Похоже, я перепутала и дала ей \'Буреглаз\', траву, что вскрывает старые обиды. Они очень похожи, только у \'Буреглаза\' чуть темнее стебелёк..."',
        choices: [
            { text: 'Вернуться к Агафье', nextScene: 'pirog_agafya' }
        ],
        onLoad: function() {
            gameState.foundClues.agafya = true;
            saveGameState();
            console.log("Найдена улика от Агафьи!");
        }
    },
    
    // Ярополк
    pirog_yaropolck: {
        text: 'Ярополк точит свой меч у опушки леса. Его угрюмый взгляд останавливается на тебе.\n\n"Что нужно?" — коротко спрашивает он.',
        choices: [
            { text: 'Спросить о пироге Берты', nextScene: 'pirog_yaropolck_talk' },
            { text: 'Обвинить Ярополка в краже пирога', nextScene: 'pirog_accuse_yaropolck' },
            { text: 'Вернуться к выбору', nextScene: 'pirog_start' }
        ],
        getChoices: function() {
            const choices = [...this.choices];
            
            // При втором прохождении добавляем дополнительный вариант
            if (gameState.accusedOnce) {
                choices.splice(1, 0, { 
                    text: 'Спросить о сборе трав для Агафьи', 
                    nextScene: 'pirog_yaropolck_clue' 
                });
            }
            
            return choices;
        }
    },
    
    pirog_yaropolck_talk: {
        text: 'Ярополк хмуро бросает: "Не до пирогов мне. Хотя... видел я, как Зоряна вокруг дома Берты крутилась. Старая ведьма давно завидует Берте. А вообще, спроси лучше у Агафьи, она травы для этого пирога собирала."',
        choices: [
            { text: 'Вернуться к Ярополку', nextScene: 'pirog_yaropolck' }
        ]
    },
    
    // Улика Ярополка
    pirog_yaropolck_clue: {
        text: 'Ярополк неохотно отвечает: "Да, я собирал травы для Агафьи на прошлое полнолуние... Но она просила собирать до полуночи, а я задержался в лесу. Выслеживал лесного вора. После полуночи я собрал те травы... А что? Что-то не так? Не могу я везде успеть!"',
        choices: [
            { text: 'Вернуться к Ярополку', nextScene: 'pirog_yaropolck' }
        ],
        onLoad: function() {
            gameState.foundClues.yaropolck = true;
            saveGameState();
            console.log("Найдена улика от Ярополка!");
        }
    },
    
    // Обвинительные концовки
    pirog_accuse_radimir: {
        text: 'Ты указываешь пальцем на Радимира: "Это ты украл пирог Берты!"\n\nРадимир багровеет от гнева: "Что?! Как ты смеешь! Я, хранитель леса, опустился бы до кражи кулинарных изделий?!"\n\nВдруг появляется Берта в клубах дыма: "Так вот ты какой, вор пирогов!"\n\nРадимир вскакивает: "Нет! Это клевета! Я требую справедливости!"\n\nВнезапно между Бертой и Радимиром вспыхивает яростная ссора. Вскоре подтягиваются и другие жители леса, и все начинают обвинять друг друга во всех бедах.\n\nБерта внезапно останавливается: "Что-то здесь не так... Этот пирог... Милава, возвращайся в Пустоту до нового зова."',
        choices: [
            { text: 'Вернуться в Пустоту (начать заново)', nextScene: 'pirog_start' }
        ],
        onLoad: function() {
            gameState.accusedOnce = true;
            saveGameState();
            console.log("Выполнено обвинение, accusedOnce =", gameState.accusedOnce);
        }
    },
    
    pirog_accuse_lubava: {
        text: 'Ты обвиняешь Любаву: "Признавайся, это ты украла пирог Берты!"\n\nЛюбава от возмущения даже выскакивает из воды: "Как ты смеешь! Я даже на берег-то с трудом выбираюсь, куда мне до пирогов?!"\n\nПоявляется Берта: "Значит, воровка нашлась! Вот уж не думала, что русалка покусится на моё творение!"\n\nЛюбава взвивается: "Я не воровка! Да как ты смеешь, старая карга!"\n\nВскоре все жители леса вовлечены в яростную перепалку. Берта вдруг замолкает: "Что-то тут не так... Пирог... Милава, вернись в Пустоту до следующего зова."',
        choices: [
            { text: 'Вернуться в Пустоту (начать заново)', nextScene: 'pirog_start' }
        ],
        onLoad: function() {
            gameState.accusedOnce = true;
            saveGameState();
            console.log("Выполнено обвинение, accusedOnce =", gameState.accusedOnce);
        }
    },
    
    pirog_accuse_zoryana: {
        text: 'Ты смело заявляешь: "Зоряна, это ты украла пирог Берты из зависти!"\n\nЗоряна взвивается от возмущения: "Ах ты, пустотная дрянь! Как смеешь обвинять меня, потомственную ведунью!"\n\nПоявляется Берта: "Я так и знала! Всегда завидовала моим талантам, старая ведьма!"\n\nЗоряна бросается на Берту с проклятиями, и вскоре все лесные жители ссорятся между собой. Берта вдруг отступает и трёт виски: "Стойте... что-то здесь не так... Милава, возвращайся в Пустоту, пока мы разберёмся."',
        choices: [
            { text: 'Вернуться в Пустоту (начать заново)', nextScene: 'pirog_start' }
        ],
        onLoad: function() {
            gameState.accusedOnce = true;
            saveGameState();
            console.log("Выполнено обвинение, accusedOnce =", gameState.accusedOnce);
        }
    },
    
    pirog_accuse_dobrynya: {
        text: 'Ты указываешь на Добрыню: "Это ты украл пирог, признавайся!"\n\nДобрыня начинает заикаться от страха: "Н-нет! Клянусь, я бы н-никогда!"\n\nПоявляется Берта: "Добрыня?! Мой верный помощник?! Вот так предательство!"\n\nДобрыня бросается к ногам Берты: "Клянусь, не брал я пирога!"\n\nВскоре все вовлечены в ожесточённый спор. Берта трясёт головой: "Странно... Такая ярость... Что-то с пирогом было не так... Милава, возвращайся в Пустоту, нам нужно успокоиться."',
        choices: [
            { text: 'Вернуться в Пустоту (начать заново)', nextScene: 'pirog_start' }
        ],
        onLoad: function() {
            gameState.accusedOnce = true;
            saveGameState();
            console.log("Выполнено обвинение, accusedOnce =", gameState.accusedOnce);
        }
    },
    
    pirog_accuse_agafya: {
        text: 'Ты решительно заявляешь: "Агафья, это ты виновата в пропаже пирога!"\n\nАгафья изумлённо прижимает руки к груди: "Милава! Как ты можешь! Я всегда помогала Берте!"\n\nПоявляется Берта: "Агафья?! Моя помощница и поставщица трав?! Предательница!"\n\nАгафья вскакивает: "Да как ты смеешь обвинять меня после всего, что я для тебя сделала!"\n\nВсе начинают кричать друг на друга, обвиняя в старых обидах. Берта останавливается: "Постойте... Эта ярость... Тут что-то не так. Милава, вернись в Пустоту до нового зова."',
        choices: [
            { text: 'Вернуться в Пустоту (начать заново)', nextScene: 'pirog_start' }
        ],
        onLoad: function() {
            gameState.accusedOnce = true;
            saveGameState();
            console.log("Выполнено обвинение, accusedOnce =", gameState.accusedOnce);
        }
    },
    
    pirog_accuse_yaropolck: {
        text: 'Ты обвиняешь Ярополка: "Вот кто украл пирог Берты!"\n\nЯрополк хватается за меч: "Что?! Ты смеешь обвинять лесного стражника в воровстве?!"\n\nПоявляется Берта: "Так это ты! А я-то думала, что можно доверять лесной страже!"\n\nЯрополк наступает на Берту: "Ты всегда была высокомерной ведьмой! Никого не уважаешь!"\n\nВскоре все лесные жители ссорятся, вспоминая старые обиды. Берта вдруг застывает: "Стоп... Что происходит? Откуда такая злоба?... Милава, вернись в Пустоту, мне нужно подумать."',
        choices: [
            { text: 'Вернуться в Пустоту (начать заново)', nextScene: 'pirog_start' }
        ],
        onLoad: function() {
            gameState.accusedOnce = true;
            saveGameState();
            console.log("Выполнено обвинение, accusedOnce =", gameState.accusedOnce);
        }
    },
    
    // Истинная концовка
    pirog_true_ending: {
        text: 'Ты собираешь всех жителей леса и рассказываешь обо всём, что удалось выяснить:\n\n"Никто специально не хотел зла. Это цепочка случайностей: Ярополк собрал травы после полуночи, когда \'Семицветник счастья\' меняет свои свойства; Агафья перепутала мешочки и дала Берте \'Буреглаз\' вместо нужной травы; Добрыня случайно насыпал слишком много этих трав в тесто; а Берта добавила их в горячее тесто, хотя следовало в холодное. Из-за всего этого свойства трав изменились. А потом, попробовав тесто, Берта под действием трав сама спрятала пирог в погребе, решив, что он слишком хорош для гостей."\n\nБерта изумлённо качает головой: "Неужели? Но... да, теперь я вспоминаю! Я действительно спрятала пирог под половицей! Какой стыд..."\n\nВсе облегчённо вздыхают, осознавая, что никто не был настоящим виновником.\n\nБерта улыбается: "Милава, ты раскрыла правду и спасла нас от взаимных обвинений. Теперь я вижу, что всему виной простые ошибки, а не злой умысел. Возвращайся в Пустоту с миром, до нового призыва."\n\nМилава улыбается и растворяется в воздухе, оставляя жителей леса мириться и готовиться к празднику заново, уже без волшебного, но опасного пирога.',
        choices: [
            { text: 'Вернуться в Пустоту (игра пройдена)', nextScene: 'pirog_start' }
        ],
        onLoad: function() {
            // Добавим уведомление о достижении
            alert('🏆 Достижение разблокировано: "Настоящий детектив"\nРаскрыта истинная тайна пирога!');
        }
    }
};

// Кастомный класс игры для "Загадки пирога"
class PirogGame extends TextGame {
    constructor() {
        super(pirogScenes);
        this.currentScene = 'pirog_start';
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
        this.renderPirogChoices(choices);
        
        // Обновляем отображение собранных улик
        this.renderClues();
    }
    
    // Метод для отображения выборов
    renderPirogChoices(choices) {
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
    
    // Метод для отображения собранных улик вместо инвентаря
    renderClues() {
        this.inventoryElement.innerHTML = '';
        
        // Если нет обвинения, не показываем улики
        if (!gameState.accusedOnce) {
            this.inventoryElement.textContent = 'Пока нет собранных улик.';
            return;
        }
        
        // Создаем список улик
        const clues = [];
        if (gameState.foundClues.recipe) clues.push('Рецепт пирога');
        if (gameState.foundClues.crumbs) clues.push('Крошки под половицей');
        if (gameState.foundClues.dobrynya) clues.push('Признание Добрыни');
        if (gameState.foundClues.agafya) clues.push('Объяснение Агафьи');
        if (gameState.foundClues.yaropolck) clues.push('Признание Ярополка');
        
        if (clues.length === 0) {
            this.inventoryElement.textContent = 'Пока нет собранных улик.';
            return;
        }
        
        // Создаем элементы для каждой улики
        clues.forEach(clue => {
            const clueElement = document.createElement('div');
            clueElement.className = 'clue-item';
            clueElement.textContent = clue;
            this.inventoryElement.appendChild(clueElement);
        });
        
        // Добавляем информацию о прогрессе расследования
        const progressElement = document.createElement('div');
        progressElement.style.marginTop = '10px';
        progressElement.textContent = `Собрано улик: ${clues.length} из 5`;
        if (clues.length === 5) {
            progressElement.textContent += " (все улики найдены!)";
            progressElement.style.color = '#0061a8';
            progressElement.style.fontWeight = 'bold';
        }
        this.inventoryElement.appendChild(progressElement);
    }
}

// Запуск игры при загрузке документа
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем состояние
    loadGameState();
    
    // Создаем игру
    const game = new PirogGame();
    
    // Отладочная кнопка для сброса прогресса
    document.getElementById('debug-reset').addEventListener('click', () => {
        localStorage.removeItem('pirogGameState');
        alert('Прогресс игры сброшен. Страница будет перезагружена.');
        location.reload();
    });
    
    // Отображаем информацию о состоянии в консоли
    console.log("Текущее состояние игры:", gameState);
    
    // Инициализация игры
    game.loadScene(game.currentScene);
});
