import { useEffect, useState } from "react";
import { getCategorias, createCategoria, deleteCategoria, getGastos } from "../services/api";
import Toast from "../components/Toast";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [toast, setToast] = useState({ mensaje: "", tipo: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const c = await getCategorias();
    const g = await getGastos();
    setCategorias(c);
    setGastos(g);
  };

  const mostrarToast = (mensaje, tipo = "exito") => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast({ mensaje: "", tipo: "" }), 3000);
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      mostrarToast("El nombre no puede estar vacío", "error");
      return;
    }
    const existe = categorias.find(
      (c) => c.nombre.toLowerCase() === nombre.trim().toLowerCase()
    );
    if (existe) {
      mostrarToast("Ya existe una categoría con ese nombre", "error");
      return;
    }
    await createCategoria({ nombre: nombre.trim() });
    setNombre("");
    mostrarToast("Categoría agregada correctamente");
    cargarDatos();
  };

  const handleDelete = async (id) => {
    await deleteCategoria(id);
    setConfirmDelete(null);
    mostrarToast("Categoría eliminada correctamente");
    cargarDatos();
  };

  const totalPorCategoria = (categoriaId) => {
    return gastos
      .filter((g) => g.categoria_id === categoriaId)
      .reduce((acc, g) => acc + g.monto, 0);
  };

  const categoriasFiltradas = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Agregar categoría</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Nombre de la categoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-fit"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Buscar categoría</h2>
        <input
          type="text"
          placeholder="Escribe para buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>

      {/* Lista de categorías */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Lista de categorías
          {categoriasFiltradas.length !== categorias.length && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({categoriasFiltradas.length} de {categorias.length})
            </span>
          )}
        </h2>
        {categoriasFiltradas.length > 0 ? (
          <ul className="space-y-2">
            {categoriasFiltradas.map((cat) => (
              <li
                key={cat.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50 gap-2"
              >
                <div>
                  <p className="text-gray-700 font-medium">{cat.nombre}</p>
                  <p className="text-sm text-gray-400">
                    Total gastado: ${totalPorCategoria(cat.id).toLocaleString("es-CL")}
                  </p>
                </div>
                {confirmDelete === cat.id ? (
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-500 text-xs">¿Seguro?</span>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold transition"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-gray-400 hover:text-gray-600 text-xs transition"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(cat.id)}
                    className="text-red-500 hover:text-red-700 transition text-sm w-fit"
                  >
                    Eliminar
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No se encontraron categorías.</p>
        )}
      </div>

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </div>
  );
}

export default Categorias;