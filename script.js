// Главный класс игры
class TextGame {
    constructor() {
        this.inventory = [];
        this.currentScene = 'start';
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.activeItem = null;
        
        // DOM элементы
        this.storyTextElement = document.getElementById('story-text');
        this.choicesElement = document.getElementById('choices');
        this.inventoryElement = document.getElementById('inventory-items');
        
        // Аудио элементы
        this.bgMusic = new Audio('https://freepd.com/music/Puzzle%20Game.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.5;
        
        // Звуковые эффекты
        this.sfx = {
            itemPickup: new Audio('https://freesound.org/data/previews/366/366113_6657512-lq.mp3'),
            itemUse: new Audio('https://freesound.org/data/previews/561/561252_12105261-lq.mp3'),
            doorOpen: new Audio('https://freesound.org/data/previews/353/353546_5477873-lq.mp3'),
            danger: new Audio('https://freesound.org/data/previews/368/368691_6687862-lq.mp3')
        };
        
        // Обработчики кнопок аудио
        document.getElementById('toggle-music').addEventListener('click', () => this.toggleMusic());
        document.getElementById('toggle-sfx').addEventListener('click', () => this.toggleSfx());
        
        // Инициализация игры
        this.initGame();
    }
    
    // Инициализация игры
    initGame() {
        this.bgMusic.play().catch(e => console.log('Автовоспроизведение заблокировано: нажмите на страницу'));
        this.loadScene(this.currentScene);
    }
    
    // Загрузка сцены
    loadScene(sceneId) {
        const scene = this.scenes[sceneId];
        if (!scene) return;
        
        this.currentScene = sceneId;
        
        // Обработка текста сцены с интерактивными элементами
        let processedText = scene.text;
        if (scene.interactiveElements) {
            for (const element of scene.interactiveElements) {
                const replaceText = `<span class="interactive" data-action="${element.action}" data-requires="${element.requires || ''}" data-gives="${element.gives || ''}" data-scene="${element.nextScene || ''}">${element.text}</span>`;
                processedText = processedText.replace(`[${element.text}]`, replaceText);
            }
        }
        
        // Отображение текста и выборов
        this.storyTextElement.innerHTML = processedText;
        this.renderChoices(scene.choices);
        this.renderInventory();
        
        // Добавление обработчиков для интерактивных элементов
        const interactiveElements = document.querySelectorAll('.interactive');
        interactiveElements.forEach(element => {
            element.addEventListener('click', () => this.handleInteraction(element));
        });
    }
    
    // Обработка интерактивных элементов
    handleInteraction(element) {
        const action = element.getAttribute('data-action');
        const requires = element.getAttribute('data-requires');
        const gives = element.getAttribute('data-gives');
        const nextScene = element.getAttribute('data-scene');
        
        if (action === 'examine') {
            this.playSfx('itemUse');
            alert(`Вы внимательно осматриваете ${element.textContent}.`);
        } else if (action === 'pickup') {
            if (gives && !this.inventory.includes(gives)) {
                this.addToInventory(gives);
                this.playSfx('itemPickup');
                element.style.color = 'gray';
                element.style.textDecoration = 'none';
                element.style.cursor = 'default';
                element.classList.remove('interactive');
            }
        } else if (action === 'use') {
            if (requires) {
                if (this.activeItem === requires) {
                    this.playSfx('itemUse');
                    if (nextScene) {
                        this.loadScene(nextScene);
                    }
                } else {
                    alert('Вам нужен правильный предмет для этого.');
                }
            }
        } else if (action === 'door') {
            if (requires && this.inventory.includes(requires)) {
                this.playSfx('doorOpen');
                if (nextScene) {
                    this.loadScene(nextScene);
                }
            } else if (requires) {
                this.playSfx('danger');
                alert(`Эта дверь заперта. Вам нужен ${requires}.`);
            } else if (nextScene) {
                this.playSfx('doorOpen');
                this.loadScene(nextScene);
            }
        }
    }
    
    // Отображение вариантов выбора
    renderChoices(choices) {
        this.choicesElement.innerHTML = '';
        
        if (!choices || choices.length === 0) return;
        
        choices.forEach(choice => {
            if (choice.requires && !this.inventory.includes(choice.requires)) {
                return; // Пропускаем выбор, если требуемый предмет отсутствует
            }
            
            const choiceButton = document.createElement('button');
            choiceButton.className = 'choice';
            choiceButton.textContent = choice.text;
            
            choiceButton.addEventListener('click', () => {
                if (choice.gives) {
                    this.addToInventory(choice.gives);
                    this.playSfx('itemPickup');
                }
                
                if (choice.removeItem) {
                    this.removeFromInventory(choice.removeItem);
                }
                
                if (choice.sfx) {
                    this.playSfx(choice.sfx);
                }
                
                this.loadScene(choice.nextScene);
            });
            
            this.choicesElement.appendChild(choiceButton);
        });
    }
    
    // Добавление предмета в инвентарь
    addToInventory(item) {
        if (!this.inventory.includes(item)) {
            this.inventory.push(item);
            this.renderInventory();
        }
    }
    
    // Удаление предмета из инвентаря
    removeFromInventory(item) {
        const index = this.inventory.indexOf(item);
        if (index !== -1) {
            this.inventory.splice(index, 1);
            if (this.activeItem === item) {
                this.activeItem = null;
            }
            this.renderInventory();
        }
    }
    
    // Отображение инвентаря
    renderInventory() {
        this.inventoryElement.innerHTML = '';
        
        if (this.inventory.length === 0) {
            this.inventoryElement.textContent = 'Пусто';
            return;
        }
        
        this.inventory.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            if (this.activeItem === item) {
                itemElement.classList.add('active');
            }
            itemElement.textContent = item;
            
            itemElement.addEventListener('click', () => {
                if (this.activeItem === item) {
                    this.activeItem = null;
                } else {
                    this.activeItem = item;
                    this.playSfx('itemUse');
                }
                this.renderInventory();
            });
            
            this.inventoryElement.appendChild(itemElement);
        });
    }
    
    // Воспроизведение звукового эффекта
    playSfx(sfxName) {
        if (this.sfxEnabled && this.sfx[sfxName]) {
            const sound = this.sfx[sfxName].cloneNode();
            sound.volume = 0.7;
            sound.play();
        }
    }
    
    // Включение/выключение музыки
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        const toggleButton = document.getElementById('toggle-music');
        
        if (this.musicEnabled) {
            this.bgMusic.play();
            toggleButton.textContent = 'Музыка: Вкл';
        } else {
            this.bgMusic.pause();
            toggleButton.textContent = 'Музыка: Выкл';
        }
    }
    
    // Включение/выключение звуковых эффектов
    toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        const toggleButton = document.getElementById('toggle-sfx');
        toggleButton.textContent = this.sfxEnabled ? 'Звуки: Вкл' : 'Звуки: Выкл';
    }
    
    // Определение сцен игры
    scenes = {
        'start': {
            text: 'Вы стоите перед огромным заброшенным замком. Холодный ветер пронизывает до костей, а тяжелые тучи нависли над древними башнями. Перед вами [массивная дверь] замка, слегка приоткрытая. Рядом с входом лежит [старая сумка].',
            interactiveElements: [
                { text: 'массивная дверь', action: 'door', nextScene: 'entrance_hall' },
                { text: 'старая сумка', action: 'pickup', gives: 'Факел' }
            ],
            choices: [
                { text: 'Войти в замок', nextScene: 'entrance_hall' },
                { text: 'Осмотреться вокруг', nextScene: 'outside_look' }
            ]
        },
        'outside_look': {
            text: 'Оглядываясь вокруг, вы замечаете, что замок стоит на краю обрыва. Позади вас густой лес, а впереди только мрачное строение. Среди камней вы видите [блестящий предмет].',
            interactiveElements: [
                { text: 'блестящий предмет', action: 'pickup', gives: 'Старинный ключ' }
            ],
            choices: [
                { text: 'Вернуться к входу', nextScene: 'start' },
                { text: 'Войти в замок', nextScene: 'entrance_hall' }
            ]
        },
        'entrance_hall': {
            text: 'Вы входите в просторный зал с высоким потолком. Пыль кружится в лучах света, пробивающихся через витражные окна. Перед вами три двери: [левая дверь], [центральная дверь] и [правая дверь]. В углу зала стоит [старинный канделябр].',
            interactiveElements: [
                { text: 'левая дверь', action: 'door', nextScene: 'library' },
                { text: 'центральная дверь', action: 'door', requires: 'Старинный ключ', nextScene: 'throne_room' },
                { text: 'правая дверь', action: 'door', nextScene: 'kitchen' },
                { text: 'старинный канделябр', action: 'examine' }
            ],
            choices: [
                { text: 'Вернуться наружу', nextScene: 'start' }
            ]
        },
        'library': {
            text: 'Вы оказываетесь в древней библиотеке. Книжные полки достигают потолка, многие книги покрыты толстым слоем пыли. На центральном столе лежит [старинная книга] и [странный амулет]. У дальней стены находится [потайная дверь], видимая через небольшую щель в стене.',
            interactiveElements: [
                { text: 'старинная книга', action: 'examine' },
                { text: 'странный амулет', action: 'pickup', gives: 'Защитный амулет' },
                { text: 'потайная дверь', action: 'door', requires: 'Факел', nextScene: 'secret_passage' }
            ],
            choices: [
                { text: 'Вернуться в главный зал', nextScene: 'entrance_hall' },
                { text: 'Изучить книги', nextScene: 'study_books' }
            ]
        },
        'study_books': {
            text: 'Просматривая книги, вы находите одну с символом, похожим на герб замка. В ней говорится о секретном сокровище, спрятанном в тронном зале. Также упоминается, что для входа нужен специальный ключ и какой-то защитный талисман.',
            choices: [
                { text: 'Вернуться к осмотру библиотеки', nextScene: 'library' }
            ]
        },
        'kitchen': {
            text: 'В старинной кухне пахнет сыростью и плесенью. Большой очаг давно остыл, а посуда покрыта пылью. На столе лежит [нож], а в углу стоит [деревянный сундук].',
            interactiveElements: [
                { text: 'нож', action: 'pickup', gives: 'Старинный нож' },
                { text: 'деревянный сундук', action: 'use', requires: 'Старинный нож', nextScene: 'chest_opened' }
            ],
            choices: [
                { text: 'Вернуться в главный зал', nextScene: 'entrance_hall' }
            ]
        },
        'chest_opened': {
            text: 'Вы используете нож, чтобы открыть сундук. Внутри вы находите [золотую монету] и старый пергамент с картой замка.',
            interactiveElements: [
                { text: 'золотую монету', action: 'pickup', gives: 'Золотая монета' }
            ],
            choices: [
                { text: 'Вернуться на кухню', nextScene: 'kitchen' }
            ]
        },
        'secret_passage': {
            text: 'Факел освещает узкий коридор. Стены здесь влажные, и вы слышите звук капающей воды. Коридор ведет вниз по винтовой лестнице к [железной двери].',
            interactiveElements: [
                { text: 'железной двери', action: 'door', nextScene: 'dungeon' }
            ],
            choices: [
                { text: 'Вернуться в библиотеку', nextScene: 'library' }
            ]
        },
        'dungeon': {
            text: 'Вы спускаетесь в подземелье замка. Здесь холодно и сыро. В центре комнаты стоит [каменный алтарь], а у стены висит [ржавый меч].',
            interactiveElements: [
                { text: 'каменный алтарь', action: 'examine' },
                { text: 'ржавый меч', action: 'pickup', gives: 'Ржавый меч' }
            ],
            choices: [
                { text: 'Вернуться в тайный проход', nextScene: 'secret_passage' },
                { text: 'Положить монету на алтарь', nextScene: 'altar_activated', requires: 'Золотая монета', removeItem: 'Золотая монета', sfx: 'danger' }
            ]
        },
        'altar_activated': {
            text: 'Как только вы кладете монету на алтарь, комната начинает дрожать. Часть стены отодвигается, открывая проход. Внутри вы видите [сундук с сокровищами].',
            interactiveElements: [
                { text: 'сундук с сокровищами', action: 'pickup', gives: 'Древний артефакт' }
            ],
            choices: [
                { text: 'Вернуться в подземелье', nextScene: 'dungeon' },
                { text: 'Исследовать потайной проход', nextScene: 'hidden_passage' }
            ]
        },
        'hidden_passage': {
            text: 'Этот тайный проход ведет вверх, в неизвестную часть замка. После короткого подъема вы оказываетесь в маленькой комнате за троном в тронном зале.',
            choices: [
                { text: 'Войти в тронный зал', nextScene: 'throne_room_back' },
                { text: 'Вернуться к сундуку', nextScene: 'altar_activated' }
            ]
        },
        'throne_room': {
            text: 'Вы входите в величественный тронный зал. В центре стоит древний трон, украшенный драгоценными камнями. За троном вы замечаете [потайную дверь]. На троне лежит [королевская корона].',
            interactiveElements: [
                { text: 'потайную дверь', action: 'door', nextScene: 'hidden_passage' },
                { text: 'королевская корона', action: 'pickup', gives: 'Королевская корона' }
            ],
            choices: [
                { text: 'Сесть на трон', nextScene: 'sit_on_throne', requires: 'Защитный амулет' },
                { text: 'Вернуться в главный зал', nextScene: 'entrance_hall' }
            ]
        },
        'throne_room_back': {
            text: 'Вы выходите из-за трона и оказываетесь в тронном зале с другой стороны. Теперь вы видите трон спереди, во всем его величии.',
            choices: [
                { text: 'Сесть на трон', nextScene: 'sit_on_throne', requires: 'Защитный амулет' },
                { text: 'Вернуться через потайной проход', nextScene: 'hidden_passage' },
                { text: 'Уйти в главный зал', nextScene: 'entrance_hall' }
            ]
        },
        'sit_on_throne': {
            text: 'Как только вы садитесь на трон, амулет на вашей шее начинает светиться. Внезапно, из подлокотников трона выдвигаются маленькие иглы, но амулет защищает вас. Часть пола перед троном отодвигается, открывая лестницу вниз к [сокровищнице].',
            interactiveElements: [
                { text: 'сокровищнице', action: 'door', requires: 'Древний артефакт', nextScene: 'treasure_room' }
            ],
            choices: [
                { text: 'Встать с трона', nextScene: 'throne_room' }
            ]
        },
        'treasure_room': {
            text: 'Вы спускаетесь в сокровищницу замка. Горы золота, драгоценных камней и артефактов сверкают в свете вашего факела. В центре комнаты стоит [древний сундук]. Вы нашли главное сокровище замка!',
            interactiveElements: [
                { text: 'древний сундук', action: 'examine' }
            ],
            choices: [
                { text: 'Взять сокровища и покинуть замок', nextScene: 'ending' }
            ]
        },
        'ending': {
            text: 'С мешком драгоценностей вы покидаете древний замок. Теперь вы обладатель несметных богатств и секретных знаний, скрытых в этих стенах веками. Поздравляем, ваше приключение завершилось успехом!',
            choices: [
                { text: 'Начать заново', nextScene: 'start' }
            ]
        }
    };
}

// Запуск игры при загрузке документа
document.addEventListener('DOMContentLoaded', () => {
    const game = new TextGame();
    
    // Отключаем автовоспроизведение музыки до первого взаимодействия
    document.body.addEventListener('click', () => {
        if (game.musicEnabled) {
            game.bgMusic.play().catch(e => console.log('Не удалось воспроизвести музыку:', e));
        }
    }, { once: true });
});
