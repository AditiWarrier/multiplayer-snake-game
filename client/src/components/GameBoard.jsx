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
  const canvasRef = useRef(null);

  useEffect(() => {
  if (!roomCode) return;

  // 🔥 FORCE REJOIN (FIX)
  socket.emit("joinRoom", roomCode);

  // 🔥 GET LATEST STATE
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

  useEffect(() => {
    const handleKey = (e) => {
      const map = {
        ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
        w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT",
        W: "UP", S: "DOWN", A: "LEFT", D: "RIGHT"
      };

      if (map[e.key]) {
        e.preventDefault();
        console.log("CLIENT EMITTING MOVE:", map[e.key], "SOCKET ID:", socket.id);
        socket.emit("move", map[e.key]);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const W = GRID_SIZE * CELL;

    ctx.fillStyle = "#0d0d16";
    ctx.fillRect(0, 0, W, W);

    // Draw food trail
    foodTrail.forEach(seg => {
      ctx.fillStyle = "#ff4d6d44";
      ctx.fillRect(seg.x * CELL, seg.y * CELL, CELL - 2, CELL - 2);
    });

    for (const id in snakes) {
      const snake = snakes[id];
      if (!snake.alive && snake.body.length === 0) continue;

      ctx.fillStyle = snake.alive ? snake.color : "#333";

      snake.body.forEach(seg => {
        ctx.fillRect(seg.x * CELL, seg.y * CELL, CELL - 2, CELL - 2);
      });
    }

    if (food) {
      ctx.fillStyle = "#ff4d6d";
      ctx.fillRect(food.x * CELL, food.y * CELL, CELL - 2, CELL - 2);
    }

    // Draw game over overlay
    if (gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, W, W);
      
      ctx.fillStyle = "#fff";
      ctx.font = "bold 24px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", W / 2, W / 2 - 20);
      
      if (winner) {
        ctx.fillStyle = "#ffd60a";
        ctx.fillText(`WINNER: ${winner === socket.id ? "YOU" : "Player " + (Object.keys(snakes).indexOf(winner) + 1)}`, W / 2, W / 2 + 20);
      }
    }

  }, [snakes, food, foodTrail, gameOver, winner]);

  return (
    <canvas
      ref={canvasRef}
      width={GRID_SIZE * CELL}
      height={GRID_SIZE * CELL}
    />
  );
}

