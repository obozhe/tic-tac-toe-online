import React from 'react';

const IntroPage = ({ id, handleInput, input, submitConnect, wrongId }) => {
  return (
    <div className="not-connected">
      <div className="wrapper">
        <p>Here is your ID: # {id}</p>
        <p>Tell it someone and wait for connect or connect to someone using his ID</p>
        <div className="input">
          <input type="text" onChange={handleInput} />
          <label>&nbsp;</label>
          <button disabled={!input} onClick={submitConnect}>
            <span>&#10004;</span>
          </button>
        </div>
        <div className={`${wrongId ? 'error-message show' : 'error-message'}`}>
          {wrongId === id ? (
            <p>You can't play with yourself :D</p>
          ) : (
            <p>Player with ID #{wrongId} doesn't exist. Try again!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroPage;
