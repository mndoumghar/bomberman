const WAITING_TIME = 20;

const state = {
    players: {},
    gameStarted: false,
    waitingTimer: null,
    gameTimer: null,
    waitingTimeCounter: null,
    waitingTime: WAITING_TIME,
    map: [],
    bombs: [],
    powerups: [],
    activeNicknames: new Set(),
    playerCount: 0,
    nextColorIndex: 0
};

const CONSTANTS = {
    WAITING_TIME,
    COUNTDOWN_TIME: 10000,
    MAX_PLAYERS: 4,
    MIN_PLAYERS: 2
};

function resetGame() {
    state.players = {};
    state.gameStarted = false;
    state.waitingTimer = null;
    state.gameTimer = null;
    state.map = [];
    state.bombs = [];
    state.powerups = [];
    state.activeNicknames.clear();
    state.playerCount = 0;
    state.nextColorIndex = 0;
    state.waitingTime = WAITING_TIME;
    
    if (state.waitingTimeCounter) {
        clearInterval(state.waitingTimeCounter);
        state.waitingTimeCounter = null;
    }
}

module.exports = {
    state,
    CONSTANTS,
    resetGame
};