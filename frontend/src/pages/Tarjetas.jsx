import { useEffect, useState } from "react";
import { getTarjetas, createTarjeta, deleteTarjeta } from "../services/api";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

function Tarjetas() {
  const [tarjetas, setTarjetas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [toast, setToast] = useState({ mensaje: "", tipo: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarTarjetas();
  }, []);

  const cargarTarjetas = async () => {
    const data = await getTarjetas();
    setTarjetas(data);
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
    await createTarjeta({ nombre: nombre.trim() });
    setNombre("");
    mostrarToast("Tarjeta agregada correctamente");
    cargarTarjetas();
  };

  const handleDelete = async (id) => {
    await deleteTarjeta(id);
    setConfirmDelete(null);
    mostrarToast("Tarjeta eliminada correctamente");
    cargarTarjetas();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Tarjetas de Crédito</h1>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Agregar tarjeta</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Nombre de la tarjeta (ej: Visa Banco Chile)"
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

      {/* Lista de tarjetas */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Mis tarjetas</h2>
        {tarjetas.length > 0 ? (
          <ul className="space-y-3">
            {tarjetas.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between border rounded-xl px-4 py-3 hover:bg-gray-50"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(`/tarjetas/${t.id}`)}
                >
                  <span className="text-2xl">💳</span>
                  <span className="text-gray-700 font-medium">{t.nombre}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(`/tarjetas/${t.id}`)}
                    className="text-blue-500 hover:text-blue-700 text-sm transition"
                  >
                    Ver detalle
                  </button>
                  {confirmDelete === t.id ? (
                    <div className="flex gap-2 items-center">
                      <span className="text-gray-500 text-xs">¿Seguro?</span>
                      <button
                        onClick={() => handleDelete(t.id)}
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
                      onClick={() => setConfirmDelete(t.id)}
                      className="text-red-500 hover:text-red-700 transition text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No tienes tarjetas registradas aún.</p>
        )}
      </div>

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </div>
  );
}

export default Tarjetas;