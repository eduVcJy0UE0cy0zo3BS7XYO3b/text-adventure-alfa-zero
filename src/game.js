/**
 * Модуль game.js - основной игровой движок
 */

class TextGame {
    constructor(scenes) {
        this.scenes = scenes;
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
    
    // Загрузка сцены с обработкой условных выборов
    loadScene(sceneId) {
	// Получаем базовую сцену
	const baseScene = this.scenes[sceneId];
	if (!baseScene) return;
	
	// Создаем рабочую копию сцены
	const scene = JSON.parse(JSON.stringify(baseScene));
	
	// Обрабатываем условные выборы, если они есть
	if (baseScene.conditionalChoices && baseScene.conditionalChoices.length > 0) {
            for (const conditional of baseScene.conditionalChoices) {
		if (conditional.condition(this)) {
                    // Если условие выполнено, применяем функцию thenFn к сцене
                    const additionalChoices = conditional.thenFn(scene).choices.slice(scene.choices.length);
                    // Добавляем новые выборы к существующим
                    scene.choices.push(...additionalChoices);
		}
            }
	}
	
	// Обработка динамического содержимого, если оно есть
	if (baseScene.dynamicContent && baseScene.dynamicContent.length > 0) {
            for (const dynamic of baseScene.dynamicContent) {
		if (dynamic.condition(this)) {
                    // Если условие выполнено, применяем функцию thenFn
                    const updatedScene = dynamic.thenFn(scene);
                    Object.assign(scene, updatedScene);
		} else if (dynamic.elseFn) {
                    // Иначе применяем elseFn, если она есть
                    const updatedScene = dynamic.elseFn(scene);
                    Object.assign(scene, updatedScene);
		}
            }
	}
	
	this.currentScene = sceneId;
	
	// Обработка текста сцены с интерактивными элементами
	let processedText = scene.text;
	if (scene.interactiveElements) {
            for (const element of scene.interactiveElements) {
		// Проверка на требуемый предмет (если есть)
		if (element.requires && !this.inventory.includes(element.requires)) {
                    continue; // Пропускаем элемент, если требуемый предмет отсутствует
		}
		
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
    
    // Далее идут остальные методы без изменений...
    // ...
    
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
                // Проверяем, требуется ли предмет для подбора
                if (requires && !this.inventory.includes(requires)) {
                    alert(`Для этого вам требуется ${requires}.`);
                    return;
                }
                
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
            // Проверка на требуемый предмет
            if (choice.requires && !this.inventory.includes(choice.requires)) {
                return; // Пропускаем выбор, если требуемый предмет отсутствует
            }
            
            // Проверка на пользовательское условие, если есть
            if (choice.condition && typeof choice.condition === 'function') {
                if (!choice.condition(this)) {
                    return; // Пропускаем выбор, если пользовательское условие не выполнено
                }
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
}

export default TextGame;
