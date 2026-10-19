import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">💰 Analizador de Gastos</h1>

        {/* Botón hamburguesa - solo en móvil */}
        <button
          className="md:hidden flex flex-col gap-1"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuAbierto ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuAbierto ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuAbierto ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>

        {/* Menú desktop */}
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/" className="hover:text-blue-200 transition">Inicio</Link>
          <Link to="/tarjetas" className="hover:text-blue-200 transition">Tarjetas</Link>
          <span className="text-blue-200 text-sm">👤 {usuario}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-blue-100 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {menuAbierto && (
        <div className="md:hidden mt-4 flex flex-col gap-3 border-t border-blue-500 pt-4">
          <Link to="/" onClick={cerrarMenu} className="hover:text-blue-200 transition">
            Inicio
          </Link>
          <Link to="/tarjetas" onClick={cerrarMenu} className="hover:text-blue-200 transition">
            Tarjetas
          </Link>
          <span className="text-blue-200 text-sm">👤 {usuario}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-blue-100 transition w-fit"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
