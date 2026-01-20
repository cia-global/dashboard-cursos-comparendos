import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Appointment, Schedule } from '../types/database';


interface EditReservationModalProps {
  reservation: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completada', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelada', color: 'bg-red-100 text-red-800' },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getDayNameFromDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return DAY_NAMES[date.getDay()];
};

export default function EditReservationModal({ reservation, onClose, onSuccess }: EditReservationModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>(reservation.status);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [formData, setFormData] = useState({
    full_name: reservation.full_name,
    id_number: reservation.id_number,
    citation_number: reservation.citation_number,
    phone: reservation.phone,
    email: reservation.email,
    appointment_date: reservation.appointment_date,
    appointment_time: reservation.appointment_time.substring(0, 5), // HH:mm
    city_id: reservation.city_id,
  });

  // 👇 CARGAR SCHEDULES AL MONTAR EL COMPONENTE
  useEffect(() => {
    if (formData.city_id) {
      fetchSchedules(formData.city_id);
    }
  }, []);

  // 👇 RECARGAR SCHEDULES CUANDO CAMBIA LA CIUDAD O FECHA
  useEffect(() => {
    if (formData.city_id) {
      fetchSchedules(formData.city_id);
    }
  }, [formData.city_id]);

  const fetchSchedules = async (cityId: string) => {
    setLoadingSchedules(true);
    try {
      console.log('📅 Cargando schedules para ciudad:', cityId);
      
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('city_id', cityId)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      
      console.log('📅 Schedules cargados:', data);
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  // 👇 FILTRAR SCHEDULES POR DÍA SELECCIONADO
  const filteredSchedules = useMemo(() => {
    if (!formData.appointment_date || schedules.length === 0) {
      console.log('⚠️ No hay fecha seleccionada o no hay schedules');
      return [];
    }

    const selectedDayName = getDayNameFromDate(formData.appointment_date);
    console.log('📅 Día seleccionado:', selectedDayName);
    
    const filtered = schedules
      .filter(s => s.day_of_week === selectedDayName)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    console.log('📅 Horarios filtrados:', filtered);
    return filtered;
  }, [schedules, formData.appointment_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        full_name: formData.full_name,
        id_number: formData.id_number,
        citation_number: formData.citation_number,
        phone: formData.phone,
        email: formData.email,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        status: status,
      };

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', reservation.id);

      if (error) throw error;

      alert('✅ Reserva actualizada exitosamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating reservation:', error);
      alert('❌ Error al actualizar la reserva: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal al presionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Editar Reserva
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                ID: {reservation.id.substring(0, 8)}...
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Estado de la Reserva
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value as any)}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-sm font-medium
                      ${status === option.value 
                        ? 'border-slate-800 ring-2 ring-slate-300 ' + option.color
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.full_name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Identificación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identificación
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.id_number}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Número de citación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Comparendo
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.citation_number}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  disabled
                  value={formData.phone}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => {
                    console.log('📅 Fecha cambiada a:', e.target.value);
                    setFormData({ 
                      ...formData, 
                      appointment_date: e.target.value,
                      appointment_time: '' // 👈 Resetear hora cuando cambia la fecha
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora {loadingSchedules && <span className="text-xs text-gray-500">(Cargando...)</span>}
                </label>
                <select
                  required
                  value={formData.appointment_time}
                  onChange={(e) => {
                    console.log('⏰ Hora cambiada a:', e.target.value);
                    setFormData({ ...formData, appointment_time: e.target.value });
                  }}
                  disabled={loadingSchedules || filteredSchedules.length === 0}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar hora</option>
                  {filteredSchedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.start_time.substring(0, 5)}>
                      {schedule.start_time.substring(0, 5)}
                    </option>
                  ))}
                </select>
                {!loadingSchedules && filteredSchedules.length === 0 && formData.appointment_date && (
                  <p className="text-xs text-red-500 mt-1">
                    No hay horarios disponibles para este día
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}