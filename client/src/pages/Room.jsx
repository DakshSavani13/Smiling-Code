import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSocket } from '../socket/socket';
import api from '../api/axios';
import Editor from '../components/Editor';
import RunPanel from '../components/RunPanel';
import { Users, Copy, Check, ArrowLeft, History } from 'lucide-react';
import './Room.css';

export default function Room() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [outputStatus, setOutputStatus] = useState('');
  const [runBy, setRunBy] = useState('');
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const codeRef = useRef('');

  const socket = getSocket();

  // Fetch room info
  useEffect(() => {
    api.get(`/rooms/${roomId}`)
      .then((res) => {
        setRoom(res.data);
        setLanguage(res.data.language || 'javascript');
      })
      .catch(() => navigate('/dashboard'));
  }, [roomId]);

  // Socket setup
  useEffect(() => {
    socket.emit('join-room', { roomId });
    setConnected(true);

    socket.on('room-users', (users) => setActiveUsers(users));

    socket.on('code-output', ({ output, status, username }) => {
      setOutput(output);
      setOutputStatus(status);
      setRunBy(username);
      setRunning(false);
    });

    socket.on('language-change', ({ language }) => setLanguage(language));

    return () => {
      socket.emit('leave-room', { roomId });
      socket.off('room-users');
      socket.off('code-output');
      socket.off('language-change');
    };
  }, [roomId]);

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    socket.emit('language-change', { roomId, language: lang });
  }, [roomId]);

  const handleRun = useCallback(async (code) => {
    const currentCode = codeRef.current;
    setRunning(true);
    setOutput('');
    try {
      const res = await api.post('/execute', { code: currentCode, language, roomId });
      socket.emit('code-output', {
        roomId,
        output: res.data.output,
        status: res.data.status,
        language,
      });
      setOutput(res.data.output);
      setOutputStatus(res.data.status);
      setRunBy(user.username);
    } catch (err) {
      const msg = err.response?.data?.output || err.response?.data?.message || 'Execution failed';
      setOutput(msg);
      setOutputStatus('Error');
    } finally {
      setRunning(false);
    }
  }, [language, roomId, user]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="room-page">
      {/* Room Topbar */}
      <div className="room-topbar">
        <div className="room-topbar-left">
          <Link to="/dashboard" className="btn btn-secondary btn-sm btn-icon">
            <ArrowLeft size={16} />
          </Link>
          <div className="room-info">
            <h2 className="room-title">{room?.name || 'Loading...'}</h2>
            <div className="connection-indicator">
              <div className={`connection-dot ${connected ? 'connected' : ''}`} />
              <span className={`connection-label ${connected ? 'connected' : ''}`}>
                {connected ? 'Connected' : 'Reconnecting…'}
              </span>
            </div>
          </div>
        </div>

        <div className="room-topbar-right">
          {/* Active users */}
          <div className="active-users">
            {activeUsers.slice(0, 5).map((u) => (
              <div
                key={u.socketId}
                className="user-avatar-chip"
                style={{ background: u.avatarColor }}
                title={u.username}
              >
                {u.username[0].toUpperCase()}
                <span className="avatar-tooltip">{u.username}</span>
              </div>
            ))}
            {activeUsers.length > 5 && (
              <div className="user-avatar-chip user-overflow">+{activeUsers.length - 5}</div>
            )}
            <span className="users-count">
              <Users size={13} /> {activeUsers.length}
            </span>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={copyLink}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Share'}
          </button>

          <Link to={`/history/${roomId}`} className="btn btn-secondary btn-sm">
            <History size={14} /> History
          </Link>
        </div>
      </div>

      {/* Editor + Panel */}
      <div className="room-body">
        <div className="editor-container">
          <Editor
            roomId={roomId}
            language={language}
            socket={socket}
            codeRef={codeRef}
          />
        </div>
        <div className="run-panel-container">
          <RunPanel
            language={language}
            onLanguageChange={handleLanguageChange}
            onRun={handleRun}
            output={output}
            outputStatus={outputStatus}
            runBy={runBy}
            running={running}
          />
        </div>
      </div>
    </div>
  );
}
