import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import socket from "../socket";

export default function Lobby() {
  console.log("THIS IS THE REAL LOBBY FILE");

  const navigate = useNavigate();

  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 NEW
  const [pulse, setPulse] = useState(false);

  useEffect(() => {

    sessionStorage.removeItem("roomCode");

    const handleRoomCreated = (roomCode) => {

      sessionStorage.setItem("roomCode", roomCode);

      navigate(`/room?code=${roomCode}`);
    };

    const handleError = (msg) => {

      alert(msg);

      setLoading(false);
    };

    socket.on("roomCreated", handleRoomCreated);
    socket.on("errorMessage", handleError);

    return () => {

      socket.off("roomCreated", handleRoomCreated);
      socket.off("errorMessage", handleError);
    };

  }, [navigate]);

  // 🔥 PULSE EFFECT

  useEffect(() => {

    const interval = setInterval(() => {

      setPulse(prev => !prev);

    }, 900);

    return () => clearInterval(interval);

  }, []);

  function handleCreateRoom() {

    setLoading(true);

    socket.emit("createRoom");
  }

  function handleJoinRoom() {

    const code = joinCode.trim().toUpperCase();

    if (!code) return;

    setLoading(true);

    sessionStorage.setItem("roomCode", code);

    socket.emit("joinRoom", code);

    navigate(`/room?code=${code}`);
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top, #141428 0%, #09090f 60%)",
        color: "#e0e0e0",
        fontFamily: "'Courier New', monospace",
        overflow: "hidden",
        position: "relative"
      }}
    >

      {/* 🔥 Background Glow */}

      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "#00ff8822",
          filter: "blur(140px)",
          top: "-180px",
          left: "-120px",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "450px",
          height: "450px",
          borderRadius: "50%",
          background: "#00cfff18",
          filter: "blur(140px)",
          bottom: "-160px",
          right: "-120px",
          pointerEvents: "none"
        }}
      />

      <Navbar />

      <div
        className="flex flex-col items-center justify-center"
        style={{
          minHeight: "calc(100vh - 56px)",
          position: "relative",
          zIndex: 2,
          padding: "2rem"
        }}
      >

        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <div
          className="text-center"
          style={{
            marginBottom: "3rem"
          }}
        >

          <h1
            style={{
              fontSize: "4.8rem",
              fontWeight: 900,
              letterSpacing: "0.18em",
              color: "#00ff88",
              textShadow:
                pulse
                  ? "0 0 40px #00ff88"
                  : "0 0 18px #00ff8855",
              transition: "0.35s",
              fontFamily: "'Courier New', monospace",
              lineHeight: 1
            }}
          >
            SNAKE
          </h1>

          <h1
            style={{
              fontSize: "4.8rem",
              fontWeight: 900,
              letterSpacing: "0.18em",
              color: "#00cfff",
              textShadow:
                pulse
                  ? "0 0 40px #00cfff"
                  : "0 0 18px #00cfff55",
              transition: "0.35s",
              fontFamily: "'Courier New', monospace",
              lineHeight: 1,
              marginTop: "-8px"
            }}
          >
            ARENA
          </h1>

          <p
            style={{
              color: "#666",
              letterSpacing: "0.35em",
              fontSize: "0.82rem",
              marginTop: "1.4rem"
            }}
          >
            MULTIPLAYER · REAL-TIME · SURVIVAL
          </p>

        </div>

        {/* ================================================= */}
        {/* MAIN CARD */}
        {/* ================================================= */}

        <div
          style={{
            background: "rgba(17,17,24,0.88)",
            backdropFilter: "blur(12px)",
            border: "1px solid #22263a",
            borderRadius: "10px",
            padding: "2.8rem",
            width: "420px",
            boxShadow:
              pulse
                ? "0 0 45px #00ff8818"
                : "0 0 20px #00ff8808",
            transition: "0.35s"
          }}
        >

          {/* CREATE BUTTON */}

          <button
            onClick={handleCreateRoom}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background:
                loading
                  ? "#1a1a2e"
                  : "linear-gradient(90deg,#00ff88,#00d97a)",
              color:
                loading
                  ? "#444"
                  : "#000",
              border: "none",
              borderRadius: "6px",
              fontWeight: 900,
              fontSize: "1rem",
              letterSpacing: "0.18em",
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
              marginBottom: "1.8rem",
              fontFamily: "'Courier New', monospace",
              boxShadow:
                loading
                  ? "none"
                  : "0 0 25px #00ff8844",
              transition: "0.25s"
            }}
          >
            {loading
              ? "CONNECTING..."
              : "CREATE ROOM"}
          </button>

          {/* DIVIDER */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.8rem"
            }}
          >

            <div
              style={{
                flex: 1,
                height: "1px",
                background:
                  "linear-gradient(to right, transparent, #333)"
              }}
            />

            <span
              style={{
                color: "#555",
                fontSize: "0.75rem",
                letterSpacing: "0.25em"
              }}
            >
              OR JOIN ROOM
            </span>

            <div
              style={{
                flex: 1,
                height: "1px",
                background:
                  "linear-gradient(to left, transparent, #333)"
              }}
            />

          </div>

          {/* INPUT + BUTTON */}

          <div
            style={{
              display: "flex",
              gap: "10px"
            }}
          >

            <input
              type="text"
              placeholder="ROOM CODE"
              value={joinCode}
              onChange={(e) =>
                setJoinCode(
                  e.target.value.toUpperCase()
                )
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                handleJoinRoom()
              }
              maxLength={5}
              style={{
                flex: 1,
                padding: "14px",
                background: "#0d0d16",
                border:
                  joinCode.length > 0
                    ? "1px solid #00cfff66"
                    : "1px solid #2a2a38",
                borderRadius: "6px",
                color: "#00ff88",
                fontFamily:
                  "'Courier New', monospace",
                fontSize: "1rem",
                letterSpacing: "0.25em",
                outline: "none",
                boxShadow:
                  joinCode.length > 0
                    ? "0 0 18px #00cfff22"
                    : "none",
                transition: "0.25s"
              }}
            />

            <button
              onClick={handleJoinRoom}
              disabled={loading}
              style={{
                padding: "14px 22px",
                background: "#131320",
                border: "1px solid #00cfff44",
                borderRadius: "6px",
                color: "#00cfff",
                fontWeight: 800,
                cursor: "pointer",
                fontFamily:
                  "'Courier New', monospace",
                letterSpacing: "0.14em",
                boxShadow:
                  pulse
                    ? "0 0 16px #00cfff22"
                    : "none",
                transition: "0.25s"
              }}
            >
              JOIN
            </button>

          </div>

          {/* HELP TEXT */}

          <div
            style={{
              marginTop: "1.3rem",
              color: "#444",
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              lineHeight: 1.8
            }}
          >
            CREATE A PRIVATE ROOM AND INVITE FRIENDS
            USING YOUR ROOM CODE.
          </div>

        </div>

        {/* FOOTER */}

        <p
          style={{
            color: "#333",
            fontSize: "0.75rem",
            marginTop: "2.5rem",
            letterSpacing: "0.25em"
          }}
        >
          UP TO 4 PLAYERS PER ROOM
        </p>

      </div>
    </div>
  );
}