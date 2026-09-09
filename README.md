# Tic‑Tac‑Toe Minimax 

A modern, glass‑morphic Tic‑Tac‑Toe web app built with **React** that features an **unbeatable Minimax AI** (with Alpha‑Beta pruning). The UI follows a dark, neon‑accented design with smooth animations, responsive layout, and equal‑sized board cells.

---

##  Features
- **Unbeatable AI** – Uses Minimax with Alpha‑Beta pruning for optimal play.
- **Multiple difficulty levels** – Easy, Medium, Unbeatable, and Player‑vs‑Player.
- **Glassmorphism UI** – Dark theme with neon glow, subtle animations, and responsive design.
- **Sound effects** – Click and win sounds powered by the Web Audio API.
- **Persistence** – Scores are saved to `localStorage`.
- **Responsive** – Works on desktop and mobile devices.
- **Full test coverage** – Includes unit tests for game logic.

---

## Demo
[Live demo (GitHub Pages)](https://priyan304.github.io/tictactoe)

---

## Installation
```bash
# Clone the repo
git clone https://github.com/Priyan304/tictactoe.git
cd tictactoe

# Install dependencies
npm install
```

## Running Locally
```bash
npm start
```
Open <http://localhost:3000> in your browser.

## Building for Production
```bash
npm run build
```
The optimized static files will be placed in the `build/` folder.

---

## Project Structure
```
tictactoe-minimax/
├─ public/               # Static assets (index.html, favicon, etc.)
├─ src/
│  ├─ App.js            # Main React component, UI + state management
│  ├─ App.css           # Glassmorphic styling and animations
│  ├─ gamelogic.js      # Minimax algorithm, win detection, board utilities
│  ├─ index.js          # React entry point
│  └─ index.css         # Global styles
├─ .gitignore            # Ignores node_modules, build, env files, logs
├─ package.json          # Project metadata & scripts
└─ README.md            # This file
```

---

## How to Play
1. Choose a game mode (Player vs Player, Easy AI, Medium AI, Unbeatable AI).
2. Click an empty cell to place your mark (X or O).
3. The AI will calculate its move (you’ll see a short "thinking" animation).
4. The first to align three marks horizontally, vertically, or diagonally wins.
5. Scores are tracked across sessions.

---

## Testing
```bash
npm test
```
Runs the Jest test suite located in `src/__tests__/`.

---

Credits & Acknowledgements
- **React** – UI library
- **Create‑React‑App** – Boilerplate tooling
- **Minimax algorithm** – Classic game‑tree search technique





