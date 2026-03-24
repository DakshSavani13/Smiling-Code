import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Code2, User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import './Auth.css';

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', color: '#f5576c' };
  if (score <= 3) return { level: 2, label: 'Medium', color: '#fb923c' };
  return { level: 3, label: 'Strong', color: '#4ade80' };
}

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-In failed.');
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful.');
  };

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await register(username, email, password);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-card glass-card ${success ? 'auth-success' : ''}`}>
        <div className="auth-logo">
          {success ? <CheckCircle size={28} /> : <Code2 size={28} />}
        </div>
        <h1 className="auth-title">{success ? 'Account created!' : 'Create account'}</h1>
        <p className="auth-subtitle">{success ? 'Redirecting to dashboard…' : 'Join and start collaborating instantly'}</p>

        {!success && (
          <>
            {error && <div className="auth-error">{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="pill"
                text="signup_with"
              />
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', display: 'flex', alignItems: 'center' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0 15px' }} />
              OR CONTINUE WITH EMAIL
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0 15px' }} />
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label>Username</label>
                <div className="input-with-icon">
                  <User size={16} />
                  <input
                    className="input-field"
                    type="text"
                    placeholder="coolcoder42"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={30}
                    autoFocus
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Email</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    className="input-field"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={16} />
                  <input
                    className="input-field"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                {password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${(strength.level / 3) * 100}%`,
                          background: strength.color,
                        }}
                      />
                    </div>
                    <span className="strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <>Create Account <ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in →</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
