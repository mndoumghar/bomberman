const { state, CONSTANTS, resetGame } = require('./state');
const { initializeMap, getStartingPosition } = require('./map');

let broadcast;

function setBroadcast(fn) {
    broadcast = fn;
}

function broadcastPlayersUpdate() {
    if (broadcast) {
        broadcast('playersUpdate', { players: state.players });
    }
}

function startGame() {
    const playerIds = Object.keys(state.players);
    if (playerIds.length === 1) {
        const winner = state.players[playerIds[0]];
        broadcast('gameStart', state);
        broadcast('gameOver', { winner });
        setTimeout(resetGame, 5000);
        return;
    }

    state.gameStarted = true;
    state.map = initializeMap();

    let playerIndex = 0;
    Object.keys(state.players).forEach(id => {
        const pos = getStartingPosition(playerIndex);
        state.players[id].x = pos.x;
        state.players[id].y = pos.y;
        state.players[id].spawnIndex = playerIndex;
        state.players[id].lives = 3;
        state.players[id].alive = true;
        playerIndex++;
    });

    broadcast('gameStart', state);
}

function handleJoin(ws, nickname) {
    if (state.playerCount >= CONSTANTS.MAX_PLAYERS) {
        ws.sendEvent('joinError', 'Game is full');
        return;
    }
    if (state.gameStarted || state.gameTimer) {
        ws.sendEvent('joinError', 'Game already started');
        return;
    }
    if (state.activeNicknames.has(nickname)) {
        ws.sendEvent('joinError', 'Nickname is already taken');
        ws.close();
        return;
    }

    state.playerCount++;
    state.players[ws.id] = {
        id: ws.id,
        nickname: nickname,
        x: 0,
        y: 0,
        lives: 3,
        bombs: 1,
        flames: 1,
        speed: 1,
        alive: true,
        colorIndex: state.nextColorIndex
    };

    state.nextColorIndex = (state.nextColorIndex + 1) % CONSTANTS.MAX_PLAYERS;

    state.activeNicknames.add(nickname);

    ws.sendEvent('joined', { playerId: ws.id, playerCount: state.playerCount });
    broadcast('playerJoined', { playerCount: state.playerCount, players: state.players, waitingTime: state.waitingTime });

    if (state.playerCount >= CONSTANTS.MIN_PLAYERS && !state.waitingTimeCounter && !state.gameStarted && !state.gameTimer) {
        state.waitingTime = CONSTANTS.WAITING_TIME;
        broadcast('updateWaitingTime', { waitingTime: state.waitingTime });

        state.waitingTimeCounter = setInterval(() => {
            state.waitingTime--;
            broadcast('updateWaitingTime', { waitingTime: state.waitingTime });

            if (state.waitingTime <= 0) {
                clearInterval(state.waitingTimeCounter);
                state.waitingTimeCounter = null;
                broadcast('countdown', { time: 10 });
                state.gameTimer = setTimeout(() => {
                    startGame();
                    state.gameTimer = null;
                }, CONSTANTS.COUNTDOWN_TIME);
            }
        }, 1000);
    }

    if (state.playerCount === CONSTANTS.MAX_PLAYERS && !state.gameStarted) {
        if (state.waitingTimeCounter) {
            clearInterval(state.waitingTimeCounter);
            state.waitingTimeCounter = null;
        }
        broadcast('countdown', { time: 10 });
        state.gameTimer = setTimeout(() => {
            startGame();
            state.gameTimer = null;
        }, CONSTANTS.COUNTDOWN_TIME);
    }
}

function handleMove(ws, payload) {
    const data = payload;
    if (!state.gameStarted || !state.players[ws.id]) return;

    const player = state.players[ws.id];
    const { direction } = data;
    let { x, y } = player;

    switch (direction) {
        case 'up': y -= 1; break;
        case 'down': y += 1; break;
        case 'left': x -= 1; break;
        case 'right': x += 1; break;
    }

    if (x >= 0 && x < 15 && y >= 0 && y < 13 &&
        (state.map[y][x] === 'empty' || state.map[y][x] === 'powerup')) {

        if (state.map[y][x] === 'powerup') {
            const powerup = state.powerups.find(p => p.x === x && p.y === y);
            if (powerup) {
                applyPowerup(player, powerup.type);
                state.powerups = state.powerups.filter(p => !(p.x === x && p.y === y));
                state.map[y][x] = 'empty';

                broadcast('powerupCollected', {
                    playerId: ws.id,
                    powerupType: powerup.type,
                    x: x,
                    y: y
                });

                broadcast('playerStatsUpdate', {
                    playerId: ws.id,
                    stats: {
                        bombs: player.bombs,
                        flames: player.flames,
                        speed: player.speed,
                        lives: player.lives
                    }
                });

                broadcast('gameStateUpdate', {
                    players: state.players,
                    powerups: state.powerups,
                    map: state.map
                });
            }
        }

        player.x = x;
        player.y = y;
        broadcast('playerMoved', { playerId: ws.id, x, y });
    }
}

function handlePlaceBomb(ws) {
    if (!state.gameStarted || !state.players[ws.id] || !state.players[ws.id].alive) return;

    const player = state.players[ws.id];
    const existingBomb = state.bombs.find(b => b.x === player.x && b.y === player.y);

    if (!existingBomb && player.bombs > 0) {
        const bomb = {
            id: Date.now(),
            x: player.x,
            y: player.y,
            playerId: ws.id,
            timer: 3000 
        };

        state.bombs.push(bomb);
        player.bombs--;

        broadcast('bombPlaced', bomb);

        broadcast('playerStatsUpdate', {
            playerId: ws.id,
            stats: {
                bombs: player.bombs,
                flames: player.flames,
                speed: player.speed,
                lives: player.lives
            }
        });

        setTimeout(() => {
            explodeBomb(bomb);
        }, bomb.timer);
    }
}

function handleChat(ws, messageContent) {
    if (state.players[ws.id]) {
        broadcast('chatMessage', {
            nickname: state.players[ws.id].nickname,
            message: messageContent,
            timestamp: Date.now()
        });
    }
}

function handleDisconnect(ws) {
    if (state.players[ws.id]) {
        state.activeNicknames.delete(state.players[ws.id].nickname);

        if (state.gameStarted) {
            state.players[ws.id].alive = false;
            broadcastPlayersUpdate();
        } else {
            delete state.players[ws.id];
            state.playerCount--;
        }

        if (state.gameStarted) {
            const alivePlayers = Object.values(state.players).filter(p => p.alive);
            if (alivePlayers.length === 1) {
                broadcast('gameOver', { winner: alivePlayers[0] });
                setTimeout(resetGame, 5000);
                return;
            }
            if (alivePlayers.length === 0) {
                broadcast('gameOver', { winner: null });
                setTimeout(resetGame, 5000);
                return;
            }
        }

        if (!state.gameStarted) {
            state.playerCount = Object.values(state.players).length;
            if (state.playerCount < CONSTANTS.MIN_PLAYERS && state.waitingTimeCounter) {
                clearInterval(state.waitingTimeCounter);
                state.waitingTimeCounter = null;
                state.waitingTime = CONSTANTS.WAITING_TIME;
                broadcast('updateWaitingTime', { waitingTime: state.waitingTime });
            }
            if (state.playerCount === 0) {
                resetGame();
            } else {
                broadcast('playerLeft', {
                    playerCount: state.playerCount,
                    players: state.players,
                    waitingTime: state.waitingTime
                });
            }
        }
    }
}

function applyPowerup(player, type) {
    switch (type) {
        case 'bombs':
            player.bombs++;
            break;
        case 'flames':
            player.flames++;
            break;
        case 'speed':
            player.speed = Math.min(player.speed + 0.5, 3);
            break;
    }
}

function explodeBomb(bomb) {
    state.bombs = state.bombs.filter(b => b.id !== bomb.id);

    const player = state.players[bomb.playerId];
    if (player) {
        player.bombs++;

        broadcast('playerStatsUpdate', {
            playerId: bomb.playerId,
            stats: {
                bombs: player.bombs,
                flames: player.flames,
                speed: player.speed,
                lives: player.lives
            }
        });
    }

    const explosions = [];
    const directions = [
        [0, 0],
        [0, -1], [0, 1],
        [-1, 0], [1, 0]
    ];

    directions.forEach(([dx, dy]) => {
        for (let i = 0; i <= (player ? player.flames : 1); i++) {
            const x = bomb.x + dx * i;
            const y = bomb.y + dy * i;

            if (x < 0 || x >= 15 || y < 0 || y >= 13) break;
            if (state.map[y][x] === 'wall') break;

            explosions.push({ x, y });

            if (state.map[y][x] === 'block') {
                state.map[y][x] = 'empty';
                if (Math.random() < 0.3) {
                    const powerupTypes = ['bombs', 'flames', 'speed'];
                    const powerup = {
                        x, y,
                        type: powerupTypes[Math.floor(Math.random() * powerupTypes.length)]
                    };
                    state.powerups.push(powerup);
                    state.map[y][x] = 'powerup';
                }
                break;
            }
        }
    });

    const damagedPlayers = [];
    Object.keys(state.players).forEach(playerId => {
        const p = state.players[playerId];
        if (p.alive && explosions.some(exp => exp.x === p.x && exp.y === p.y)) {
            p.lives--;
            damagedPlayers.push({
                playerId,
                lives: p.lives,
                alive: p.lives > 0
            });

            if (p.lives <= 0) {
                p.alive = false;
                broadcast('playerDied', { playerId });
                broadcastPlayersUpdate();
            } else {
                const spawnPos = getStartingPosition(p.spawnIndex);
                p.x = spawnPos.x;
                p.y = spawnPos.y;
                broadcast('playerMoved', { playerId, x: p.x, y: p.y });
            }

            broadcast('playerStatsUpdate', {
                playerId,
                stats: {
                    bombs: p.bombs,
                    flames: p.flames,
                    speed: p.speed,
                    lives: p.lives
                }
            });
        }
    });

    broadcast('bombExploded', {
        bombId: bomb.id,
        explosions,
        damagedPlayers
    });

    broadcast('mapUpdate', { map: state.map });

    broadcast('gameStateUpdate', {
        players: state.players,
        powerups: state.powerups,
        map: state.map
    });

    const alivePlayers = Object.values(state.players).filter(p => p.alive);
    if (alivePlayers.length <= 1) {
        broadcast('gameOver', { winner: alivePlayers[0] || null });
        setTimeout(resetGame, 5000);
    }
}

module.exports = {
    setBroadcast,
    handleJoin,
    handleMove,
    handlePlaceBomb,
    handleChat,
    handleDisconnect
};