import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import socket from "../socket";

export default function Lobby() {

  const navigate = useNavigate();

  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("roomCreated", (roomCode) => {
      navigate(`/room?code=${roomCode}`);
    });

    socket.on("errorMessage", (msg) => {
      alert(msg);
      setLoading(false);
    });

  }, []);

  function handleCreateRoom() {
    setLoading(true);
    socket.emit("createRoom");
  }

  function handleJoinRoom() {

    if (!joinCode.trim()) return;

    setLoading(true);

    socket.emit("joinRoom", joinCode);

    navigate(`/room?code=${joinCode}`);
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="p-8">

        <h1 className="text-3xl font-bold mb-8">
          Game Lobby
        </h1>

        <div className="flex gap-4 mb-8">

          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className={`px-6 py-3 rounded text-white ${
              loading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating..." : "Create Game"}
          </button>

          <div className="flex gap-2">

            <input
              type="text"
              placeholder="Enter Room Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="border rounded px-3 py-2"
            />

            <button
              onClick={handleJoinRoom}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
            >
              Join
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}