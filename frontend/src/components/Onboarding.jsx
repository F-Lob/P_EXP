import { useState } from "react";
import { completarOnboarding } from "../services/api";

const emptyFixedExpense = { descripcion: "", monto: "", categoria_id: "", dia_cobro: "" };

export default function Onboarding({ categorias, onComplete, onError }) {
  const [sueldo, setSueldo] = useState("");
  const [diaPago, setDiaPago] = useState("5");
  const [gastosFijos, setGastosFijos] = useState([]);
  const [nuevoGasto, setNuevoGasto] = useState(emptyFixedExpense);
  const [meta, setMeta] = useState({ nombre: "", monto_objetivo: "" });
  const [guardando, setGuardando] = useState(false);

  const agregarGasto = () => {
    if (!nuevoGasto.descripcion || Number(nuevoGasto.monto) <= 0 || !nuevoGasto.categoria_id || !nuevoGasto.dia_cobro) {
      onError("Completa el gasto fijo antes de agregarlo");
      return;
    }
    setGastosFijos((actuales) => [...actuales, { ...nuevoGasto, monto: Number(nuevoGasto.monto), categoria_id: Number(nuevoGasto.categoria_id), dia_cobro: Number(nuevoGasto.dia_cobro) }]);
    setNuevoGasto(emptyFixedExpense);
  };

  const guardar = async () => {
    if (Number(sueldo) <= 0 || Number(diaPago) < 1 || Number(diaPago) > 31) {
      onError("Indica tu sueldo y día de pago");
      return;
    }
    setGuardando(true);
    try {
      await completarOnboarding({
        sueldo: Number(sueldo),
        dia_pago: Number(diaPago),
        gastos_fijos: gastosFijos,
        meta: meta.nombre && Number(meta.monto_objetivo) > 0 ? { nombre: meta.nombre, monto_objetivo: Number(meta.monto_objetivo) } : null,
      });
      onComplete();
    } catch (error) {
      onError(error.message);
    } finally {
      setGuardando(false);
    }
  };

  return <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
    <span className="text-sm font-semibold text-blue-700">Configuración inicial</span>
    <h2 className="mt-1 text-xl font-bold text-gray-800">Dejemos lista tu vida financiera</h2>
    <p className="mt-1 text-sm text-gray-600">Solo toma un minuto. Podrás cambiar todo después.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <input type="number" min="1" placeholder="Sueldo mensual" value={sueldo} onChange={(e) => setSueldo(e.target.value)} className="rounded-lg border bg-white px-3 py-2" />
      <input type="number" min="1" max="31" placeholder="Día de pago" value={diaPago} onChange={(e) => setDiaPago(e.target.value)} className="rounded-lg border bg-white px-3 py-2" />
    </div>
    <div className="mt-5 rounded-xl bg-white p-4">
      <h3 className="font-semibold text-gray-800">Gastos fijos (opcional)</h3>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <input placeholder="Ej. Arriendo" value={nuevoGasto.descripcion} onChange={(e) => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })} className="rounded-lg border px-3 py-2" />
        <input type="number" min="1" placeholder="Monto" value={nuevoGasto.monto} onChange={(e) => setNuevoGasto({ ...nuevoGasto, monto: e.target.value })} className="rounded-lg border px-3 py-2" />
        <select value={nuevoGasto.categoria_id} onChange={(e) => setNuevoGasto({ ...nuevoGasto, categoria_id: e.target.value })} className="rounded-lg border bg-white px-3 py-2"><option value="">Categoría</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
        <div className="flex gap-2"><input type="number" min="1" max="31" placeholder="Día" value={nuevoGasto.dia_cobro} onChange={(e) => setNuevoGasto({ ...nuevoGasto, dia_cobro: e.target.value })} className="min-w-0 rounded-lg border px-3 py-2" /><button onClick={agregarGasto} className="rounded-lg bg-gray-800 px-3 text-white">+</button></div>
      </div>
      {gastosFijos.length > 0 && <p className="mt-3 text-sm text-gray-600">{gastosFijos.map((g) => `${g.descripcion} (${g.monto.toLocaleString("es-CL")})`).join(" · ")}</p>}
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2"><input placeholder="Meta de ahorro (opcional)" value={meta.nombre} onChange={(e) => setMeta({ ...meta, nombre: e.target.value })} className="rounded-lg border bg-white px-3 py-2" /><input type="number" min="1" placeholder="Monto de la meta" value={meta.monto_objetivo} onChange={(e) => setMeta({ ...meta, monto_objetivo: e.target.value })} className="rounded-lg border bg-white px-3 py-2" /></div>
    <button disabled={guardando} onClick={guardar} className="mt-5 rounded-lg bg-blue-600 px-5 py-2 font-medium text-white disabled:opacity-60">{guardando ? "Guardando..." : "Empezar a usar mi resumen"}</button>
  </section>;
}
