import { h } from '../new-framework/index.js';

export function GameOverScreen({ state }) {
  return h('div', { class: 'screen' }, [
    h('h1', {}, ['Game Over!']),
    state.winner ?
      h('h2', {}, [`🎉 ${state.winner.nickname} Wins! 🎉`]) :
      h('h2', {}, ['No Winner']),
    h('p', {}, ['🏆 Go back to lobby champion! 🏆']),
    h('button', {
      class: 'btn',
      onclick: () => window.location.reload()
    }, ['Play Again'])
  ]);
}
