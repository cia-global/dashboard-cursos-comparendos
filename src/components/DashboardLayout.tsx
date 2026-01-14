import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Calendar, MapPin, Users, LogOut, Car, CalendarClock } from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  const { user, role, signOut } = useAuth();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/reservations', label: 'Reservas', icon: Calendar },
    { path: '/schedules', label: 'Horarios', icon: CalendarClock },
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
    <div className="min-h-screen bg-slate-50 flex shadow-sm border border-slate-600">
      <aside className="w-64 bg-white text-black flex flex-col fixed h-full shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            
               <img
                src="/images/icon.png"
                alt="Banner decorativo"
                className=" h-10 w-10 object-contain "
                />
            
            <div>
              <h1 className="text-lg font-bold">Cursos Comparendos</h1>
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
                        ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white'
                        : 'text-slate-500 hover:bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 hover:text-white'
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
          <div className="mb-4 px-4 py-3 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 rounded-lg">
            <p className="text-sm text-slate-400">Usuario activo</p>
            <p className="font-medium truncate text-white">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Rol: <span className="text-slate-300 font-medium capitalize">{role}</span>
            </p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition font-medium text-white"
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
