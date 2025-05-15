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

        // Добавляем элемент для описания предметов
	this.itemDescriptionElement = document.createElement('div');
	this.itemDescriptionElement.id = 'item-description';
	this.itemDescriptionElement.className = 'item-description';
	document.getElementById('inventory').appendChild(this.itemDescriptionElement);
	
        // Аудио элементы
	this.initAudio();
	
        // Обработчики кнопок аудио
        document.getElementById('toggle-music').addEventListener('click', () => this.toggleMusic());
        document.getElementById('toggle-sfx').addEventListener('click', () => this.toggleSfx());

	// Обработчики кнопок сохранения/загрузки
	try {
            const saveGameBtn = document.getElementById('save-game');
            const loadGameBtn = document.getElementById('load-game');
            
            if (saveGameBtn && loadGameBtn) {
		saveGameBtn.addEventListener('click', () => {
                    if (typeof saveGame === 'function') {
			saveGame(this);
			alert('Игра сохранена!');
                    }
		});
		
		loadGameBtn.addEventListener('click', () => {
                    if (typeof loadGame === 'function') {
			const result = loadGame(this);
			if (result) {
                            alert('Игра загружена!');
			} else {
                            alert('Нет сохранений или произошла ошибка при загрузке.');
			}
                    }
		});
            }
	} catch (error) {
            console.error('Ошибка при инициализации кнопок сохранения/загрузки:', error);
	}
	
        // Инициализация игры
        this.initGame();
    }

    // Метод для инициализации звуков
    initAudio() {
	try {
            this.bgMusic = new Audio('/resources/Adventure.mp3');
            this.bgMusic.loop = true;
            this.bgMusic.volume = 0.5;
            
            this.sfx = {
		itemPickup: new Audio('/resources/item-pickup-v1.wav'),
		itemUse: new Audio('/resources/item-pickup-v1.wav'),
		doorOpen: new Audio('/resources/item-pickup-v1.wav'),
		danger: new Audio('/resources/item-pickup-v1.wav')
            };
	} catch (error) {
            console.error('Ошибка при загрузке аудио:', error);
            // Создаем пустые объекты вместо аудио
            this.sfx = {
		itemPickup: { play: () => {} },
		itemUse: { play: () => {} },
		doorOpen: { play: () => {} },
		danger: { play: () => {} }
            };
            this.bgMusic = { play: () => {}, pause: () => {} };
	}
    }
    // Новый метод для осмотра предмета
    examineItem(item) {
	// Словарь с описаниями предметов (можно вынести его в отдельный модуль или файл)
	const itemDescriptions = {
            'Факел': 'Старый потрёпанный факел. Ещё горит и даёт достаточно света для тёмных помещений.',
            'Старинный ключ': 'Массивный бронзовый ключ с витиеватым узором. Выглядит древним.',
            'Защитный амулет': 'Амулет с руническими символами. От него исходит слабое свечение.',
            'Старинный нож': 'Небольшой нож с изящной рукоятью. Лезвие всё ещё острое.',
            'Золотая монета': 'Блестящая золотая монета с изображением бывшего правителя замка.',
            'Ржавый меч': 'Старый меч, покрытый ржавчиной. Не подходит для боя, но может пригодиться.',
            'Древний артефакт': 'Странный артефакт неизвестного назначения. На нём высечены загадочные символы.',
            'Королевская корона': 'Великолепная корона, украшенная драгоценными камнями.',
            'Сундук с сокровищами': 'Тяжёлый сундук, заполненный разнообразными сокровищами.'
	};
	
	// Воспроизводим звук осмотра
	this.playSfx('itemUse');
	
	// Показываем описание
	const description = itemDescriptions[item] || 'Вы внимательно осматриваете предмет, но не можете понять его назначение';
	
	// Создаём модальное окно с описанием
	const modal = document.createElement('div');
	modal.className = 'item-modal';
	modal.innerHTML = `
        <div class="item-modal-content">
            <h3>Осмотр: ${item}</h3>
            <p>${description}</p>
            <button class="item-modal-close">Закрыть</button>
        </div>
    `;
	
	document.body.appendChild(modal);
	
	// Обработчик закрытия
	modal.querySelector('.item-modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
	});
	
	// Закрытие по клику вне модального окна
	modal.addEventListener('click', (e) => {
            if (e.target === modal) {
		document.body.removeChild(modal);
            }
	});
    }
    
    // Инициализация игры
    initGame() {
        this.bgMusic.play().catch(e => console.log('Автовоспроизведение заблокировано: нажмите на страницу'));

	// Добавляем обработчик клика для отмены выбора предмета
	document.addEventListener('click', (e) => {
            // Если клик не по предмету инвентаря и не по интерактивному элементу,
            // то снимаем выбор с активного предмета
            if (!e.target.closest('.inventory-item') && 
		!e.target.classList.contains('interactive') &&
		this.activeItem !== null) {
		this.activeItem = null;
		this.itemDescriptionElement.textContent = '';
		this.renderInventory();
            }
	});
	
        this.loadScene(this.currentScene);
    }
    
    // Улучшенная обработка интерактивных элементов
    handleInteraction(element) {
	const action = element.getAttribute('data-action');
	const requires = element.getAttribute('data-requires');
	const gives = element.getAttribute('data-gives');
	const nextScene = element.getAttribute('data-scene');
	
	if (action === 'examine') {
            this.playSfx('itemUse');
            // Улучшенное сообщение об осмотре
            const examineText = `Вы внимательно осматриваете ${element.textContent}. `;
            
            // Дополнительные описания в зависимости от объекта
            const examineDetails = {
		'старинный канделябр': 'Массивный канделябр из потемневшего серебра. Похоже, его давно не зажигали.',
		'старинная книга': 'Книга написана на древнем языке. Вы различаете упоминания о тайных комнатах замка и о сокровище.',
		'каменный алтарь': 'Алтарь украшен странными символами. В центре имеется круглое углубление, похожее на место для монеты.',
		'древний сундук': 'Сундук покрыт магическими печатями и кажется непроницаемым.'
            };
            
            // Получаем текст элемента и ищем его в словаре описаний
            const elementText = element.textContent.toLowerCase();
            let detailedDescription = '';
            
            for (const [key, value] of Object.entries(examineDetails)) {
		if (elementText.includes(key)) {
                    detailedDescription = value;
                    break;
		}
            }
            
            // Если не нашли детального описания
            if (!detailedDescription) {
		detailedDescription = 'Ничего особенного вы не замечаете.';
            }
            
            alert(examineText + detailedDescription);
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
                    // Сбрасываем активный предмет после использования
                    this.activeItem = null;
                    this.itemDescriptionElement.textContent = '';
                    this.renderInventory();
                    
                    if (nextScene) {
			this.loadScene(nextScene);
                    } else {
			// Если не указана новая сцена, просто показываем сообщение об использовании
			alert(`Вы успешно использовали ${requires} на ${element.textContent}.`);
                    }
		} else {
                    alert('Вам нужен правильный предмет для этого.');
		}
            }
	} else if (action === 'door') {
            if (requires && !this.inventory.includes(requires)) {
		this.playSfx('danger');
		alert(`Эта дверь заперта. Вам нужен ${requires}.`);
            } else if (requires && this.activeItem === requires) {
		// Если дверь требует ключ и он активен, открываем дверь
		this.playSfx('doorOpen');
		
		// Сбрасываем активный предмет после использования
		this.activeItem = null;
		this.itemDescriptionElement.textContent = '';
		this.renderInventory();
		
		if (nextScene) {
                    this.loadScene(nextScene);
		}
            } else if (requires && this.inventory.includes(requires) && this.activeItem !== requires) {
		// Если ключ есть в инвентаре, но не выбран
		alert(`Эта дверь заперта. Вам нужно выбрать ${requires} из инвентаря.`);
            } else if (nextScene) {
		this.playSfx('doorOpen');
		this.loadScene(nextScene);
            }
	}
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
    
    // Перепишем метод renderInventory для добавления осмотра предметов
    renderInventory() {
	this.inventoryElement.innerHTML = '';
	
	if (this.inventory.length === 0) {
            this.inventoryElement.textContent = 'Пусто';
            this.itemDescriptionElement.textContent = '';
            return;
	}
	
	// Словарь с описаниями предметов (можно вынести в отдельный файл)
	const itemDescriptions = {
            'Факел': 'Старый потрёпанный факел. Ещё горит и даёт достаточно света для тёмных помещений.',
            'Старинный ключ': 'Массивный бронзовый ключ с витиеватым узором. Выглядит древним.',
            'Защитный амулет': 'Амулет с руническими символами. От него исходит слабое свечение.',
            'Старинный нож': 'Небольшой нож с изящной рукоятью. Лезвие всё ещё острое.',
            'Золотая монета': 'Блестящая золотая монета с изображением бывшего правителя замка.',
            'Ржавый меч': 'Старый меч, покрытый ржавчиной. Не подходит для боя, но может пригодиться.',
            'Древний артефакт': 'Странный артефакт неизвестного назначения. На нём высечены загадочные символы.',
            'Королевская корона': 'Великолепная корона, украшенная драгоценными камнями.',
            'Сундук с сокровищами': 'Тяжёлый сундук, заполненный разнообразными сокровищами.'
	};
	
	// Словарь с комбинациями предметов (первый применяется ко второму)
	this.itemCombinations = {
            'Факел:Ржавый меч': {
		result: 'Вы нагрели ржавый меч на огне. Некоторая ржавчина отвалилась, но меч всё ещё выглядит не очень.',
		gives: null,
		removes: null
            },
            'Старинный нож:Старинный ключ': {
		result: 'Вы почистили ключ от грязи с помощью ножа. Теперь он блестит.',
		gives: null,
		removes: null
            },
            'Золотая монета:Защитный амулет': {
		result: 'Вы приложили монету к амулету, и оба предмета начали слабо светиться.',
		gives: 'Светящийся амулет',
		removes: ['Золотая монета', 'Защитный амулет']
            }
            // Можно добавить больше комбинаций
	};
	
	this.inventory.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            if (this.activeItem === item) {
		itemElement.classList.add('active');
            }
            itemElement.textContent = item;
            
            // Левый клик - выбор или применение предмета
            itemElement.addEventListener('click', (e) => {
		e.stopPropagation(); // Предотвращаем "всплытие" события
		
		// Если есть активный предмет и он не текущий - пробуем применить
		if (this.activeItem && this.activeItem !== item) {
                    this.combineItems(this.activeItem, item);
		} 
		// Иначе выбираем/отменяем выбор текущего предмета
		else {
                    if (this.activeItem === item) {
			this.activeItem = null;
			this.itemDescriptionElement.textContent = '';
                    } else {
			this.activeItem = item;
			this.playSfx('itemUse');
			
			// Показываем описание предмета
			const description = itemDescriptions[item] || 'Предмет неизвестного назначения';
			this.itemDescriptionElement.textContent = description;
                    }
                    this.renderInventory();
		}
            });
            
            // Правый клик - только осмотр предмета
            itemElement.addEventListener('contextmenu', (e) => {
		e.preventDefault(); // Отменяем стандартное контекстное меню
		e.stopPropagation();
		
		// Показываем описание предмета
		const description = itemDescriptions[item] || 'Предмет неизвестного назначения';
		this.itemDescriptionElement.textContent = description;
		this.playSfx('itemUse');
            });
            
            this.inventoryElement.appendChild(itemElement);
	});
	
	// Обновляем курсор при наличии активного предмета
	if (this.activeItem) {
            document.body.classList.add('item-active');
	} else {
            document.body.classList.remove('item-active');
	}
    }

    // Новый метод для комбинирования предметов
    combineItems(activeItem, targetItem) {
	// Формируем ключ для поиска в словаре комбинаций
	const combinationKey = `${activeItem}:${targetItem}`;
	
	// Проверяем, есть ли такая комбинация
	const combination = this.itemCombinations[combinationKey];
	
	if (combination) {
            this.playSfx('itemUse');
            alert(combination.result);
            
            // Если комбинация дает новый предмет
            if (combination.gives) {
		this.addToInventory(combination.gives);
            }
            
            // Если комбинация удаляет предметы
            if (combination.removes) {
		if (Array.isArray(combination.removes)) {
                    combination.removes.forEach(item => this.removeFromInventory(item));
		} else {
                    this.removeFromInventory(combination.removes);
		}
            }
            
            // Сбрасываем активный предмет
            this.activeItem = null;
            this.itemDescriptionElement.textContent = '';
            this.renderInventory();
	} else {
            // Если комбинация не найдена
            this.playSfx('danger');
            alert(`Вы не можете использовать ${activeItem} с ${targetItem}.`);
	}
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
