
let store = {
  screen: 'nickname',
  players: {},
  myPlayerId: null,
  playerCount: 0,
  map: [],
  bombs: [],
  powerups: [],
  explosions: [],
  gameStarted: false,
  waitingTime: 0,
  countdown: 0,
  chatMessages: [],
  winner: null
};

let subscribers = new Set();

export function updateStore(newState) {
  store = newState;
  subscribers.forEach(callback => callback(store));
}

export function getStoreState() {
  return store;
}

export function subscribe(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}
