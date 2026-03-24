# 🙂 Smiling Code

> A browser-based collaborative code editor — multiple users join a room via a shared link and edit code simultaneously with **live cursors**, **syntax highlighting**, and a **Run Code** button.

---

## ✨ Features

- **Real-time sync** — Powered by Yjs CRDT. Every keystroke is merged conflict-free.
- **Live cursors** — See teammates' cursors with colored labels in real-time.
- **40+ languages** — JavaScript, Python, Java, C++, Go, Rust, TypeScript, and more.
- **Code execution** — Run code via Judge0 API. Output shared with the whole room.
- **Auth + Rooms** — JWT-based login, room creation, shareable links.
- **Session history** — Browse past code runs per room.

---

## 🏗️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Monaco Editor |
| Real-time sync | Yjs (CRDT), Socket.io |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Sessions | Redis |
| Code execution | Judge0 API |

---

## 🚀 Quick Start (Local — No Docker)

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017
- Redis running locally on port 6379

### 1. Clone & install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your values
```

**Key `.env` values:**

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/smiling-code
JWT_SECRET=your_secret_key_here
JUDGE0_API_KEY=your_rapidapi_key_here   # Get free key at rapidapi.com
CLIENT_URL=http://localhost:5173
```

> **Get a Judge0 API key:** Go to [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce), subscribe to the free plan, copy your key.

### 3. Run

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🐳 Quick Start (Docker)

```bash
# Start everything
docker-compose up -d

# Frontend still runs locally:
cd client && npm install && npm run dev
```

---

## 📁 Folder Structure

```
smiling-code/
├── server/              # Node.js + Express + Socket.io backend
│   └── src/
│       ├── config/      # MongoDB connection
│       ├── middleware/  # JWT auth middleware
│       ├── models/      # User, Room, Session schemas
│       ├── routes/      # REST API routes
│       └── socket/      # Socket.io + Yjs handlers
│
├── client/              # React 18 + Vite frontend
│   └── src/
│       ├── components/  # Editor, RunPanel, Navbar
│       ├── contexts/    # AuthContext
│       ├── pages/       # Home, Dashboard, Room, History
│       └── socket/      # Socket.io singleton
│
└── docker-compose.yml
```

---

## 🔑 API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/rooms` | Create room |
| GET | `/api/rooms` | List rooms |
| GET | `/api/rooms/:id` | Get room |
| GET | `/api/rooms/:id/sessions` | Session history |
| POST | `/api/execute` | Run code |
| GET | `/api/execute/languages` | List languages |

---

## 🔌 Socket Events

| Event | Direction | Description |
|---|---|---|
| `join-room` | Client → Server | Join a room |
| `yjs-update` | Bidirectional | CRDT doc update |
| `yjs-sync` | Server → Client | Initial full doc state |
| `cursor-update` | Bidirectional | Cursor position |
| `room-users` | Server → Client | Active user list |
| `code-output` | Bidirectional | Execution result |
| `language-change` | Bidirectional | Language switch |

---

## 🗺️ Roadmap

- [ ] Persistent Yjs docs (Redis/MongoDB)
- [ ] Voice chat in rooms
- [ ] File tabs per room
- [ ] GitHub Gist export
- [ ] AI code suggestions
