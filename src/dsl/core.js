/**
 * Модуль core.js - ядро DSL с базовыми функциями
 */

// Функция thread - основной threading макрос
const thread = (initialValue, ...fns) => 
      fns.reduce((value, fn) => fn(value), initialValue);

// Создание пустой сцены
const scene = (id) => ({
    id,
    text: '',
    interactiveElements: [],
    choices: []
});

// Обогащение сцены текстом
const withText = (text) => (scene) => ({
    ...scene,
    text
});

// Добавление интерактивного элемента
const withInteractive = (text, action, options = {}) => (scene) => ({
    ...scene,
    interactiveElements: [
	...scene.interactiveElements,
	{ text, action, ...options }
    ]
});

// Добавление выбора
const withChoice = (text, nextScene, options = {}) => (scene) => ({
    ...scene,
    choices: [
	...scene.choices,
	{ text, nextScene, ...options }
    ]
});

// Условный оператор, который сохраняет условие для выполнения при загрузке сцены
const when = (condition, thenFn) => (scene) => {
    // Создаем условную оболочку для функции thenFn
    return {
	...scene,
	conditionalChoices: [...(scene.conditionalChoices || []), { condition, thenFn }]
    };
};

// Комбинирование сцен
const combineScenes = (sceneA, sceneB) => ({
    ...sceneA,
    text: `${sceneA.text}\n\n${sceneB.text}`,
    interactiveElements: [...sceneA.interactiveElements, ...sceneB.interactiveElements],
    choices: [...sceneA.choices, ...sceneB.choices],
    dynamicContent: [...(sceneA.dynamicContent || []), ...(sceneB.dynamicContent || [])]
});

// Экспортируем все функции
export {
    thread,
    scene,
    withText,
    withInteractive,
    withChoice,
    when,
    combineScenes
};
