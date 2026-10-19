import { useEffect, useMemo, useState } from "react";
import FinancialCalendar from "../components/FinancialCalendar";
import Onboarding from "../components/Onboarding";
import Toast from "../components/Toast";
import {
  aportarMeta, actualizarPresupuesto, createGasto, crearMeta, deleteGasto, eliminarMeta,
  getCategorias, getGastos, getMetas, getPerfil, getSueldo, setSueldo,
} from "../services/api";

const initialForm = { descripcion: "", monto: "", categoria_id: "", fecha: "", es_fijo: false, dia_cobro: "" };
const money = (value) => `$${Number(value || 0).toLocaleString("es-CL")}`;
const currentMonth = () => new Date().toISOString().slice(0, 7);

function Dashboard() {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [metas, setMetas] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [sueldo, setSueldoState] = useState(null);
  const [nuevoSueldo, setNuevoSueldo] = useState("");
  const [form, setForm] = useState(initialForm);
  const [mes, setMes] = useState(currentMonth());
  const [presupuestos, setPresupuestos] = useState({});
  const [nuevaMeta, setNuevaMeta] = useState({ nombre: "", monto_objetivo: "" });
  const [aportes, setAportes] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState({ mensaje: "", tipo: "" });

  const mostrarToast = (mensaje, tipo = "exito") => {
    setToast({ mensaje, tipo });
    window.setTimeout(() => setToast({ mensaje: "", tipo: "" }), 3500);
  };

  const cargarDatos = async () => {
    try {
      const [g, c, s, p, m] = await Promise.all([getGastos(), getCategorias(), getSueldo(), getPerfil(), getMetas()]);
      setGastos(g); setCategorias(c); setSueldoState(s); setPerfil(p); setMetas(m);
      setPresupuestos(Object.fromEntries(c.map((categoria) => [categoria.id, categoria.presupuesto_mensual || ""])));
    } catch (error) { mostrarToast(error.message || "No se pudieron cargar los datos", "error"); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const gastosDelMes = useMemo(() => gastos.filter((gasto) => gasto.fecha.slice(0, 7) === mes), [gastos, mes]);
  const previousMonth = useMemo(() => {
    const [year, month] = mes.split("-").map(Number);
    return new Date(year, month - 2, 1).toISOString().slice(0, 7);
  }, [mes]);
  const gastosMesAnterior = gastos.filter((gasto) => gasto.fecha.slice(0, 7) === previousMonth);
  const totalMes = gastosDelMes.reduce((sum, gasto) => sum + Number(gasto.monto), 0);
  const totalAnterior = gastosMesAnterior.reduce((sum, gasto) => sum + Number(gasto.monto), 0);
  const totalFijo = gastosDelMes.filter((gasto) => gasto.es_fijo).reduce((sum, gasto) => sum + Number(gasto.monto), 0);
  const saldo = sueldo ? Number(sueldo.monto) - totalMes : null;
  const gastosPorCategoria = categorias.map((categoria) => ({
    ...categoria,
    gastado: gastosDelMes.filter((gasto) => gasto.categoria_id === categoria.id).reduce((sum, gasto) => sum + Number(gasto.monto), 0),
  }));
  const gastoMayor = [...gastosDelMes].sort((a, b) => Number(b.monto) - Number(a.monto))[0];
  const porcentajeCambio = totalAnterior ? Math.round(((totalMes - totalAnterior) / totalAnterior) * 100) : null;
  const daysUntilPay = () => {
    if (!perfil?.dia_pago) return null;
    const today = new Date();
    const next = new Date(today.getFullYear(), today.getMonth(), perfil.dia_pago);
    if (next <= today) next.setMonth(next.getMonth() + 1);
    return Math.max(1, Math.ceil((next - today) / 86400000));
  };
  const diasParaPago = daysUntilPay();
  const diarioDisponible = saldo !== null && diasParaPago ? Math.max(0, saldo) / diasParaPago : null;
  const alertas = gastosPorCategoria.filter((categoria) => categoria.presupuesto_mensual && categoria.gastado / Number(categoria.presupuesto_mensual) >= 0.8);
  const hoy = new Date().getDate();
  const cobrosProximos = gastos.filter((gasto) => gasto.es_fijo && gasto.dia_cobro >= hoy && gasto.dia_cobro - hoy <= 3);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const agregarGasto = async () => {
    const monto = Number(form.monto); const categoriaId = Number(form.categoria_id); const dia = Number(form.dia_cobro);
    if (!form.descripcion.trim() || monto <= 0 || !categoriaId || (form.es_fijo && (dia < 1 || dia > 31))) return mostrarToast("Completa los datos obligatorios del gasto", "error");
    try {
      await createGasto({ descripcion: form.descripcion.trim(), monto, categoria_id: categoriaId, fecha: form.fecha || null, es_fijo: form.es_fijo, dia_cobro: form.es_fijo ? dia : null });
      setForm(initialForm); await cargarDatos(); mostrarToast("Gasto agregado correctamente");
    } catch (error) { mostrarToast(error.message, "error"); }
  };

  const guardarSueldo = async () => {
    if (Number(nuevoSueldo) <= 0) return mostrarToast("Ingresa un sueldo válido", "error");
    try { await setSueldo(Number(nuevoSueldo)); setNuevoSueldo(""); await cargarDatos(); mostrarToast("Sueldo actualizado"); } catch (error) { mostrarToast(error.message, "error"); }
  };
  const guardarPresupuesto = async (categoriaId) => {
    const monto = Number(presupuestos[categoriaId]);
    if (monto <= 0) return mostrarToast("El presupuesto debe ser mayor a cero", "error");
    try { await actualizarPresupuesto(categoriaId, monto); await cargarDatos(); mostrarToast("Presupuesto guardado"); } catch (error) { mostrarToast(error.message, "error"); }
  };
  const agregarMeta = async () => {
    if (!nuevaMeta.nombre.trim() || Number(nuevaMeta.monto_objetivo) <= 0) return mostrarToast("Completa la meta y su monto", "error");
    try { await crearMeta({ nombre: nuevaMeta.nombre.trim(), monto_objetivo: Number(nuevaMeta.monto_objetivo) }); setNuevaMeta({ nombre: "", monto_objetivo: "" }); await cargarDatos(); mostrarToast("Meta creada"); } catch (error) { mostrarToast(error.message, "error"); }
  };
  const aportar = async (metaId) => {
    const monto = Number(aportes[metaId]); if (monto <= 0) return;
    try { await aportarMeta(metaId, monto); setAportes({ ...aportes, [metaId]: "" }); await cargarDatos(); mostrarToast("Aporte registrado"); } catch (error) { mostrarToast(error.message, "error"); }
  };

  return <div className="space-y-6">
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-blue-600">Control simple, decisiones claras</p><h1 className="text-3xl font-bold text-gray-800">Mi resumen financiero</h1><p className="text-sm text-gray-500">Todo lo importante, en una sola pantalla.</p></div><select value={mes} onChange={(e) => setMes(e.target.value)} className="rounded-lg border bg-white px-3 py-2">{[...new Set([currentMonth(), ...gastos.map((g) => g.fecha.slice(0, 7))])].sort().reverse().map((item) => <option key={item} value={item}>{new Date(`${item}-01T12:00:00`).toLocaleDateString("es-CL", { month: "long", year: "numeric" })}</option>)}</select></header>

    {perfil && !perfil.onboarding_completado && <Onboarding categorias={categorias} onComplete={cargarDatos} onError={(mensaje) => mostrarToast(mensaje, "error")} />}

    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow"><p className="text-sm text-blue-100">Disponible este mes</p><p className="mt-1 text-3xl font-bold">{saldo === null ? "—" : money(saldo)}</p><div className="mt-3 flex gap-2"><input aria-label="Sueldo" type="number" min="1" placeholder={sueldo ? "Actualizar sueldo" : "Registrar sueldo"} value={nuevoSueldo} onChange={(e) => setNuevoSueldo(e.target.value)} className="min-w-0 rounded bg-white/15 px-2 py-1 text-sm placeholder:text-blue-100" /><button onClick={guardarSueldo} className="rounded bg-white px-2 text-sm font-medium text-blue-700">OK</button></div></div>
      <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-gray-500">Gastado en {mes}</p><p className="mt-1 text-2xl font-bold text-orange-500">{money(totalMes)}</p><p className={`mt-2 text-xs ${porcentajeCambio !== null && porcentajeCambio > 0 ? "text-red-600" : "text-green-600"}`}>{porcentajeCambio === null ? "Sin comparación previa" : `${porcentajeCambio > 0 ? "▲" : "▼"} ${Math.abs(porcentajeCambio)}% vs. mes anterior`}</p></div>
      <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-gray-500">Para gastar por día</p><p className="mt-1 text-2xl font-bold text-green-600">{diarioDisponible === null ? "Configura tu pago" : money(diarioDisponible)}</p><p className="mt-2 text-xs text-gray-500">{diasParaPago ? `${diasParaPago} días hasta tu pago` : "Define tu día de pago"}</p></div>
      <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-gray-500">Gasto más alto</p><p className="mt-1 truncate text-xl font-bold text-gray-800">{gastoMayor ? gastoMayor.descripcion : "Sin gastos"}</p><p className="mt-2 text-sm text-blue-600">{gastoMayor ? money(gastoMayor.monto) : "—"}</p></div>
    </section>

    {(alertas.length > 0 || cobrosProximos.length > 0) && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h2 className="font-semibold text-amber-900">Alertas financieras</h2><div className="mt-2 flex flex-wrap gap-2">{alertas.map((c) => <span key={c.id} className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">{c.nombre}: {Math.round((c.gastado / c.presupuesto_mensual) * 100)}% usado</span>)}{cobrosProximos.map((gasto) => <span key={`fijo-${gasto.id}`} className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">{gasto.descripcion}: cobro el día {gasto.dia_cobro}</span>)}</div></section>}

    <section className="rounded-2xl bg-white p-6 shadow"><h2 className="text-lg font-semibold text-gray-800">Registrar gasto</h2><div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4"><input name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} className="rounded-lg border px-3 py-2" /><input name="monto" type="number" min="1" placeholder="Monto" value={form.monto} onChange={handleChange} className="rounded-lg border px-3 py-2" /><select name="categoria_id" value={form.categoria_id} onChange={handleChange} className="rounded-lg border bg-white px-3 py-2"><option value="">Categoría</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select><input name="fecha" type="date" value={form.fecha} max={new Date().toISOString().slice(0, 10)} onChange={handleChange} className="rounded-lg border px-3 py-2" /></div><div className="mt-3 flex flex-wrap items-center gap-3"><label className="text-sm"><input name="es_fijo" type="checkbox" checked={form.es_fijo} onChange={handleChange} /> Gasto fijo</label>{form.es_fijo && <input name="dia_cobro" type="number" min="1" max="31" placeholder="Día de cobro" value={form.dia_cobro} onChange={handleChange} className="rounded-lg border px-3 py-2" />}<button onClick={agregarGasto} className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white">Agregar gasto</button></div></section>

    <section className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl bg-white p-5 shadow"><h2 className="font-semibold text-gray-800">Presupuestos por categoría</h2><div className="mt-4 space-y-4">{gastosPorCategoria.map((c) => { const limit = Number(c.presupuesto_mensual); const percent = limit ? Math.min(100, (c.gastado / limit) * 100) : 0; return <div key={c.id}><div className="flex justify-between text-sm"><span>{c.nombre}</span><span>{limit ? `${money(c.gastado)} / ${money(limit)}` : money(c.gastado)}</span></div>{limit ? <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full ${percent >= 100 ? "bg-red-500" : percent >= 80 ? "bg-amber-400" : "bg-green-500"}`} style={{ width: `${percent}%` }} /></div> : null}<div className="mt-2 flex gap-2"><input type="number" min="1" placeholder="Presupuesto" value={presupuestos[c.id] || ""} onChange={(e) => setPresupuestos({ ...presupuestos, [c.id]: e.target.value })} className="w-36 rounded border px-2 py-1 text-sm" /><button onClick={() => guardarPresupuesto(c.id)} className="text-sm text-blue-600">Guardar</button></div></div>; })}</div></div><FinancialCalendar month={mes} gastos={gastos} /></section>

    <section className="rounded-2xl bg-white p-5 shadow"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-gray-800">Metas de ahorro</h2><p className="text-sm text-gray-500">Convierte tu ahorro en avances visibles.</p></div><div className="flex gap-2"><input placeholder="Nueva meta" value={nuevaMeta.nombre} onChange={(e) => setNuevaMeta({ ...nuevaMeta, nombre: e.target.value })} className="w-32 rounded border px-2 py-1 text-sm" /><input type="number" min="1" placeholder="Monto" value={nuevaMeta.monto_objetivo} onChange={(e) => setNuevaMeta({ ...nuevaMeta, monto_objetivo: e.target.value })} className="w-28 rounded border px-2 py-1 text-sm" /><button onClick={agregarMeta} className="rounded bg-blue-600 px-3 text-sm text-white">Crear</button></div></div><div className="mt-4 grid gap-4 md:grid-cols-2">{metas.map((meta) => { const porcentaje = Math.min(100, Number(meta.monto_ahorrado) / Number(meta.monto_objetivo) * 100); return <div key={meta.id} className="rounded-xl border p-4"><div className="flex justify-between"><strong>{meta.nombre}</strong><button onClick={async () => { await eliminarMeta(meta.id); await cargarDatos(); }} className="text-xs text-red-500">Eliminar</button></div><p className="mt-1 text-sm text-gray-500">{money(meta.monto_ahorrado)} de {money(meta.monto_objetivo)}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-blue-600" style={{ width: `${porcentaje}%` }} /></div><div className="mt-3 flex gap-2"><input type="number" min="1" placeholder="Aportar" value={aportes[meta.id] || ""} onChange={(e) => setAportes({ ...aportes, [meta.id]: e.target.value })} className="w-28 rounded border px-2 py-1 text-sm" /><button onClick={() => aportar(meta.id)} className="text-sm text-blue-600">Sumar</button></div></div>; })}{metas.length === 0 && <p className="text-sm text-gray-500">Crea tu primera meta para empezar.</p>}</div></section>

    <section className="rounded-2xl bg-white p-5 shadow"><h2 className="font-semibold text-gray-800">Movimientos del mes</h2><div className="mt-3 space-y-2">{[...gastosDelMes].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((gasto) => <article key={gasto.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{gasto.descripcion}</p><p className="text-xs text-gray-500">{categorias.find((c) => c.id === gasto.categoria_id)?.nombre} · {new Date(gasto.fecha).toLocaleDateString("es-CL")}</p></div><div className="flex items-center gap-3"><strong className="text-blue-600">{money(gasto.monto)}</strong>{confirmDelete === gasto.id ? <span className="flex gap-2 text-xs"><button onClick={async () => { await deleteGasto(gasto.id); setConfirmDelete(null); await cargarDatos(); }} className="text-red-600">Confirmar</button><button onClick={() => setConfirmDelete(null)}>Cancelar</button></span> : <button onClick={() => setConfirmDelete(gasto.id)} className="text-xs text-red-500">Eliminar</button>}</div></article>)}{gastosDelMes.length === 0 && <p className="text-sm text-gray-500">No hay movimientos este mes.</p>}</div></section>
    <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
  </div>;
}

export default Dashboard;
