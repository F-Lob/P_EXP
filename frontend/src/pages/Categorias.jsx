import { useEffect, useState } from "react";
import { getCategorias, createCategoria, deleteCategoria } from "../services/api";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    const data = await getCategorias();
    setCategorias(data);
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) return;
    await createCategoria({ nombre });
    setNombre("");
    cargarCategorias();
  };

  const handleDelete = async (id) => {
    await deleteCategoria(id);
    cargarCategorias();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Agregar categoría</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Nombre de la categoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Lista de categorías</h2>
        {categorias.length > 0 ? (
          <ul className="space-y-2">
            {categorias.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between border rounded-lg px-4 py-2 hover:bg-gray-50"
              >
                <span className="text-gray-700">{cat.nombre}</span>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No hay categorías registradas aún.</p>
        )}
      </div>
    </div>
  );
}

export default Categorias;