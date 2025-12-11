import { movePlayer, placeBomb } from './socket.js';
import { getStoreState, subscribe } from '../store/store.js';

let pressedKeys = {};
let lastMoveTime = 0;
let baseMoveThrottle = 150;
let moveThrottle = baseMoveThrottle;
let moveInterval = null;
let lastSpeed = 0;

subscribe((state) => {
    if (!state.myPlayerId || !state.players[state.myPlayerId]) return;
    
    const myPlayer = state.players[state.myPlayerId];
    if (myPlayer.speed !== lastSpeed) {
        if (myPlayer.speed > lastSpeed) {
             const speedDiff = myPlayer.speed - 1; 
             moveThrottle = Math.max(25, baseMoveThrottle - (speedDiff * 25));
        }
        lastSpeed = myPlayer.speed;
        
        if (moveInterval) {
            const dirKey = Object.keys(pressedKeys).find(k => pressedKeys[k] && ['arrowup','arrowdown','arrowleft','arrowright'].includes(k));
            if (dirKey) {
                stopMoving();
                startMoving(dirKey.replace('arrow', '').toLowerCase());
            }
        }
    }
});

function startMoving(direction) {
  if (moveInterval) return;
  
  movePlayer(direction);
  lastMoveTime = performance.now();
  
  moveInterval = setInterval(() => {
    const currentTime = performance.now();
    if (currentTime - lastMoveTime >= moveThrottle) {
      movePlayer(direction);
      lastMoveTime = currentTime;
    }
  }, 20); 
}

function stopMoving() {
  if (moveInterval) {
    clearInterval(moveInterval);
    moveInterval = null;
  }
}

export function handleKeyDown(e) {
  if (!e || !e.key) return;
  
  const key = e.key.toLowerCase();
  if (pressedKeys[key]) return;
  
  pressedKeys[key] = true;
  
  const state = getStoreState();
  if (state.screen !== 'game' || !state.gameStarted) return;
  
  switch (key) {
    case 'arrowup':
    case 'arrowdown':
    case 'arrowleft':
    case 'arrowright':
      e.preventDefault();
      startMoving(key.replace('arrow', '').toLowerCase());
      break;
    case ' ':
      e.preventDefault();
      placeBomb();
      break;
  }
}

export function handleKeyUp(e) {
  if (!e || !e.key) return;
  
  const key = e.key.toLowerCase();
  pressedKeys[key] = false;
  
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    stopMoving();
  }
}

export function initInput() {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
}

export function cleanupInput() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
}
