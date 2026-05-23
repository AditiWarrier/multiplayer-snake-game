import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import GameBoard from "../components/GameBoard";
import socket from "../socket";

export default function Game() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get("code");

  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    if (roomCode) {
      socket.setRoomCode(roomCode);
      socket.emit("joinRoom", roomCode);
      socket.emit("getState", roomCode);
    }

    const handleGameState = (state) => {
      const snakeIds = Object.keys(state.snakes || {});

      const formatted = snakeIds.map((id, index) => ({
        id,
        name: index === 0 ? "Host" : `Player ${index + 1}`,
        color: state.snakes[id]?.color,
        alive: state.snakes[id]?.alive
      }));

      setPlayers(formatted);
      setScores(state.scores || {});
    };

    socket.on("gameState", handleGameState);

    return () => {
      socket.off("gameState", handleGameState);
    };
  }, [roomCode]);

  const sortedPlayers = [...players].sort(
    (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
  );

  const colorDot = (color, alive) => (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: alive ? color : "#333",
        boxShadow: alive ? `0 0 6px ${color}` : "none",
        marginRight: 10,
        flexShrink: 0
      }}
    />
  );

  const panelStyle = {
    background: "#111118",
    border: "1px solid #1a1a2e",
    borderRadius: "4px",
    padding: "1.25rem",
    width: 180
  };

  const labelStyle = {
    color: "#444",
    fontSize: "0.65rem",
    letterSpacing: "0.25em",
    marginBottom: "0.75rem"
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#e0e0e0", fontFamily: "'Courier New', monospace" }}>
      <Navbar />

      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "1.5rem", padding: "2rem 1rem", flexWrap: "wrap" }}>

        <div style={panelStyle}>
          <div style={labelStyle}>PLAYERS</div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {players.map((p) => (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 10px",
                  background: p.id === socket.id ? "#0d1a14" : "#0d0d16",
                  border: `1px solid ${p.id === socket.id ? "#00ff8822" : "#111"}`,
                  borderRadius: "3px",
                  opacity: p.alive ? 1 : 0.4
                }}
              >
                {colorDot(p.color, p.alive)}
                <span style={{ fontSize: "0.8rem" }}>{p.name}</span>
                {!p.alive && (
                  <span style={{ color: "#444", fontSize: "0.65rem", marginLeft: "auto" }}>
                    DEAD
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "1.5rem", borderTop: "1px solid #1a1a1a", paddingTop: "1rem" }}>
            <div style={labelStyle}>ROOM</div>
            <div style={{ color: "#ffd60a", fontWeight: 700, letterSpacing: "0.2em", fontSize: "1rem" }}>
              {roomCode}
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", borderTop: "1px solid #1a1a1a", paddingTop: "1rem" }}>
            <div style={labelStyle}>CONTROLS</div>
            <div style={{ color: "#333", fontSize: "0.7rem", lineHeight: 1.8 }}>
              ↑ ↓ ← →<br />or W A S D
            </div>
          </div>
        </div>

        <div>
          <GameBoard roomCode={roomCode} />
        </div>

        <div style={panelStyle}>
          <div style={labelStyle}>SCOREBOARD</div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {sortedPlayers.map((p, rank) => (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 10px",
                  background: rank === 0 ? "#1a1500" : "#0d0d16",
                  border: `1px solid ${rank === 0 ? "#ffd60a22" : "#111"}`,
                  borderRadius: "3px",
                  opacity: p.alive ? 1 : 0.5
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ color: "#444", fontSize: "0.7rem", width: 18 }}>
                    #{rank + 1}
                  </span>
                  {colorDot(p.color, p.alive)}
                  <span style={{ fontSize: "0.8rem" }}>{p.name}</span>
                </div>

                <span style={{ fontSize: "1rem", fontWeight: 700, color: rank === 0 ? "#ffd60a" : "#00ff88" }}>
                  {scores[p.id] || 0}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}