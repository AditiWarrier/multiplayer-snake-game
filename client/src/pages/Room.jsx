import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import socket from "../socket";

export default function Room() {

  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get("code");

  const [players, setPlayers] = useState([]);

  useEffect(() => {

    if (roomCode) {
      socket.emit("joinRoom", roomCode);
      socket.emit("getState", roomCode); // 🔥 IMPORTANT FIX
    }

    const handleGameState = (state) => {

      const snakeIds = Object.keys(state.snakes || {});

      const formatted = snakeIds.map((id, index) => ({
        id,
        name: index === 0 ? "Host" : `Player ${index + 1}`,
        host: index === 0
      }));

      setPlayers(formatted);
    };

    const handleGameStart = () => {
  window.location.href = `/game?code=${roomCode}`;
};

    socket.on("gameState", handleGameState);
    socket.on("gameStarted", handleGameStart);

    return () => {
      socket.off("gameState", handleGameState);
      socket.off("gameStarted", handleGameStart);
    };

  }, [roomCode]);

  const isHost =
    players.length > 0 && players[0].id === socket.id;

  function copyRoomCode() {
    navigator.clipboard.writeText(roomCode);
    alert("Room code copied!");
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="p-8 max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Game Room
        </h1>

        {/* Room Code */}
        <div className="bg-white shadow rounded-xl p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="text-gray-600">Room Code</p>
            <p className="text-xl font-bold">{roomCode}</p>
          </div>

          <button
            onClick={copyRoomCode}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Copy
          </button>
        </div>

        {/* Players */}
        <div className="bg-white shadow rounded-xl p-6 mb-6">

          <h2 className="text-xl font-semibold mb-4">
            Players
          </h2>

          <ul className="space-y-2">

            {players.map((player) => (
              <li
                key={player.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span>{player.name}</span>

                {player.host && (
                  <span className="text-blue-600 text-sm">
                    Host
                  </span>
                )}
              </li>
            ))}

          </ul>

        </div>

        {/* Start Game */}
        <div className="flex justify-center mt-6">

          {isHost ? (
            <button
              onClick={() => socket.emit("startGame", roomCode)}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
            >
              Start Game
            </button>
          ) : (
            <p className="text-gray-600">
              Waiting for host to start the game...
            </p>
          )}

        </div>

        {/* Leave Room */}
        <div className="flex justify-center mt-6">

          <button
            onClick={() => {
              socket.emit("leaveRoom", roomCode);
              window.location.href = "/lobby";
            }}
            className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700"
          >
            Leave Room
          </button>

        </div>

      </div>

    </div>
  );
}