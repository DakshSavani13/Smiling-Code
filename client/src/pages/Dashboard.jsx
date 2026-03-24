import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { Plus, Users, Clock, Code2, Copy, Check, Globe, Search, Sparkles } from 'lucide-react';
import './Dashboard.css';

const LANGUAGES = [
  'javascript', 'python', 'java', 'cpp', 'typescript',
  'go', 'rust', 'csharp', 'ruby', 'php',
];

const langDisplayNames = {
  javascript: 'JavaScript', python: 'Python', java: 'Java',
  cpp: 'C++', typescript: 'TypeScript', go: 'Go',
  rust: 'Rust', csharp: 'C#', ruby: 'Ruby', php: 'PHP',
};

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function CopiedLink({ roomId }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/room/${roomId}`;

  const copy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className="btn btn-secondary btn-sm copy-btn" onClick={copy} title="Copy room link">
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [creating, setCreating] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/rooms').then((res) => setRooms(res.data)).finally(() => setLoading(false));
  }, []);

  const createRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/rooms', { name: roomName, language });
      navigate(`/room/${res.data.roomId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (joinId.trim()) navigate(`/room/${joinId.trim()}`);
  };

  const langColor = {
    javascript: '#f7df1e', python: '#3776ab', java: '#ed8b00',
    cpp: '#00599c', typescript: '#3178c6', go: '#00add8',
    rust: '#dea584', csharp: '#9b4f96', ruby: '#cc342d', php: '#777bb4',
  };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page dashboard page-enter">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1>Welcome, <span className="dash-username">{user?.username}</span> 👋</h1>
          <p>Your collaborative coding rooms</p>
        </div>
        <div className="dash-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Room
          </button>
        </div>
      </div>

      {/* Search + Join */}
      <div className="dash-bar-row">
        {rooms.length > 0 && (
          <div className="search-bar glass-card">
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              className="input-field search-input"
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
        <form className="join-bar glass-card" onSubmit={joinRoom}>
          <Globe size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            className="input-field join-input"
            placeholder="Enter room ID to join..."
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
          />
          <button className="btn btn-secondary btn-sm" type="submit">Join Room</button>
        </form>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : filteredRooms.length === 0 && rooms.length > 0 ? (
        <div className="empty-state glass-card">
          <Search size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <h3>No rooms match "{search}"</h3>
          <p>Try a different search term</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="empty-state glass-card">
          <div className="empty-icon-wrapper">
            <Sparkles size={48} className="empty-sparkle" />
          </div>
          <h3>No rooms yet</h3>
          <p>Create your first room to start collaborating</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Room
          </button>
        </div>
      ) : (
        <div className="rooms-grid">
          {filteredRooms.map((room, index) => (
            <Link
              to={`/room/${room.roomId}`}
              key={room._id}
              className="room-card glass-card"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="room-card-header">
                <div className="room-lang-dot" style={{ background: langColor[room.language] || '#667eea' }} />
                <span className="room-lang-badge">{langDisplayNames[room.language] || room.language}</span>
                <CopiedLink roomId={room.roomId} />
              </div>
              <h3 className="room-name">{room.name}</h3>
              <div className="room-meta">
                <span><Users size={13} /> {room.participants?.length || 1} member{room.participants?.length !== 1 ? 's' : ''}</span>
                <span><Clock size={13} /> {timeAgo(room.updatedAt || room.createdAt)}</span>
              </div>
              <div className="room-id-chip">
                <code>{room.roomId.slice(0, 18)}…</code>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Room Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Room</h2>
            <form onSubmit={createRoom} className="modal-form">
              <div className="input-group">
                <label>Room Name</label>
                <input
                  className="input-field"
                  placeholder="My Awesome Project"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="input-group">
                <label>Language</label>
                <select
                  className="select-field"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{langDisplayNames[l]}</option>
                  ))}
                </select>
              </div>
              <div className="modal-btns">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
