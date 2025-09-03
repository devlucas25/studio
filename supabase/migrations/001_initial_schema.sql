-- supabase/migrations/001_initial_schema.sql

-- Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgrst" WITH SCHEMA "public";
-- Tipos ENUM para segurança e consistência
CREATE TYPE user_role AS ENUM ('interviewer', 'administrator');
CREATE TYPE survey_status AS ENUM ('pending', 'active', 'completed', 'archived');
CREATE TYPE interview_status AS ENUM ('draft', 'completed', 'submitted', 'approved', 'rejected');

-- Tabela de perfis para associar papéis aos usuários
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabela de Entrevistadores
CREATE TABLE interviewers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cpf TEXT UNIQUE,
  phone_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Pesquisas
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  status survey_status DEFAULT 'pending',
  city TEXT,
  progress TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Entrevistas realizadas
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES interviewers(id) ON DELETE SET NULL,
  respondent_name TEXT,
  respondent_age INTEGER,
  respondent_gender TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  answers JSONB NOT NULL,
  status interview_status DEFAULT 'draft',
  is_offline BOOLEAN DEFAULT FALSE,
  offline_synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Habilitar Row Level Security (RLS) para todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para Administradores (acesso total)
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL TO authenticated USING (
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'administrator'
);
CREATE POLICY "Admins can manage all interviewers" ON interviewers FOR ALL TO authenticated USING (
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'administrator'
);
CREATE POLICY "Admins can manage all surveys" ON surveys FOR ALL TO authenticated USING (
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'administrator'
);
CREATE POLICY "Admins can manage all interviews" ON interviews FOR ALL TO authenticated USING (
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'administrator'
);

-- Políticas de acesso para Entrevistadores
CREATE POLICY "Interviewers can view their own profile" ON profiles FOR SELECT TO authenticated USING (
  user_id = auth.uid()
);
CREATE POLICY "Interviewers can update their own profile" ON profiles FOR UPDATE TO authenticated USING (
  user_id = auth.uid()
);
CREATE POLICY "Interviewers can view all active surveys" ON surveys FOR SELECT TO authenticated USING (
  status = 'active'
);
CREATE POLICY "Interviewers can manage their own interviews" ON interviews FOR ALL TO authenticated USING (
  interviewer_id IN (SELECT id FROM interviewers WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

-- Gatilho para criar um perfil quando um novo usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name)
  VALUES (new.id, 'interviewer', new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Gatilho para atualizar o campo `updated_at` automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_interviewers_updated_at BEFORE UPDATE ON interviewers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
