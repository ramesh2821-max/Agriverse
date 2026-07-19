export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="state-message">
      <div className="eyebrow">{label}</div>
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message, actionLabel, onAction }) {
  return (
    <div className="state-message">
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {actionLabel && onAction && (
        <button className="btn btn-outline" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default LoadingState;
