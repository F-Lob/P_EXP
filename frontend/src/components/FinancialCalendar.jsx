const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

export default function FinancialCalendar({ month, gastos }) {
  const [year, monthNumber] = month.split("-").map(Number);
  const startOffset = (new Date(year, monthNumber - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const totals = gastos.reduce((acc, gasto) => {
    if (!gasto.es_fijo && gasto.fecha.slice(0, 7) !== month) return acc;
    const day = gasto.es_fijo ? gasto.dia_cobro : new Date(gasto.fecha).getDate();
    acc[day] = (acc[day] || 0) + Number(gasto.monto);
    return acc;
  }, {});
  const cells = Array.from({ length: startOffset + daysInMonth }, (_, index) => index < startOffset ? null : index - startOffset + 1);

  return <section className="rounded-2xl bg-white p-5 shadow">
    <h2 className="font-semibold text-gray-800">Calendario financiero</h2>
    <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-gray-500">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
    <div className="mt-2 grid grid-cols-7 gap-1">{cells.map((day, index) => <div key={`${day}-${index}`} className={`min-h-12 rounded-lg p-1 text-xs ${day ? "bg-gray-50" : ""}`}>
      {day && <><span className="text-gray-500">{day}</span>{totals[day] && <span title={`$${totals[day].toLocaleString("es-CL")}`} className="mt-1 block truncate rounded bg-orange-100 px-1 font-medium text-orange-700">${Math.round(totals[day] / 1000)}k</span>}</>}
    </div>)}</div>
    <p className="mt-3 text-xs text-gray-500">Incluye movimientos registrados y cobros fijos planificados.</p>
  </section>;
}
