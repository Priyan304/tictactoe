export const HUMAN = "X";
export const AI = "O";
export const EMPTY = null;

export const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Creates a fresh 3x3 board
 */
export const newBoard = () => Array(9).fill(EMPTY);

/**
 * Returns array of available cell indices
 */
export const availableMoves = (board) =>
  board
    .map((cell, i) => (cell === EMPTY || cell === " " || cell === null ? i : null))
    .filter((i) => i !== null);

/**
 * Checks for a winner and returns { winner, line } or null
 */
export const checkWinner = (board) => {
  for (let [a, b, c] of WINNING_LINES) {
    if (
      board[a] !== EMPTY &&
      board[a] !== " " &&
      board[a] !== null &&
      board[a] === board[b] &&
      board[b] === board[c]
    ) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return null;
};

/**
 * Simplified winner check returning just the winning symbol or null
 */
export const winner = (board) => {
  const result = checkWinner(board);
  return result ? result.winner : null;
};

/**
 * Returns true if board is full
 */
export const isFull = (board) => availableMoves(board).length === 0;

/**
 * Heuristic score for terminal states
 */
export const score = (board, depth, aiSymbol = AI, humanSymbol = HUMAN) => {
  const win = winner(board);
  if (win === aiSymbol) return 10 - depth;
  if (win === humanSymbol) return depth - 10;
  return 0;
};

/**
 * Minimax algorithm with alpha-beta pruning and depth evaluation
 */
export const minimax = (
  board,
  depth,
  isMaximizing,
  aiSymbol = AI,
  humanSymbol = HUMAN,
  alpha = -Infinity,
  beta = Infinity
) => {
  const winResult = checkWinner(board);
  if (winResult !== null || isFull(board)) {
    return score(board, depth, aiSymbol, humanSymbol);
  }

  const moves = availableMoves(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let move of moves) {
      const nextBoard = [...board];
      nextBoard[move] = aiSymbol;
      const evaluation = minimax(
        nextBoard,
        depth + 1,
        false,
        aiSymbol,
        humanSymbol,
        alpha,
        beta
      );
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of moves) {
      const nextBoard = [...board];
      nextBoard[move] = humanSymbol;
      const evaluation = minimax(
        nextBoard,
        depth + 1,
        true,
        aiSymbol,
        humanSymbol,
        alpha,
        beta
      );
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
};

/**
 * Determines the best move for AI based on chosen difficulty
 */
export const bestMove = (
  board,
  aiSymbol = AI,
  humanSymbol = HUMAN,
  difficulty = "unbeatable"
) => {
  const moves = availableMoves(board);
  if (moves.length === 0) return null;

  // Easy mode: 80% random, 20% minimax
  if (difficulty === "easy" && Math.random() < 0.8) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Medium mode: 45% random, 55% minimax
  if (difficulty === "medium" && Math.random() < 0.45) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestScore = -Infinity;
  let optimalMoves = [];

  for (let move of moves) {
    const nextBoard = [...board];
    nextBoard[move] = aiSymbol;
    const moveScore = minimax(
      nextBoard,
      0,
      false,
      aiSymbol,
      humanSymbol,
      -Infinity,
      Infinity
    );

    if (moveScore > bestScore) {
      bestScore = moveScore;
      optimalMoves = [move];
    } else if (moveScore === bestScore) {
      optimalMoves.push(move);
    }
  }

  // Randomize among equally optimal moves for natural variety
  return optimalMoves[Math.floor(Math.random() * optimalMoves.length)];
};