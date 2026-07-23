export default function Toast({ message, type }) {
  return (
    <div className={`toast toast-${type}`}>
      <span>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      {message}
    </div>
  );
}
