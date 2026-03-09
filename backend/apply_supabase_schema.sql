-- SkillMatch AI Backend Schema Update
-- --------------------------------------------------------
-- Run this in your Supabase SQL Editor to enable all HR/AI features!

-- 1. ADD MISSING COLUMNS TO PROFILES
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS extracted_skills JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS resume_url VARCHAR(1000),
  ADD COLUMN IF NOT EXISTS resume_text TEXT;

-- 2. CREATE JOB ROLES TABLE
CREATE TABLE IF NOT EXISTS public.job_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    required_skills JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    avg_salary VARCHAR(100),
    industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_role_id UUID NOT NULL REFERENCES public.job_roles(id) ON DELETE CASCADE,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    recommended_courses JSONB DEFAULT '[]'::jsonb,
    practice_tasks JSONB DEFAULT '[]'::jsonb,
    match_score FLOAT DEFAULT 0,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_role_id UUID NOT NULL REFERENCES public.job_roles(id) ON DELETE CASCADE,
    match_score FLOAT DEFAULT 0,
    matched_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'rejected')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SEED JOB ROLES FOR DEMO PURPOSES
INSERT INTO public.job_roles (title, category, required_skills, description, avg_salary) VALUES
('Frontend Developer', 'Software Engineering', '[{"skill_name":"React","importance":5},{"skill_name":"TypeScript","importance":4},{"skill_name":"CSS","importance":3}]'::jsonb, 'Build beautiful UIs', '$110,000'),
('Data Scientist', 'Data', '[{"skill_name":"Python","importance":5},{"skill_name":"Machine Learning","importance":5},{"skill_name":"SQL","importance":4}]'::jsonb, 'Analyze data and build models', '$135,000'),
('Product Manager', 'Management', '[{"skill_name":"Agile","importance":5},{"skill_name":"Jira","importance":4},{"skill_name":"Communication","importance":5}]'::jsonb, 'Lead product strategy and execution', '$140,000');
