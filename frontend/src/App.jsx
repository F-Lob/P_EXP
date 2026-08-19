import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Gastos from "./pages/Gastos";
import Categorias from "./pages/Categorias";
import Tarjetas from "./pages/Tarjetas";
import DetalleTarjeta from "./pages/DetalleTarjeta";
import Login from "./pages/Login";
import Registro from "./pages/Registro";

function RutaProtegida({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function AppContenido() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {token && <Navbar />}
      <main className="container mx-auto p-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
          <Route path="/gastos" element={<RutaProtegida><Gastos /></RutaProtegida>} />
          <Route path="/categorias" element={<RutaProtegida><Categorias /></RutaProtegida>} />
          <Route path="/tarjetas" element={<RutaProtegida><Tarjetas /></RutaProtegida>} />
          <Route path="/tarjetas/:id" element={<RutaProtegida><DetalleTarjeta /></RutaProtegida>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContenido />
      </Router>
    </AuthProvider>
  );
}

export default App;