import { Link } from "react-router-dom";
import { login, logout } from "../auth/auth";

export default function Navbar() {
  return (
    <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow">
      <div className="flex gap-6 font-medium">
        <Link to="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
        <Link to="/org" className="hover:text-blue-400 transition-colors">Org</Link>
        <Link to="/health" className="hover:text-blue-400 transition-colors">Health</Link>
      </div>

      <div className="flex gap-3">
        <button
          onClick={login}
          className="bg-blue-500 px-4 py-1 rounded hover:bg-blue-600 transition-colors"
        >
          Login
        </button>
        <button
          onClick={logout}
          className="bg-red-500 px-4 py-1 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}