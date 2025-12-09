import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Calendar, MapPin, Users, LogOut, Car } from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  const { user, role, signOut } = useAuth();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/reservations', label: 'Reservas', icon: Calendar },
    { path: '/cities', label: 'Ciudades', icon: MapPin },
    { path: '/users', label: 'Usuarios', icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-slate-700 p-2 rounded-lg">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Dashboard Vial</h1>
              <p className="text-xs text-slate-400">Sistema administrativo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive(item.path)
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="mb-4 px-4 py-3 bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-400">Usuario activo</p>
            <p className="font-medium truncate text-white">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Rol: <span className="text-slate-300 font-medium capitalize">{role}</span>
            </p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition font-medium"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
