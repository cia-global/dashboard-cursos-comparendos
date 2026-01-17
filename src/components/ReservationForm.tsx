import { useState, useEffect, FormEvent, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { City, Schedule, CourseType } from '../types/database';
import { X } from 'lucide-react';
import { API_URL } from '../config/api';



interface ReservationFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

 const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const getDayNameFromDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return DAY_NAMES[date.getDay()];
};


export default function ReservationForm({ onClose, onSuccess }: ReservationFormProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    id_number: '',
    citation_number: '',
    phone: '',
    email: '',
    appointment_date: '',
    appointment_time: '',
    city_id: '',
    course_type_id: '',
  });
 
  useEffect(() => {
    fetchCities();
    fetchCourseTypes();
  }, []);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchCourseTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('course_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCourseTypes(data || []);
    } catch (error) {
      console.error('Error fetching course types:', error);
    }
  };

   useEffect(() => {
    if (!formData.city_id) {
      setSchedules([]);
      return;
    }

    const fetchSchedules = async () => {
      setLoadingSchedules(true);
      try {
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .eq('city_id', formData.city_id)
          .eq('is_active', true)
          .order('day_of_week');

        if (error) throw error;
        setSchedules(data || []);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, [formData.city_id]);

  const filteredSchedules = useMemo(() => {
    if (!formData.appointment_date || schedules.length === 0) return [];

    const selectedDayName = getDayNameFromDate(formData.appointment_date);
    
    return schedules
      .filter(s => s.day_of_week === selectedDayName)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [schedules, formData.appointment_date]);

   useEffect(() => {
    if (!formData.appointment_time) return;
    
    const isTimeStillValid = filteredSchedules.some(
      s => s.start_time === formData.appointment_time
    );
    
    if (!isTimeStillValid) {
      setFormData(prev => ({ ...prev, appointment_time: '' }));
    }
  }, [filteredSchedules, formData.appointment_time]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('📤 Enviando datos al backend:', formData);

    try {
      // 👇 LLAMAR AL BACKEND
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city_id: formData.city_id,
          course_type_id: formData.course_type_id,
          full_name: formData.full_name,
          id_number: formData.id_number,
          citation_number: formData.citation_number,
          phone: formData.phone,
          email: formData.email,
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          status: 'pending',
        }),
      });

      const result = await response.json();
      console.log('📥 Respuesta del backend:', result);

      if (!response.ok || !result.success) {
        // Mostrar errores de validación
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details
            .map((err: any) => `• ${err.message}`)
            .join('\n');
          throw new Error(`Errores de validación:\n${errorMessages}`);
        }
        throw new Error(result.error || 'Error al crear la reserva');
      }

      alert('✅ Reserva creada exitosamente. Se ha enviado un email de confirmación.');
      onSuccess();
    } catch (error: any) {
      console.error('❌ Error creating reservation:', error);
      alert(error.message || 'Error al crear la reserva. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const canSelectSchedule = Boolean(formData.city_id && formData.appointment_date);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Nueva Reserva</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ciudad *
              </label>
              <select
                required
                value={formData.city_id}
                onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
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

            {/* Tipo de Curso */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Curso *
              </label>
              <select
                required
                value={formData.course_type_id}
                onChange={(e) => setFormData({ ...formData, course_type_id: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">Seleccionar curso</option>
                {courseTypes.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
                 {/* Fecha de Cita */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha de Cita *
              </label>
              <input
                type="date"
                required
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
              />
            </div>

           
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hora de Cita *
              </label>
               <select
                required
                value={formData.appointment_time}
                disabled={!canSelectSchedule}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">Seleccionar hora</option>
                {filteredSchedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.start_time}>
                    {schedule.start_time}
                  </option>
                ))}
              </select>
            </div>
            {/* Nombre Completo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                minLength={3}
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Ej: Juan Pérez García"
              />
            </div>

            {/* Número de Identificación */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Número de Identificación *
              </label>
              <input
                type="text"
                required
                minLength={5}
                value={formData.id_number}
                onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Ej: 1234567890"
              />
            </div>

            {/* Número de Comparendo */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Número de Comparendo *
              </label>
              <input
                type="text"
                required
                value={formData.citation_number}
                onChange={(e) => setFormData({ ...formData, citation_number: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Ej: CIT-2024-001"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                required
                minLength={7}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Ej: 3001234567"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Ej: juan@example.com"
              />
            </div>

           
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Reserva'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

