const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const gameLogic = require('./game/logic');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const filePath = path.join(__dirname, '..', 'frontend', 'index.html'); 
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  }

  else if (req.url.startsWith('/js/') && req.url.endsWith('.js')) {
    const filePath = path.join(__dirname, '..', 'frontend', req.url); 
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('JavaScript File Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      }
    });
  }

  else if (req.url === '/styles.css') {
    const filePath = path.join(__dirname, '..', 'frontend', 'styles.css');
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('CSS File Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
      }
    });
  }

  else if (req.url.startsWith('/assets/') && (req.url.endsWith('.png') || req.url.endsWith('.jpg') || req.url.endsWith('.gif'))) {
    const filePath = path.join(__dirname, '..', 'frontend', req.url);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Image Not Found');
      } else {
        const ext = path.extname(req.url).toLowerCase();
        const contentType = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.gif': 'image/gif'
        }[ext];
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  }

  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});


const wss = new WebSocket.Server({ server });

function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

gameLogic.setBroadcast(broadcast);

wss.on('connection', (ws) => {
  const socketId = crypto.randomUUID();
  ws.id = socketId;

  ws.sendEvent = (type, payload) => {
      if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type, payload }));
      }
  };

  ws.on('message', (messageBuffer) => {
    const messageStr = messageBuffer.toString();
    let message;
    try {
        message = JSON.parse(messageStr);
    } catch (e) {
        console.error('Invalid JSON:', messageStr);
        return;
    }

    const { type, payload } = message;

    switch (type) {
        case 'joinGame':
            gameLogic.handleJoin(ws, payload);
            break;

        case 'playerMove':
            gameLogic.handleMove(ws, payload);
            break;

        case 'placeBomb':
            gameLogic.handlePlaceBomb(ws);
            break;

        case 'chatMessage':
            gameLogic.handleChat(ws, payload);
            break;
    }
  });

  ws.on('close', () => {
    gameLogic.handleDisconnect(ws);
  });
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});