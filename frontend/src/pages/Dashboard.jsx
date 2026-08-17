import { useEffect, useState } from "react";
import { getGastos, getCategorias } from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

// Colores para el gráfico de torta
const COLORES = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

function Dashboard() {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    getGastos().then(setGastos);
    getCategorias().then(setCategorias);
  }, []);

  // Total general
  const totalGeneral = gastos.reduce((acc, g) => acc + g.monto, 0);

  // Gastos agrupados por categoría para el PieChart
  const datosPorCategoria = categorias.map((cat) => ({
    name: cat.nombre,
    value: gastos
      .filter((g) => g.categoria_id === cat.id)
      .reduce((acc, g) => acc + g.monto, 0)
  })).filter((d) => d.value > 0);

  // Gastos agrupados por mes para el BarChart
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

      {/* Tarjeta de total general */}
      <div className="bg-white rounded-2xl shadow p-6 w-fit">
        <p className="text-gray-500 text-sm">Total gastado</p>
        <p className="text-4xl font-bold text-blue-600">
          ${totalGeneral.toLocaleString("es-CL")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico por categoría */}
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

        {/* Gráfico por mes */}
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