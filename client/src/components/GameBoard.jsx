import { useEffect, useState, useRef } from "react";
import socket from "../socket";

const GRID_SIZE = 30;
const CELL = 20;

export default function GameBoard({ roomCode }) {

  const [snakes, setSnakes] = useState({});
  const [food, setFood] = useState(null);
  const [foodTrail, setFoodTrail] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // 🔥 COUNTDOWN
  const [countdown, setCountdown] = useState(3);

  // 🔥 NEW ANIMATION TIMER
  const [pulse, setPulse] = useState(0);

  const canvasRef = useRef(null);

  // =====================================================
  // SOCKETS
  // =====================================================

  useEffect(() => {

    if (!roomCode) return;

    socket.emit("joinRoom", roomCode);
    socket.emit("getState", roomCode);

    const handleGameState = (state) => {

      setSnakes(state.snakes || {});
      setFood(state.food || null);
      setFoodTrail(state.foodTrail || []);
      setGameOver(state.gameOver || false);
      setWinner(state.winner || null);
    };

    socket.on("gameState", handleGameState);

    return () => {
      socket.off("gameState", handleGameState);
    };

  }, [roomCode]);

  // =====================================================
  // COUNTDOWN
  // =====================================================

  useEffect(() => {

    let current = 3;

    const interval = setInterval(() => {

      current--;

      setCountdown(current);

      if (current < 0) {
        clearInterval(interval);
      }

    }, 1000);

    return () => clearInterval(interval);

  }, []);

  // =====================================================
  // PULSE ANIMATION
  // =====================================================

  useEffect(() => {

    const interval = setInterval(() => {

      setPulse(prev => prev + 0.08);

    }, 30);

    return () => clearInterval(interval);

  }, []);

  // =====================================================
  // CONTROLS
  // =====================================================

  useEffect(() => {

    const handleKey = (e) => {

      if (countdown > 0) return;

      const map = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
        W: "UP",
        S: "DOWN",
        A: "LEFT",
        D: "RIGHT"
      };

      if (map[e.key]) {

        e.preventDefault();

        socket.emit("move", map[e.key]);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () =>
      window.removeEventListener("keydown", handleKey);

  }, [countdown]);

  // =====================================================
  // DRAW
  // =====================================================

  useEffect(() => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const W = GRID_SIZE * CELL;

    // =================================================
    // BACKGROUND
    // =================================================

    ctx.fillStyle = "#08080d";
    ctx.fillRect(0, 0, W, W);

    // 🔥 subtle vignette
    const gradient = ctx.createRadialGradient(
      W / 2,
      W / 2,
      50,
      W / 2,
      W / 2,
      W / 1.2
    );

    gradient.addColorStop(0, "rgba(0,255,136,0.03)");
    gradient.addColorStop(1, "rgba(0,0,0,0.5)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, W);

    // =================================================
    // GRID
    // =================================================

    ctx.strokeStyle = "#12121d";
    ctx.lineWidth = 1;

    for (let i = 0; i <= GRID_SIZE; i++) {

      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, W);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(W, i * CELL);
      ctx.stroke();
    }

    // =================================================
    // FOOD TRAIL
    // =================================================

    foodTrail.forEach(seg => {

      ctx.fillStyle = "#ff4d6d33";

      ctx.shadowColor = "#ff4d6d";
      ctx.shadowBlur = 12;

      ctx.fillRect(
        seg.x * CELL + 4,
        seg.y * CELL + 4,
        CELL - 8,
        CELL - 8
      );

      ctx.shadowBlur = 0;
    });

    // =================================================
    // FOOD
    // =================================================

    if (food) {

      const pulseSize =
        Math.sin(pulse * 2) * 2;

      ctx.fillStyle = "#ff4d6d";

      ctx.shadowColor = "#ff4d6d";

      ctx.shadowBlur =
        22 + Math.sin(pulse * 3) * 12;

      ctx.beginPath();

      ctx.roundRect(
        food.x * CELL + 2 - pulseSize / 2,
        food.y * CELL + 2 - pulseSize / 2,
        CELL - 4 + pulseSize,
        CELL - 4 + pulseSize,
        5
      );

      ctx.fill();

      ctx.shadowBlur = 0;
    }

    // =================================================
    // SNAKES
    // =================================================

    for (const id in snakes) {

      const snake = snakes[id];

      if (!snake.alive && snake.body.length === 0) {
        continue;
      }

      snake.body.forEach((seg, index) => {

        const isHead = index === 0;

        // 🔥 head pulse glow
        if (isHead && snake.alive) {

          ctx.shadowColor = snake.color;

          ctx.shadowBlur =
            18 + Math.sin(pulse * 4) * 6;

        } else {

          ctx.shadowBlur = 0;
        }

        // 🔥 body alpha fade
        ctx.globalAlpha =
          isHead
            ? 1
            : Math.max(
                0.45,
                1 - index * 0.05
              );

        ctx.fillStyle =
          snake.alive
            ? snake.color
            : "#333";

        ctx.beginPath();

        ctx.roundRect(
          seg.x * CELL + 2,
          seg.y * CELL + 2,
          CELL - 4,
          CELL - 4,
          4
        );

        ctx.fill();

        ctx.globalAlpha = 1;

        // =================================================
        // EYES
        // =================================================

        if (isHead && snake.alive) {

          ctx.shadowBlur = 0;

          ctx.fillStyle = "#000";

          ctx.fillRect(
            seg.x * CELL + 5,
            seg.y * CELL + 5,
            3,
            3
          );

          ctx.fillRect(
            seg.x * CELL + CELL - 8,
            seg.y * CELL + 5,
            3,
            3
          );
        }
      });
    }

    // =================================================
    // COUNTDOWN
    // =================================================

    if (countdown >= 0) {

      ctx.fillStyle = "rgba(0,0,0,0.74)";
      ctx.fillRect(0, 0, W, W);

      ctx.textAlign = "center";

      const text =
        countdown === 0
          ? "GO!"
          : countdown.toString();

      const color =
        countdown === 0
          ? "#00ff88"
          : "#ffd60a";

      ctx.shadowColor = color;

      ctx.shadowBlur =
        30 + Math.sin(pulse * 5) * 10;

      ctx.fillStyle = color;

      ctx.font =
        countdown === 0
          ? "900 95px 'Courier New'"
          : "900 125px 'Courier New'";

      ctx.fillText(
        text,
        W / 2,
        W / 2 + 30
      );

      ctx.shadowBlur = 0;

      ctx.fillStyle = "#777";

      ctx.font = "18px 'Courier New'";

      ctx.fillText(
        countdown === 0
          ? "SURVIVE."
          : "GET READY",
        W / 2,
        W / 2 + 90
      );
    }

    // =================================================
    // GAME OVER
    // =================================================

    if (gameOver) {

      ctx.fillStyle = "rgba(0,0,0,0.84)";
      ctx.fillRect(0, 0, W, W);

      ctx.fillStyle =
        "rgba(255,214,10,0.08)";

      ctx.fillRect(
        W / 2 - 170,
        W / 2 - 120,
        340,
        230
      );

      ctx.textAlign = "center";

      ctx.shadowColor = "#ffd60a";

      ctx.shadowBlur =
        28 + Math.sin(pulse * 5) * 8;

      ctx.fillStyle = "#ffd60a";

      ctx.font = "900 46px 'Courier New'";

      ctx.fillText(
        "GAME OVER",
        W / 2,
        W / 2 - 45
      );

      ctx.shadowBlur = 0;

      ctx.fillStyle = "#666";

      ctx.font = "16px 'Courier New'";

      ctx.fillText(
        "SURVIVAL COMPLETE",
        W / 2,
        W / 2 - 10
      );

      // =============================================
      // WINNER
      // =============================================

      if (winner) {

        const winnerColor =
          snakes[winner]?.color || "#00ff88";

        ctx.fillStyle = winnerColor;

        ctx.shadowColor = winnerColor;

        ctx.shadowBlur =
          20 + Math.sin(pulse * 5) * 8;

        ctx.font = "bold 26px 'Courier New'";

        ctx.fillText(
          `🏆 ${
            winner === socket.id
              ? "YOU WIN"
              : "PLAYER " +
                (Object.keys(snakes).indexOf(winner) + 1) +
                " WINS"
          }`,
          W / 2,
          W / 2 + 40
        );

        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = "#999";

      ctx.font = "14px 'Courier New'";

      ctx.fillText(
        "Refresh or restart room to play again",
        W / 2,
        W / 2 + 95
      );
    }

  }, [
    snakes,
    food,
    foodTrail,
    gameOver,
    winner,
    countdown,
    pulse
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={GRID_SIZE * CELL}
      height={GRID_SIZE * CELL}
      style={{
        border: "2px solid #1a1a2e",
        boxShadow: "0 0 45px #00ff8822",
        background: "#0a0a12",
        borderRadius: "6px"
      }}
    />
  );
}