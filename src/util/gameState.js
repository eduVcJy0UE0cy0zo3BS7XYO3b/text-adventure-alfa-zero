/**
 * Модуль gameState.js - управление состоянием игры (сохранение/загрузка)
 */

// Сохранение состояния игры
const saveGame = (game) => {
  const saveData = {
    inventory: game.inventory,
    currentScene: game.currentScene,
    activeItem: game.activeItem,
    musicEnabled: game.musicEnabled,
    sfxEnabled: game.sfxEnabled,
    achievements: game.achievements || {},
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem('textAdventureSave', JSON.stringify(saveData));
  return saveData;
};

// Загрузка состояния игры
const loadGame = (game) => {
  const saveData = localStorage.getItem('textAdventureSave');
  if (!saveData) return null;
  
  try {
    const parsedData = JSON.parse(saveData);
    
    // Восстановление состояния
    game.inventory = parsedData.inventory || [];
    game.currentScene = parsedData.currentScene || 'start';
    game.activeItem = parsedData.activeItem || null;
    game.musicEnabled = parsedData.musicEnabled !== undefined ? parsedData.musicEnabled : true;
    game.sfxEnabled = parsedData.sfxEnabled !== undefined ? parsedData.sfxEnabled : true;
    game.achievements = parsedData.achievements || {};
    
    // Перезагрузка текущей сцены
    game.loadScene(game.currentScene);
    
    return parsedData;
  } catch (e) {
    console.error('Ошибка при загрузке сохранения:', e);
    return null;
  }
};

// Проверка наличия сохранения
const hasSavedGame = () => {
  return localStorage.getItem('textAdventureSave') !== null;
};

// Удаление сохранения
const deleteSavedGame = () => {
  localStorage.removeItem('textAdventureSave');
};

export {
  saveGame,
  loadGame,
  hasSavedGame,
  deleteSavedGame
};
