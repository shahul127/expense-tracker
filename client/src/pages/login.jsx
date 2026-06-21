import { useState } from 'react';
import api, { setAccessToken } from '../api/axios';

function Login({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/send-otp', { phone });
      setStep('otp'); // move to OTP input screen
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', { phone, otp });
      setAccessToken(res.data.accessToken); // store the access token in memory
      onLogin(); // tell App.jsx "user is now logged in"
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>💸 Expense Tracker</h2>

        {step === 'phone' ? (
          <>
            <p style={styles.subtitle}>Enter your phone number to continue</p>
            <input
              style={styles.input}
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
            />
            <button
              style={styles.button}
              onClick={handleSendOtp}
              disabled={loading || phone.length !== 10}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <p style={styles.subtitle}>OTP sent to +91 {phone}</p>
            <input
              style={styles.input}
              type="number"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
            <button
              style={styles.button}
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              style={styles.linkButton}
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
            >
              ← Change number
            </button>
          </>
        )}

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: { margin: 0, textAlign: 'center', fontSize: '1.5rem' },
  subtitle: { margin: 0, color: '#666', fontSize: '0.9rem', textAlign: 'center' },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textAlign: 'left',
  },
  error: { color: '#dc2626', fontSize: '0.85rem', margin: 0 },
};

export default Login;