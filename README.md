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

## Detailed Enhancements & Features

### 🔐 1. Google OAuth Integration 
- **Backend Verification:** Installed `google-auth-library` to securely verify tokens directly with Google.
- **Account Creation Flow:** Auto-provisions accounts using Google profile names (passwords not required). Link seamlessly with existing accounts.
- **Frontend UI:** Sleek, premium Google Login buttons integrated right above standard forms.

### 🌐 2. Global Design System
- **Rich Background:** CSS grid pattern overlay with animated floating blobs for depth.
- **Page Transitions:** All pages slide/fade in smoothly on mount (`.page-enter`).
- **Feedback & Accessibility:** Branded pulsing logo spinner, color-changing focus labels, and improved toasts.

### 🏠 3. Home Page
- **Staggered Hero:** Elements slide in with cascading delays.
- **Gradient Shimmer:** The "Ship Faster" text has a slow, infinite color shifting animation.
- **Scroll Reveal:** `IntersectionObserver` fades in Stats, Features, and CTA sections precisely on scroll.
- **3D Feature Cards:** Stunning 3D perspective tilt effect on mouse hover.

### 🎛️ 4. Dashboard
- **Search & Filter:** Sleek glassmorphism search bar to filter existing rooms instantly.
- **Staggered Cards:** Room cards animate in one by one with an index-based delay.

### 🧭 5. Navbar
- **Scroll Awareness:** Navbar starts at 75% opacity and deepens to 92% with a drop shadow when scrolled down.

### 🖥️ 6. Editing Room
- **Connection Clarity:** Explicit "Connected" / "Reconnecting…" text next to pulsing connection dots.
- **Avatar Tooltips:** Hovering over avatars scales them up and reveals full usernames.

### ⚡ 7. RunPanel
- **Keyboard Shortcuts:** Support for `Ctrl + Enter` to instantly run code without clicking.
- **Terminal Polish:** Classic terminal blinking cursor during output generation, plus a quick "Copy" button.

### ⏳ 8. History Page
- **Timeline Layout:** Vertical timeline with a glowing dashed line connecting sessions and smooth maximum-height expansion.

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
