import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { City } from '../types/database';
import { Plus, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import CityForm from '../components/CityForm';
import { useAuth } from '../contexts/AuthContext';

export default function Cities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const { role } = useAuth();

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name');

      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  // const toggleCityStatus = async (city: City) => {
  //   try {
  //     const { error } = await supabase
  //       .from('cities')
  //       .update({ is_active: !city.is_active })
  //       .eq('id', city.id);

  //     if (error) throw error;
  //     fetchCities();
  //   } catch (error) {
  //     console.error('Error toggling city status:', error);
  //   }
  // };

  // const handleEdit = (city: City) => {
  //   setEditingCity(city);
  //   setShowForm(true);
  // };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCity(null);
  };

  const handleSuccess = () => {
    handleCloseForm();
    fetchCities();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando ciudades...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ciudades</h1>
          <p className="text-slate-600">
            Gestión de sedes y ubicaciones
          </p>
        </div>
        {role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition"
          >
            <Plus className="w-4 h-4" />
            Nueva Ciudad
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No hay ciudades registradas</p>
          </div>
        ) : (
          cities.map((city) => (
            <div
              key={city.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {city.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Código: {city.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  {city.is_active ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-700">
                        Activa
                      </span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-500">
                        Inactiva
                      </span>
                    </>
                  )}
                </div>

                {/* {role === 'admin' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(city)}
                      className="text-sm text-slate-600 hover:text-slate-900 font-medium transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleCityStatus(city)}
                      className="text-sm text-slate-600 hover:text-slate-900 font-medium transition"
                    >
                      {city.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                )} */}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <CityForm
          city={editingCity}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
