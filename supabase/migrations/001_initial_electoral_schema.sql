-- Initial database schema for London Pesquisas electoral data system
-- Created: 2025-09-03

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for user roles (extends Supabase auth.users)
CREATE TABLE user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('interviewer', 'administrator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Table for interviewers (additional details for interviewer role)
CREATE TABLE interviewers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL, -- Brazilian CPF number
    phone_number TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for survey templates
CREATE TABLE surveys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL, -- Store survey questions and options as JSON
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for interviews (conducted surveys)
CREATE TABLE interviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES interviewers(id) ON DELETE CASCADE,
    respondent_name TEXT,
    respondent_age INTEGER,
    respondent_gender TEXT,
    respondent_location TEXT,
    latitude DOUBLE PRECISION, -- GPS coordinates
    longitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION, -- GPS accuracy in meters
    answers JSONB NOT NULL, -- Store interview responses
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'submitted', 'approved', 'rejected')),
    is_offline BOOLEAN DEFAULT FALSE,
    offline_synced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Table for reports
CREATE TABLE reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('survey_summary', 'interviewer_performance', 'geographic_analysis')),
    filters JSONB, -- Store report filters as JSON
    data JSONB NOT NULL, -- Store report data
    format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'word')),
    generated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    downloaded_at TIMESTAMP WITH TIME ZONE
);

-- Table for messages/notifications
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id),
    receiver_id UUID REFERENCES auth.users(id),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'notification' CHECK (type IN ('notification', 'alert', 'message')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for better performance
CREATE INDEX idx_interviews_survey_id ON interviews(survey_id);
CREATE INDEX idx_interviews_interviewer_id ON interviews(interviewer_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_offline_synced ON interviews(offline_synced);
CREATE INDEX idx_interviews_created_at ON interviews(created_at);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- RLS (Row Level Security) policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles
CREATE POLICY "Users can view their own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Administrators can manage all roles" ON user_roles FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'administrator')
);

-- Policies for interviewers
CREATE POLICY "Interviewers can view their own profile" ON interviewers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Administrators can manage all interviewers" ON interviewers FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'administrator')
);

-- Policies for surveys
CREATE POLICY "All authenticated users can view active surveys" ON surveys FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Administrators can manage surveys" ON surveys FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'administrator')
);

-- Policies for interviews
CREATE POLICY "Interviewers can manage their own interviews" ON interviews FOR ALL USING (
    interviewer_id IN (SELECT id FROM interviewers WHERE user_id = auth.uid())
);
CREATE POLICY "Administrators can manage all interviews" ON interviews FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'administrator')
);

-- Policies for reports
CREATE POLICY "Users can view their own reports" ON reports FOR SELECT USING (generated_by = auth.uid());
CREATE POLICY "Administrators can manage all reports" ON reports FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'administrator')
);

-- Policies for messages
CREATE POLICY "Users can view their own messages" ON messages FOR SELECT USING (receiver_id = auth.uid());
CREATE POLICY "Users can manage their sent messages" ON messages FOR ALL USING (sender_id = auth.uid());
CREATE POLICY "Administrators can manage all messages" ON messages FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'administrator')
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interviewers_updated_at BEFORE UPDATE ON interviewers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial roles and sample data if needed
-- Note: This would typically be done through the application, but we can add seed data later