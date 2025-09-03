-- Tabela para armazenar perfis de usuário e seus papéis (roles)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('administrator', 'interviewer')),
    full_name TEXT,
    cpf TEXT UNIQUE,
    phone_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para armazenar as pesquisas
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para armazenar as entrevistas realizadas
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    respondent_name TEXT,
    respondent_age INTEGER,
    respondent_gender TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    answers JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'submitted', 'approved', 'rejected')),
    is_offline BOOLEAN DEFAULT FALSE,
    offline_synced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Tabela para gerenciar a atribuição de pesquisas aos entrevistadores
CREATE TABLE survey_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(survey_id, interviewer_id)
);

-- Tabela para relatórios gerados
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    filters JSONB,
    data JSONB NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('pdf', 'excel', 'word')),
    generated_by UUID REFERENCES auth.users(id),
    created_at TIMESTamptz DEFAULT NOW()
);

-- Tabela para mensagens e notificações
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES auth.users(id),
    receiver_id UUID REFERENCES auth.users(id),
    survey_id UUID REFERENCES surveys(id),
    subject TEXT,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'message' CHECK (type IN ('notification', 'alert', 'message')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTamptz DEFAULT NOW(),
    read_at TIMESTAMPTZ
);


-- Habilitar Row Level Security (RLS) para todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;


-- Políticas para a tabela 'profiles'
-- Administradores podem ver todos os perfis.
CREATE POLICY "Administrators can view all profiles" ON profiles
    FOR SELECT TO authenticated USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'administrator'
    );

-- Usuários podem ver seu próprio perfil.
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT TO authenticated USING (id = auth.uid());

-- Usuários podem atualizar seu próprio perfil.
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE TO authenticated USING (id = auth.uid());


-- Políticas para a tabela 'surveys'
-- Administradores podem gerenciar todas as pesquisas.
CREATE POLICY "Administrators can manage surveys" ON surveys
    FOR ALL TO authenticated USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'administrator'
    );

-- Entrevistadores podem ver as pesquisas que lhes foram atribuídas.
CREATE POLICY "Interviewers can view assigned surveys" ON surveys
    FOR SELECT TO authenticated USING (
        id IN (
            SELECT survey_id FROM survey_assignments WHERE interviewer_id = auth.uid()
        )
    );


-- Políticas para a tabela 'interviews'
-- Entrevistadores podem criar e gerenciar suas próprias entrevistas.
CREATE POLICY "Interviewers can manage their own interviews" ON interviews
    FOR ALL TO authenticated USING (interviewer_id = auth.uid());

-- Administradores podem ver todas as entrevistas.
CREATE POLICY "Administrators can view all interviews" ON interviews
    FOR SELECT TO authenticated USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'administrator'
    );


-- Políticas para a tabela 'survey_assignments'
-- Administradores podem gerenciar atribuições de pesquisas.
CREATE POLICY "Administrators can manage assignments" ON survey_assignments
    FOR ALL TO authenticated USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'administrator'
    );
