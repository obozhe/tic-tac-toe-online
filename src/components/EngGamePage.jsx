import React from 'react';

const EngGamePage = ({ message, handleRestart }) => {
  return (
    <div className="winning-message">
      <div>{message}</div>
      <button id="restartButton" onClick={handleRestart}>
        restart
      </button>
    </div>
  );
};

export default EngGamePage;
