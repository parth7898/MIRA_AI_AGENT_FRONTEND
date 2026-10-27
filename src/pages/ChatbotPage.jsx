import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/axiosClient.js';
import { demoLogout, getCurrentUser } from '../api/companionApi.js';
import ChatWindow from '../components/ChatWindow.jsx';
import CompanionLogin from './CompanionLogin.jsx';

export default function ChatbotPage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((requestError) => {
        if (active && requestError.response?.status !== 401) setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => { active = false; };
  }, []);

  const handleLogout = useCallback(async () => {
    await demoLogout();
    setUser(null);
  }, []);

  return (
    <>
      {checking && <main className="companion-loading page-shell"><span className="spinner" /> Checking your saved session…</main>}
      {!checking && error && !user && (
        <main className="companion-login page-shell">
          <section className="companion-login-card">
            <p className="form-error" role="alert">{error}</p>
            <button className="primary-button" type="button" onClick={() => window.location.reload()}>Try again</button>
          </section>
        </main>
      )}
      {!checking && !error && !user && <CompanionLogin onLogin={setUser} />}
      {!checking && user && <main className="chat-page page-shell"><ChatWindow key={user.id} user={user} onLogout={handleLogout} /></main>}
    </>
  );
}
