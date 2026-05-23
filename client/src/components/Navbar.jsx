import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("roomCode");
    navigate("/");
  };

  return (
    <nav style={{ background: "#0d0d16", borderBottom: "1px solid #1a1a2e", padding: "0 2rem", height: 56, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Courier New', monospace" }}>
      <div style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "0.2em", color: "#00ff88", textShadow: "0 0 20px #00ff8855" }}>SNAKE ARENA</div>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link to="/lobby" style={{ color: "#555", textDecoration: "none", fontSize: "0.8rem", letterSpacing: "0.15em" }}>LOBBY</Link>
        <Link to="/leaderboard" style={{ color: "#555", textDecoration: "none", fontSize: "0.8rem", letterSpacing: "0.15em" }}>LEADERBOARD</Link>
        <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #ff4d6d33", borderRadius: "3px", color: "#ff4d6d", padding: "5px 14px", cursor: "pointer", fontFamily: "'Courier New', monospace", fontSize: "0.75rem", letterSpacing: "0.15em" }}>LOGOUT</button>
      </div>
    </nav>
  );
}