import React, { useState, useEffect, useRef } from 'react';
import {
  newBoard,
  checkWinner,
  isFull,
  bestMove,
  EMPTY
} from './gamelogic';
import './App.css';

// Synthesize audio using Web Audio API (no external asset dependencies)
const playSound = (type) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'ai') {
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.linearRampToValueAtTime(520, now + 0.1);
      osc.frequency.linearRampToValueAtTime(700, now + 0.25);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'draw') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    // Graceful fallback if AudioContext is not allowed yet
  }
};

export default function App() {
  const [board, setBoard] = useState(newBoard());
  const [history, setHistory] = useState([newBoard()]);
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState('unbeatable'); // 'unbeatable', 'medium', 'easy', 'pvp'
  const [playerSymbol, setPlayerSymbol] = useState('X'); // 'X' or 'O'
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scores, setScores] = useState(() => {
    try {
      const saved = localStorage.getItem('ttt_minimax_scores');
      return saved ? JSON.parse(saved) : { X: 0, O: 0, ties: 0 };
    } catch {
      return { X: 0, O: 0, ties: 0 };
    }
  });

  const aiSymbol = playerSymbol === 'X' ? 'O' : 'X';
  const currentTurnSymbol = isXNext ? 'X' : 'O';
  const isAiTurn = gameMode !== 'pvp' && currentTurnSymbol === aiSymbol;

  const winInfo = checkWinner(board);
  const isDraw = !winInfo && isFull(board);
  const isGameOver = Boolean(winInfo) || isDraw;

  const prevGameOverRef = useRef(false);

  // Sync scores with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ttt_minimax_scores', JSON.stringify(scores));
    } catch (e) {
      // Safe storage
    }
  }, [scores]);

  // Handle game end audio & score increment
  useEffect(() => {
    if (isGameOver && !prevGameOverRef.current) {
      if (winInfo) {
        if (soundEnabled) playSound('win');
        setScores((prev) => ({
          ...prev,
          [winInfo.winner]: prev[winInfo.winner] + 1,
        }));
      } else if (isDraw) {
        if (soundEnabled) playSound('draw');
        setScores((prev) => ({
          ...prev,
          ties: prev.ties + 1,
        }));
      }
    }
    prevGameOverRef.current = isGameOver;
  }, [isGameOver, winInfo, isDraw, soundEnabled]);

  // AI execution effect - guaranteed to complete without premature timer cancellations
  useEffect(() => {
    if (!isAiTurn || isGameOver) return;

    setIsAiThinking(true);
    const timer = setTimeout(() => {
      const move = bestMove(board, aiSymbol, playerSymbol, gameMode);
      if (move !== null && move !== undefined) {
        const nextBoard = [...board];
        nextBoard[move] = aiSymbol;
        setBoard(nextBoard);
        setHistory((prev) => [...prev, nextBoard]);
        setIsXNext((prev) => !prev);
        if (soundEnabled) playSound('ai');
      }
      setIsAiThinking(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [isAiTurn, isGameOver, board, aiSymbol, playerSymbol, gameMode, soundEnabled]);

  // Handle human click
  const handleCellClick = (index) => {
    if (board[index] !== EMPTY || isGameOver || isAiThinking || isAiTurn) return;

    if (soundEnabled) playSound('click');
    const nextBoard = [...board];
    nextBoard[index] = currentTurnSymbol;
    setBoard(nextBoard);
    setHistory((prev) => [...prev, nextBoard]);
    setIsXNext(!isXNext);
  };

  // Reset current board
  const resetGame = () => {
    const empty = newBoard();
    setBoard(empty);
    setHistory([empty]);
    setIsXNext(true);
    setIsAiThinking(false);
    prevGameOverRef.current = false;
  };

  // Clear score records
  const resetScores = () => {
    const freshScores = { X: 0, O: 0, ties: 0 };
    setScores(freshScores);
    try {
      localStorage.setItem('ttt_minimax_scores', JSON.stringify(freshScores));
    } catch {}
    resetGame();
  };

  // Undo move
  const handleUndo = () => {
    if (history.length <= 1 || isGameOver || isAiThinking) return;

    const stepsToUndo = gameMode !== 'pvp' && history.length > 2 ? 2 : 1;
    const newHistory = history.slice(0, Math.max(1, history.length - stepsToUndo));
    const previousBoard = newHistory[newHistory.length - 1];

    setHistory(newHistory);
    setBoard(previousBoard);

    const filledCount = previousBoard.filter((c) => c !== EMPTY).length;
    setIsXNext(filledCount % 2 === 0);
  };

  // Status message computation
  const getStatusText = () => {
    if (winInfo) {
      if (gameMode === 'pvp') {
        return `Player ${winInfo.winner} Wins! 🏆`;
      }
      return winInfo.winner === playerSymbol ? 'You Won! 🎉' : 'Minimax AI Wins! 🤖';
    }
    if (isDraw) {
      return "It's a Draw! 🤝";
    }
    if (isAiThinking) {
      return 'AI calculating minimax move...';
    }
    if (gameMode === 'pvp') {
      return `Player ${currentTurnSymbol}'s Turn`;
    }
    return currentTurnSymbol === playerSymbol ? 'Your Turn' : "AI's Turn";
  };

  const minHistoryForUndo = gameMode !== 'pvp' && playerSymbol === 'O' ? 2 : 1;

  return (
    <div className="game-wrapper">
      <main className="game-card">
        {/* Top Header */}
        <header className="game-header">
          <div className="title-row">
            <h1 className="game-title">
              <span className="brand-glow">⚡</span> TIC-TAC-TOE
            </h1>
            <button
              className="sound-toggle-btn"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
          <p className="game-subtitle">
            Unbeatable Minimax Algorithm with Alpha-Beta Pruning
          </p>
        </header>

        {/* Game Mode Selector */}
        <nav className="mode-selector-grid" aria-label="Game Mode">
          <button
            className={`mode-pill ${gameMode === 'unbeatable' ? 'active' : ''}`}
            onClick={() => {
              setGameMode('unbeatable');
              resetGame();
            }}
          >
            🧠 Unbeatable
          </button>
          <button
            className={`mode-pill ${gameMode === 'medium' ? 'active' : ''}`}
            onClick={() => {
              setGameMode('medium');
              resetGame();
            }}
          >
            ⚡ Medium
          </button>
          <button
            className={`mode-pill ${gameMode === 'easy' ? 'active' : ''}`}
            onClick={() => {
              setGameMode('easy');
              resetGame();
            }}
          >
            🌱 Easy
          </button>
          <button
            className={`mode-pill ${gameMode === 'pvp' ? 'active' : ''}`}
            onClick={() => {
              setGameMode('pvp');
              resetGame();
            }}
          >
            👥 2 Players
          </button>
        </nav>

        {/* Symbol Selection when in Single-Player AI mode */}
        {gameMode !== 'pvp' && (
          <div className="symbol-selector-row">
            <span className="symbol-selector-label">Play as:</span>
            <div className="symbol-btn-group">
              <button
                className={`symbol-btn ${playerSymbol === 'X' ? 'active' : ''}`}
                onClick={() => {
                  setPlayerSymbol('X');
                  resetGame();
                }}
              >
                <span className="color-x">X</span> (First)
              </button>
              <button
                className={`symbol-btn ${playerSymbol === 'O' ? 'active' : ''}`}
                onClick={() => {
                  setPlayerSymbol('O');
                  resetGame();
                }}
              >
                <span className="color-o">O</span> (Second)
              </button>
            </div>
          </div>
        )}

        {/* Scoreboard */}
        <section className="scoreboard-container" aria-label="Scoreboard">
          <div
            className={`score-card ${
              currentTurnSymbol === 'X' && !isGameOver ? 'active-turn-x' : ''
            }`}
          >
            <span className="score-card-label">
              {gameMode === 'pvp'
                ? 'Player X'
                : playerSymbol === 'X'
                ? 'You (X)'
                : 'AI (X)'}
            </span>
            <span className="score-card-num x-val">{scores.X}</span>
          </div>

          <div className="score-card ties-card">
            <span className="score-card-label">Ties</span>
            <span className="score-card-num ties-val">{scores.ties}</span>
          </div>

          <div
            className={`score-card ${
              currentTurnSymbol === 'O' && !isGameOver ? 'active-turn-o' : ''
            }`}
          >
            <span className="score-card-label">
              {gameMode === 'pvp'
                ? 'Player O'
                : playerSymbol === 'O'
                ? 'You (O)'
                : 'AI (O)'}
            </span>
            <span className="score-card-num o-val">{scores.O}</span>
          </div>
        </section>

        {/* Turn / Result Status Banner */}
        <div className={`status-pill ${isGameOver ? 'game-over-banner' : ''}`}>
          <span
            className={`pulse-dot ${
              isAiThinking
                ? 'pulse-ai'
                : currentTurnSymbol === 'X'
                ? 'pulse-x'
                : 'pulse-o'
            }`}
          />
          <span className="status-text">{getStatusText()}</span>
        </div>

        {/* 3x3 Board Grid */}
        <div className="board-grid" role="grid">
          {board.map((cell, index) => {
            const isWinningCell = winInfo?.line.includes(index);
            return (
              <button
                key={index}
                className={`grid-cell ${
                  cell === 'X' ? 'cell-x' : cell === 'O' ? 'cell-o' : ''
                } ${isWinningCell ? 'cell-winning' : ''}`}
                onClick={() => handleCellClick(index)}
                disabled={cell !== EMPTY || isGameOver || isAiThinking || isAiTurn}
                aria-label={`Cell ${index + 1}: ${cell ? cell : 'empty'}`}
              >
                {cell && <span className="cell-marker">{cell}</span>}
              </button>
            );
          })}
        </div>

        {/* Action Controls Toolbar */}
        <div className="actions-toolbar">
          <button className="primary-action-btn" onClick={resetGame}>
            🔄 Play Again
          </button>
          <button
            className="secondary-action-btn"
            onClick={handleUndo}
            disabled={history.length <= minHistoryForUndo || isGameOver || isAiThinking}
          >
            ↩️ Undo
          </button>
          <button
            className="secondary-action-btn"
            onClick={resetScores}
            title="Reset Scores"
          >
            🗑️ Clear
          </button>
        </div>
      </main>
    </div>
  );
}