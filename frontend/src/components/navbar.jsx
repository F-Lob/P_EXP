import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">💰 Analizador de Gastos</h1>
        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-blue-200 transition">
            Dashboard
          </Link>
          <Link to="/gastos" className="hover:text-blue-200 transition">
            Gastos
          </Link>
          <Link to="/categorias" className="hover:text-blue-200 transition">
            Categorías
          </Link>
          <Link to="/tarjetas" className="hover:text-blue-200 transition">
            Tarjetas
          </Link>
          <span className="text-blue-200 text-sm">👤 {usuario}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-blue-100 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;