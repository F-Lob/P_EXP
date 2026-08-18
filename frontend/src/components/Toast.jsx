function Toast({ mensaje, tipo }) {
  if (!mensaje) return null;

  const estilos = {
    exito: "bg-green-500",
    error: "bg-red-500"
  };

  return (
    <div className={`fixed bottom-6 right-6 text-white px-6 py-3 rounded-xl shadow-lg transition-all ${estilos[tipo]}`}>
      {mensaje}
    </div>
  );
}

export default Toast;