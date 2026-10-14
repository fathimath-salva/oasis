// Hand-maintained from the ordered SQL migrations under supabase/migrations/.
// SQL text columns remain `string`; repository mappings validate constrained values.
type TableShape<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableShape<{
        id: string; full_name: string; email: string; phone: string; role: Database['public']['Enums']['user_role'];
        avatar_url: string | null; created_at: string; updated_at: string;
      }>;
      services: TableShape<{
        id: string; name: string; category: string; gender: Database['public']['Enums']['gender_classification'];
        description: string; price: number; price_confirmed: boolean; requires_confirmation: boolean;
        duration_minutes: number; is_active: boolean; image_url: string | null; created_at: string; updated_at: string;
        source_key: string | null; price_type: string; price_min: number | null;
        price_max: number | null; hair_length: string | null; source_note: string | null;
      }>;
      staff: TableShape<{
        id: string; profile_id: string | null; name: string; title: string; specialties: string[];
        is_active: boolean; rating: number; avatar_url: string | null; working_days: number[];
        start_time: string; end_time: string; created_at: string; updated_at: string; source_key: string | null;
      }>;
      staff_private: TableShape<{ staff_id: string; phone: string; email: string }>;
      staff_services: TableShape<{ staff_id: string; service_id: string }>;
      salon_business_hours: TableShape<{
        id: number; day_of_week: number; day_name: string; is_open: boolean; open_time: string; close_time: string;
      }>;
      salon_holidays: TableShape<{
        id: string; holiday_date: string; title: string; description: string | null; created_at: string;
      }>;
      appointments: TableShape<{
        id: string; booking_reference: string; customer_id: string; customer_name: string; customer_phone: string;
        customer_email: string; staff_id: string; appointment_date: string; start_time: string; end_time: string;
        total_duration_minutes: number; total_price: number; status: Database['public']['Enums']['appointment_status'];
        notes: string | null; payment_status: Database['public']['Enums']['payment_status'];
        payment_method: Database['public']['Enums']['payment_method'] | null; created_at: string; updated_at: string;
      }>;
      appointment_services: TableShape<{
        appointment_id: string; service_id: string; service_name: string; service_price: number; duration_minutes: number;
        hair_length: string | null;
      }>;
      payments: TableShape<{
        id: string; appointment_id: string; booking_reference: string; customer_name: string; amount: number;
        payment_method: Database['public']['Enums']['payment_method']; payment_status: Database['public']['Enums']['payment_status'];
        upi_transaction_id: string | null; recorded_by: string | null; recorded_at: string; notes: string | null;
      }>;
      audit_logs: TableShape<{
        id: string; user_id: string | null; user_name: string; user_role: Database['public']['Enums']['user_role'];
        action: string; entity_type: string; entity_id: string; details: Json; created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: { Args: Record<PropertyKey, never>; Returns: Database['public']['Enums']['user_role'] | null };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_staff: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_assigned_staff: { Args: { p_staff_id: string }; Returns: boolean };
      admin_set_profile_role: { Args: { p_user_id: string; p_role: Database['public']['Enums']['user_role'] }; Returns: undefined };
      get_available_slots: {
        Args: { p_date: string; p_duration_minutes: number; p_staff_id?: string | null; p_service_ids?: string[] | null };
        Returns: { available_time: string }[];
      };
      create_booking: {
        Args: {
          p_service_ids: string[]; p_appointment_date: string; p_start_time: string; p_staff_id?: string | null;
          p_customer_name?: string | null; p_customer_phone?: string | null; p_customer_email?: string | null; p_notes?: string | null;
        };
        Returns: Database['public']['Tables']['appointments']['Row'];
      };
      cancel_customer_booking: { Args: { p_appointment_id: string; p_reason?: string | null }; Returns: Database['public']['Tables']['appointments']['Row'] };
      reschedule_customer_booking: { Args: { p_appointment_id: string; p_new_date: string; p_new_start: string }; Returns: Database['public']['Tables']['appointments']['Row'] };
      update_appointment_status: {
        Args: { p_appointment_id: string; p_status: Database['public']['Enums']['appointment_status'] };
        Returns: Database['public']['Tables']['appointments']['Row'];
      };
      record_appointment_payment: {
        Args: { p_appointment_id: string; p_method: Database['public']['Enums']['payment_method']; p_upi_transaction_id?: string | null; p_notes?: string | null };
        Returns: Database['public']['Tables']['payments']['Row'];
      };
    };
    Enums: {
      user_role: 'customer' | 'staff' | 'admin';
      gender_classification: 'men' | 'women' | 'unisex';
      appointment_status: 'pending' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
      payment_method: 'cash' | 'upi' | 'card' | 'online';
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
