import { updateStore, getStoreState } from '../store/store.js';

let socket = null;

export function initSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  socket = new WebSocket(`${protocol}//${host}`);

  socket.onopen = () => {
    console.log('Connected to WebSocket server');
  };

  socket.onmessage = (event) => {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch (e) {
      console.error('Invalid JSON received', event.data);
      return;
    }

    const { type, payload } = message;

    switch (type) {
      case 'joined':
        updateStore({
          ...getStoreState(),
          screen: 'waiting',
          myPlayerId: payload.playerId,
          playerCount: payload.playerCount
        });
        break;

      case 'playerJoined':
        updateStore({
          ...getStoreState(),
          playerCount: payload.playerCount,
          players: payload.players,
          waitingTime: payload.waitingTime
        });
        break;

      case 'updateWaitingTime':
        updateStore({
          ...getStoreState(),
          waitingTime: payload.waitingTime
        });
        break;

      case 'playerLeft':
        updateStore({
          ...getStoreState(),
          playerCount: payload.playerCount,
          players: payload.players
        });
        break;

      case 'countdown':
        updateStore({
          ...getStoreState(),
          countdown: payload.time
        });

        let timeLeft = payload.time;
        const countdownTimer = setInterval(() => {
          timeLeft--;
          updateStore({
            ...getStoreState(),
            countdown: timeLeft
          });

          if (timeLeft <= 0) {
            clearInterval(countdownTimer);
          }
        }, 1000);
        break;

      case 'gameStart':
        updateStore({
          ...getStoreState(),
          screen: 'game',
          gameStarted: true,
          players: payload.players,
          map: payload.map,
          bombs: payload.bombs || [],
          powerups: payload.powerups || [],
          countdown: 0
        });
        break;

      case 'playerMoved':
        {
          const currentState = getStoreState();
          const currentPlayers = { ...currentState.players };
          if (currentPlayers[payload.playerId]) {
            currentPlayers[payload.playerId] = {
              ...currentPlayers[payload.playerId],
              x: payload.x,
              y: payload.y
            };
            updateStore({
              ...currentState,
              players: currentPlayers
            });
          }
        }
        break;

      case 'bombPlaced': {
        const state = getStoreState();
        updateStore({
          ...state,
          bombs: [...state.bombs, payload]
        });
        break;
      }

      case 'mapUpdate':
        updateStore({
          ...getStoreState(),
          map: payload.map
        });
        break;

      case 'playersUpdate':
        updateStore({
          ...getStoreState(),
          players: { ...payload.players }
        });
        break;

      case 'playerStatsUpdate': {
        const state = getStoreState();
        if (state.players[payload.playerId]) {
          const players = { ...state.players };
          players[payload.playerId] = {
            ...players[payload.playerId],
            bombs: payload.stats.bombs,
            flames: payload.stats.flames,
            speed: payload.stats.speed,
            lives: payload.stats.lives
          };
          updateStore({
            ...state,
            players
          });
        }
        break;
      }

      case 'powerupCollected': {
        const state = getStoreState();
        updateStore({
          ...state,
          powerups: state.powerups.filter(p => !(p.x === payload.x && p.y === payload.y))
        });
        break;
      }

      case 'gameStateUpdate':
        updateStore({
          ...getStoreState(),
          players: payload.players,
          powerups: payload.powerups,
          map: payload.map
        });
        break;

      case 'bombExploded': {
        const state = getStoreState();
        let newBombs = state.bombs.filter(b => b.id !== payload.bombId);
        let newPlayers = { ...state.players };

        if (payload.damagedPlayers) {
          payload.damagedPlayers.forEach(damaged => {
            if (newPlayers[damaged.playerId]) {
              newPlayers[damaged.playerId] = {
                ...newPlayers[damaged.playerId],
                lives: damaged.lives,
                alive: damaged.alive
              };
            }
          });
        }

        updateStore({
          ...state,
          bombs: newBombs,
          players: newPlayers,
          explosions: payload.explosions
        });

        setTimeout(() => {
          updateStore({
            ...getStoreState(),
            explosions: []
          });
        }, 300);
        break;
      }

      case 'playerDied': {
        const state = getStoreState();
        if (state.players[payload.playerId]) {
          const players = { ...state.players };
          players[payload.playerId] = {
            ...players[payload.playerId],
            alive: false
          };
          updateStore({
            ...state,
            players
          });
        }
        break;
      }

      case 'gameOver':
        updateStore({
          ...getStoreState(),
          screen: 'gameover',
          winner: payload.winner
        });
        break;

      case 'chatMessage': {
        const state = getStoreState();
        let messages = [...state.chatMessages, payload];
        if (messages.length > 50) {
          messages = messages.slice(-50);
        }
        updateStore({
          ...state,
          chatMessages: messages
        });
        break;
      }
      
      case 'joinError':
        alert(payload);
        break;
    }
  };
}

function emit(type, payload) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, payload }));
  } else {
    console.error('Socket not connected. ReadyState:', socket ? socket.readyState : 'null');
  }
}

export function joinGame(nickname) {
  emit('joinGame', nickname);
}

export function movePlayer(direction) {
  emit('playerMove', { direction });
}

export function placeBomb() {
  emit('placeBomb');
}

export function sendChatMessage(message) {
  emit('chatMessage', message);
}
