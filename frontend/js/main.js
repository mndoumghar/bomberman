import { render, h, useState, useEffect } from './new-framework/index.js';
import { getStoreState, subscribe } from './store/store.js';
import { initSocket } from './services/socket.js';
import { initInput, cleanupInput } from './services/input.js';

import { NicknameScreen } from './components/NicknameScreen.js';
import { WaitingScreen } from './components/WaitingScreen.js';
import { GameScreen } from './components/GameScreen.js';
import { GameOverScreen } from './components/GameOverScreen.js';

function App() {
  const [state, setState] = useState(getStoreState());

  useEffect(() => {
    initSocket();
    initInput();
    const unsubscribe = subscribe((newState) => {
        setState({ ...newState });
    });
    
    return () => {
        unsubscribe();
        cleanupInput();
    };
  }, []);

  let content;
  switch (state.screen) {
    case 'nickname':
      content = h(NicknameScreen, { state });
      break;
    case 'waiting':
      content = h(WaitingScreen, { state });
      break;
    case 'game':
      content = h(GameScreen, { state });
      break;
    case 'gameover':
      content = h(GameOverScreen, { state });
      break;
    default:
      content = h('div', {}, ['Loading...']);
  }

  return h('div', { 
      id: 'app-container',
      tabindex: '0', 
      style: 'outline: none;' 
  }, [content]);
}

render(App, document.getElementById('app'));
