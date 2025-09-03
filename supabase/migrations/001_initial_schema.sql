-- Drop existing tables to start with a clean slate
DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "reports" CASCADE;
DROP TABLE IF EXISTS "interviews" CASCADE;
DROP TABLE IF EXISTS "surveys" CASCADE;
DROP TABLE IF EXISTS "interviewers" CASCADE;
DROP TABLE IF EXISTS "user_roles" CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- Table for User Roles
CREATE TABLE "user_roles" (
  "id" UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  "user_id" UUID REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "role" TEXT CHECK (role IN ('interviewer', 'administrator')) NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table for Interviewers
CREATE TABLE "interviewers" (
  "id" UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  "user_id" UUID REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "full_name" TEXT NOT NULL,
  "cpf" TEXT UNIQUE,
  "phone_number" TEXT,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAМPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table for Surveys
CREATE TABLE "surveys" (
  "id" UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "questions" JSONB,
  "status" TEXT CHECK (status IN ('pending', 'active', 'completed', 'archived')) DEFAULT 'pending',
  "city" TEXT,
  "progress" TEXT,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_by" UUID REFERENCES "auth"."users"("id"),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table for Interviews
CREATE TABLE "interviews" (
  "id" UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  "survey_id" UUID REFERENCES "surveys"("id") ON DELETE CASCADE,
  "interviewer_id" UUID REFERENCES "interviewers"("id") ON DELETE SET NULL,
  "respondent_name" TEXT,
  "respondent_age" INTEGER,
  "respondent_gender" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "accuracy" DOUBLE PRECISION,
  "answers" JSONB,
  "status" TEXT CHECK (status IN ('draft', 'completed', 'submitted', 'approved', 'rejected')) DEFAULT 'draft',
  "is_offline" BOOLEAN DEFAULT FALSE,
  "offline_synced" BOOLEAN DEFAULT FALSE,
  "completed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table for Reports
CREATE TABLE "reports" (
  "id" UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  "title" TEXT NOT NULL,
  "type" TEXT,
  "filters" JSONB,
  "data" JSONB,
  "format" TEXT,
  "generated_by" UUID REFERENCES "auth"."users"("id"),
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table for Messages/Alerts
CREATE TABLE "messages" (
  "id" UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  "sender_id" UUID REFERENCES "auth"."users"("id"),
  "receiver_id" UUID REFERENCES "auth"."users"("id"),
  "subject" TEXT,
  "content" TEXT NOT NULL,
  "type" TEXT DEFAULT 'message',
  "is_read" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "read_at" TIMESTAMPTZ
);

-- Row Level Security Policies
-- Enable RLS for all tables
ALTER TABLE "user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "interviewers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "surveys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "interviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "Admins full access" ON "surveys" FOR ALL USING (
  (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'administrator'
);
CREATE POLICY "Admins full access" ON "interviews" FOR ALL USING (
  (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'administrator'
);

-- Interviewers can only see their own assigned surveys and interviews
CREATE POLICY "Interviewers can see assigned surveys" ON "surveys" FOR SELECT USING (
  (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'interviewer'
);
CREATE POLICY "Interviewers can manage their own interviews" ON "interviews" FOR ALL USING (
  (SELECT i.user_id FROM interviewers i WHERE i.id = interviewer_id) = auth.uid()
);

-- Allow public read for specific cases if needed (example)
CREATE POLICY "Public read on surveys" ON "surveys" FOR SELECT USING (true);
