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
type ExpectedBall = "red" | "color" | "sequence";

// Clearance order after reds are gone
const CLEARANCE_ORDER: BallColor[] = ["yellow", "green", "brown", "blue", "pink", "black"];

type PlayerId = 1 | 2;

type HistoryEvent =
  | { id: number; player: PlayerId; type: "pot"; color: BallColor; points: number }
  | { id: number; player: PlayerId; type: "miss" }
  | { id: number; player: PlayerId; type: "foul"; points: 4 | 5 | 6 | 7 };

type GameSnapshot = {
  frameTime: number;
  firstScore: number;
  secondScore: number;
  firstFrame: number;
  secondFrame: number;
  frameNumber: number;
  showEndFrameConfirm: boolean;
  showEndGameConfirm: boolean;
  isFirstPlayerTurn: boolean;
  currentBreak: number;
  redCount: number;
  gameOver: boolean;
  frameOver: boolean;
  frameWinner: string | null;
  clearanceIndex: number;
  lastRedColorPending: boolean;
  expectedBall: ExpectedBall;
  isFoulActive: boolean;
  history: HistoryEvent[];
  eventCounter: number;
};

export default function MainWindow() {
  // --- Pre-game setup ---
  const [matchTitle, setMatchTitle] = useState("");
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
  const [frameOver, setFrameOver] = useState(false);
  const [frameWinner, setFrameWinner] = useState<string | null>(null);
  const [clearanceIndex, setClearanceIndex] = useState(0);
  const [lastRedColorPending, setLastRedColorPending] = useState(false);

  // --- Marking history / undo ---
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [eventCounter, setEventCounter] = useState(0);
  const [undoStack, setUndoStack] = useState<GameSnapshot[]>([]);

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

  const getCurrentPlayerId = (): PlayerId => (isFirstPlayerTurn ? 1 : 2);

  const createSnapshot = (): GameSnapshot => ({
    frameTime,
    firstScore,
    secondScore,
    firstFrame,
    secondFrame,
    frameNumber,
    showEndFrameConfirm,
    showEndGameConfirm,
    isFirstPlayerTurn,
    currentBreak,
    redCount,
    gameOver,
    frameOver,
    frameWinner,
    clearanceIndex,
    lastRedColorPending,
    expectedBall,
    isFoulActive,
    history,
    eventCounter,
  });

  const pushUndoSnapshot = () => {
    setUndoStack(prev => [...prev, createSnapshot()]);
  };

  const restoreSnapshot = (snapshot: GameSnapshot) => {
    setFrameTime(snapshot.frameTime);
    setFirstScore(snapshot.firstScore);
    setSecondScore(snapshot.secondScore);
    setFirstFrame(snapshot.firstFrame);
    setSecondFrame(snapshot.secondFrame);
    setFrameNumber(snapshot.frameNumber);
    setShowEndFrameConfirm(snapshot.showEndFrameConfirm);
    setShowEndGameConfirm(snapshot.showEndGameConfirm);
    setIsFirstPlayerTurn(snapshot.isFirstPlayerTurn);
    setCurrentBreak(snapshot.currentBreak);
    setRedCount(snapshot.redCount);
    setGameOver(snapshot.gameOver);
    setFrameOver(snapshot.frameOver);
    setFrameWinner(snapshot.frameWinner);
    setClearanceIndex(snapshot.clearanceIndex);
    setLastRedColorPending(snapshot.lastRedColorPending);
    setExpectedBall(snapshot.expectedBall);
    setIsFoulActive(snapshot.isFoulActive);
    setHistory(snapshot.history);
    setEventCounter(snapshot.eventCounter);
  };

  const appendHistory = (event: Omit<HistoryEvent, "id">) => {
    setHistory(prev => [...prev, { ...event, id: eventCounter }]);
    setEventCounter(prev => prev + 1);
  };

  const applyExpectedBallAfterTurnChange = () => {
    if (redCount === 0) {
      // If the color after the last red was missed/fouled, next legal ball is yellow.
      if (lastRedColorPending) {
        setLastRedColorPending(false);
        setClearanceIndex(0);
      }
      setExpectedBall("sequence");
      return;
    }
    setExpectedBall("red");
  };

  // --- Handle ball pot ---
  const potBall = (color: BallColor) => {
    if (gameOver || isFoulActive || frameOver) return;

    const sequenceActive = redCount === 0 && !lastRedColorPending;

    // --- Sequence potting ---
    if (sequenceActive) {
      const expectedColor = CLEARANCE_ORDER[clearanceIndex];
      if (color !== expectedColor) return;

      pushUndoSnapshot();

      const points = BALL_POINTS[color];
      if (isFirstPlayerTurn) {
        setFirstScore(prev => prev + points);
      } else {
        setSecondScore(prev => prev + points);
      }
      appendHistory({ player: getCurrentPlayerId(), type: "pot", color, points });
      setCurrentBreak(prev => prev + points);

      // Last black ends frame
      if (color === "black") {
        const winner =
          firstScore > secondScore
            ? player1Name
            : secondScore > firstScore
              ? player2Name
              : "Draw";
        setFrameWinner(winner);
        setFrameOver(true);
        return;
      }

      // Move to next color in sequence
      setClearanceIndex(prev => Math.min(prev + 1, CLEARANCE_ORDER.length - 1));
      return;
    }

    // --- Normal potting ---
    if ((expectedBall === "red" && color !== "red") || (expectedBall === "color" && color === "red"))
      return;
    if (color === "red" && redCount === 0) return;

    pushUndoSnapshot();

    const points = BALL_POINTS[color];
    if (isFirstPlayerTurn) {
      setFirstScore(prev => prev + points);
    } else {
      setSecondScore(prev => prev + points);
    }
    appendHistory({ player: getCurrentPlayerId(), type: "pot", color, points });
    setCurrentBreak(prev => prev + points);

    if (color === "red") {
      if (redCount === 1) setLastRedColorPending(true);
      setRedCount(prev => Math.max(prev - 1, 0));
      setExpectedBall("color");
    } else {
      if (lastRedColorPending) {
        setLastRedColorPending(false);
        setClearanceIndex(0); // start sequence potting
        setExpectedBall("sequence");
      } else {
        setExpectedBall(redCount > 0 ? "red" : "sequence");
      }
    }
  };

  // --- Undo last shot ---
  const undoLastShot = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    restoreSnapshot(previous);
  };

  // --- Foul ---
  const foul = () => {
    if (gameOver || isFoulActive || frameOver) return;
    pushUndoSnapshot();
    setCurrentBreak(0);
    setIsFirstPlayerTurn(prev => !prev);
    applyExpectedBallAfterTurnChange();
    setIsFoulActive(true);
  };

  const handleFoulPoints = (points: 4 | 5 | 6 | 7) => {
    if (gameOver || !isFoulActive || frameOver) return;
    pushUndoSnapshot();
    const receiver = getCurrentPlayerId();
    if (isFirstPlayerTurn) setFirstScore(prev => prev + points);
    else setSecondScore(prev => prev + points);
    appendHistory({ player: receiver, type: "foul", points });

    setIsFoulActive(false);
    setCurrentBreak(0);
    applyExpectedBallAfterTurnChange();
  };

  // --- End turn ---
  const endTurn = () => {
    if (gameOver || isFoulActive || frameOver) return;
    pushUndoSnapshot();
    appendHistory({ player: getCurrentPlayerId(), type: "miss" });
    setIsFirstPlayerTurn(prev => !prev);
    setCurrentBreak(0);
    applyExpectedBallAfterTurnChange();
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
    setExpectedBall("red");
    setFrameTime(0);
    setIsFoulActive(false);
    setFrameOver(false);
    setFrameWinner(null);
    setClearanceIndex(0);
    setLastRedColorPending(false);
    setHistory([]);
    setEventCounter(0);
    setUndoStack([]);

    if (frameNumber >= totalFrames) setGameOver(true);
  };

  // --- Reset game ---
  const resetGame = () => {
    setUndoStack([]);
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
    setHistory([]);
    setEventCounter(0);
    setExpectedBall("red");
    setIsFoulActive(false);
    setFrameTime(0);
    setFrameOver(false);
    setFrameWinner(null);
    setClearanceIndex(0);
    setLastRedColorPending(false);
    setMatchTitle("");
    setPlayer1Name("");
    setPlayer2Name("");
  };

  const difference = Math.abs(firstScore - secondScore);
  const player1History = history.filter(item => item.player === 1);
  const player2History = history.filter(item => item.player === 2);

  // --- Start game ---
  const startGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchTitle || !player1Name || !player2Name || totalFrames < 1) return;
    setGameStarted(true);
  };

  // --- Pre-game setup ---
  if (!gameStarted) {
    return (
      <div className="flex flex-col justify-center items-center px-2">
        <form
          className="flex flex-col gap-4 bg-[#232334] p-4 md:p-6 rounded-lg shadow-lg text-black w-full max-w-2xl"
          onSubmit={startGame}
        >
          <h2 className="text-2xl md:text-3xl text-white text-center font-semibold">
            Online Snooker Scoreboard
          </h2>

          <h3 className="text-white">Match Title:</h3>
          <input
            type="text"
            placeholder="Enter match title"
            value={matchTitle}
            onChange={e => setMatchTitle(e.target.value)}
            className="p-2 rounded border"
            required
          />

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
      {/* Match Title */}
      {gameStarted && (
        <h1 className="text-center font-bold text-3xl md:text-5xl mb-4 md:mb-6 text-white">
          {matchTitle}
        </h1>
      )}

      {/* Player Windows and Center Stats */}
      <div className="rounded-2xl grid grid-cols-1 md:grid-cols-[1fr_260px_1fr] lg:grid-cols-[1fr_300px_1fr] gap-2">
        <PlayerWindow
          name={player1Name}
          score={firstScore}
          isTurn={isFirstPlayerTurn}
          history={player1History}
          ballClasses={BALL_CLASSES}
        />
        <section className="background px-3 md:px-4 py-5 md:py-7 grid gap-4 rounded-sm order-first md:order-none">
          <div className="grid grid-cols-3 text-center text-3xl md:text-4xl font-bold pb-2 md:pb-5">
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
          {frameOver && (
            <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
              <div className="bg-[#2c2c3f] p-6 rounded-lg flex flex-col gap-4 w-[90vw] max-w-md text-center shadow-lg">
                <p className="text-lg font-semibold">{frameWinner} wins the frame!</p>
                <button
                  onClick={endFrame}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Next Frame
                </button>
              </div>
            </div>
          )}

          {gameOver && !frameOver && (
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
          history={player2History}
          ballClasses={BALL_CLASSES}
        />
      </div>

      {/* Ball Buttons */}
      {!gameOver && !isFoulActive && !frameOver && (
        <section className="mt-2 background rounded-sm py-6">
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center items-center px-2">

            {(["red", "yellow", "green", "brown", "blue", "pink", "black"] as BallColor[]).map(color => {
              let isDisabled = false;
              const isSequenceActive = redCount === 0 && !lastRedColorPending;

              // Determine which balls are active
              if (color === "red" && redCount === 0) isDisabled = true;
              else if (isSequenceActive) isDisabled = CLEARANCE_ORDER[clearanceIndex] !== color;
              else if (expectedBall === "red") isDisabled = color !== "red";
              else if (expectedBall === "color") isDisabled = color === "red";
              else if (expectedBall === "sequence") isDisabled = CLEARANCE_ORDER[clearanceIndex] !== color;

              // Disabled balls are rendered neutral grey to make state obvious.
              const buttonClass = isDisabled
                ? "bg-gray-600 text-gray-300 opacity-70 cursor-not-allowed"
                : BALL_CLASSES[color];

              return (
                <button
                  key={color}
                  onClick={() => potBall(color)}
                  disabled={isDisabled}
                  className={`ball_button flex items-center justify-center text-white font-semibold ${buttonClass}`}
                >
                  {BALL_POINTS[color]}
                  {color === "red" && redCount > 0 && <span className="ml-1 md:ml-2 text-lg md:text-2xl">x {redCount}</span>}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Foul Points */}
      {!gameOver && isFoulActive && (
        <section className="mt-2 background rounded-sm py-6">
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center items-center px-2">
            {[4, 5, 6, 7].map(val => (
              <button
                key={val}
                className="ball_button bg-gray-600 flex items-center justify-center text-white font-semibold"
                onClick={() => handleFoulPoints(val as 4 | 5 | 6 | 7)}
              >
                {val}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Function Buttons */}
      <section className="mt-2 background rounded-sm py-6">
        <div className="flex flex-wrap gap-2 md:gap-4 justify-center items-center px-2">
          {!gameOver ? (
            <>
              <button
                onClick={undoLastShot}
                disabled={undoStack.length === 0}
                className={`funcButton bg-green-600 text-black ${undoStack.length === 0
                  ? "opacity-30 cursor-not-allowed"
                  : ""
                  }`}
              >
                Undo
              </button>

              <button
                onClick={foul}
                disabled={isFoulActive}
                className={`funcButton bg-purple-600 ${isFoulActive ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                Foul
              </button>

              <button
                onClick={endTurn}
                disabled={isFoulActive}
                className={`funcButton bg-gray-600 ${isFoulActive ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                End Turn
              </button>

              <button onClick={() => setShowEndFrameConfirm(true)} className="funcButton bg-blue-600">
                End Frame
              </button>

              <button onClick={() => setShowEndGameConfirm(true)} className="funcButton bg-red-600">
                End Match
              </button>
            </>
          ) : (
            <button onClick={resetGame} className="funcButton bg-green-600 text-white px-4 py-2 rounded">
              Set a New Match
            </button>
          )}
        </div>
      </section>

      {/* End Frame & Game Confirmation */}
      {showEndFrameConfirm && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
          <div className="bg-[#2c2c3f] p-6 rounded-lg flex flex-col gap-4 w-[90vw] max-w-md text-center shadow-lg">
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
          <div className="bg-[#2c2c3f] p-6 rounded-lg flex flex-col gap-4 w-[90vw] max-w-md text-center shadow-lg">
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

