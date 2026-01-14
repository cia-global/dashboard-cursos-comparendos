import { useEffect, useState } from 'react';
import { Calendar, CalendarClock, MapPin, CalendarRange, AlertCircle } from 'lucide-react';
import { API_URL } from '../config/api';

interface Stats {
  appointmentsToday: number;
  appointmentsThisWeek: number;
  pendingAppointments: number;
  activeCities: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    appointmentsToday: 0,
    appointmentsThisWeek: 0,
    pendingAppointments: 0,
    activeCities: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
     const response = await fetch(`${API_URL}/api/stats`);
      const data = await response.json();

        if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al cargar estadísticas');
      }

      setStats(data.data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      setError(error.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Reservas de Hoy',
      value: stats.appointmentsToday,
      icon: Calendar,
      color: 'bg-blue-500',
      description: 'Citas programadas para hoy',
    },{
      title: 'Reservas de esta semana',
      value: stats.appointmentsThisWeek,
      icon: CalendarRange,
      color: 'bg-green-500',
      description: 'Citas pendientes en total',
    },
    {
      title: 'Reservas Próximas',
      value: stats.pendingAppointments,
      icon: CalendarClock,
      color: 'bg-yellow-500',
      description: 'Citas pendientes en total',
    },
    {
      title: 'Sedes Activas',
      value: stats.activeCities,
      icon: MapPin,
      color: 'bg-slate-500',
      description: 'Ciudades operativas',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

   if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-red-700 font-medium">Error al cargar estadísticas</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={fetchStats}
              className="text-red-700 underline text-sm mt-2"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">
          Resumen general del sistema de agendamiento cursos comparendos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-slate-900 mb-2">
                {card.value}
              </p>
              <p className="text-xs text-slate-500">{card.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Bienvenido al Sistema de Gestión de agendamientos
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Este panel administrativo te permite gestionar reservas, ciudades y usuarios del sistema de educación y sensibilización vial.
          Utiliza el menú lateral para navegar entre las diferentes secciones.
        </p>
      </div>
    </div>
  );
}
