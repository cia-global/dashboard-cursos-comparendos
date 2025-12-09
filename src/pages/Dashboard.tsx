import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, CalendarClock, MapPin } from 'lucide-react';

interface Stats {
  todayReservations: number;
  upcomingReservations: number;
  activeCities: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    todayReservations: 0,
    upcomingReservations: 0,
    activeCities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { count: todayCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today);

      const { count: upcomingCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', today)
        .eq('status', 'pending');

      const { count: citiesCount } = await supabase
        .from('cities')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        todayReservations: todayCount || 0,
        upcomingReservations: upcomingCount || 0,
        activeCities: citiesCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Reservas de Hoy',
      value: stats.todayReservations,
      icon: Calendar,
      color: 'bg-blue-500',
      description: 'Citas programadas para hoy',
    },
    {
      title: 'Reservas Próximas',
      value: stats.upcomingReservations,
      icon: CalendarClock,
      color: 'bg-green-500',
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">
          Resumen general del sistema de educación vial
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
          Bienvenido al Sistema de Gestión Vial
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Este panel administrativo te permite gestionar reservas, ciudades y usuarios del sistema de educación y sensibilización vial.
          Utiliza el menú lateral para navegar entre las diferentes secciones.
        </p>
      </div>
    </div>
  );
}
