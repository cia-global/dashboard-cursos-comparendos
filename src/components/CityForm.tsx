import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { City } from '../types/database';
import { X } from 'lucide-react';

interface CityFormProps {
  city: City | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CityForm({ city, onClose, onSuccess }: CityFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    is_active: true,
  });

  useEffect(() => {
    if (city) {
      setFormData({
        name: city.name,
        code: city.code,
        is_active: city.is_active,
      });
    }
  }, [city]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (city) {
        const { error } = await supabase
          .from('cities')
          .update(formData)
          .eq('id', city.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('cities').insert([formData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving city:', error);
      alert('Error al guardar la ciudad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {city ? 'Editar Ciudad' : 'Nueva Ciudad'}
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre de la Ciudad
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Ej: Bogotá"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Código
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent uppercase"
                placeholder="Ej: BOG"
                maxLength={3}
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
                Ciudad activa
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
