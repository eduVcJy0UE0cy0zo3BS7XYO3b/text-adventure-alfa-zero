/**
 * Модуль index.js - точка входа в приложение
 */

import TextGame from './game.js';
import scenes from './scenes/gameScenes.js';

// Запуск игры при загрузке документа
document.addEventListener('DOMContentLoaded', () => {
    const game = new TextGame(scenes);
    
    // Отключаем автовоспроизведение музыки до первого взаимодействия
    document.body.addEventListener('click', () => {
        if (game.musicEnabled) {
            game.bgMusic.play().catch(e => console.log('Не удалось воспроизвести музыку:', e));
        }
    }, { once: true });
});
