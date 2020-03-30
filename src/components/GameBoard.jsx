import React, { Component } from 'react';
import socket from '../utils/socket';
import IntroPage from './IntroPage';
import EngGamePage from './EngGamePage';

const initBoard = [
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

export default class GameBoard extends Component {
  constructor() {
    super();

    this.state = {
      input: '',
      id: null,
      roomID: null,
      currentTurn: null,
      board: [...initBoard],
      wrongId: null,
      endGameMessage: ''
    };

    this.socket = socket();

    this.room = null;
    this.team = null;

    this.submitConnect = this.submitConnect.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleRestart = this.handleRestart.bind(this);
  }

  handleInput(e) {
    this.setState({ input: e.target.value });
  }

  submitConnect() {
    this.socket.connectTo(this.state.input);
  }

  componentDidMount() {
    this.board = document.getElementById('board');

    this.socket.registerHandlers(
      id => this.setId(id),
      roomID => this.setRoomId(roomID),
      team => this.setTeam(team),
      currentTurn => this.setCurrentTurn(currentTurn),
      board => this.setBoard(board),
      endGameMessage => this.endGame(endGameMessage),
      () => this.startGame(),
      wrongId => this.setWrongId(wrongId)
    );

    this.startGame();
  }

  setId(id) {
    this.setState({ id });
  }

  setRoomId(roomID) {
    this.setState({ roomID });

    if (!roomID) {
      this.setState({
        team: null,
        input: '',
        currentTurn: null,
        board: [...initBoard],
        wrongId: null,
        endGameMessage: ''
      });
    }
  }

  setTeam(team) {
    this.team = team;
    this.setBoardHoverClass();
  }

  setCurrentTurn(currentTurn) {
    this.setState({ currentTurn });
  }

  setBoard(board) {
    this.setState({ board });
  }

  setWrongId(wrongId) {
    this.setState({ wrongId }, () => setTimeout(() => this.setState({ wrongId: null }), 5000));
  }

  startGame() {
    this.setState({ endGameMessage: '' });
  }

  handleClick(e) {
    if (this.state.currentTurn === this.team) {
      this.socket.placeMark({ id: e.target.id, value: this.team });
    }
  }

  endGame(message) {
    if (message === 'Draw!') {
      this.setState({ endGameMessage: message });
      return;
    }

    if (this.team === message) {
      this.setState({ endGameMessage: 'You won!' });
    }
    if (this.team !== message) {
      this.setState({ endGameMessage: 'You lost :(' });
    }
  }

  setBoardHoverClass() {
    if (this.board.classList.contains('x')) this.board.classList.remove('x');
    if (this.board.classList.contains('circle')) this.board.classList.remove('circle');

    this.board.classList.add(this.team);
  }

  handleRestart() {
    this.socket.restart();
  }

  statusMessage() {
    return this.state.currentTurn === this.team ? 'Your turn!' : 'Wait for opponents turn...';
  }

  render() {
    const { board, endGameMessage, roomID, id, input, wrongId } = this.state;
    return (
      <>
        <div className="board" id="board">
          {board.map((el, i) => (
            <div
              key={String(i)}
              id={String(i)}
              className={`${el ? el + ' cell' : 'cell'}`}
              onClick={this.handleClick}
            ></div>
          ))}
        </div>
        <div className="status-message">{this.statusMessage()}</div>

        {endGameMessage && (
          <EngGamePage message={endGameMessage} handleRestart={this.handleRestart} />
        )}

        {!roomID && (
          <IntroPage
            id={id}
            input={input}
            handleInput={this.handleInput}
            submitConnect={this.submitConnect}
            wrongId={wrongId}
          />
        )}
      </>
    );
  }
}
