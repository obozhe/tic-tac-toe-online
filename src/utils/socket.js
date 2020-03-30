const io = require('socket.io-client');

export default function() {
  const port = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : '';
  const socket = io.connect(port);

  function registerHandlers(
    setId,
    setRoomId,
    setTeam,
    updateCurrentTurn,
    updateBoard,
    endGame,
    restart,
    handleWrongId
  ) {
    socket.emit('ready');
    socket.on('id', setId);
    socket.on('roomID', setRoomId);
    socket.on('team', setTeam);
    socket.on('turn', updateCurrentTurn);
    socket.on('board', updateBoard);
    socket.on('endGame', endGame);
    socket.on('restart', restart);
    socket.on('wrongId', handleWrongId);
  }

  function connectTo(id) {
    socket.emit('connectTo', id);
  }

  function placeMark(mark) {
    socket.emit('mark', mark);
  }

  function nextTurn(currentTeam, pairId) {
    socket.emit('nextTurn', { currentTeam, pairId });
  }

  function endGame(message, pairId) {
    socket.emit('endGame', { message, pairId });
  }

  function restart() {
    socket.emit('restart');
  }

  return { registerHandlers, connectTo, placeMark, nextTurn, endGame, restart };
}
