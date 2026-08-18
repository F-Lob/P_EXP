import { useEffect, useState } from "react";
import { getGastos, createGasto, deleteGasto, getCategorias } from "../services/api";
import Toast from "../components/Toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    descripcion: "",
    monto: "",
    categoria_id: "",
    fecha: ""
  });
  const [toast, setToast] = useState({ mensaje: "", tipo: "" });
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const g = await getGastos();
    const c = await getCategorias();
    setGastos(g);
    setCategorias(c);
  };

  const mostrarToast = (mensaje, tipo = "exito") => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast({ mensaje: "", tipo: "" }), 3000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.descripcion || !form.monto || !form.categoria_id) {
      mostrarToast("Completa todos los campos obligatorios", "error");
      return;
    }
    if (parseFloat(form.monto) <= 0) {
      mostrarToast("El monto debe ser mayor a cero", "error");
      return;
    }
    if (form.fecha && new Date(form.fecha) > new Date()) {
      mostrarToast("La fecha no puede ser futura", "error");
      return;
    }
    await createGasto({
      descripcion: form.descripcion,
      monto: parseFloat(form.monto),
      categoria_id: parseInt(form.categoria_id),
      fecha: form.fecha || null
    });
    setForm({ descripcion: "", monto: "", categoria_id: "", fecha: "" });
    mostrarToast("Gasto agregado correctamente");
    cargarDatos();
  };

  const handleDelete = async (id) => {
    await deleteGasto(id);
    setConfirmDelete(null);
    mostrarToast("Gasto eliminado correctamente");
    cargarDatos();
  };

  const gastosFiltrados = gastos.filter((g) => {
    const coincideCategoria = filtroCategoria
      ? g.categoria_id === parseInt(filtroCategoria)
      : true;
    const coincideMes = filtroMes
      ? new Date(g.fecha).toISOString().slice(0, 7) === filtroMes
      : true;
    return coincideCategoria && coincideMes;
  });

  const totalFiltrado = gastosFiltrados.reduce((acc, g) => acc + g.monto, 0);

  const mesesUnicos = [...new Set(
    gastos.map((g) => new Date(g.fecha).toISOString().slice(0, 7))
  )].sort().reverse();

  // Exportar a CSV
  const exportarCSV = () => {
    if (gastosFiltrados.length === 0) {
      mostrarToast("No hay gastos para exportar", "error");
      return;
    }

    const encabezados = ["Descripción", "Monto", "Categoría", "Fecha"];
    const filas = gastosFiltrados.map((g) => [
      g.descripcion,
      g.monto,
      categorias.find((c) => c.id === g.categoria_id)?.nombre || "Sin categoría",
      new Date(g.fecha).toLocaleDateString("es-CL")
    ]);

    const contenido = [encabezados, ...filas]
      .map((fila) => fila.join(","))
      .join("\n");

    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gastos_${filtroMes || "todos"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    mostrarToast("CSV exportado correctamente");
  };

  // Exportar a PDF
  const exportarPDF = () => {
    if (gastosFiltrados.length === 0) {
      mostrarToast("No hay gastos para exportar", "error");
      return;
    }

    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Reporte de Gastos", 14, 16);

    // Subtítulo con mes si está filtrado
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(
      filtroMes
        ? `Mes: ${new Date(filtroMes + "-01").toLocaleString("es-CL", { month: "long", year: "numeric" })}`
        : "Todos los meses",
      14,
      24
    );

    // Tabla
    autoTable(doc, {
      startY: 30,
      head: [["Descripción", "Monto", "Categoría", "Fecha"]],
      body: gastosFiltrados.map((g) => [
        g.descripcion,
        `$${g.monto.toLocaleString("es-CL")}`,
        categorias.find((c) => c.id === g.categoria_id)?.nombre || "Sin categoría",
        new Date(g.fecha).toLocaleDateString("es-CL")
      ]),
      foot: [["Total", `$${totalFiltrado.toLocaleString("es-CL")}`, "", ""]],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
      footStyles: { fillColor: [239, 246, 255], textColor: [30, 64, 175], fontStyle: "bold" }
    });

    doc.save(`gastos_${filtroMes || "todos"}.pdf`);
    mostrarToast("PDF exportado correctamente");
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
            min="0"
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

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          <select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Todos los meses</option>
            {mesesUnicos.map((mes) => (
              <option key={mes} value={mes}>
                {new Date(mes + "-01").toLocaleString("es-CL", { month: "long", year: "numeric" })}
              </option>
            ))}
          </select>
        </div>
        {(filtroCategoria || filtroMes) && (
          <button
            onClick={() => { setFiltroCategoria(""); setFiltroMes(""); }}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla de gastos */}
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Historial de gastos
            {gastosFiltrados.length !== gastos.length && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({gastosFiltrados.length} de {gastos.length})
              </span>
            )}
          </h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-blue-600">
              ${totalFiltrado.toLocaleString("es-CL")}
            </p>
          </div>
        </div>

        {/* Botones de exportar */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={exportarCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
          >
            Exportar CSV
          </button>
          <button
            onClick={exportarPDF}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
          >
            Exportar PDF
          </button>
        </div>

        {gastosFiltrados.length > 0 ? (
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
              {gastosFiltrados.map((g) => (
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
                    {confirmDelete === g.id ? (
                      <div className="flex gap-2 items-center">
                        <span className="text-gray-500 text-xs">¿Seguro?</span>
                        <button
                          onClick={() => handleDelete(g.id)}
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
                        onClick={() => setConfirmDelete(g.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-sm">No hay gastos para los filtros seleccionados.</p>
        )}
      </div>

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </div>
  );
}

export default Gastos;