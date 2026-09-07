Tic‑Tac‑Toe Minimax
A modern, glass‑morphic Tic‑Tac‑Toe web app built with React that features an unbeatable Minimax AI (with Alpha‑Beta pruning). 
The UI follows a dark, neon‑accented design with smooth animations, responsive layout, and equal‑sized board cells.

# Clone the repo
git clone https://github.com/Priyan304/tictactoe.git
cd tictactoe

# Install dependencies
npm install

npm start

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
