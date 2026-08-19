import { useEffect, useState } from "react";
import { getGastos, getCategorias, getSueldo, setSueldo } from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

const COLORES = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

function Dashboard() {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [sueldo, setSueldoState] = useState(null);
  const [editandoSueldo, setEditandoSueldo] = useState(false);
  const [nuevoSueldo, setNuevoSueldo] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const g = await getGastos();
    const c = await getCategorias();
    const s = await getSueldo();
    setGastos(g);
    setCategorias(c);
    setSueldoState(s);
  };

  const handleGuardarSueldo = async () => {
    if (!nuevoSueldo || parseFloat(nuevoSueldo) <= 0) return;
    await setSueldo(parseFloat(nuevoSueldo));
    setNuevoSueldo("");
    setEditandoSueldo(false);
    cargarDatos();
  };

  // Total general
  const totalGeneral = gastos.reduce((acc, g) => acc + g.monto, 0);

  // Saldo disponible
  const saldoDisponible = sueldo ? sueldo.monto - totalGeneral : null;

  // Gastos del mes actual
  const mesActual = new Date().toISOString().slice(0, 7);
  const gastosMesActual = gastos
    .filter((g) => new Date(g.fecha).toISOString().slice(0, 7) === mesActual)
    .reduce((acc, g) => acc + g.monto, 0);

  // Gastos fijos vs variables
  const totalFijos = gastos.filter((g) => g.es_fijo).reduce((acc, g) => acc + g.monto, 0);
  const totalVariables = gastos.filter((g) => !g.es_fijo).reduce((acc, g) => acc + g.monto, 0);

  // Gastos por categoría
  const datosPorCategoria = categorias.map((cat) => ({
    name: cat.nombre,
    value: gastos
      .filter((g) => g.categoria_id === cat.id)
      .reduce((acc, g) => acc + g.monto, 0)
  })).filter((d) => d.value > 0);

  // Gastos por mes
  const datosPorMes = gastos.reduce((acc, g) => {
    const mes = new Date(g.fecha).toLocaleString("es-CL", { month: "short", year: "numeric" });
    const existe = acc.find((d) => d.mes === mes);
    if (existe) {
      existe.total += g.monto;
    } else {
      acc.push({ mes, total: g.monto });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Sueldo */}
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 text-sm">Sueldo mensual</p>
          {sueldo ? (
            <p className="text-3xl font-bold text-green-600">
              ${sueldo.monto.toLocaleString("es-CL")}
            </p>
          ) : (
            <p className="text-gray-400 text-sm mt-1">No registrado</p>
          )}
          {editandoSueldo ? (
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                placeholder="Nuevo sueldo"
                value={nuevoSueldo}
                onChange={(e) => setNuevoSueldo(e.target.value)}
                className="border rounded-lg px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                onClick={handleGuardarSueldo}
                className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition"
              >
                ✓
              </button>
              <button
                onClick={() => setEditandoSueldo(false)}
                className="bg-gray-200 text-gray-600 px-3 py-1 rounded-lg text-sm hover:bg-gray-300 transition"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditandoSueldo(true)}
              className="mt-2 text-sm text-green-600 hover:underline"
            >
              {sueldo ? "Actualizar sueldo" : "Registrar sueldo"}
            </button>
          )}
        </div>

        {/* Saldo disponible */}
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 text-sm">Saldo disponible</p>
          {saldoDisponible !== null ? (
            <p className={`text-3xl font-bold ${saldoDisponible >= 0 ? "text-blue-600" : "text-red-500"}`}>
              ${saldoDisponible.toLocaleString("es-CL")}
            </p>
          ) : (
            <p className="text-gray-400 text-sm mt-1">Registra tu sueldo</p>
          )}
        </div>

        {/* Gasto mes actual */}
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 text-sm">Gastado este mes</p>
          <p className="text-3xl font-bold text-orange-500">
            ${gastosMesActual.toLocaleString("es-CL")}
          </p>
        </div>

        {/* Total general */}
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 text-sm">Total gastado</p>
          <p className="text-3xl font-bold text-gray-700">
            ${totalGeneral.toLocaleString("es-CL")}
          </p>
        </div>
      </div>

      {/* Fijos vs Variables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 text-sm">Gastos fijos</p>
          <p className="text-3xl font-bold text-blue-600">
            ${totalFijos.toLocaleString("es-CL")}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 text-sm">Gastos variables</p>
          <p className="text-3xl font-bold text-purple-500">
            ${totalVariables.toLocaleString("es-CL")}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Gastos por categoría</h2>
          {datosPorCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosPorCategoria}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {datosPorCategoria.map((_, index) => (
                    <Cell key={index} fill={COLORES[index % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString("es-CL")}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No hay gastos registrados aún.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Gastos por mes</h2>
          {datosPorMes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString("es-CL")}`} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No hay gastos registrados aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;