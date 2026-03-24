import { useState, useEffect } from 'react';
import { Play, ChevronDown, Terminal, Loader2, User, Copy, Check, Command } from 'lucide-react';
import './RunPanel.css';

const LANGUAGES = [
  { key: 'javascript', name: 'JavaScript' },
  { key: 'typescript', name: 'TypeScript' },
  { key: 'python', name: 'Python 3' },
  { key: 'java', name: 'Java' },
  { key: 'cpp', name: 'C++' },
  { key: 'c', name: 'C' },
  { key: 'csharp', name: 'C#' },
  { key: 'go', name: 'Go' },
  { key: 'rust', name: 'Rust' },
  { key: 'ruby', name: 'Ruby' },
  { key: 'swift', name: 'Swift' },
  { key: 'kotlin', name: 'Kotlin' },
  { key: 'php', name: 'PHP' },
  { key: 'r', name: 'R' },
  { key: 'scala', name: 'Scala' },
  { key: 'perl', name: 'Perl' },
  { key: 'lua', name: 'Lua' },
  { key: 'bash', name: 'Bash' },
  { key: 'dart', name: 'Dart' },
  { key: 'haskell', name: 'Haskell' },
  { key: 'sql', name: 'SQL' },
  { key: 'clojure', name: 'Clojure' },
  { key: 'elixir', name: 'Elixir' },
  { key: 'erlang', name: 'Erlang' },
];

const statusColors = {
  'Accepted': '#4ade80',
  'Wrong Answer': '#f87171',
  'Time Limit Exceeded': '#fb923c',
  'Runtime Error': '#f87171',
  'Compilation Error': '#f87171',
  'Error': '#f87171',
  'Service Unavailable': '#facc15',
};

export default function RunPanel({ language, onLanguageChange, onRun, output, outputStatus, runBy, running }) {
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [copied, setCopied] = useState(false);

  // Keyboard shortcut: Ctrl+Enter to run
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRun]);

  const handleRun = () => {
    onRun();
  };

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor = statusColors[outputStatus] || 'var(--text-muted)';

  return (
    <div className="run-panel">
      {/* Language selector */}
      <div className="run-panel-section">
        <label className="run-label">Language</label>
        <div className="lang-selector">
          <select
            className="select-field lang-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.key} value={l.key}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stdin toggle */}
      <div className="run-panel-section">
        <button
          className="stdin-toggle"
          onClick={() => setShowStdin(!showStdin)}
        >
          <ChevronDown size={14} style={{ transform: showStdin ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          Standard Input (stdin)
        </button>
        {showStdin && (
          <textarea
            className="stdin-area input-field"
            placeholder="Enter input for your program..."
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={4}
          />
        )}
      </div>

      {/* Run Button */}
      <div className="run-panel-section">
        <RunButton onClick={handleRun} running={running} />
        <div className="shortcut-hint">
          <Command size={11} />
          <span>Ctrl + Enter</span>
        </div>
      </div>

      {/* Output */}
      <div className="run-panel-section output-section">
        <div className="output-header">
          <Terminal size={14} />
          <span>Output</span>
          {outputStatus && (
            <span className="output-status" style={{ color: statusColor }}>
              ● {outputStatus}
            </span>
          )}
          {runBy && (
            <span className="run-by">
              <User size={11} /> {runBy}
            </span>
          )}
          {output && (
            <button className="copy-output-btn" onClick={copyOutput} title="Copy output">
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          )}
        </div>
        <div className="output-area">
          {running ? (
            <div className="output-loading">
              <div className="terminal-cursor-blink" />
              <span>Running code…</span>
            </div>
          ) : output ? (
            <pre className="output-text">{output}</pre>
          ) : (
            <p className="output-placeholder">Run your code to see output here…</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RunButton({ onClick, running }) {
  return (
    <button
      className={`btn btn-success run-btn ${running ? 'running' : ''}`}
      onClick={onClick}
      disabled={running}
    >
      {running ? (
        <><Loader2 size={16} className="spin-icon" /> Running…</>
      ) : (
        <><Play size={16} fill="currentColor" /> Run Code</>
      )}
    </button>
  );
}
