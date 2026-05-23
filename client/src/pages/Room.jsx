import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import socket from "../socket";

export default function Room() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get("code");
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!roomCode) return;
    socket.setRoomCode(roomCode);
    socket.emit("joinRoom", roomCode);

    const handleGameState = (state) => {
      const snakeIds = Object.keys(state.snakes || {});
      setPlayers(snakeIds.map((id, index) => ({
        id,
        name: index === 0 ? "Host" : `Player ${index + 1}`,
        host: index === 0,
        color: state.snakes[id]?.color || "#fff"
      })));
    };

    const handleGameStarted = () => {
      window.location.href = `/game?code=${roomCode}`;
    };

    socket.on("gameState", handleGameState);
    socket.on("gameStarted", handleGameStarted);

    return () => {
      socket.off("gameState", handleGameState);
      socket.off("gameStarted", handleGameStarted);
    };
  }, [roomCode]);

  const isHost = players.length > 0 && players[0].id === socket.id;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      alert("Copied!");
    } catch {
      alert("Copy failed");
    }
  };

  const colorDot = (color) => (
    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, marginRight: 10 }} />
  );

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#e0e0e0", fontFamily: "'Courier New', monospace" }}>
      <Navbar />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "0.15em", color: "#00ff88", marginBottom: "2rem" }}>GAME ROOM</h1>

        <div style={{ background: "#111118", border: "1px solid #222", borderRadius: "4px", padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#555", fontSize: "0.7rem", letterSpacing: "0.25em", marginBottom: 4 }}>ROOM CODE</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "0.3em", color: "#ffd60a", textShadow: "0 0 20px #ffd60a66" }}>{roomCode}</div>
          </div>
          <button onClick={handleCopy} style={{ padding: "8px 16px", background: "#1a1a2e", border: "1px solid #333", borderRadius: "3px", color: "#aaa", cursor: "pointer", fontFamily: "'Courier New', monospace", fontSize: "0.75rem", letterSpacing: "0.1em" }}>COPY</button>
        </div>

        <div style={{ background: "#111118", border: "1px solid #222", borderRadius: "4px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ color: "#555", fontSize: "0.7rem", letterSpacing: "0.25em", marginBottom: "1rem" }}>PLAYERS ({players.length}/4)</div>
          {players.length === 0 && <div style={{ color: "#444", fontSize: "0.85rem" }}>Waiting for players...</div>}
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {players.map((player) => (
              <li key={player.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: player.id === socket.id ? "#0d1a14" : "#0d0d16", border: `1px solid ${player.id === socket.id ? "#00ff8833" : "#1a1a1a"}`, borderRadius: "3px" }}>
                <span>{colorDot(player.color)}{player.name}{player.id === socket.id && <span style={{ color: "#555", fontSize: "0.75rem", marginLeft: 8 }}>(you)</span>}</span>
                {player.host && <span style={{ fontSize: "0.7rem", color: "#ffd60a", letterSpacing: "0.15em" }}>HOST</span>}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          {isHost ? (
            <button onClick={() => socket.emit("startGame", roomCode)} style={{ padding: "14px 48px", background: "#00ff88", border: "none", borderRadius: "3px", color: "#000", fontWeight: 900, fontSize: "1rem", letterSpacing: "0.2em", cursor: "pointer", fontFamily: "'Courier New', monospace" }}>START GAME</button>
          ) : (
            <p style={{ color: "#555", letterSpacing: "0.15em", fontSize: "0.85rem" }}>WAITING FOR HOST...</p>
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={() => { socket.emit("leaveRoom", roomCode); socket.setRoomCode(null); window.location.href = "/lobby"; }} style={{ padding: "10px 28px", background: "transparent", border: "1px solid #ff4d6d44", borderRadius: "3px", color: "#ff4d6d", cursor: "pointer", fontFamily: "'Courier New', monospace", fontSize: "0.8rem", letterSpacing: "0.15em" }}>LEAVE ROOM</button>
        </div>
      </div>
    </div>
  );
}