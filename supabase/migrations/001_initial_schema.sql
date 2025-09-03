-- Apaga tipos e tabelas existentes para garantir um ambiente limpo.
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.survey_status CASCADE;
DROP TYPE IF EXISTS public.interview_status CASCADE;
DROP TABLE IF EXISTS public.surveys CASCADE;
DROP TABLE IF EXISTS public.interviews CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


-- Criação dos Tipos (ENUMS)
CREATE TYPE public.user_role AS ENUM ('interviewer', 'administrator');
CREATE TYPE public.survey_status AS ENUM ('pending', 'active', 'completed', 'archived');
CREATE TYPE public.interview_status AS ENUM ('draft', 'completed', 'submitted', 'approved', 'rejected');


-- Tabela de Perfis (Profiles)
-- Armazena dados públicos dos usuários, com link para a tabela de autenticação.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role public.user_role NOT NULL DEFAULT 'interviewer'::public.user_role,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Pesquisas (Surveys)
-- Armazena os modelos e configurações das pesquisas.
CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status public.survey_status DEFAULT 'pending'::public.survey_status,
  city TEXT,
  progress TEXT,
  questions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Entrevistas (Interviews)
-- Armazena cada entrevista realizada.
CREATE TABLE public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.surveys(id),
  interviewer_id UUID REFERENCES public.profiles(id),
  answers JSONB,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  status public.interview_status DEFAULT 'draft'::public.interview_status,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Política para Perfis: Usuários podem ver todos os perfis, mas só podem atualizar o seu.
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para Pesquisas: Administradores podem fazer tudo, entrevistadores podem apenas ler.
CREATE POLICY "Admins can manage surveys." ON public.surveys
  FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrator'
  );
CREATE POLICY "Interviewers can view surveys." ON public.surveys
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'interviewer'
  );

-- Política para Entrevistas: Administradores veem tudo, entrevistadores só podem criar e ver suas próprias entrevistas.
CREATE POLICY "Admins can manage all interviews." ON public.interviews
  FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrator'
  );
CREATE POLICY "Interviewers can create interviews." ON public.interviews
  FOR INSERT WITH CHECK (
    auth.uid() = interviewer_id
  );
CREATE POLICY "Interviewers can view their own interviews." ON public.interviews
  FOR SELECT USING (
    auth.uid() = interviewer_id
  );
