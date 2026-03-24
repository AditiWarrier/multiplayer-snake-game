export default function Button({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded text-white font-medium transition ${className}`}
    >
      {children}
    </button>
  );
}