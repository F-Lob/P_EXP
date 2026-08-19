import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGastosTarjeta, createGastoTarjeta, deleteGastoTarjeta, pagarCuota, getTarjetas } from "../services/api";
import Toast from "../components/Toast";

function DetalleTarjeta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gastos, setGastos] = useState([]);
  const [tarjeta, setTarjeta] = useState(null);
  const [toast, setToast] = useState({ mensaje: "", tipo: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({
    descripcion: "",
    monto_total: "",
    cuotas_totales: "",
    cuotas_pagadas: "0",
    fecha_inicio: ""
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    const tarjetas = await getTarjetas();
    const encontrada = tarjetas.find((t) => t.id === parseInt(id));
    setTarjeta(encontrada);
    const data = await getGastosTarjeta(id);
    setGastos(data);
  };

  const mostrarToast = (mensaje, tipo = "exito") => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast({ mensaje: "", tipo: "" }), 3000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.descripcion || !form.monto_total || !form.cuotas_totales) {
      mostrarToast("Completa todos los campos obligatorios", "error");
      return;
    }
    if (parseFloat(form.monto_total) <= 0) {
      mostrarToast("El monto debe ser mayor a cero", "error");
      return;
    }
    if (parseInt(form.cuotas_totales) <= 0) {
      mostrarToast("Las cuotas deben ser mayor a cero", "error");
      return;
    }
    if (parseInt(form.cuotas_pagadas) > parseInt(form.cuotas_totales)) {
      mostrarToast("Las cuotas pagadas no pueden superar las totales", "error");
      return;
    }

    await createGastoTarjeta({
      descripcion: form.descripcion,
      monto_total: parseFloat(form.monto_total),
      cuotas_totales: parseInt(form.cuotas_totales),
      cuotas_pagadas: parseInt(form.cuotas_pagadas),
      fecha_inicio: form.fecha_inicio || null,
      tarjeta_id: parseInt(id)
    });

    setForm({
      descripcion: "",
      monto_total: "",
      cuotas_totales: "",
      cuotas_pagadas: "0",
      fecha_inicio: ""
    });
    mostrarToast("Gasto agregado correctamente");
    cargarDatos();
  };

  const handlePagarCuota = async (gastoId) => {
    await pagarCuota(gastoId);
    mostrarToast("Cuota pagada correctamente");
    cargarDatos();
  };

  const handleDelete = async (gastoId) => {
    await deleteGastoTarjeta(gastoId);
    setConfirmDelete(null);
    mostrarToast("Gasto eliminado correctamente");
    cargarDatos();
  };

  // Total de deuda pendiente
  const totalPendiente = gastos.reduce((acc, g) => {
    return acc + g.monto_por_cuota * g.cuotas_restantes;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/tarjetas")}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Volver a tarjetas
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          💳 {tarjeta ? tarjeta.nombre : "Cargando..."}
        </h1>
      </div>

      {/* Resumen */}
      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-gray-500 text-sm">Deuda total pendiente</p>
        <p className="text-4xl font-bold text-red-500">
          ${totalPendiente.toLocaleString("es-CL")}
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Agregar gasto en cuotas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción (ej: Smart TV)"
            value={form.descripcion}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            name="monto_total"
            placeholder="Monto total"
            value={form.monto_total}
            onChange={handleChange}
            min="0"
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            name="cuotas_totales"
            placeholder="Cuotas totales"
            value={form.cuotas_totales}
            onChange={handleChange}
            min="1"
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            name="cuotas_pagadas"
            placeholder="Cuotas ya pagadas"
            value={form.cuotas_pagadas}
            onChange={handleChange}
            min="0"
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
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

      {/* Lista de gastos */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Gastos en cuotas</h2>
        {gastos.length > 0 ? (
          <div className="space-y-4">
            {gastos.map((g) => (
              <div
                key={g.id}
                className={`border rounded-xl p-4 ${g.cuotas_restantes === 0 ? "bg-green-50 border-green-200" : "hover:bg-gray-50"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{g.descripcion}</p>
                    <p className="text-sm text-gray-500">
                      Monto total: ${g.monto_total.toLocaleString("es-CL")} —
                      Cuota mensual: ${g.monto_por_cuota.toLocaleString("es-CL")}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(g.cuotas_pagadas / g.cuotas_totales) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {g.cuotas_pagadas}/{g.cuotas_totales} cuotas
                        {g.cuotas_restantes === 0 && (
                          <span className="ml-2 text-green-600 font-semibold">✅ Pagado</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {g.cuotas_restantes > 0 && (
                      <button
                        onClick={() => handlePagarCuota(g.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition text-sm"
                      >
                        Pagar cuota
                      </button>
                    )}
                    {confirmDelete === g.id ? (
                      <div className="flex gap-2 items-center">
                        <span className="text-gray-500 text-xs">¿Seguro?</span>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold"
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-gray-400 hover:text-gray-600 text-xs"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(g.id)}
                        className="text-red-500 hover:text-red-700 transition text-sm"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No hay gastos registrados en esta tarjeta.</p>
        )}
      </div>

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </div>
  );
}

export default DetalleTarjeta;