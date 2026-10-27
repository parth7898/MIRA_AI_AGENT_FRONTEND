export default function MessageBubble({ message, displayName = 'You' }) {
  return (
    <article className={`message-row message-row--${message.role}`}>
      {message.role === 'assistant' && <span className="message-avatar mira-avatar--small" aria-hidden="true">M</span>}
      <div className={`message-bubble message-bubble--${message.role}${message.pending ? ' pending' : ''}`}>
        <p>{message.content}</p>
        {message.imageUrl && (
          <img
            className="message-image"
            src={message.imageUrl}
            alt="A fictional AI-generated portrait of Mira"
            loading="lazy"
          />
        )}
      </div>
      {message.role === 'user' && <span className="message-avatar message-avatar--user" aria-label={displayName}>{displayName.slice(0, 1).toUpperCase()}</span>}
    </article>
  );
}
