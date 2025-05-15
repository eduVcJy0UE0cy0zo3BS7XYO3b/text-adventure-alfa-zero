/**
 * Модуль operators.js - дополнительные операторы для DSL
 */

// Применение функций в зависимости от состояния игры
const withGameState = (stateFn, applyFn) => scene => {
    // Возвращает функцию, которая будет вызвана с объектом игры
    return game => {
	if (stateFn(game)) {
	    return applyFn(scene);
	}
	return scene;
    };
};

// Функция для создания цепочки условий
const branch = (conditions) => scene => {
    // Возвращает функцию, которая будет вызвана с объектом игры
    return game => {
	for (const condition of conditions) {
	    if (condition.test(game)) {
		return condition.then(scene);
	    }
	}
	return scene;
    };
};

// Композиция нескольких функций
const compose = (...fns) => scene => {
    return fns.reduceRight((acc, fn) => fn(acc), scene);
};

// Применение функции только если выполнено условие
const ifThen = (condition, thenFn) => scene => {
    return condition ? thenFn(scene) : scene;
};

// Добавление произвольных данных к сцене
const withData = (key, value) => scene => ({
    ...scene,
    [key]: value
});

export {
    withGameState,
    branch,
    compose,
    ifThen,
    withData
};
