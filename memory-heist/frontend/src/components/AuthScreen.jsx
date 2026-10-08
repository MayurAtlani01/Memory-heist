import React, { useState } from 'react';
import landingBg from '../assets/landing_bg.jpg';
import landingLogo from '../assets/landing_logo_transparent.png';
import { PixelIcon } from './PixelIcon.jsx';
import { signIn, signUp } from '../services/auth.js';
import { isSupabaseConfigured } from '../services/supabase.js';

export function AuthScreen({ onAuthSuccess, onContinueAsGuest, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const configured = isSupabaseConfigured();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    if (!configured) {
      setErrorMsg('Supabase credentials not yet configured in .env. You can use "Continue as Guest" to test immediately.');
      return;
    }

    setLoading(true);
    try {
      const data = await signIn({ email: email.trim(), password });
      setSuccessMsg('Authentication confirmed. Welcome, operative!');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(data.user);
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to authenticate operative.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Check your input.');
      return;
    }

    if (!configured) {
      setErrorMsg('Supabase credentials not yet configured in .env. You can use "Continue as Guest" to test immediately.');
      return;
    }

    setLoading(true);
    try {
      const data = await signUp({
        email: email.trim(),
        password,
        username: fullName.trim()
      });
      if (data.session) {
        setSuccessMsg('Account registered! Infiltrating the system...');
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(data.user);
        }, 800);
      } else {
        setSuccessMsg('Account registered! If confirmation is required, check your email or log in now.');
        setTimeout(() => {
          setMode('login');
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-screen-wrap"
      style={{
        backgroundImage: `linear-gradient(rgba(5, 11, 24, 0.3), rgba(5, 11, 24, 0.55)), url(${landingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="auth-content">
        {/* Pixel Art Title Logo */}
        <div className="landing-logo-wrap">
          <img
            src={landingLogo}
            alt="Memory Heist"
            className="landing-logo-pixel"
          />
        </div>

        {/* Wooden Plank Signboard Header */}
        <div className="wood-banner wood-banner-auth">
          <span className="stud stud-tl" />
          <span className="stud stud-tr" />
          <span className="stud stud-bl" />
          <span className="stud stud-br" />
          <span className="wood-banner-text">
            {mode === 'login' ? 'WELCOME BACK, OPERATIVE' : 'JOIN THE OPERATIVES'}
          </span>
        </div>

        {/* Central Metallic Auth Card */}
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">
              {mode === 'login' ? 'LOGIN TO CONTINUE' : 'CREATE YOUR ACCOUNT'}
            </h2>
            <p className="auth-card-subtitle">
              {mode === 'login'
                ? 'Plan. Memorize. Infiltrate. Extract.'
                : 'Join the heist. Prove your mind.'}
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="auth-alert auth-alert-error">
              <PixelIcon name="skull" size={14} color="#FF4B4B" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert auth-alert-success">
              <PixelIcon name="star" size={14} color="#19D99B" />
              <span>{successMsg}</span>
            </div>
          )}

          {!configured && (
            <div className="auth-alert auth-alert-info">
              <span>⚠️ Supabase credentials pending in <code>.env</code>. Click &quot;Continue as Guest&quot; below to test gameplay anytime.</span>
            </div>
          )}

          {/* Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form" id="login-form">
              {/* Email */}
              <div className="auth-input-group">
                <span className="input-icon">
                  <PixelIcon name="mail" size={16} color="#6BA3C7" />
                </span>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  id="login-email"
                />
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <span className="input-icon">
                  <PixelIcon name="lock" size={16} color="#6BA3C7" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  id="login-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <PixelIcon name={showPassword ? 'eye-off' : 'eye'} size={16} color="#6BA3C7" />
                </button>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="auth-meta-row">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    className="auth-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="forgot-pass-link"
                  onClick={() => alert('Please contact mission command or check Supabase auth dashboard to reset your operative passphrase.')}
                >
                  Forgot password?
                </button>
              </div>

              {/* Gold Login CTA Button */}
              <button
                type="submit"
                className="btn btn-primary btn-cta btn-auth"
                disabled={loading}
                id="login-submit-btn"
              >
                {loading ? 'AUTHENTICATING...' : '▶ LOGIN'}
              </button>

              {/* OR Divider */}
              <div className="auth-divider">
                <span className="divider-line" />
                <span className="divider-text">OR</span>
                <span className="divider-line" />
              </div>

              {/* Continue as Guest */}
              <button
                type="button"
                className="btn btn-secondary btn-guest"
                onClick={onContinueAsGuest}
                id="continue-guest-btn"
              >
                <PixelIcon name="globe" size={16} color="#25C7FF" />
                <span>CONTINUE AS GUEST</span>
              </button>

              {/* Switch to Register link */}
              <div className="auth-switch-text">
                <span>Need operative credentials? </span>
                <button
                  type="button"
                  className="link-switch"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* Quote Footer Box */}
              <div className="auth-quote-box">
                <div className="quote-icon-wrap">
                  <PixelIcon name="scroll" size={18} />
                </div>
                <p className="quote-text">
                  &ldquo;A sharp mind opens more doors than a golden key.&rdquo;
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form" id="register-form">
              {/* Full Name */}
              <div className="auth-input-group">
                <span className="input-icon">
                  <PixelIcon name="user" size={16} color="#6BA3C7" />
                </span>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  id="register-name"
                />
              </div>

              {/* Email */}
              <div className="auth-input-group">
                <span className="input-icon">
                  <PixelIcon name="mail" size={16} color="#6BA3C7" />
                </span>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  id="register-email"
                />
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <span className="input-icon">
                  <PixelIcon name="lock" size={16} color="#6BA3C7" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  id="register-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <PixelIcon name={showPassword ? 'eye-off' : 'eye'} size={16} color="#6BA3C7" />
                </button>
              </div>

              {/* Confirm Password */}
              <div className="auth-input-group">
                <span className="input-icon">
                  <PixelIcon name="lock" size={16} color="#6BA3C7" />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  id="register-confirm-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  <PixelIcon name={showConfirmPassword ? 'eye-off' : 'eye'} size={16} color="#6BA3C7" />
                </button>
              </div>

              {/* Gold Create Account CTA Button */}
              <button
                type="submit"
                className="btn btn-primary btn-cta btn-auth"
                disabled={loading}
                id="register-submit-btn"
              >
                <PixelIcon name="user-plus" size={18} color="#1A0D04" />
                <span>{loading ? 'CREATING IDENTITY...' : 'CREATE ACCOUNT'}</span>
              </button>

              {/* OR Divider */}
              <div className="auth-divider">
                <span className="divider-line" />
                <span className="divider-text">OR</span>
                <span className="divider-line" />
              </div>

              {/* Already have an account? Login button */}
              <button
                type="button"
                className="btn btn-secondary btn-guest"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                id="back-to-login-btn"
              >
                <PixelIcon name="login-arrow" size={16} color="#FFB51B" />
                <span>ALREADY HAVE AN ACCOUNT? LOGIN</span>
              </button>

              {/* Quote Footer Box */}
              <div className="auth-quote-box">
                <div className="quote-icon-wrap">
                  <PixelIcon name="key" size={18} />
                </div>
                <p className="quote-text">
                  &ldquo;New operatives study the maps. Great operatives rewrite them.&rdquo;
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
