-- Types Enum for User Roles
CREATE TYPE public.user_role AS ENUM ('interviewer', 'administrator');

-- Types Enum for Survey Status
CREATE TYPE public.survey_status AS ENUM ('pending', 'active', 'completed', 'archived');

-- Types Enum for Interview Status
CREATE TYPE public.interview_status AS ENUM ('draft', 'completed', 'submitted', 'approved', 'rejected');

-- Profiles Table
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  updated_at timestamp with time zone,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  website text,
  role public.user_role DEFAULT 'interviewer'::public.user_role NOT NULL,
  CONSTRAINT username_length CHECK ((char_length(username) >= 3))
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ((auth.uid() = id));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'interviewer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Surveys Table
CREATE TABLE public.surveys (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    questions jsonb,
    is_active boolean DEFAULT true NOT NULL,
    status public.survey_status DEFAULT 'pending'::public.survey_status,
    city text,
    progress text,
    created_by uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Surveys are viewable by authenticated users." ON public.surveys FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can create surveys." ON public.surveys FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrator'));
CREATE POLICY "Admins can update surveys." ON public.surveys FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrator'));
CREATE POLICY "Admins can delete surveys." ON public.surveys FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrator'));


-- Interviewers Table
CREATE TABLE public.interviewers (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.interviewers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Interviewers data is managed by admins." ON public.interviewers FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrator'));
CREATE POLICY "Interviewers can view their own data." ON public.interviewers FOR SELECT USING (user_id = auth.uid());


-- Interviews Table
CREATE TABLE public.interviews (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id uuid REFERENCES public.surveys(id) ON DELETE CASCADE,
    interviewer_id uuid REFERENCES public.interviewers(id) ON DELETE SET NULL,
    respondent_name text,
    respondent_age integer,
    respondent_gender text,
    latitude double precision,
    longitude double precision,
    accuracy double precision,
    answers jsonb,
    status public.interview_status DEFAULT 'draft'::public.interview_status,
    is_offline boolean DEFAULT false,
    offline_synced boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see all interviews." ON public.interviews FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrator'));
CREATE POLICY "Interviewers can see their own interviews." ON public.interviews FOR SELECT USING (EXISTS (SELECT 1 FROM interviewers WHERE user_id = auth.uid() AND id = interviews.interviewer_id));
CREATE POLICY "Interviewers can create interviews." ON public.interviews FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM interviewers WHERE user_id = auth.uid() AND id = interviews.interviewer_id));


-- Automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables
CREATE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_surveys
BEFORE UPDATE ON public.surveys
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_interviews
BEFORE UPDATE ON public.interviews
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();
