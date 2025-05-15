/**
 * Модуль templates.js - шаблоны сцен высшего порядка
 */

import { thread, scene, withText } from './core.js';
import { withItem, withDoor, withReturn } from './elements.js';

// Создание типовой сцены с предметом и дверью
const createItemAndDoorRoom = (id, description, itemText, itemName, doorText, doorDest) => 
      thread(
	  scene(id),
	  withText(description),
	  withItem(itemText, itemName),
	  withDoor(doorText, doorDest)
      );

// Создание сцены сокровищницы с предметом и возвратом
const createTreasureRoom = (id, description, treasureText, treasureName, returnText, returnDest) => 
      thread(
	  scene(id),
	  withText(description),
	  withItem(treasureText, treasureName),
	  withReturn(returnText, returnDest)
      );

// Создание сцены с запертой дверью
const createLockedDoorRoom = (id, description, doorText, keyName, doorDest, returnText, returnDest) => 
      thread(
	  scene(id),
	  withText(description),
	  withDoor(doorText, doorDest, keyName),
	  withReturn(returnText, returnDest)
      );

// Создание сцены с развилкой (несколько выходов)
const createJunctionRoom = (id, description, exits) => {
    // Создаем базовую сцену с текстом
    const baseScene = thread(
	scene(id),
	withText(description)
    );
    
    // Добавляем все выходы
    return exits.reduce((sceneAcc, exit) => {
	return thread(
	    sceneAcc,
	    withDoor(exit.text, exit.destination, exit.requires || null)
	);
    }, baseScene);
};

export {
    createItemAndDoorRoom,
    createTreasureRoom,
    createLockedDoorRoom,
    createJunctionRoom
};
