# Dashboard Vial Admin

Panel administrativo para el sistema de educación y sensibilización vial.

## Características

- Autenticación segura con Supabase (email/password)
- Sistema de roles (admin y recepción)
- Gestión de reservas de citas
- Administración de ciudades/sedes
- Panel de control con estadísticas en tiempo real
- Gestión de usuarios (solo para administradores)
- Interfaz responsive y moderna con Tailwind CSS

## Tecnologías

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Iconos**: Lucide React

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── CityForm.tsx
│   ├── DashboardLayout.tsx
│   ├── ProtectedRoute.tsx
│   └── ReservationForm.tsx
├── contexts/            # Contextos de React
│   └── AuthContext.tsx
├── lib/                 # Configuración de librerías
│   └── supabase.ts
├── pages/               # Páginas de la aplicación
│   ├── Cities.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Reservations.tsx
│   └── Users.tsx
├── types/               # Tipos TypeScript
│   └── database.ts
├── App.tsx              # Componente raíz
├── main.tsx             # Punto de entrada
└── index.css            # Estilos globales
```

## Configuración Inicial

### 1. Configurar Variables de Entorno

Crea o edita el archivo `.env.local` en la raíz del proyecto con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Crear un Usuario Administrador

Para crear tu primer usuario administrador, debes:

1. Registra un usuario en Supabase Auth (puedes usar la consola de Supabase o crear un endpoint de registro)
2. Ejecuta el siguiente SQL en la consola de Supabase para asignar el rol de admin:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('tu_user_id_aqui', 'admin');
```

## Ejecutar el Proyecto

### Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Compilar para Producción

```bash
npm run build
```

### Vista Previa de Producción

```bash
npm run preview
```

## Rutas del Sistema

- `/login` - Página de inicio de sesión
- `/` - Dashboard principal con estadísticas
- `/reservations` - Gestión de reservas
- `/cities` - Gestión de ciudades/sedes
- `/users` - Gestión de usuarios (solo admin)

## Roles y Permisos

### Admin
- Acceso completo a todas las funcionalidades
- Puede gestionar usuarios
- Puede crear, editar y eliminar ciudades
- Puede gestionar todas las reservas

### Recepción
- Puede ver y gestionar reservas
- Puede ver ciudades (sin editar)
- No tiene acceso a la gestión de usuarios

## Base de Datos

El proyecto incluye las siguientes tablas:

### user_roles
Almacena los roles de los usuarios del sistema.

### cities
Gestiona las ciudades/sedes donde se realizan las capacitaciones.

### reservations
Registra todas las citas programadas para educación vial.

## Seguridad

- Todas las tablas tienen Row Level Security (RLS) habilitado
- Las políticas de RLS garantizan que solo usuarios autenticados con roles válidos puedan acceder a los datos
- Las contraseñas se gestionan de forma segura a través de Supabase Auth

## Próximas Mejoras

- Sistema de notificaciones
- Exportación de reportes en PDF/Excel
- Calendario visual para las reservas
- Sistema de recordatorios por email
- Dashboard con más métricas y gráficos

## Soporte

Para reportar problemas o sugerir mejoras, contacta al equipo de desarrollo.
