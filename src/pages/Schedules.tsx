import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Schedule, City, DayOfWeek } from '../types/database';
import { Plus, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import ScheduleForm from '../components/ScheduleForm';
import { useAuth } from '../contexts/AuthContext';

interface ScheduleWithCity extends Schedule {
  cities?: City | null;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_LABELS: Record<DayOfWeek, string> = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
};

export default function Schedules() {
  const [schedules, setSchedules] = useState<ScheduleWithCity[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleWithCity | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const { role } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesData, citiesData] = await Promise.all([
        supabase
          .from('schedules')
          .select('*, cities(*)')
          .order('city_id')
          .order('day_of_week'),
        supabase
          .from('cities')
          .select('*')
          .eq('is_active', true)
          .order('name'),
      ]);

      if (schedulesData.error) throw schedulesData.error;
      if (citiesData.error) throw citiesData.error;

      setSchedules(schedulesData.data || []);
      setCities(citiesData.data || []);

      if (citiesData.data && citiesData.data.length > 0) {
        setSelectedCity(citiesData.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleScheduleStatus = async (schedule: ScheduleWithCity) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .update({ is_active: !schedule.is_active })
        .eq('id', schedule.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error toggling schedule status:', error);
    }
  };

  const handleEdit = (schedule: ScheduleWithCity) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSchedule(null);
  };

  const handleSuccess = () => {
    handleCloseForm();
    fetchData();
  };

  const filteredSchedules = schedules.filter(
    (schedule) => !selectedCity || schedule.city_id === selectedCity
  );

  const groupedByDay: Record<DayOfWeek, ScheduleWithCity[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  filteredSchedules.forEach((schedule) => {
    groupedByDay[schedule.day_of_week].push(schedule);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Horarios</h1>
          <p className="text-slate-600">
            Gestión de horarios de atención por ciudad
          </p>
        </div>
        {role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition"
          >
            <Plus className="w-4 h-4" />
            Nuevo Horario
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Filtrar por ciudad
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        >
          <option value="">Todas las ciudades</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day) => {
          const daySchedules = groupedByDay[day];
          const hasSchedules = daySchedules.length > 0;

          return (
            <div
              key={day}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">
                  {DAY_LABELS[day]}
                </h3>
              </div>

              {hasSchedules ? (
                <div className="divide-y divide-slate-200">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-6 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="bg-slate-100 p-3 rounded-lg">
                          <Clock className="w-5 h-5 text-slate-700" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {schedule.cities?.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {schedule.start_time} - {schedule.end_time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {schedule.is_active ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-green-500" />
                              <span className="text-sm font-medium text-green-700">
                                Activo
                              </span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-medium text-slate-500">
                                Inactivo
                              </span>
                            </>
                          )}
                        </div>

                        {role === 'admin' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(schedule)}
                              className="text-sm text-slate-600 hover:text-slate-900 font-medium transition"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => toggleScheduleStatus(schedule)}
                              className="text-sm text-slate-600 hover:text-slate-900 font-medium transition"
                            >
                              {schedule.is_active ? 'Desactivar' : 'Activar'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-slate-500 text-sm">
                    No hay horarios asignados para este día
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <ScheduleForm
          schedule={editingSchedule}
          cities={cities}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
