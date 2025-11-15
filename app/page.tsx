"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

const winPatterns = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [3, 4, 5],
  [6, 7, 8],
];

export default function Home() {
  const [boxes, setBoxes] = useState<string[]>(Array(9).fill(""));
  const [turnO, setTurnO] = useState(true);
  const [count, setCount] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiTurn, setAiTurn] = useState(false);

  const checkWinner = (currentBoxes: string[]): string | null => {
    for (let pattern of winPatterns) {
      const pos1Val = currentBoxes[pattern[0]];
      const pos2Val = currentBoxes[pattern[1]];
      const pos3Val = currentBoxes[pattern[2]];

      if (pos1Val !== "" && pos2Val !== "" && pos3Val !== "") {
        if (pos1Val === pos2Val && pos2Val === pos3Val) {
          return pos1Val;
        }
      }
    }
    return null;
  };

  const minMax = (
    board: string[],
    depth: number,
    isMaximizing: boolean
  ): number => {
    const aiPlayer = "X";
    const humanPlayer = "O";

    const aiWinner = checkWinner(board) === aiPlayer;
    if (aiWinner) {
      return 10 - depth;
    }

    const humanWinner = checkWinner(board) === humanPlayer;
    if (humanWinner) {
      return depth - 10;
    }

    if (board.every((cell) => cell !== "")) {
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = aiPlayer;
          const score = minMax(board, depth + 1, false);
          board[i] = "";
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = humanPlayer;
          const score = minMax(board, depth + 1, true);
          board[i] = "";
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const findBestMove = (board: string[]): number => {
    let bestScore = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        const score = minMax(board, 0, false);
        board[i] = "";
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };
  // Use useEffect to trigger AI move when it's AI's turn
  useEffect(() => {
    if (!isAiMode || !aiTurn || turnO || winner || isDraw) {
      return;
    }

    const timer = setTimeout(() => {
      setBoxes((currentBoxes) => {
        const newBoxes = [...currentBoxes];
        const bestMove = findBestMove(newBoxes);

        if (bestMove === -1) {
          setAiTurn(false);
          return currentBoxes;
        }

        newBoxes[bestMove] = "X"; // AI plays X

        setCount((currentCount) => {
          const newCount = currentCount + 1;

          setTurnO(true); // Switch back to player (O)
          setAiTurn(false); // Allow player to click again

          const newWinner = checkWinner(newBoxes);

          if (newWinner) {
            setWinner(newWinner);
            setShowMessage(true);
          } else if (newCount === 9) {
            setIsDraw(true);
            setShowMessage(true);
          }

          return newCount;
        });

        return newBoxes;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [isAiMode, aiTurn, turnO, winner, isDraw]);

  const handleBoxClick = (index: number) => {
    if (boxes[index] !== "" || winner || isDraw || aiTurn) {
      return;
    }

    const newBoxes = [...boxes];
    newBoxes[index] = turnO ? "O" : "X";
    const newCount = count + 1;

    setBoxes(newBoxes);
    const newTurnO = !turnO;
    setTurnO(newTurnO);
    setCount(newCount);

    const newWinner = checkWinner(newBoxes);

    if (newWinner) {
      setWinner(newWinner);
      setShowMessage(true);
    } else if (newCount === 9) {
      setIsDraw(true);
      setShowMessage(true);
    } else if (isAiMode && !newTurnO) {
      // If AI mode is on and it's now AI's turn (X's turn)
      setAiTurn(true);
    }
  };

  const resetGame = () => {
    setBoxes(Array(9).fill(""));
    setTurnO(true);
    setCount(0);
    setWinner(null);
    setIsDraw(false);
    setShowMessage(false);
    setAiTurn(false);
  };

  return (
    <main className={styles.main}>
      {showMessage && (
        <div className={styles.msgContainer}>
          <p className={styles.msg}>
            {isDraw
              ? "Game was a Draw."
              : `Congratulations, Winner is ${winner}`}
          </p>
          <button className={styles.newBtn} onClick={resetGame}>
            New Game
          </button>
        </div>
      )}
      <button
        onClick={() => {
          setIsAiMode(!isAiMode);
          resetGame();
        }}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          backgroundColor: isAiMode ? "#4CAF50" : "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        {isAiMode ? "AI Mode: ON" : "AI Mode: OFF"}
      </button>
      <h1>Tic Tac Toe</h1>
      <div className={styles.container}>
        <div className={styles.game}>
          {boxes.map((value, index) => (
            <button
              key={index}
              className={styles.box}
              onClick={() => handleBoxClick(index)}
              disabled={value !== "" || winner !== null || isDraw || aiTurn}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <button className={styles.resetBtn} onClick={resetGame}>
        Reset Game
      </button>
    </main>
  );
}
