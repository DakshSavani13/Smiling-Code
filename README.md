# Smiling Code

Welcome to **Smiling Code**, a premium, real-time collaborative code editor with a stunning dark-theme glassmorphism UI.

![Smiling Code Homepage](docs/assets/homepage.png)

## Features

- **Real-Time Collaboration:** Powered by Yjs and socket.io, multiple users can type in the same room simultaneously with zero latency.
- **Advanced Code Execution:** Instantly run your code in over 40+ languages natively within the browser using the Piston API. 
- **Premium UI/UX:** A beautifully polished interface featuring spring animations, a glowing grid background, and staggered entrance effects.
- **Terminal Integration:** A sleek, resizable Run Panel that mimics a real terminal, complete with loading cursors and `Ctrl+Enter` shortcuts.
- **Secure Authentication:** JWT-based login and registration flows with dynamic password strength indicators and beautifully animated toast notifications.

## 🎥 Walkthrough

Check out the UI and collaboration features in action:

![Smiling Code Walkthrough](docs/assets/walkthrough.webp)

## Tech Stack

- **Frontend:** React 18, Vite, Monaco Editor, Lucide Icons, pure CSS animations.
- **Backend:** Node.js, Express, Socket.io.
- **Database:** MongoDB, Mongoose.
- **Code Execution:** Piston API.
- **CRDT Sync:** Yjs, y-monaco.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
3. Set up your `.env` variables (e.g., `MONGO_URI`, `JWT_SECRET`).
4. Start the servers:
   ```bash
   cd server && npm run dev
   cd client && npm run dev
   ```
5. Open `http://localhost:5173` in your browser.
