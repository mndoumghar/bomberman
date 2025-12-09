import { h } from '../new-framework/index.js';
import { sendChatMessage } from '../services/socket.js';

export function WaitingScreen({ state }) {
  function handleChatSubmit(e) {
    e.preventDefault();
    const message = e.target.message.value.trim();
    if (message) {
      sendChatMessage(message);
      e.target.message.value = '';
    }
  }

  return h('div', { class: 'screen waiting-screen' }, [
    h('div', { class: 'waiting-info' }, [
      h('h1', {}, ['Waiting for Players']),
      h('p', {}, [`Players: ${state.playerCount}/4`]),
      ...(state.waitingTime > 0 && state.playerCount >= 2 ? [
        h('div', { class: 'waiting-time' }, [`Waiting time: ${state.waitingTime}s`])
      ] : []),
      ...(state.countdown > 0 ? [
        h('div', { class: 'countdown' }, [`Game starts in: ${state.countdown}s`])
      ] : []),
      ...(state.playerCount < 2 ? [
        h('p', {}, ['Waiting for more players...'])
      ] : []),
      h('div', { class: 'player-list' },
        Object.values(state.players).map((player, index) =>
          h('div', { key: player.id, class: 'player-info' }, [
            h('span', { class: `player-${index}` }, ['●']), ' ', player.nickname
          ])
        )
      )
    ]),
    h('div', { class: 'chat-container' }, [
      h('div', { class: 'chat' }, [
        h('h4', {}, ['Chat']),
        h('div', { class: 'chat-messages' },
          state.chatMessages.slice(-20).map((msg, index) =>
            h('div', { key: index, class: 'message' }, [
              h('strong', {}, [msg.nickname + ': ']),
              msg.message
            ])
          )
        ),
        h('form', { class: 'chat-input', onsubmit: handleChatSubmit }, [
          h('input', {
            type: 'text',
            name: 'message',
            placeholder: 'Type message...',
            maxlength: '100'
          }, [])
        ])
      ])
    ])
  ]);
}
