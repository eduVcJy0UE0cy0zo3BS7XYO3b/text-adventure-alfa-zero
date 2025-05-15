/**
 * Модуль elements.js - специализированные элементы DSL
 */

import { withInteractive, withChoice } from './core.js';

// Добавление предмета, который можно поднять
const withItem = (text, itemName) => 
      withInteractive(text, 'pickup', { gives: itemName });

// Добавление двери
const withDoor = (text, nextScene, keyRequired = null) => 
      withInteractive(text, 'door', { 
	  nextScene, 
	  requires: keyRequired 
      });

// Добавление осматриваемого объекта
const withExaminable = (text) => 
      withInteractive(text, 'examine');

// Добавление объекта, требующего использования предмета
const withUsable = (text, requiredItem, nextScene = null) => 
      withInteractive(text, 'use', { 
	  requires: requiredItem,
	  nextScene
      });

// Добавление выбора возврата в предыдущую локацию
const withReturn = (text, prevScene) => 
      withChoice(text, prevScene);

// Добавление выбора, требующего предмет
const withRequiredChoice = (text, nextScene, requiredItem) => 
      withChoice(text, nextScene, { requires: requiredItem });

// Добавление выбора, дающего предмет
const withRewardChoice = (text, nextScene, itemName) => 
      withChoice(text, nextScene, { gives: itemName });

// Добавление выбора, удаляющего предмет
const withConsumingChoice = (text, nextScene, itemName) => 
      withChoice(text, nextScene, { removeItem: itemName });

// Добавление выбора со звуковым эффектом
const withSoundChoice = (text, nextScene, soundEffect) => 
      withChoice(text, nextScene, { sfx: soundEffect });

export {
    withItem,
    withDoor,
    withExaminable,
    withUsable,
    withReturn,
    withRequiredChoice,
    withRewardChoice,
    withConsumingChoice,
    withSoundChoice
};
