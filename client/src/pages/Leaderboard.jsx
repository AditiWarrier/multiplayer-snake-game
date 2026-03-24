import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="p-8">

        <h1 className="text-3xl font-bold mb-6">
          Leaderboard
        </h1>

        <div className="bg-white shadow rounded-xl p-6">

          <table className="w-full">

            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Player</th>
                <th className="pb-2">Score</th>
              </tr>
            </thead>

            <tbody>

              <tr className="border-b">
                <td className="py-2">Player1</td>
                <td>120</td>
              </tr>

              <tr className="border-b">
                <td className="py-2">Player2</td>
                <td>95</td>
              </tr>

              <tr>
                <td className="py-2">Player3</td>
                <td>80</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}