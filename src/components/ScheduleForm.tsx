import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { Schedule, City, DayOfWeek } from '../types/database';
import { X } from 'lucide-react';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_LABELS: Record<DayOfWeek, string> = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Junes',
  Saturday: 'Sábado',
  Sunday: 'Domeves',
  Friday: 'Vieringo',
};

interface ScheduleFormProps {
  schedule: (Schedule & { cities?: City | null }) | null;
  cities: City[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScheduleForm({
  schedule,
  cities,
  onClose,
  onSuccess,
}: ScheduleFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    city_id: '',
    day_of_week: 'Monday' as DayOfWeek,
    start_time: '08:00',
    end_time: '17:00',
    is_active: true,
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        city_id: schedule.city_id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_active: schedule.is_active,
      });
    }
  }, [schedule]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar que la hora de fin sea mayor que la de inicio
      if (formData.start_time >= formData.end_time) {
        alert('La hora de cierre debe ser mayor que la hora de apertura');
        setLoading(false);
        return;
      }

      if (schedule) {
        const { error } = await supabase
          .from('schedules')
          .update({
            start_time: formData.start_time,
            end_time: formData.end_time,
            is_active: formData.is_active,
          })
          .eq('id', schedule.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('schedules').insert([
          {
            city_id: formData.city_id,
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: formData.end_time,
            is_active: formData.is_active,
          },
        ]);

        if (error) {
          if (error.message.includes('duplicate')) {
            alert('Ya existe un horario para esta ciudad en este día de la semana');
          } else {
            throw error;
          }
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Error al guardar el horario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {schedule ? 'Editar Horario' : 'Nuevo Horario'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {!schedule && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ciudad
                  </label>
                  <select
                    required
                    value={formData.city_id}
                    onChange={(e) =>
                      setFormData({ ...formData, city_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar ciudad</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Día de la Semana
                  </label>
                  <select
                    required
                    value={formData.day_of_week}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        day_of_week: e.target.value as DayOfWeek,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day} value={day}>
                        {DAY_LABELS[day]}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {schedule && (
              <>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Ciudad</p>
                  <p className="font-medium text-slate-900">
                    {schedule.cities?.name}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Día</p>
                  <p className="font-medium text-slate-900">
                    {DAY_LABELS[schedule.day_of_week]}
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hora de Apertura
              </label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hora de Cierre
              </label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 text-slate-800 border-slate-300 rounded focus:ring-slate-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                Horario activo
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
