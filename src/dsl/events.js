/**
 * Модуль events.js - система событий для DSL
 */

// Добавление обработчика события к сцене
const withEvent = (eventType, handler) => scene => ({
    ...scene,
    events: {
	...(scene.events || {}),
	[eventType]: [...(scene.events?.[eventType] || []), handler]
    }
});

// Создание обработчиков типовых событий
const onEnter = (handler) => withEvent('enter', handler);
const onExit = (handler) => withEvent('exit', handler);
const onItemPickup = (handler) => withEvent('itemPickup', handler);
const onItemUse = (handler) => withEvent('itemUse', handler);

// Триггер события
const triggerEvent = (game, scene, eventType, ...args) => {
    if (scene.events && scene.events[eventType]) {
	for (const handler of scene.events[eventType]) {
	    handler(game, ...args);
	}
    }
};

// Добавление достижения при входе в сцену
const withAchievement = (achievementId, title, description) => 
      onEnter((game) => {
	  if (!game.achievements) {
	      game.achievements = {};
	  }
	  game.achievements[achievementId] = {
	      title,
	      description,
	      unlocked: true,
	      timestamp: new Date().toISOString()
	  };
	  // Опционально: показать уведомление о получении достижения
	  alert(`Достижение разблокировано: ${title}`);
      });

export {
    withEvent,
    onEnter,
    onExit,
    onItemPickup,
    onItemUse,
    triggerEvent,
    withAchievement
};
