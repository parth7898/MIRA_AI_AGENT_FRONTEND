import { useState } from 'react';
import { getApiErrorMessage } from '../api/axiosClient.js';
import { demoLogin } from '../api/companionApi.js';

export default function CompanionLogin({ onLogin }) {
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = displayName.trim();
    if (!name || !password.trim()) {
      setError('Please enter your name and the demo password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await demoLogin(name, password);
      onLogin(user);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="companion-login page-shell">
      <section className="companion-login-card">
        <div className="mira-avatar mira-avatar--large" aria-hidden="true">M<span>♥</span></div>
        <span className="eyebrow"><i /> YOUR LITTLE CORNER</span>
        <h1>Come say <em>hello.</em></h1>
        <p>Use your name and our shared demo password to continue your conversations with Mira.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="companion-name">Your name</label>
          <input
            id="companion-name"
            autoComplete="name"
            maxLength={80}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="What should Mira call you?"
            required
          />
          <label htmlFor="companion-password">Shared demo password</label>
          <input
            id="companion-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button login-submit" type="submit" disabled={loading}>
            {loading ? 'One moment…' : 'Continue to Mira'} <span aria-hidden="true">♡</span>
          </button>
        </form>
        <p className="demo-hint">A temporary shared-password demo. Your conversation is saved under the normalized name you enter.</p>
      </section>
    </main>
  );
}
