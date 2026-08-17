import { useEffect, useState } from "react";
import { getGastos, createGasto, deleteGasto, getCategorias } from "../services/api";

function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    descripcion: "",
    monto: "",
    categoria_id: "",
    fecha: ""
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const g = await getGastos();
    const c = await getCategorias();
    setGastos(g);
    setCategorias(c);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.descripcion || !form.monto || !form.categoria_id) return;
    await createGasto({
      descripcion: form.descripcion,
      monto: parseFloat(form.monto),
      categoria_id: parseInt(form.categoria_id),
      fecha: form.fecha || null
    });
    setForm({ descripcion: "", monto: "", categoria_id: "", fecha: "" });
    cargarDatos();
  };

  const handleDelete = async (id) => {
    await deleteGasto(id);
    cargarDatos();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Gastos</h1>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Agregar gasto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            name="monto"
            placeholder="Monto"
            value={form.monto}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            name="categoria_id"
            value={form.categoria_id}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Agregar
        </button>
      </div>

      {/* Tabla de gastos */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Historial de gastos</h2>
        {gastos.length > 0 ? (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="pb-2">Descripción</th>
                <th className="pb-2">Monto</th>
                <th className="pb-2">Categoría</th>
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((g) => (
                <tr key={g.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{g.descripcion}</td>
                  <td className="py-2">${g.monto.toLocaleString("es-CL")}</td>
                  <td className="py-2">
                    {categorias.find((c) => c.id === g.categoria_id)?.nombre || "Sin categoría"}
                  </td>
                  <td className="py-2">
                    {new Date(g.fecha).toLocaleDateString("es-CL")}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-sm">No hay gastos registrados aún.</p>
        )}
      </div>
    </div>
  );
}

export default Gastos;