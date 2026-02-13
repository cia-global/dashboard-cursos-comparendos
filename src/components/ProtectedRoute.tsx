import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();

  if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
        <p className="text-slate-600">Cargando...</p>
      </div>
    </div>
  );
}

// ❌ No logueado
if (!user) {
  return <Navigate to="/login" replace />;
}

// ⏳ Usuario existe pero rol aún no
if (!role) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-600">Verificando permisos...</p>
    </div>
  );
}

// 🚫 Rol no autorizado
if (!['admin', 'recepcion'].includes(role)) {
  return <Navigate to="/login" replace />;
}

return <>{children}</>;
}
