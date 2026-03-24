import { Router } from 'express';
import { execFile, spawn } from 'child_process';
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import axios from 'axios';
import auth from '../middleware/auth.js';
import Session from '../models/Session.js';

const router = Router();

// ──────────────────────────────────────────────────────────────
//  Language configuration
// ──────────────────────────────────────────────────────────────
export const LANGUAGES = {
  javascript:  { name: 'JavaScript (Node.js)', ext: 'js',   local: true },
  typescript:  { name: 'TypeScript',           ext: 'ts',   local: false },
  python:      { name: 'Python 3',             ext: 'py',   local: true },
  java:        { name: 'Java',                 ext: 'java', local: false },
  cpp:         { name: 'C++',                  ext: 'cpp',  local: false },
  c:           { name: 'C',                    ext: 'c',    local: false },
  csharp:      { name: 'C#',                   ext: 'cs',   local: false },
  go:          { name: 'Go',                   ext: 'go',   local: false },
  rust:        { name: 'Rust',                 ext: 'rs',   local: false },
  ruby:        { name: 'Ruby',                 ext: 'rb',   local: false },
  php:         { name: 'PHP',                  ext: 'php',  local: false },
  swift:       { name: 'Swift',                ext: 'swift', local: false },
  kotlin:      { name: 'Kotlin',               ext: 'kt',   local: false },
  dart:        { name: 'Dart',                 ext: 'dart',  local: false },
  r:           { name: 'R',                    ext: 'r',     local: false },
  scala:       { name: 'Scala',                ext: 'scala', local: false },
  perl:        { name: 'Perl',                 ext: 'pl',    local: false },
  lua:         { name: 'Lua',                  ext: 'lua',   local: false },
  bash:        { name: 'Bash',                 ext: 'sh',    local: false },
  haskell:     { name: 'Haskell',              ext: 'hs',    local: false },
  fsharp:      { name: 'F#',                   ext: 'fs',    local: false },
  elixir:      { name: 'Elixir',               ext: 'exs',   local: false },
  clojure:     { name: 'Clojure',              ext: 'clj',   local: false },
  groovy:      { name: 'Groovy',               ext: 'groovy', local: false },
};

// Piston URL (optional — used for languages not runnable locally)
const PISTON_URL = process.env.PISTON_URL || 'http://localhost:2000';

// Temp directory for code files
const TEMP_DIR = join(tmpdir(), 'smiling-code');
if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true });

// ──────────────────────────────────────────────────────────────
//  Local code runner — uses child_process for JS & Python
//  No Docker, no API key, works instantly on any machine
// ──────────────────────────────────────────────────────────────
function runLocal(code, language, stdin = '') {
  return new Promise((resolve) => {
    const id = randomUUID().slice(0, 8);
    const ext = LANGUAGES[language].ext;
    const filePath = join(TEMP_DIR, `run_${id}.${ext}`);

    writeFileSync(filePath, code, 'utf-8');

    let cmd, args;
    if (language === 'javascript') {
      cmd = 'node';
      args = [filePath];
    } else if (language === 'python') {
      // Try 'python' first (Windows), fallback is handled by execFile error
      cmd = process.platform === 'win32' ? 'python' : 'python3';
      args = [filePath];
    } else {
      cleanup(filePath);
      return resolve({ output: 'Language not supported locally', status: 'Error', exitCode: 1 });
    }

    const child = spawn(cmd, args, {
      timeout: 15000, // 15 second limit
      maxBuffer: 1024 * 1024, // 1MB output limit
      env: { ...process.env, NODE_NO_WARNINGS: '1' },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    // Send stdin if provided
    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    } else {
      child.stdin.end();
    }

    child.on('close', (exitCode) => {
      cleanup(filePath);

      if (exitCode === null) {
        // Process was killed (timeout)
        return resolve({
          output: '⏱️ Execution timed out (15s limit).',
          status: 'Time Limit Exceeded',
          exitCode: 1,
        });
      }

      const output = stdout || stderr || '(no output)';
      const status = exitCode === 0 ? 'Accepted' : 'Runtime Error';
      resolve({ output, status, exitCode });
    });

    child.on('error', (err) => {
      cleanup(filePath);
      if (err.code === 'ENOENT') {
        resolve({
          output: `❌ "${cmd}" not found on this system.\n\nInstall ${language === 'python' ? 'Python 3' : 'Node.js'} and make sure it's in your PATH.`,
          status: 'Error',
          exitCode: 1,
        });
      } else {
        resolve({ output: `❌ ${err.message}`, status: 'Error', exitCode: 1 });
      }
    });
  });
}

function cleanup(filePath) {
  try { unlinkSync(filePath); } catch {}
}

// ──────────────────────────────────────────────────────────────
//  Piston runner — for other languages (when Piston Docker is up)
// ──────────────────────────────────────────────────────────────
async function runPiston(code, language, stdin = '') {
  const response = await axios.post(
    `${PISTON_URL}/api/v2/execute`,
    {
      language: language,
      version: '*',
      files: [{ name: 'main', content: code }],
      stdin: stdin || '',
      args: [],
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    }
  );

  const { run, compile } = response.data;

  if (compile && compile.code !== 0) {
    return {
      output: compile.stderr || compile.output || 'Compilation failed',
      status: 'Compilation Error',
      exitCode: compile.code,
    };
  }

  return {
    output: run.stdout || run.stderr || run.output || '(no output)',
    status: run.code === 0 ? 'Accepted' : 'Runtime Error',
    exitCode: run.code,
  };
}

// ──────────────────────────────────────────────────────────────
//  POST /api/execute
// ──────────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { code, language, stdin, roomId } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }

    const langConfig = LANGUAGES[language];
    if (!langConfig) {
      return res.status(400).json({ message: `Unsupported language: ${language}` });
    }

    let result;

    // Strategy: use local runner for JS/Python, Piston for everything else
    if (langConfig.local) {
      // 🚀 Local execution — instant, no Docker needed
      result = await runLocal(code, language, stdin);
    } else {
      // 🐳 Try Piston for other languages
      try {
        result = await runPiston(code, language, stdin);
      } catch (pistonErr) {
        if (pistonErr.code === 'ECONNREFUSED') {
          return res.status(503).json({
            output: `⚠️ "${langConfig.name}" requires the Piston code engine.\n\nTo enable it:\n  1. docker-compose up piston -d\n  2. Wait ~30s, then try again\n\n✅ JavaScript & Python always work without Docker!`,
            status: 'Service Unavailable',
          });
        }
        throw pistonErr;
      }
    }

    // Save session history (non-blocking)
    if (roomId) {
      Session.create({
        roomId,
        userId: req.user.id,
        code,
        language,
        output: `[${result.status}]\n${result.output}`,
      }).catch(() => {});
    }

    return res.json(result);
  } catch (err) {
    console.error('Execute error:', err.response?.data || err.message);
    res.status(500).json({
      output: '❌ Execution failed. Check server logs.',
      status: 'Error',
    });
  }
});

// GET /api/execute/languages
router.get('/languages', (_req, res) => {
  const langs = Object.entries(LANGUAGES).map(([key, val]) => ({
    key,
    name: val.name,
    local: val.local,
  }));
  res.json(langs);
});

export default router;
