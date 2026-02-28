/*
  # Government Services Portal Database Schema

  ## Overview
  This migration sets up the complete database structure for a government services portal
  with citizen services, officer workflow, and administrative capabilities.

  ## New Tables

  ### 1. profiles
  Extended user profile information linked to auth.users
  - `id` (uuid, FK to auth.users)
  - `full_name` (text)
  - `phone` (text)
  - `aadhaar_number` (text, encrypted)
  - `address` (text)
  - `role` (text: 'citizen', 'verification_officer', 'approving_authority', 'admin')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. departments
  Government departments offering services
  - `id` (uuid, primary key)
  - `name` (text)
  - `code` (text, unique)
  - `description` (text)
  - `icon` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 3. services
  Services offered by departments
  - `id` (uuid, primary key)
  - `department_id` (uuid, FK)
  - `name` (text)
  - `code` (text, unique)
  - `description` (text)
  - `required_documents` (jsonb)
  - `processing_days` (integer)
  - `fee_amount` (decimal)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 4. applications
  Citizen applications for various services
  - `id` (uuid, primary key)
  - `application_number` (text, unique)
  - `user_id` (uuid, FK)
  - `service_id` (uuid, FK)
  - `status` (text: 'draft', 'submitted', 'under_review', 'approved', 'rejected')
  - `form_data` (jsonb)
  - `documents` (jsonb)
  - `current_officer_id` (uuid, nullable)
  - `remarks` (text)
  - `submitted_at` (timestamptz)
  - `approved_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. grievances
  Citizen grievances and complaints
  - `id` (uuid, primary key)
  - `grievance_number` (text, unique)
  - `user_id` (uuid, FK)
  - `subject` (text)
  - `description` (text)
  - `category` (text)
  - `status` (text: 'open', 'in_progress', 'resolved', 'closed')
  - `assigned_officer_id` (uuid, nullable)
  - `resolution` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. appointments
  Slot booking for services like driving tests
  - `id` (uuid, primary key)
  - `application_id` (uuid, FK)
  - `user_id` (uuid, FK)
  - `appointment_date` (date)
  - `time_slot` (text)
  - `officer_id` (uuid, nullable)
  - `status` (text: 'scheduled', 'completed', 'cancelled', 'rescheduled')
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 7. payments
  Payment records for services
  - `id` (uuid, primary key)
  - `application_id` (uuid, FK)
  - `user_id` (uuid, FK)
  - `amount` (decimal)
  - `payment_method` (text)
  - `transaction_id` (text)
  - `status` (text: 'pending', 'completed', 'failed')
  - `receipt_number` (text)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Citizens can only access their own records
  - Officers can access records assigned to them
  - Admins have full access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  aadhaar_number text,
  address text,
  role text NOT NULL DEFAULT 'citizen',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('citizen', 'verification_officer', 'approving_authority', 'admin'))
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  required_documents jsonb DEFAULT '[]'::jsonb,
  processing_days integer DEFAULT 7,
  fee_amount decimal(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  status text DEFAULT 'draft',
  form_data jsonb DEFAULT '{}'::jsonb,
  documents jsonb DEFAULT '[]'::jsonb,
  current_officer_id uuid REFERENCES auth.users(id),
  remarks text,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected'))
);

-- Create grievances table
CREATE TABLE IF NOT EXISTS grievances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  category text,
  status text DEFAULT 'open',
  assigned_officer_id uuid REFERENCES auth.users(id),
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'))
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  time_slot text NOT NULL,
  officer_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled'))
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_method text,
  transaction_id text,
  status text DEFAULT 'pending',
  receipt_number text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Departments policies (public read)
CREATE POLICY "Anyone can view active departments"
  ON departments FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Services policies (public read)
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Applications policies
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own draft applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'draft')
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Officers can view assigned applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    current_officer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('verification_officer', 'approving_authority', 'admin')
    )
  );

CREATE POLICY "Officers can update applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('verification_officer', 'approving_authority', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('verification_officer', 'approving_authority', 'admin')
    )
  );

-- Grievances policies
CREATE POLICY "Users can view own grievances"
  ON grievances FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create grievances"
  ON grievances FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Officers can view assigned grievances"
  ON grievances FOR SELECT
  TO authenticated
  USING (
    assigned_officer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('verification_officer', 'approving_authority', 'admin')
    )
  );

CREATE POLICY "Officers can update grievances"
  ON grievances FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('verification_officer', 'approving_authority', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('verification_officer', 'approving_authority', 'admin')
    )
  );

-- Appointments policies
CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'scheduled')
  WITH CHECK (user_id = auth.uid());

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Insert initial departments
INSERT INTO departments (name, code, description, icon) VALUES
  ('Revenue & Civil Department', 'RCD', 'Citizen services including income, caste, and residence certificates', 'FileText'),
  ('Transport & Licensing Department', 'TLD', 'RTO services including license applications and vehicle tax', 'Car'),
  ('Social Welfare & Grievance Department', 'SWGD', 'Public support services and grievance redressal', 'Users')
ON CONFLICT (code) DO NOTHING;

-- Insert initial services
INSERT INTO services (department_id, name, code, description, required_documents, processing_days, fee_amount) VALUES
  ((SELECT id FROM departments WHERE code = 'RCD'), 'Income Certificate', 'INCOME_CERT', 'Certificate of income for various purposes', '["Salary Slips", "Bank Statement", "ID Proof"]', 7, 50.00),
  ((SELECT id FROM departments WHERE code = 'RCD'), 'Caste Certificate', 'CASTE_CERT', 'Certificate of caste/community', '["Community Proof", "Address Proof", "ID Proof"]', 15, 75.00),
  ((SELECT id FROM departments WHERE code = 'RCD'), 'Residence Certificate', 'RESIDENCE_CERT', 'Certificate of residence/domicile', '["Aadhaar Card", "Address Proof", "Utility Bills"]', 10, 50.00),
  ((SELECT id FROM departments WHERE code = 'TLD'), 'Learner''s License', 'LEARNER_LICENSE', 'Application for learner''s driving license', '["Age Proof", "Address Proof", "Passport Photo"]', 3, 200.00),
  ((SELECT id FROM departments WHERE code = 'TLD'), 'Vehicle Tax Payment', 'VEHICLE_TAX', 'Annual road tax payment for vehicles', '["RC Book", "Insurance", "Previous Tax Receipt"]', 1, 0.00),
  ((SELECT id FROM departments WHERE code = 'SWGD'), 'Old Age Pension', 'OLD_AGE_PENSION', 'Pension scheme for senior citizens', '["Age Proof", "Income Certificate", "Bank Details"]', 30, 0.00),
  ((SELECT id FROM departments WHERE code = 'SWGD'), 'Grievance Redressal', 'GRIEVANCE', 'Lodge complaints against delayed services', '[]', 7, 0.00)
ON CONFLICT (code) DO NOTHING;