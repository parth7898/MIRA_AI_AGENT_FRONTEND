export default function LoadingIndicator({ label = 'BooklyAI is thinking' }) {
  return (
    <div className="typing-indicator" role="status" aria-label={label}>
      <span />
      <span />
      <span />
    </div>
  );
}
