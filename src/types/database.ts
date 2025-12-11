export type UserRole = 'admin' | 'recepcion';

export type ReservationStatus = 'pending' | 'completed' | 'cancelled';

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  city_id: string;
  course_type_id: string;
  full_name: string;
  id_number: string;
  citation_number: string;
  phone: string;
  email: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      user_roles: {
        Row: UserRoleRecord;
        Insert: Omit<UserRoleRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<UserRoleRecord, 'id' | 'created_at'>>;
      };
      cities: {
        Row: City;
        Insert: Omit<City, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<City, 'id' | 'created_at' | 'updated_at'>>;
      };
      reservations: {
        Row: Appointment;
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
