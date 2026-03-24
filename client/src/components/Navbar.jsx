import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">

      <h1 className="text-xl font-bold text-blue-600">
        Multiplayer Arena
      </h1>

      <div className="flex gap-6">

        <Link
          to="/lobby"
          className="text-gray-700 hover:text-blue-600"
        >
          Lobby
        </Link>

        <Link
          to="/leaderboard"
          className="text-gray-700 hover:text-blue-600"
        >
          Leaderboard
        </Link>

        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-600"
        >
          Logout
        </button>

      </div>

    </nav>
  );
}