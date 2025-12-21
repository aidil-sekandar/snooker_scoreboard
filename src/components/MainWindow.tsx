import React, { useState, useEffect } from "react";
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
type ExpectedBall = "red" | "color";

export default function MainWindow() {
  // --- Pre-game setup ---
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [totalFrames, setTotalFrames] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);

  // --- Game state ---
  const [frameTime, setFrameTime] = useState(0); // seconds
  const [firstScore, setFirstScore] = useState(0);
  const [secondScore, setSecondScore] = useState(0);
  const [firstFrame, setFirstFrame] = useState(0);
  const [secondFrame, setSecondFrame] = useState(0);
  const [frameNumber, setFrameNumber] = useState(1);
  const [showEndFrameConfirm, setShowEndFrameConfirm] = useState(false);
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);
  const [isFirstPlayerTurn, setIsFirstPlayerTurn] = useState(true);
  const [currentBreak, setCurrentBreak] = useState(0);
  const [redCount, setRedCount] = useState(15);
  const [gameOver, setGameOver] = useState(false);

  // --- Shot history ---
  const [player1Shots, setPlayer1Shots] = useState<BallColor[]>([]);
  const [player2Shots, setPlayer2Shots] = useState<BallColor[]>([]);

  // --- Ball logic ---
  const [expectedBall, setExpectedBall] = useState<ExpectedBall>("red");
  const [isFoulActive, setIsFoulActive] = useState(false);

  const BALL_CLASSES: Record<BallColor, string> = {
    red: "bg-red-600",
    yellow: "bg-[#EC9801]",
    green: "bg-green-600",
    brown: "bg-amber-900",
    blue: "bg-blue-600",
    pink: "bg-pink-500",
    black: "bg-black",
  };

  // --- Timer ---
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const timer = setInterval(() => setFrameTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, frameNumber]);

  // --- Prevent accidental close ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gameStarted && !gameOver) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [gameStarted, gameOver]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // --- Handle ball pot ---
  const potBall = (color: BallColor) => {
    if (gameOver || isFoulActive) return;

    if ((expectedBall === "red" && color !== "red") || (expectedBall === "color" && color === "red")) return;

    const points = BALL_POINTS[color];
    if (isFirstPlayerTurn) {
      setFirstScore(prev => prev + points);
      setPlayer1Shots(prev => [...prev, color]);
    } else {
      setSecondScore(prev => prev + points);
      setPlayer2Shots(prev => [...prev, color]);
    }
    setCurrentBreak(prev => prev + points);

    if (color === "red") {
      setRedCount(prev => Math.max(prev - 1, 0));
      setExpectedBall("color");
    } else {
      setExpectedBall("red");
    }
  };

  // --- Undo last shot ---
  const undoLastShot = () => {
    if (gameOver || isFoulActive) return;
    const shots = isFirstPlayerTurn ? player1Shots : player2Shots;
    if (shots.length === 0) return;

    const lastBall = shots[shots.length - 1];
    const points = BALL_POINTS[lastBall];

    if (isFirstPlayerTurn) {
      setFirstScore(prev => Math.max(prev - points, 0));
      setCurrentBreak(prev => Math.max(prev - points, 0));
      setPlayer1Shots(prev => prev.slice(0, -1));
    } else {
      setSecondScore(prev => Math.max(prev - points, 0));
      setCurrentBreak(prev => Math.max(prev - points, 0));
      setPlayer2Shots(prev => prev.slice(0, -1));
    }

    setExpectedBall(lastBall === "red" ? "red" : "color");
    if (lastBall === "red") setRedCount(prev => Math.min(prev + 1, 15));
  };

  // --- Foul ---
  const foul = () => {
    if (gameOver || isFoulActive) return;
    const points = 4;
    if (isFirstPlayerTurn) setSecondScore(prev => prev + points);
    else setFirstScore(prev => prev + points);

    setCurrentBreak(0);
    setIsFirstPlayerTurn(prev => !prev);
    setExpectedBall("red");
    setIsFoulActive(true);
  };

  const handleFoulPoints = (points: 4 | 5 | 6 | 7) => {
    if (gameOver || !isFoulActive) return;
    if (isFirstPlayerTurn) setFirstScore(prev => prev + points);
    else setSecondScore(prev => prev + points);

    setIsFoulActive(false);
    setCurrentBreak(0);
    setExpectedBall("red");
  };

  // --- End turn ---
  const endTurn = () => {
    if (gameOver || isFoulActive) return;
    setIsFirstPlayerTurn(prev => !prev);
    setCurrentBreak(0);
    setExpectedBall("red");
  };

  // --- End frame ---
  const endFrame = () => {
    if (gameOver) return;
    if (firstScore > secondScore) setFirstFrame(prev => prev + 1);
    else if (secondScore > firstScore) setSecondFrame(prev => prev + 1);

    setFirstScore(0);
    setSecondScore(0);
    setCurrentBreak(0);
    setRedCount(15);
    setFrameNumber(prev => prev + 1);
    setIsFirstPlayerTurn(true);
    setPlayer1Shots([]);
    setPlayer2Shots([]);
    setExpectedBall("red");
    setFrameTime(0);
    setIsFoulActive(false);

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
    setRedCount(15);
    setGameOver(false);
    setGameStarted(false);
    setPlayer1Shots([]);
    setPlayer2Shots([]);
    setExpectedBall("red");
    setIsFoulActive(false);
    setFrameTime(0);
  };

  const difference = Math.abs(firstScore - secondScore);

  // --- Pre-game setup ---
  const startGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1Name || !player2Name || totalFrames < 1) return;
    setGameStarted(true);
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col justify-center items-center">
        <form
          className="flex flex-col gap-4 bg-[#232334] p-6 rounded-lg shadow-lg text-black min-w-[40rem]"
          onSubmit={startGame}
        >
          <h2 className="text-3xl text-white text-center font-semibold">Game Setup</h2>
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
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded mt-2">
            Start Game
          </button>
        </form>
      </div>
    );
  }

  // --- Render game ---
  return (
    <>
      <div className="rounded-2xl grid grid-cols-[1fr_300px_1fr] gap-2">
        <PlayerWindow
          name={player1Name}
          score={firstScore}
          isTurn={isFirstPlayerTurn}
          shots={player1Shots}
          ballClasses={BALL_CLASSES}
        />
        <section className="background px-4 py-7 grid gap-4 rounded-sm">
          <div className="grid grid-cols-3 text-center text-4xl font-bold pb-5">
            <span>{firstFrame}</span>
            <span>({frameNumber})</span>
            <span>{secondFrame}</span>
          </div>
          <div className="flex">
            <span className="flex-grow">Frame Time</span>
            <span className="font-bold text-yellow-200">{formatTime(frameTime)}</span>
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
          shots={player2Shots}
          ballClasses={BALL_CLASSES}
        />
      </div>

      {/* Ball Section */}
      {!gameOver && !isFoulActive && (
        <section className="mt-2 background rounded-sm py-6">
          <div className="flex gap-4 justify-center items-center">
            {/* Red */}
            <span className="flex items-center">
              <button
                className={`ball_button mr-2 flex items-center justify-center text-white text-xl font-semibold
                  ${expectedBall === "red" ? "bg-red-600" : "bg-red-600/30 cursor-not-allowed"}`}
                onClick={() => potBall("red")}
                disabled={expectedBall !== "red"}
              >
                {BALL_POINTS.red}
              </button>
              <span className="text-[2rem]">× {redCount}</span>
            </span>

            {/* Color balls */}
            {(["yellow", "green", "brown", "blue", "pink", "black"] as BallColor[]).map(color => (
              <button
                key={color}
                onClick={() => potBall(color)}
                disabled={expectedBall !== "color"}
                className={`ball_button flex items-center justify-center text-white text-xl font-semibold
                  ${expectedBall === "color" ? BALL_CLASSES[color] : `${BALL_CLASSES[color]} opacity-30 cursor-not-allowed`}`}
              >
                {BALL_POINTS[color]}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Foul Points Section */}
      {!gameOver && isFoulActive && (
        <section className="mt-2 background rounded-sm py-6">
          <div className="flex gap-4 justify-center items-center">
            {[4, 5, 6, 7].map(val => (
              <button
                key={val}
                className={`ball_button bg-gray-600 flex items-center justify-center text-white text-xl font-semibold`}
                onClick={() => handleFoulPoints(val as 4 | 5 | 6 | 7)}
              >
                {val}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Function Buttons */}
      {!gameOver && (
        <section className="mt-2 background rounded-sm py-6">
          <div className="flex gap-4 justify-center items-center">
            {/* Undo */}
            <button
              onClick={undoLastShot}
              disabled={isFoulActive || (isFirstPlayerTurn ? player1Shots.length === 0 : player2Shots.length === 0)}
              className={`funcButton bg-green-600 text-black ${isFoulActive || (isFirstPlayerTurn ? player1Shots.length : player2Shots.length) === 0
                  ? "opacity-30 cursor-not-allowed"
                  : ""
                }`}
            >
              Undo
            </button>

            {/* Foul */}
            <button
              onClick={foul}
              disabled={isFoulActive}
              className={`funcButton bg-purple-600 ${isFoulActive ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              Foul
            </button>

            {/* End Turn */}
            <button
              onClick={endTurn}
              disabled={isFoulActive}
              className={`funcButton bg-gray-600 ${isFoulActive ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              End Turn
            </button>

            {/* End Frame */}
            <button onClick={() => setShowEndFrameConfirm(true)} className="funcButton bg-blue-600">
              End Frame
            </button>

            {/* End Game */}
            <button onClick={() => setShowEndGameConfirm(true)} className="funcButton bg-red-600">
              End Match
            </button>
          </div>
        </section>
      )}

      {/* End Frame & Game Confirmation */}
      {showEndFrameConfirm && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
          <div className="bg-[#2c2c3f] p-6 rounded-lg flex flex-col gap-4 w-96 text-center shadow-lg">
            <p className="text-lg font-semibold">You are about to end the frame. Confirm?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  endFrame();
                  setShowEndFrameConfirm(false);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
              <button onClick={() => setShowEndFrameConfirm(false)} className="bg-red-600 text-white px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEndGameConfirm && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
          <div className="bg-[#2c2c3f] p-6 rounded-lg flex flex-col gap-4 w-96 text-center shadow-lg">
            <p className="text-lg font-semibold">You are about to end the match. Confirm?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  resetGame();
                  setShowEndGameConfirm(false);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
              <button onClick={() => setShowEndGameConfirm(false)} className="bg-red-600 text-white px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
