import { h } from '../new-framework/index.js';
import { LivesStat } from './LivesStat.js';

export function GameScreen({ state }) {
  const myPlayer = state.players[state.myPlayerId];
  const playerArray = Object.values(state.players);

  return h('div', { class: 'game-container' }, [
    h('div', { class: 'game-header' }, [
      myPlayer ? h('div', { class: 'stats-bar' }, [
        h(LivesStat, {
           lives: myPlayer.lives,
           prevLives: myPlayer._prevLives,
           onAnimationEnd: () => { myPlayer._prevLives = myPlayer.lives; }
        }),
        h('div', {
          class: `stat stat-bombs ${myPlayer._prevBombs !== undefined && myPlayer._prevBombs !== myPlayer.bombs ? 'value-changed' : ''}`,
           onanimationend: () => { myPlayer._prevBombs = myPlayer.bombs; }
        }, [`💣 ${myPlayer.bombs ?? 1}`]),
        h('div', {
          class: `stat stat-flames ${myPlayer._prevFlames !== undefined && myPlayer._prevFlames !== myPlayer.flames ? 'value-changed' : ''}`,
           onanimationend: () => { myPlayer._prevFlames = myPlayer.flames; }
        }, [`🔥 ${myPlayer.flames ?? 1}`]),
        h('div', {
          class: `stat stat-speed ${myPlayer._prevSpeed !== undefined && myPlayer._prevSpeed !== myPlayer.speed ? 'value-changed' : ''}`,
           onanimationend: () => { myPlayer._prevSpeed = myPlayer.speed; }
        }, [`🚀 ${myPlayer.speed ? myPlayer.speed.toFixed(1) : 1}`])
      ]) : h('div', { class: 'stats-bar' }, ['Spectating...'])
    ]),

    h('div', { class: 'game-board', style: 'width: 480px; height: 416px;' }, [
      ...state.map.flatMap((row, y) =>
        row.map((cell, x) =>
          h('div', {
            key: `cell-${x}-${y}`,
            class: `game-cell ${cell}`,
            style: `left: ${x * 32}px; top: ${y * 32}px;`
          }, [])
        )
      ),

      ...Object.values(state.players)
        .map(player =>
          h('div', {
            key: player.id,
            class: `player player-${player.colorIndex}` + (player.alive ? '' : ' player-dead'),
            style: `left: ${player.x * 32}px; top: ${player.y * 32}px;`
          }, [])
        ),

      ...state.powerups.map((powerup, index) => {
        let icon = '';
        switch (powerup.type) {
          case 'bombs': icon = '💣'; break;
          case 'flames': icon = '🔥'; break;
          case 'speed': icon = '🚀'; break;
        }
        return h('div', { 
            key: `powerup-${index}`, 
            class: `powerup ${powerup.type}`, 
            style: `left: ${powerup.x * 32}px; top: ${powerup.y * 32}px;` 
        }, [icon]);
      }),

      ...state.bombs.map(bomb =>
        h('div', {
          key: `bomb-${bomb.id}`,
          class: 'bomb',
          style: `left: ${bomb.x * 32}px; top: ${bomb.y * 32}px;`
        }, [])
      ),

      ...state.explosions.map((explosion, index) =>
        h('div', {
          key: `explosion-${index}`,
          class: 'explosion',
          style: `left: ${explosion.x * 32}px; top: ${explosion.y * 32}px;`
        }, [])
      )
    ]),

    h('div', { class: 'game-footer' }, [
      h('div', { class: 'player-list-container' },
        playerArray
          .map((player) => {
            const isMe = player.id === state.myPlayerId;
            return h('div', {
              key: player.id,
              class: 'player-info player-stats' + (isMe ? ' is-me' : '') + (player.alive ? '' : ' dead'),
            }, [
              h('div', { class: 'player-header' }, [
                h('span', { class: `player-${player.colorIndex}` }, ['●']),
                ' ',
                player.nickname,
                isMe ? ' (You)' : ''
              ])
            ]);
          })
      ),
      h('div', { class: 'controls-footer' }, [
        h('span', {}, ['Arrow Keys: Move']),
        h('span', {}, ['Space: Bomb'])
      ])
    ])
  ]);
}
