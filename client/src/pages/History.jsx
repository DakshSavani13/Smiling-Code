import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Clock, User, Code2, Terminal, History as HistoryIcon } from 'lucide-react';
import './History.css';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function History() {
  const { roomId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get(`/rooms/${roomId}/sessions`)
      .then((res) => setSessions(res.data))
      .finally(() => setLoading(false));
  }, [roomId]);

  return (
    <div className="page history-page page-enter">
      <div className="page-header history-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to={`/room/${roomId}`} className="btn btn-secondary btn-sm btn-icon">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1>Session History</h1>
            <p>Timeline of past code executions in this room</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="pulse-loader">
            <span /><span /><span />
          </div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state glass-card">
          <HistoryIcon size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <h3>No sessions yet</h3>
          <p>Run some code in the editor to see history here</p>
        </div>
      ) : (
        <div className="timeline-container">
          <div className="timeline-line" />
          <div className="history-list">
            {sessions.map((session, index) => (
              <div
                key={session._id}
                className={`history-item glass-card ${expanded === session._id ? 'expanded' : ''}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="timeline-dot" />
                <div className="history-item-header" onClick={() => setExpanded(expanded === session._id ? null : session._id)}>
                  <div className="history-meta">
                    <span className="history-lang-badge">{session.language}</span>
                    <span className="history-time">
                      <Clock size={12} />
                      {timeAgo(session.createdAt)}
                    </span>
                    <span className="history-user">
                      <User size={12} />
                      {session.userId?.username || 'Unknown'}
                    </span>
                  </div>
                  <div className="history-preview">
                    <Code2 size={13} style={{ color: 'var(--text-muted)' }} />
                    <code>{session.code?.slice(0, 60)?.replace(/\n/g, ' ')}…</code>
                  </div>
                  <span className="history-toggle">{expanded === session._id ? '▲' : '▼'}</span>
                </div>

                <div 
                  className="history-detail-wrapper" 
                  style={{ 
                    maxHeight: expanded === session._id ? '1000px' : '0',
                    opacity: expanded === session._id ? 1 : 0
                  }}
                >
                  <div className="history-detail">
                    <div className="history-code-block">
                      <div className="code-block-label"><Code2 size={12} /> Code executed</div>
                      <pre className="syntax-highlighted">{session.code}</pre>
                    </div>
                    {session.output && (
                      <div className="history-output-block">
                        <div className="code-block-label"><Terminal size={12} /> Output received</div>
                        <pre className="output-text terminal-font">{session.output}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
