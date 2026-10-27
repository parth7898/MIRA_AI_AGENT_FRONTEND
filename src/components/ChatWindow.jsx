import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '../api/axiosClient.js';
import {
  getCompanionHistory,
  isImageGenerationRequest,
  saveLanguagePreference,
  sendCompanionMessage,
} from '../api/companionApi.js';
import LoadingIndicator from './LoadingIndicator.jsx';
import MessageBubble from './MessageBubble.jsx';

const LANGUAGES = [
  { id: 'hi', label: 'हिंदी', prompt: 'मुझे हिंदी में बात करना पसंद है।' },
  { id: 'en', label: 'English', prompt: 'I prefer to chat in English.' },
  { id: 'hinglish', label: 'Hinglish', prompt: 'Mujhe Hinglish mein baat karna pasand hai.' },
];
const LANGUAGE_QUESTION = 'Heyy ❤️ tumse ek baat poochun? Tumhe Hindi mein baat karna pasand hai, English mein, ya Hinglish mein?';

function makeMessageId() {
  return crypto.randomUUID();
}

export default function ChatWindow({ user, onLogout }) {
  const [profile, setProfile] = useState(user);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [languageSaving, setLanguageSaving] = useState(false);
  const pendingMessage = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;
    getCompanionHistory()
      .then((history) => {
        if (!active) return;
        const restored = history.map((message) => ({ ...message, id: message.id }));
        const lastMessage = restored.at(-1);
        if (lastMessage?.role === 'user') {
          pendingMessage.current = {
            turnId: lastMessage.turnId,
            content: lastMessage.content,
            displayText: lastMessage.content,
          };
          setError("Mira couldn't finish the last reply. You can retry it.");
        }
        if (!user.language) {
          restored.push({ id: 'language-question', role: 'language-options', content: LANGUAGE_QUESTION });
        }
        setMessages(restored);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status === 401) void onLogout();
        else setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [onLogout, user.id, user.language]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const handleLogout = useCallback(async () => {
    try {
      await onLogout();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }, [onLogout]);

  const submitMessage = useCallback(async (text, {
    turnId = makeMessageId(),
    displayText = text,
    alreadyVisible = false,
    allowWithoutLanguage = false,
  } = {}) => {
    const content = text.trim();
    if (!content || sending || (!profile.language && !allowWithoutLanguage)) return;
    const pending = { turnId, content, displayText };
    pendingMessage.current = pending;
    setError('');
    setSending(true);
    setDraft('');
    if (!alreadyVisible) {
      setMessages((current) => [...current, {
        id: turnId,
        turnId,
        role: 'user',
        content: displayText,
        pending: true,
      }]);
    }

    try {
      const result = await sendCompanionMessage({ turnId, message: content });
      setMessages((current) => [
        ...current.filter((item) => item.turnId !== turnId),
        result.message,
        result.reply,
      ]);
      setProfile((current) => ({ ...current, language: result.language }));
      pendingMessage.current = null;
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        await handleLogout();
      } else {
        setError(getApiErrorMessage(requestError));
      }
    } finally {
      setSending(false);
    }
  }, [handleLogout, profile.language, sending]);

  const handleSubmit = (event) => {
    event.preventDefault();
    void submitMessage(draft);
  };

  const handleLanguageSelect = async (language) => {
    if (languageSaving || sending) return;
    const selected = LANGUAGES.find((item) => item.id === language);
    if (!selected) return;
    setLanguageSaving(true);
    setError('');
    try {
      const updated = await saveLanguagePreference(language);
      setProfile(updated);
      setMessages((current) => current.filter((item) => item.id !== 'language-question'));
      await submitMessage(selected.prompt, { displayText: selected.prompt, allowWithoutLanguage: true });
    } catch (requestError) {
      if (requestError.response?.status === 401) await handleLogout();
      else setError(getApiErrorMessage(requestError));
    } finally {
      setLanguageSaving(false);
    }
  };

  const handleLanguageChange = async (event) => {
    const language = event.target.value;
    if (!language || languageSaving) return;
    setLanguageSaving(true);
    setError('');
    try {
      const updated = await saveLanguagePreference(language);
      setProfile(updated);
    } catch (requestError) {
      if (requestError.response?.status === 401) await onLogout();
      else setError(getApiErrorMessage(requestError));
    } finally {
      setLanguageSaving(false);
    }
  };

  return (
    <section className="chat-panel companion-panel" aria-label="Chat with Mira">
      <header className="chat-header companion-header">
        <div className="mira-avatar" aria-hidden="true">M<span>♥</span></div>
        <div className="companion-title">
          <strong>Mira</strong>
          <span><i className="online-dot" /> A little corner just for us</span>
        </div>
        <div className="companion-profile">
          <label className="sr-only" htmlFor="preferred-language">Chat language</label>
          {profile.language && (
            <select
              id="preferred-language"
              aria-label="Change chat language"
              value={profile.language}
              onChange={handleLanguageChange}
              disabled={languageSaving || sending}
            >
              {LANGUAGES.map((language) => <option key={language.id} value={language.id}>{language.label}</option>)}
            </select>
          )}
          <button className="nav-logout" type="button" onClick={() => void handleLogout()}>Log out</button>
        </div>
      </header>

      <div className="chat-messages companion-messages" aria-live="polite">
        <div className="chat-day-label">A LITTLE WHILE TOGETHER</div>
        {loading && <div className="companion-loading-inline"><span className="spinner" /> Loading your conversation…</div>}
        {messages.map((message) => message.role === 'language-options'
          ? (
            <div className="message-row" key={message.id}>
              <span className="message-avatar mira-avatar--small" aria-hidden="true">M</span>
              <div className="language-prompt">
                <p>{message.content}</p>
                <div className="language-options">
                  {LANGUAGES.map((language) => (
                    <button
                      type="button"
                      key={language.id}
                      onClick={() => void handleLanguageSelect(language.id)}
                      disabled={languageSaving || sending}
                    >
                      {language.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
          : <MessageBubble key={message.id} message={message} displayName={profile.displayName} />)}
        {sending && (
          <div className="message-row">
            <span className="message-avatar mira-avatar--small" aria-hidden="true">M</span>
            {isImageGenerationRequest(pendingMessage.current?.content ?? '')
              ? (
                <div className="image-progress" role="status" aria-live="polite">
                  <p>{profile.language === 'hi'
                    ? 'हम्म, एक मिनट जी… देखूँ क्या तुम्हारे लिए एक प्यारी-सी profile image बना पाती हूँ ❤️'
                    : profile.language === 'en'
                      ? 'Hmm, give me a moment… let me see if I can make a cute profile picture for you ❤️'
                      : 'Hmm, ek minute ji… dekhun tumhare liye cute si profile image bana paati hoon ya nahi ❤️'}</p>
                  <LoadingIndicator label="Mira is working on an image" />
                </div>
              )
              : <LoadingIndicator label="Mira is thinking" />}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="chat-error" role="alert">
          <span>{error}</span>
          {pendingMessage.current && (
            <button
              type="button"
              onClick={() => void submitMessage(pendingMessage.current.content, {
                ...pendingMessage.current,
                alreadyVisible: true,
              })}
            >
              Retry
            </button>
          )}
        </div>
      )}

      <form className="chat-composer companion-composer" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="chat-message">Message Mira</label>
        <input
          id="chat-message"
          type="text"
          placeholder={profile.language ? 'Tell Mira what’s on your mind…' : 'Choose your language to start chatting…'}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={sending || loading || !profile.language}
          maxLength={4000}
        />
        <button className="send-button" type="submit" disabled={sending || loading || !profile.language || !draft.trim()} aria-label="Send message">
          <span>Send</span><span aria-hidden="true">♡</span>
        </button>
      </form>
      <p className="chat-footnote">Mira is your virtual AI companion · Conversation saved privately for this demo profile</p>
    </section>
  );
}
