import { h } from '../new-framework/index.js';
import { joinGame } from '../services/socket.js';

export function NicknameScreen({ state }) {
  function handleSubmit(e) {
    e.preventDefault();
    const nickname = e.target.nickname.value.trim();
    if (nickname.length > 0 && nickname.length <= 20) {
      joinGame(nickname);
    }
  }

  return h('div', { class: 'screen' }, [
    h('h1', {}, ['Bomberman DOM']),
    h('p', {}, ['Enter your nickname to join the battle!']),
    state.error ? h('p', { style: 'color: #ff4444;' }, [state.error]) : '',
    h('form', { onsubmit: handleSubmit }, [
      h('input', {
        type: 'text',
        name: 'nickname',
        placeholder: 'Enter nickname...',
        maxlength: '20',
        required: true
      }, []),
      h('br', {}, []),
      h('button', { type: 'submit', class: 'btn' }, ['Join Game'])
    ])
  ]);
}
