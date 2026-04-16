import { Link, useLocation, Outlet } from 'react-router-dom';
import { Bell } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from "react-hot-toast";
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Calendar, MapPin, Users, LogOut, CalendarClock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardLayout() {
  const location = useLocation();
  const [notificationsCount, setNotificationsCount] = useState(0);
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

  const playSound = () => {
  const audio = new Audio("sounds/notification.mp3");
  audio.play().catch(() => {}); // evita errores de autoplay
};

  useEffect(() => {
  const channel = supabase
    .channel("appointments-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "appointments",
      },
      async (payload) => {
          console.log("📡 Evento realtime recibido:", payload);
        const appointment = payload.new;

        // 🔥 obtener ciudad (simple)
        const { data: city } = await supabase
          .from("cities")
          .select("name")
          .eq("id", appointment.city_id)
          .single();
          console.log("🏙️ Ciudad encontrada:", city);
        handleNewAppointment({
          ...appointment,
          city_name: city?.name || "Ciudad",
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

const handleNewAppointment = (appointment) => {
  // 🔴 badge
  console.log("🔔 Nueva notificación procesada:", appointment);
  setNotificationsCount((prev) => prev + 1);

  // 🔊 sonido
  playSound();


  toast.success(
    `Nueva reserva en ${appointment.city_name}\n${appointment.full_name}`,
    {
      duration: 5000,
    }
  );
};

  return (
    <div className="min-h-screen bg-slate-50 flex shadow-sm border border-slate-600">
      <Toaster position="top-right" />
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
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
  <div className="relative cursor-pointer">
  <Bell className="bg-slate-900 text-white  hover:scale-110 transition" size={24} onClick={() => setNotificationsCount(0)} />
    
  {notificationsCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
      {notificationsCount}
    </span>
  )}
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
