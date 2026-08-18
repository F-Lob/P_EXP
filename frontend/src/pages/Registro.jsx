import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Toast from "../components/Toast";

function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", confirmar: "" });
  const [toast, setToast] = useState({ mensaje: "", tipo: "" });

  const mostrarToast = (mensaje, tipo = "error") => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast({ mensaje: "", tipo: "" }), 3000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.username || !form.password || !form.confirmar) {
      mostrarToast("Completa todos los campos");
      return;
    }

    if (form.password !== form.confirmar) {
      mostrarToast("Las contraseñas no coinciden");
      return;
    }

    if (form.password.length < 6) {
      mostrarToast("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/usuarios/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password
        })
      });

      if (!response.ok) {
        const data = await response.json();
        mostrarToast(data.detail || "Error al registrar usuario");
        return;
      }

      mostrarToast("Usuario creado correctamente, inicia sesión", "exito");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      mostrarToast("Error al conectar con el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">💰 Crear cuenta</h1>

        <div className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={form.username}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="confirmar"
            placeholder="Confirmar contraseña"
            value={form.confirmar}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full"
        >
          Registrarse
        </button>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>

      <Toast mensaje={toast.mensaje} tipo={toast.tipo} />
    </div>
  );
}

export default Registro;