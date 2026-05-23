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
        boxShadow: alive ? `0 0 12px ${color}` : "none",
        marginRight: 10,
        flexShrink: 0
      }}
    />
  );

  const panelStyle = {
    background: "linear-gradient(180deg, #111118 0%, #0b0b12 100%)",
    border: "1px solid #1a1a2e",
    borderRadius: "10px",
    padding: "1.25rem",
    width: 220,
    boxShadow: "0 0 25px rgba(0,255,136,0.08)"
  };

  const labelStyle = {
    color: "#666",
    fontSize: "0.65rem",
    letterSpacing: "0.28em",
    marginBottom: "1rem",
    fontWeight: 700
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top, #111122 0%, #09090f 45%, #050507 100%)",
        color: "#e0e0e0",
        fontFamily: "'Courier New', monospace"
      }}
    >
      <Navbar />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "2rem",
          padding: "2rem 1rem",
          flexWrap: "wrap"
        }}
      >

        {/* LEFT PANEL */}
        <div style={panelStyle}>

          <div
            style={{
              ...labelStyle,
              color: "#00ff88",
              textShadow: "0 0 12px #00ff8866"
            }}
          >
            PLAYERS
          </div>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}
          >
            {players.map((p) => (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  background:
                    p.id === socket.id
                      ? "linear-gradient(90deg, #0d1a14 0%, #111118 100%)"
                      : "#0d0d16",
                  border: `1px solid ${
                    p.id === socket.id
                      ? "#00ff8844"
                      : p.alive
                      ? "#1a1a1a"
                      : "#222"
                  }`,
                  borderRadius: "6px",
                  opacity: p.alive ? 1 : 0.35,
                  boxShadow:
                    p.id === socket.id
                      ? "0 0 12px #00ff8822"
                      : "none",
                  transition: "all 0.25s ease"
                }}
              >
                {colorDot(p.color, p.alive)}

                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: p.id === socket.id ? 700 : 500,
                    color: p.id === socket.id ? "#00ff88" : "#ddd"
                  }}
                >
                  {p.name}
                </span>

                {p.id === socket.id && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.62rem",
                      color: "#00ff88",
                      letterSpacing: "0.12em"
                    }}
                  >
                    YOU
                  </span>
                )}

                {!p.alive && (
                  <span
                    style={{
                      color: "#ff4d6d",
                      fontSize: "0.65rem",
                      marginLeft: "auto",
                      fontWeight: 700,
                      letterSpacing: "0.08em"
                    }}
                  >
                    ELIMINATED
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* ROOM SECTION */}
          <div
            style={{
              marginTop: "1.8rem",
              borderTop: "1px solid #1a1a1a",
              paddingTop: "1rem"
            }}
          >
            <div style={labelStyle}>ROOM</div>

            <div
              style={{
                color: "#ffd60a",
                fontWeight: 900,
                letterSpacing: "0.3em",
                fontSize: "1.1rem",
                textShadow: "0 0 14px #ffd60a55"
              }}
            >
              {roomCode}
            </div>
          </div>

          {/* CONTROLS */}
          <div
            style={{
              marginTop: "1.8rem",
              borderTop: "1px solid #1a1a1a",
              paddingTop: "1rem"
            }}
          >
            <div style={labelStyle}>CONTROLS</div>

            <div
              style={{
                color: "#888",
                fontSize: "0.75rem",
                lineHeight: 2,
                letterSpacing: "0.08em"
              }}
            >
              ↑ ↓ ← →<br />
              or W A S D
            </div>
          </div>
        </div>

        {/* GAME BOARD */}
        <div
          style={{
            position: "relative"
          }}
        >
          <GameBoard roomCode={roomCode} />
        </div>

        {/* SCOREBOARD */}
        <div style={panelStyle}>

          <div
            style={{
              ...labelStyle,
              color: "#ffd60a",
              textShadow: "0 0 12px #ffd60a55"
            }}
          >
            SCOREBOARD
          </div>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}
          >
            {sortedPlayers.map((p, rank) => (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  background:
                    rank === 0
                      ? "linear-gradient(90deg, #2a2200 0%, #151100 100%)"
                      : "#0d0d16",
                  border: `1px solid ${
                    rank === 0
                      ? "#ffd60a55"
                      : "#1a1a1a"
                  }`,
                  borderRadius: "6px",
                  opacity: p.alive ? 1 : 0.45,
                  boxShadow:
                    rank === 0
                      ? "0 0 18px #ffd60a22"
                      : "none",
                  transition: "all 0.25s ease"
                }}
              >

                <div style={{ display: "flex", alignItems: "center" }}>

                  <span
                    style={{
                      color:
                        rank === 0
                          ? "#ffd60a"
                          : "#555",
                      fontSize: "0.72rem",
                      width: 24,
                      fontWeight: 700
                    }}
                  >
                    #{rank + 1}
                  </span>

                  {colorDot(p.color, p.alive)}

                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: rank === 0 ? 700 : 500,
                      color:
                        rank === 0
                          ? "#ffd60a"
                          : "#ddd"
                    }}
                  >
                    {p.name}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 900,
                    color:
                      rank === 0
                        ? "#ffd60a"
                        : "#00ff88",
                    textShadow:
                      rank === 0
                        ? "0 0 12px #ffd60a66"
                        : "0 0 10px #00ff8844"
                  }}
                >
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