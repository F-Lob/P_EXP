export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers(), ...options.headers },
  });

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || "No fue posible completar la solicitud");
  }
  return data;
}

export const getGastos = () => request("/gastos/");
export const createGasto = (gasto) => request("/gastos/", { method: "POST", body: JSON.stringify(gasto) });
export const updateGasto = (id, gasto) => request(`/gastos/${id}`, { method: "PUT", body: JSON.stringify(gasto) });
export const deleteGasto = (id) => request(`/gastos/${id}`, { method: "DELETE" });

export const getCategorias = () => request("/categorias/");
// Se mantienen por compatibilidad con pantallas antiguas; la API rechazará cambios porque las categorías son fijas.
export const createCategoria = (categoria) => request("/categorias/", { method: "POST", body: JSON.stringify(categoria) });
export const deleteCategoria = (id) => request(`/categorias/${id}`, { method: "DELETE" });
export const getTarjetas = () => request("/tarjetas/");
export const createTarjeta = (tarjeta) => request("/tarjetas/", { method: "POST", body: JSON.stringify(tarjeta) });
export const deleteTarjeta = (id) => request(`/tarjetas/${id}`, { method: "DELETE" });

export const getGastosTarjeta = (tarjetaId) => request(`/gastos-tarjeta/tarjeta/${tarjetaId}`);
export const createGastoTarjeta = (gasto) => request("/gastos-tarjeta/", { method: "POST", body: JSON.stringify(gasto) });
export const pagarCuota = (gastoId) => request(`/gastos-tarjeta/${gastoId}/pagar-cuota`, { method: "PATCH" });
export const deleteGastoTarjeta = (id) => request(`/gastos-tarjeta/${id}`, { method: "DELETE" });

export const getSueldo = async () => {
  try {
    return await request("/sueldo/");
  } catch (error) {
    if (error.message === "Sueldo no registrado") return null;
    throw error;
  }
};

export const setSueldo = (monto) => request("/sueldo/", { method: "POST", body: JSON.stringify({ monto }) });
export const getPerfil = () => request("/usuarios/perfil");
export const completarOnboarding = (datos) => request("/usuarios/onboarding", { method: "POST", body: JSON.stringify(datos) });
export const actualizarPresupuesto = (categoriaId, monto) => request(`/categorias/${categoriaId}/presupuesto`, { method: "PUT", body: JSON.stringify({ monto }) });
export const getMetas = () => request("/metas/");
export const crearMeta = (meta) => request("/metas/", { method: "POST", body: JSON.stringify(meta) });
export const aportarMeta = (metaId, monto) => request(`/metas/${metaId}/aportar`, { method: "PATCH", body: JSON.stringify({ monto }) });
export const eliminarMeta = (metaId) => request(`/metas/${metaId}`, { method: "DELETE" });
