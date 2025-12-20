import React, { useState } from "react";
import PlayerWindow from "@/components/PlayerWindow";

// Ball points
const BALL_POINTS = {
  red: 1,
  yellow: 2,
  green: 3,
  brown: 4,
  blue: 5,
  pink: 6,
  black: 7,
} as const;

type BallColor = keyof typeof BALL_POINTS;

export default function MainWindow() {
  // --- Pre-game setup state ---
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [totalFrames, setTotalFrames] = useState(7);
  const [gameStarted, setGameStarted] = useState(false);

  // --- Game state ---
  const [firstScore, setFirstScore] = useState(0);
  const [secondScore, setSecondScore] = useState(0);
  const [firstFrame, setFirstFrame] = useState(0);
  const [secondFrame, setSecondFrame] = useState(0);
  const [frameNumber, setFrameNumber] = useState(1);

  const [isFirstPlayerTurn, setIsFirstPlayerTurn] = useState(true);
  const [currentBreak, setCurrentBreak] = useState(0);

  const MAX_REDS = 15;
  const MAX_POINTS = 147;
  const [redCount, setRedCount] = useState(MAX_REDS);

  const [gameOver, setGameOver] = useState(false);

  const BALL_CLASSES: Record<BallColor, string> = {
    red: "bg-red-600",
    yellow: "bg-yellow-400",
    green: "bg-green-600",
    brown: "bg-amber-900",
    blue: "bg-blue-600",
    pink: "bg-pink-500",
    black: "bg-black",
  };

  // --- Handle ball pot ---
  const potBall = (color: BallColor) => {
    if (gameOver) return;
    const points = BALL_POINTS[color];
    if (isFirstPlayerTurn) setFirstScore(prev => prev + points);
    else setSecondScore(prev => prev + points);
    setCurrentBreak(prev => prev + points);
    if (color === "red") setRedCount(prev => Math.max(prev - 1, 0));
  };

  // --- Foul ---
  const foul = () => {
    if (gameOver) return;
    const points = 4;
    if (isFirstPlayerTurn) setSecondScore(prev => prev + points);
    else setFirstScore(prev => prev + points);
    setCurrentBreak(0);
    setIsFirstPlayerTurn(prev => !prev); // automatically switch turn
  };

  // --- End turn ---
  const endTurn = () => {
    if (gameOver) return;
    setIsFirstPlayerTurn(prev => !prev);
    setCurrentBreak(0);
  };

  // --- End frame ---
  const endFrame = () => {
    if (gameOver) return;
    if (firstScore > secondScore) setFirstFrame(prev => prev + 1);
    else if (secondScore > firstScore) setSecondFrame(prev => prev + 1);

    // Reset for next frame
    setFirstScore(0);
    setSecondScore(0);
    setCurrentBreak(0);
    setRedCount(MAX_REDS);
    setFrameNumber(prev => prev + 1);
    setIsFirstPlayerTurn(true);

    // Check game over
    if (frameNumber >= totalFrames) setGameOver(true);
  };

  // --- Reset game ---
  const resetGame = () => {
    setFirstScore(0);
    setSecondScore(0);
    setFirstFrame(0);
    setSecondFrame(0);
    setFrameNumber(1);
    setIsFirstPlayerTurn(true);
    setCurrentBreak(0);
    setRedCount(MAX_REDS);
    setGameOver(false);
    setGameStarted(false);
  };

  const difference = Math.abs(firstScore - secondScore);

  // --- Pre-game setup form submit ---
  const startGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1Name || !player2Name || totalFrames < 1) return;
    setGameStarted(true);
  };

  // --- Render pre-game setup ---
  if (!gameStarted) {
    return (
      <div className=" flex flex-col justify-center items-center">
        <form
          className="flex flex-col gap-4 bg-[#232334] p-6 rounded-lg shadow-lg text-black min-w-[40rem]"
          onSubmit={startGame}
        >
          <h2 className="text-3xl font-bold text-white text-center font-semibold">Game Setup</h2>
          <h3 className="text-white">Players' name:</h3>
          <input
            type="text"
            placeholder="Player 1"
            value={player1Name}
            onChange={e => setPlayer1Name(e.target.value)}
            className="p-2 rounded border"
            required
          />
          <input
            type="text"
            placeholder="Player 2"
            value={player2Name}
            onChange={e => setPlayer2Name(e.target.value)}
            className="p-2 rounded border"
            required
          />
          <h3 className="text-white">Number of frames to be played:</h3>
          <input
            type="number"
            placeholder="Number of frames"
            value={totalFrames}
            onChange={e => setTotalFrames(Math.max(1, +e.target.value))}
            className="p-2 rounded border"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
          >
            Start Game
          </button>
        </form>
      </div>
    );
  }

  // --- Render game scoreboard ---
  return (
    <>
      <div className="rounded-2xl grid grid-cols-[1fr_300px_1fr] gap-2">
        <PlayerWindow
          name={player1Name}
          score={firstScore}
          isTurn={isFirstPlayerTurn}
        />
        <section className="background px-4 py-7 grid gap-4 rounded-sm">
          <div className="grid grid-cols-3 text-center text-4xl font-bold pb-5">
            <span>{firstFrame}</span>
            <span>({frameNumber})</span>
            <span>{secondFrame}</span>
          </div>
          <div className="flex">
            <span className="flex-grow">Break</span>
            <span className="font-bold text-yellow-200">{currentBreak}</span>
          </div>
          <div className="flex">
            <span className="flex-grow">Difference</span>
            <span className="font-bold text-yellow-200">{difference}</span>
          </div>
          {gameOver && (
            <div className="text-center text-xl font-bold mt-4">
              Game Over!{" "}
              {firstFrame > secondFrame
                ? `${player1Name} wins`
                : secondFrame > firstFrame
                  ? `${player2Name} wins`
                  : "Draw"}
            </div>
          )}
        </section>
        <PlayerWindow
          name={player2Name}
          score={secondScore}
          isTurn={!isFirstPlayerTurn}
        />
      </div>

      {/* Ball Buttons */}
      {!gameOver && (
        <section className="mt-2 background rounded-sm py-6">
          <div className="flex gap-4 justify-center items-center">
            <span className="flex items-center">
              <button
                className="bg-red-600 ball_button mr-2"
                onClick={() => potBall("red")}
              />
              <span className="text-[2rem]">{redCount}</span>
            </span>
            {(["yellow", "green", "brown", "blue", "pink", "black"] as BallColor[]).map(color => (
              <button
                key={color}
                className={`${BALL_CLASSES[color]} ball_button`}
                onClick={() => potBall(color)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Function Buttons */}
      {!gameOver && (
        <section className="mt-2 background rounded-sm py-6">
          <div className="flex gap-4 justify-center items-center">
            <button onClick={foul} className="bg-purple-600 funcButton">Foul</button>
            <button onClick={endTurn} className="bg-gray-600 funcButton">End Turn</button>
            <button onClick={endFrame} className="bg-blue-600 funcButton">End Frame</button>
            <button onClick={resetGame} className="bg-green-600 funcButton">Reset Game</button>
          </div>
        </section>
      )}

      {gameOver && (
        <div className="flex justify-center mt-4">
          <button
            onClick={resetGame}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            New Game
          </button>
        </div>
      )}
    </>
  );
}
