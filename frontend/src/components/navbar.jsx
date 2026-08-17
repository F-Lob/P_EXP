import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white px-6 py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">Analizador de Gastos</h1>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-blue-200 transition">
            Dashboard
          </Link>
          <Link to="/gastos" className="hover:text-blue-200 transition">
            Gastos
          </Link>
          <Link to="/categorias" className="hover:text-blue-200 transition">
            Categorías
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;