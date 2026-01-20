import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserRoleRecord } from '../types/database';
import { Users as UsersIcon, Shield, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'recepcion';
  created_at: string;
}

interface UserWithEmail extends UserRole {
  email: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { role } = useAuth();

  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👥 Obteniendo usuarios...');
      
      // 1. Obtener roles de usuarios
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) {
        console.error('❌ Error obteniendo roles:', rolesError);
        throw rolesError;
      }

      console.log('📊 Roles obtenidos:', userRoles?.length);

      // 2. Obtener emails de los usuarios
      const usersWithEmails = await Promise.all(
        (userRoles || []).map(async (userRole) => {
          try {
            // 👇 IMPORTANTE: Esto requiere service_role key
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userRole.user_id);
            
            if (userError) {
              console.warn(`⚠️ No se pudo obtener usuario ${userRole.user_id}:`, userError);
            }
            
            return {
              ...userRole,
              email: user?.email || 'Email no disponible',
            };
          } catch (err) {
            console.error('Error al obtener email:', err);
            return {
              ...userRole,
              email: 'Error al cargar',
            };
          }
        })
      );

      setUsers(usersWithEmails);
      console.log('✅ Usuarios cargados:', usersWithEmails.length);
    } catch (error: any) {
      console.error('❌ Error fetching users:', error);
      setError('Error al cargar los usuarios. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-slate-100 text-slate-800',
      recepcion: 'bg-blue-100 text-blue-800',
    };

    const labels = {
      admin: 'Administrador',
      recepcion: 'Recepción',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Guard: Solo admins
  if (role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-slate-600">
            Solo los administradores pueden acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Usuarios</h1>
            <p className="text-slate-600">
              Gestión de usuarios y roles del sistema
            </p>
          </div>
          
          {/* 👇 OPCIONAL: Botón para recargar */}
          <button
            onClick={fetchUsers}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Correo Electrónico
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Fecha de Registro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No hay usuarios registrados</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-full">
                          <UserCircle className="w-5 h-5 text-slate-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {user.email.split('@')[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}