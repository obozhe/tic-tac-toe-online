const X_CLASS = 'x';
const CIRCLE_CLASS = 'circle';

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const initialBoard = [
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined
];

class Room {
  constructor(roomID, socket1, socket2) {
    this.placeMark = this.placeMark.bind(this);
    this.restart = this.restart.bind(this);
    this.disconnectHost = this.disconnectHost.bind(this);
    this.disconnectGuest = this.disconnectGuest.bind(this);

    this.roomID = roomID;
    this.board = [...initialBoard];
    this.host = { team: X_CLASS, id: socket1.id, socket: socket1.socket };
    this.guest = { team: CIRCLE_CLASS, id: socket2.id, socket: socket2.socket };
    this.currentTurn = X_CLASS;
    this.initSockets();
  }

  initSockets() {
    this.host.socket.off('mark', this.placeMark);
    this.guest.socket.off('mark', this.placeMark);

    this.host.socket.off('restart', this.restart);
    this.guest.socket.off('restart', this.restart);

    this.host.socket.emit('roomID', this.roomID);
    this.guest.socket.emit('roomID', this.roomID);

    this.host.socket.emit('team', this.host.team);
    this.guest.socket.emit('team', this.guest.team);
    this.host.socket.emit('turn', this.currentTurn);
    this.guest.socket.emit('turn', this.currentTurn);

    this.host.socket.on('mark', this.placeMark);
    this.guest.socket.on('mark', this.placeMark);

    this.host.socket.on('restart', this.restart);
    this.guest.socket.on('restart', this.restart);

    this.host.socket.on('disconnect', this.disconnectHost);
    this.guest.socket.on('disconnect', this.disconnectGuest);
  }

  disconnectHost() {
    this.guest.socket.emit('roomID', null);
  }

  disconnectGuest() {
    this.host.socket.emit('roomID', null);
  }

  restart() {
    this.board = [...initialBoard];
    this.reloadBoard();
    this.initSockets();
    this.host.socket.emit('restart');
    this.guest.socket.emit('restart');
  }

  placeMark({ id, value }) {
    if (value === this.currentTurn) {
      this.board[id] = this.currentTurn;
      this.reloadBoard();
      if (this.checkWin()) {
        this.endGame(false);
      } else if (this.isDraw()) {
        this.endGame(true);
      } else {
        this.nextTurn();
      }
    }
  }

  reloadBoard() {
    this.host.socket.emit('board', this.board);
    this.guest.socket.emit('board', this.board);
  }

  checkWin() {
    return WINNING_COMBINATIONS.some(combination =>
      combination.every(index => this.board[index] === this.currentTurn)
    );
  }

  isDraw() {
    return this.board.every(cell => cell === X_CLASS || cell === CIRCLE_CLASS);
  }

  nextTurn() {
    this.currentTurn = this.currentTurn === X_CLASS ? CIRCLE_CLASS : X_CLASS;
    this.host.socket.emit('turn', this.currentTurn);
    this.guest.socket.emit('turn', this.currentTurn);
  }

  endGame(draw) {
    draw ? this.emitEndGame('Draw!') : this.emitEndGame(this.currentTurn);
  }

  emitEndGame(message) {
    this.host.socket.emit('endGame', message);
    this.guest.socket.emit('endGame', message);
  }
}

module.exports = Room;
