import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Code2, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login, loginWithGoogle } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
        <h1 className="auth-title">{success ? 'Welcome back!' : 'Welcome back'}</h1>
        <p className="auth-subtitle">{success ? 'Redirecting to dashboard…' : 'Sign in to continue coding together'}</p>

        {!success && (
          <>
            {error && <div className="auth-error">{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="pill"
              />
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', display: 'flex', alignItems: 'center' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0 15px' }} />
              OR CONTINUE WITH EMAIL
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0 15px' }} />
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
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
                    autoFocus
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account? <Link to="/register">Create one →</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
