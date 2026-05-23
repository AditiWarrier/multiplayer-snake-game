import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import socket from "../socket";

export default function Room() {

  const [searchParams] = useSearchParams();

  const roomCode = searchParams.get("code");

  const [players, setPlayers] = useState([]);

  // 🔥 NEW
  const [pulse, setPulse] = useState(false);

  useEffect(() => {

    if (!roomCode) return;

    socket.setRoomCode(roomCode);

    socket.emit("joinRoom", roomCode);

    const handleGameState = (state) => {

      const snakeIds = Object.keys(state.snakes || {});

      setPlayers(
        snakeIds.map((id, index) => ({
          id,
          name: index === 0
            ? "Host"
            : `Player ${index + 1}`,
          host: index === 0,
          color: state.snakes[id]?.color || "#fff"
        }))
      );
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

  // 🔥 PULSE EFFECT
  useEffect(() => {

    const interval = setInterval(() => {
      setPulse(prev => !prev);
    }, 900);

    return () => clearInterval(interval);

  }, []);

  const isHost =
    players.length > 0 &&
    players[0].id === socket.id;

  const handleCopy = async () => {

    try {

      await navigator.clipboard.writeText(roomCode);

      alert("Copied!");

    } catch {

      alert("Copy failed");
    }
  };

  const colorDot = (color) => (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 10px ${color}`,
        marginRight: 10
      }}
    />
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top, #111122 0%, #0a0a0f 60%)",
        color: "#e0e0e0",
        fontFamily: "'Courier New', monospace"
      }}
    >

      <Navbar />

      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          padding: "3rem 1.5rem"
        }}
      >

        {/* TITLE */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem"
          }}
        >

          <div
            style={{
              fontSize: "2.4rem",
              fontWeight: 900,
              letterSpacing: "0.18em",
              color: "#00ff88",
              textShadow:
                pulse
                  ? "0 0 35px #00ff88"
                  : "0 0 10px #00ff8844",
              transition: "0.4s"
            }}
          >
            MULTIPLAYER SNAKE
          </div>

          <div
            style={{
              marginTop: "0.8rem",
              color: "#555",
              letterSpacing: "0.25em",
              fontSize: "0.75rem"
            }}
          >
            WAITING ROOM
          </div>
        </div>

        {/* ROOM CODE */}

        <div
          style={{
            background: "#111118",
            border: "1px solid #222",
            borderRadius: "6px",
            padding: "1.4rem 1.6rem",
            marginBottom: "1.6rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 0 20px #00000066"
          }}
        >

          <div>

            <div
              style={{
                color: "#555",
                fontSize: "0.7rem",
                letterSpacing: "0.25em",
                marginBottom: 4
              }}
            >
              ROOM CODE
            </div>

            <div
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                letterSpacing: "0.35em",
                color: "#ffd60a",
                textShadow:
                  pulse
                    ? "0 0 25px #ffd60a"
                    : "0 0 8px #ffd60a44",
                transition: "0.4s"
              }}
            >
              {roomCode}
            </div>

          </div>

          <button
            onClick={handleCopy}
            style={{
              padding: "10px 18px",
              background: "#1a1a2e",
              border: "1px solid #333",
              borderRadius: "4px",
              color: "#bbb",
              cursor: "pointer",
              fontFamily: "'Courier New', monospace",
              fontSize: "0.75rem",
              letterSpacing: "0.12em"
            }}
          >
            COPY
          </button>
        </div>

        {/* PLAYER LIST */}

        <div
          style={{
            background: "#111118",
            border: "1px solid #222",
            borderRadius: "6px",
            padding: "1.5rem",
            marginBottom: "1.7rem",
            boxShadow: "0 0 20px #00000055"
          }}
        >

          <div
            style={{
              color: "#555",
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              marginBottom: "1rem"
            }}
          >
            PLAYERS ({players.length}/4)
          </div>

          {players.length === 0 && (
            <div
              style={{
                color: "#444",
                fontSize: "0.9rem",
                padding: "1rem 0"
              }}
            >
              WAITING FOR PLAYERS...
            </div>
          )}

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

            {players.map((player) => (

              <li
                key={player.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  background:
                    player.id === socket.id
                      ? "#0d1a14"
                      : "#0d0d16",
                  border:
                    `1px solid ${
                      player.id === socket.id
                        ? "#00ff8844"
                        : "#1a1a1a"
                    }`,
                  borderRadius: "4px",
                  transition: "0.25s",
                  boxShadow:
                    player.id === socket.id
                      ? "0 0 15px #00ff8822"
                      : "none"
                }}
              >

                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.9rem"
                  }}
                >

                  {colorDot(player.color)}

                  {player.name}

                  {player.id === socket.id && (
                    <span
                      style={{
                        color: "#666",
                        fontSize: "0.75rem",
                        marginLeft: 8
                      }}
                    >
                      (YOU)
                    </span>
                  )}

                </span>

                {player.host && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "#ffd60a",
                      letterSpacing: "0.15em"
                    }}
                  >
                    HOST
                  </span>
                )}

              </li>
            ))}

          </ul>
        </div>

        {/* STATUS */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "1.3rem",
            color: "#666",
            fontSize: "0.8rem",
            letterSpacing: "0.15em"
          }}
        >
          {isHost
            ? "YOU CONTROL GAME START"
            : "HOST CONTROLS GAME START"}
        </div>

        {/* START BUTTON */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "1.4rem"
          }}
        >

          {isHost ? (

            <button
              onClick={() =>
                socket.emit("startGame", roomCode)
              }
              style={{
                padding: "16px 52px",
                background:
                  pulse
                    ? "#00ff88"
                    : "#00dd77",
                border: "none",
                borderRadius: "5px",
                color: "#000",
                fontWeight: 900,
                fontSize: "1rem",
                letterSpacing: "0.22em",
                cursor: "pointer",
                fontFamily:
                  "'Courier New', monospace",
                boxShadow:
                  pulse
                    ? "0 0 25px #00ff88"
                    : "0 0 8px #00ff8844",
                transition: "0.25s"
              }}
            >
              START GAME
            </button>

          ) : (

            <div
              style={{
                color: pulse ? "#888" : "#444",
                letterSpacing: "0.2em",
                fontSize: "0.85rem",
                transition: "0.3s"
              }}
            >
              WAITING FOR HOST...
            </div>
          )}

        </div>

        {/* LEAVE BUTTON */}

        <div
          style={{
            textAlign: "center"
          }}
        >

          <button
            onClick={() => {

              socket.emit("leaveRoom", roomCode);

              socket.setRoomCode(null);

              window.location.href = "/lobby";
            }}
            style={{
              padding: "11px 30px",
              background: "transparent",
              border: "1px solid #ff4d6d44",
              borderRadius: "4px",
              color: "#ff4d6d",
              cursor: "pointer",
              fontFamily:
                "'Courier New', monospace",
              fontSize: "0.8rem",
              letterSpacing: "0.16em"
            }}
          >
            LEAVE ROOM
          </button>

        </div>

      </div>
    </div>
  );
}