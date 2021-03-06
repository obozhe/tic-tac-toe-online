const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

const Room = require('./Room');

function randomInteger() {
  return Math.round(0 - 0.5 + Math.random() * (10000 - 0 + 1));
}

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

const sockets = new Map();

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
}

io.on('connection', socket => {
  const id = randomInteger().toString();
  sockets.set(id, socket);

  socket.on('ready', () => {
    socket.emit('id', id);
  });

  socket.on('connectTo', i => {
    if (sockets.has(i) && i !== id) {
      const socket1 = { id: i, socket: sockets.get(i) };
      const socket2 = { id, socket };
      let newRoomId = randomInteger();
      const room = new Room(newRoomId, socket1, socket2);
      room.initSockets();
    } else {
      socket.emit('wrongId', i);
    }
  });
});
