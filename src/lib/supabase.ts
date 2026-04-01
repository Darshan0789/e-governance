import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from Vite environment variables
const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
// Prefer the conventional name, but keep backward-compat with your existing env var.
const supabaseAnonKey: string | undefined =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY) are set.',
  );
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  aadhaar_number?: string;
  address?: string;
  employee_id?: string;
  department?: string;
  designation?: string;
  is_active?: boolean;
  role: 'citizen' | 'verification_officer' | 'approving_authority' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  department_id: string;
  name: string;
  code: string;
  description?: string;
  required_documents: string[];
  processing_days: number;
  fee_amount: number;
  is_active: boolean;
  created_at: string;
}

export interface Application {
  id: string;
  application_number: string;
  user_id: string;
  service_id?: string | null;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  form_data: Record<string, unknown>;
  documents: unknown[];
  current_officer_id?: string;
  remarks?: string;
  submitted_at?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}
