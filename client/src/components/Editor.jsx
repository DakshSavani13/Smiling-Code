import { useEffect, useRef, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import './Editor.css';

// Monaco language map
const monacoLang = {
  javascript: 'javascript', python: 'python', java: 'java',
  cpp: 'cpp', typescript: 'typescript', go: 'go',
  rust: 'rust', csharp: 'csharp', ruby: 'ruby', php: 'php',
  swift: 'swift', kotlin: 'kotlin', r: 'r', scala: 'scala',
  lua: 'lua', bash: 'shell', sql: 'sql', dart: 'dart',
  haskell: 'haskell', perl: 'perl',
};

// Per-room Yjs docs (singleton)
const ydocs = new Map();

// Base64 helpers (browser compatible)
function toBase64(uint8Array) {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, uint8Array.subarray(i, i + chunkSize));
  }
  return window.btoa(binary);
}

function fromBase64(base64) {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getYDoc(roomId) {
  if (!ydocs.has(roomId)) {
    ydocs.set(roomId, new Y.Doc());
  }
  return ydocs.get(roomId);
}

export default function Editor({ roomId, language, socket, codeRef }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const bindingRef = useRef(null);
  const ydoc = useRef(getYDoc(roomId));
  const ytext = useRef(ydoc.current.getText('monaco'));
  const decorationsRef = useRef([]);
  const remoteCursors = useRef({});

  // ── Sync: apply incoming Yjs updates from server & broadcast local ──
  useEffect(() => {
    const doc = ydoc.current;
    
    // Broadcast local changes
    const handleLocalUpdate = (update, origin) => {
      if (origin !== 'remote') {
        const base64 = toBase64(update);
        socket.emit('yjs-update', { roomId, update: base64 });
      }
    };
    
    doc.on('update', handleLocalUpdate);

    // Apply remote updates
    const handleRemoteSync = (base64Update) => {
      try {
        const update = fromBase64(base64Update);
        Y.applyUpdate(doc, update, 'remote');
      } catch (e) { console.error('Yjs sync error', e); }
    };

    const handleRemoteUpdate = (base64Update) => {
      try {
        const update = fromBase64(base64Update);
        Y.applyUpdate(doc, update, 'remote');
      } catch (e) { console.error('Yjs update error', e); }
    };

    socket.on('yjs-sync', handleRemoteSync);
    socket.on('yjs-update', handleRemoteUpdate);

    return () => {
      doc.off('update', handleLocalUpdate);
      socket.off('yjs-sync', handleRemoteSync);
      socket.off('yjs-update', handleRemoteUpdate);
    };
  }, [roomId, socket]);

  // ── Remote cursor updates ──
  useEffect(() => {
    const handleCursor = ({ userId, username, avatarColor, cursor }) => {
      if (!editorRef.current || !monacoRef.current) return;
      remoteCursors.current[userId] = { username, avatarColor, cursor };
      renderCursors();
    };

    const handleCursorRemove = ({ userId }) => {
      delete remoteCursors.current[userId];
      renderCursors();
    };

    socket.on('cursor-update', handleCursor);
    socket.on('cursor-remove', handleCursorRemove);
    return () => {
      socket.off('cursor-update', handleCursor);
      socket.off('cursor-remove', handleCursorRemove);
    };
  }, [socket]);

  const renderCursors = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const newDecorations = Object.entries(remoteCursors.current).map(
      ([, { username, avatarColor, cursor }]) => {
        if (!cursor) return null;
        return {
          range: new monaco.Range(cursor.lineNumber, cursor.column, cursor.lineNumber, cursor.column),
          options: {
            className: 'remote-cursor',
            beforeContentClassName: 'remote-cursor-line',
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            zIndex: 1000,
            after: {
              content: username,
              inlineClassName: 'remote-cursor-label',
              cursorStops: monaco.editor.InjectedTextCursorStops.None,
            },
          },
        };
      }
    ).filter(Boolean);

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, []);

  // ── Monaco mount ──
  const onMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const model = editor.getModel();

    // Create Monaco Binding to Yjs Text
    bindingRef.current = new MonacoBinding(
      ytext.current,
      model,
      new Set([editor])
    );

    // Keep codeRef in sync for RunPanel
    editor.onDidChangeModelContent(() => {
      if (codeRef) codeRef.current = model.getValue();
    });

    // Cursor tracking
    editor.onDidChangeCursorPosition((e) => {
      socket.emit('cursor-update', {
        roomId,
        cursor: {
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        },
      });
    });

    // Initial value for codeRef
    if (codeRef) codeRef.current = model.getValue();

  }, [roomId, socket, codeRef]);

  // Clean up binding on unmount
  useEffect(() => {
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    };
  }, []);

  return (
    <div className="editor-wrapper">
      <MonacoEditor
        height="100%"
        language={monacoLang[language] || language}
        theme="vs-dark"
        onMount={onMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 16 },
          tabSize: 2,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
