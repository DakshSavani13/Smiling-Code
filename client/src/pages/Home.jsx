import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Code2, Users, Zap, Globe, GitMerge, Play } from 'lucide-react';
import './Home.css';

const features = [
  {
    icon: <Users size={24} />,
    title: 'Real-Time Collaboration',
    desc: 'Multiple users edit simultaneously with live cursors — like Google Docs for code.',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
  },
  {
    icon: <GitMerge size={24} />,
    title: 'Conflict-Free Sync',
    desc: 'Powered by Yjs CRDT — every keystroke merges perfectly, no conflicts ever.',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
  },
  {
    icon: <Play size={24} />,
    title: 'Run Code Instantly',
    desc: 'Execute in 40+ languages directly in the browser. See output shared with the room.',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
  },
  {
    icon: <Code2 size={24} />,
    title: 'Monaco Editor',
    desc: 'The same editor that powers VS Code — syntax highlighting, autocomplete, themes.',
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
  },
  {
    icon: <Zap size={24} />,
    title: 'Instant Rooms',
    desc: 'Create a room in one click. Share the link. Everyone joins — no install needed.',
    gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
  },
  {
    icon: <Globe size={24} />,
    title: '40+ Languages',
    desc: 'JavaScript, Python, Java, C++, Go, Rust, TypeScript and many more.',
    gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  },
];

const languages = ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'TypeScript', 'Ruby', 'Swift', 'Kotlin'];

const stats = [
  { value: 40, suffix: '+', label: 'Languages' },
  { value: 100, suffix: '%', label: 'Free' },
  { value: 0, suffix: 'ms', label: 'Conflict', prefix: '' },
];

// Animated counter hook
function useCountUp(target, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// Feature card with 3D tilt
function FeatureCard({ icon, title, desc, gradient, delay }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) card.style.transform = '';
  };

  return (
    <div
      ref={cardRef}
      className="feature-card glass-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="feature-icon" style={{ background: gradient }}>
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

export default function Home() {
  const featuresRef = useScrollReveal();
  const statsRef = useScrollReveal();
  const ctaRef = useScrollReveal();
  const [statsVisible, setStatsVisible] = useState(false);

  const count1 = useCountUp(stats[0].value, 1200, statsVisible);
  const count2 = useCountUp(stats[1].value, 1200, statsVisible);
  const count3 = useCountUp(stats[2].value, 1200, statsVisible);
  const counts = [count1, count2, count3];

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero stagger-enter">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Now live — collaborative editing for teams
        </div>
        <h1 className="hero-title">
          Code Together,<br />
          <span className="hero-gradient">Ship Faster</span>
        </h1>
        <p className="hero-subtitle">
          A real-time collaborative code editor with live cursors, syntax highlighting,
          and instant code execution — built for teams who ship.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Coding Free →
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>
        {/* Code preview window */}
        <div className="hero-preview">
          <div className="preview-bar">
            <div className="preview-dots">
              <span style={{ background: '#ff5f57' }} />
              <span style={{ background: '#febc2e' }} />
              <span style={{ background: '#28c840' }} />
            </div>
            <span className="preview-title">room/awesome-project</span>
            <div className="preview-users">
              {['#667eea', '#f093fb', '#4facfe'].map((c, i) => (
                <span key={i} className="preview-avatar" style={{ background: c, marginLeft: i > 0 ? -8 : 0 }} />
              ))}
              <span className="preview-user-count">3 online</span>
            </div>
          </div>
          <div className="preview-code">
            <div className="preview-line">
              <span className="lnum">1</span>
              <span className="kw">async function</span>
              <span className="fn"> fetchUsers</span>
              <span className="punc">() {'{'}</span>
            </div>
            <div className="preview-line">
              <span className="lnum">2</span>
              <span className="indent" />
              <span className="kw">const</span>
              <span className="var"> response </span>
              <span className="op">=</span>
              <span className="kw"> await </span>
              <span className="fn">fetch</span>
              <span className="punc">(</span>
              <span className="str">'/api/users'</span>
              <span className="punc">);</span>
              <span className="preview-cursor" style={{ background: '#667eea' }}>|</span>
              <span className="preview-cursor-label" style={{ background: '#667eea' }}>Alex</span>
            </div>
            <div className="preview-line">
              <span className="lnum">3</span>
              <span className="indent" />
              <span className="kw">const</span>
              <span className="var"> data </span>
              <span className="op">=</span>
              <span className="kw"> await </span>
              <span className="var">response</span>
              <span className="punc">.</span>
              <span className="fn">json</span>
              <span className="punc">();</span>
              <span className="preview-cursor" style={{ background: '#f093fb' }}>|</span>
              <span className="preview-cursor-label" style={{ background: '#f093fb' }}>Priya</span>
            </div>
            <div className="preview-line">
              <span className="lnum">4</span>
              <span className="indent" />
              <span className="kw">return</span>
              <span className="var"> data</span>
              <span className="punc">;</span>
            </div>
            <div className="preview-line">
              <span className="lnum">5</span>
              <span className="punc">{'}'}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* Stats */}
      <section className="stats-section reveal" ref={statsRef}>
        {stats.map((s, i) => (
          <div className="stat-item" key={i}>
            <span className="stat-value">{s.prefix || ''}{counts[i]}{s.suffix}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      <div className="gradient-divider" />

      {/* Features */}
      <section className="features reveal" ref={featuresRef}>
        <h2 className="section-title">Everything your team needs</h2>
        <p className="section-subtitle">From a 2-minute standup to a 2-week hackathon — Smiling Code scales with you.</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="langs-section">
        <h2 className="section-title">40+ Languages Supported</h2>
        <div className="langs-scroll">
          {[...languages, ...languages].map((lang, i) => (
            <span key={i} className="lang-pill">{lang}</span>
          ))}
        </div>
      </section>

      <div className="gradient-divider" />

      {/* CTA */}
      <section className="cta-section reveal" ref={ctaRef}>
        <div className="cta-card glass-card">
          <h2>Ready to code together?</h2>
          <p>Create your first room in 30 seconds.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Free →
          </Link>
        </div>
      </section>

      <footer className="footer">
        <p>Smiling Code © 2024 · Built with React, Yjs, Socket.io & ❤️</p>
      </footer>
    </div>
  );
}
