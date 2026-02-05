import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Appointment, City } from '../types/database';
import { Plus, Calendar, Search, NotebookPen, Filter, X  } from 'lucide-react';
import ReservationForm from '../components/ReservationForm';
import EditReservationModal from '../components/EditAppointmentModal';
import { API_URL } from '../config/api';

interface ReservationWithCity extends Appointment {
  cities?: City | null;
  course_types?: {
    id: string;
    name: string;
  } | null;
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export default function Reservations() {
  const [allReservations, setAllReservations] = useState<ReservationWithCity[]>([]); // 👈 NUEVO: Todas las reservas
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Appointment | null>(null);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  // 👇 SOLO fetchReservations cuando cambian los filtros del BACKEND
  useEffect(() => {
    fetchReservations();
  }, [statusFilter, cityFilter, dateFilter]); // 👈 SIN searchTerm

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

  const fetchReservations = async () => {
    setLoading(true);
    try {
      console.log('🔍 Filtros aplicados:', { statusFilter, cityFilter, dateFilter });

      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (cityFilter !== 'all') params.append('cityId', cityFilter);
      if (dateFilter) params.append('date', dateFilter);

      const url = `${API_URL}/api/appointments?${params.toString()}`;
      console.log('📡 Fetching:', url);

      const response = await fetch(url);
      const result = await response.json();

      console.log('📥 Respuesta del backend:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al cargar reservas');
      }

      setAllReservations(result.data || []); // 👈 Guardar TODAS las reservas
    } catch (error) {
      console.error('❌ Error fetching reservations:', error);
      // Fallback a Supabase
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*, cities(*), course_types(*)')
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true });

        if (error) throw error;
        setAllReservations(data || []);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // 👇 FILTRAR EN EL CLIENTE (sin hacer fetch)
  const filteredReservations = useMemo(() => {
    let results = allReservations;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase().trim();
      results = allReservations.filter((reservation) =>
        reservation.full_name.toLowerCase().includes(search) ||
        reservation.id_number.includes(search) ||
        reservation.citation_number.toLowerCase().includes(search)
      );
    }
    
    // 👈 Invertir el orden: mostrar las citas más nuevas primero
    return [...results].reverse();
  }, [allReservations, searchTerm]); // 👈 Se recalcula solo cuando cambian estas dependencias

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setCityFilter('all');
    setDateFilter('');
    setSearchTerm('');
  };

  const activeFiltersCount = 
    (statusFilter !== 'all' ? 1 : 0) +
    (cityFilter !== 'all' ? 1 : 0) +
    (dateFilter ? 1 : 0) +
    (searchTerm ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reservas</h1>
          <p className="text-slate-600">
            Gestión de citas para cursos comparendos
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition"
        >
          <Plus className="w-4 h-4" />
          Nueva Reserva
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, identificación o citación"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // 👈 SOLO actualiza el estado, no hace fetch
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
              activeFiltersCount > 0
                ? 'border-slate-800 bg-slate-50 text-slate-800'
                : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-slate-800 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* PANEL DE FILTROS */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por Estado */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estado
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      statusFilter === 'all'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      statusFilter === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                    }`}
                  >
                    Pendiente
                  </button>
                  <button
                    onClick={() => setStatusFilter('confirmed')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      statusFilter === 'confirmed'
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    Confirmada
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      statusFilter === 'completed'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    Completada
                  </button>
                  <button
                    onClick={() => setStatusFilter('cancelled')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      statusFilter === 'cancelled'
                        ? 'bg-red-500 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    Cancelada
                  </button>
                </div>
              </div>

              {/* Filtro por Ciudad */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ciudad
                </label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="all">Todas las ciudades</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Fecha */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Botón para limpiar filtros */}
            {activeFiltersCount > 0 && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-slate-600">
                  {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro activo' : 'filtros activos'}
                </span>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONTADOR DE RESULTADOS */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-600">
          {filteredReservations.length === 0 ? (
            'No se encontraron reservas'
          ) : (
            <>
              Mostrando <strong>{filteredReservations.length}</strong> de <strong>{allReservations.length}</strong> reservas
            </>
          )}
        </span>
        {activeFiltersCount > 0 && (
          <span className="text-sm text-slate-500">
            Filtros aplicados: {activeFiltersCount}
          </span>
        )}
      </div>

      {/* Tabla de reservas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Nombre Completo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Identificación
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Hora
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Ciudad
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Editar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 mb-2">No se encontraron reservas</p>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-slate-600 hover:text-slate-900 text-sm underline"
                      >
                        Limpiar filtros para ver todas las reservas
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {reservation.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {reservation.id_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(reservation.appointment_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatTime(reservation.appointment_time)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {reservation.cities?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(reservation.status)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setEditingReservation(reservation)}
                        className="text-slate-600 hover:text-slate-900 transition"
                        title="Editar reserva"
                      >
                        <NotebookPen className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ReservationForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchReservations();
          }}
        />
      )}
      
      {editingReservation && (
        <EditReservationModal
          reservation={editingReservation}
          onClose={() => setEditingReservation(null)}
          onSuccess={() => {
            setEditingReservation(null);
            fetchReservations();
          }}
        />
      )}
    </div>
  );
}