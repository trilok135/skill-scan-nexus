-- ============================================================
-- SkillMatch AI - Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- USERS TABLE
-- ────────────────────────────────────────────────────────────
create table if not exists users (
    id              uuid primary key default uuid_generate_v4(),
    email           varchar(255) unique not null,
    hashed_password varchar(255) not null,
    full_name       varchar(255) not null,
    role            varchar(50)  not null default 'student'
                        check (role in ('student', 'hr')),
    is_verified     boolean default false,
    created_at      timestamp with time zone default now(),
    updated_at      timestamp with time zone default now()
);

-- ────────────────────────────────────────────────────────────
-- STUDENT PROFILES TABLE
-- ────────────────────────────────────────────────────────────
create table if not exists student_profiles (
    id              uuid primary key default uuid_generate_v4(),
    user_id         uuid unique not null references users(id) on delete cascade,
    extracted_skills jsonb default '[]'::jsonb,   -- [{skill_name, proficiency, source}]
    projects        jsonb default '[]'::jsonb,    -- [{title, description, tech_stack, url}]
    experience      jsonb default '[]'::jsonb,    -- [{company, role, duration, description}]
    education       jsonb default '[]'::jsonb,    -- [{degree, institution, year}]
    linkedin_url    varchar(500),
    resume_url      varchar(1000),
    resume_text     text,
    last_updated    timestamp with time zone default now()
);

-- ────────────────────────────────────────────────────────────
-- JOB ROLES TABLE
-- ────────────────────────────────────────────────────────────
create table if not exists job_roles (
    id              uuid primary key default uuid_generate_v4(),
    title           varchar(255) not null,
    category        varchar(100),
    required_skills jsonb default '[]'::jsonb,    -- [{skill_name, importance}]
    description     text,
    avg_salary      varchar(100),
    industry        varchar(100),
    created_at      timestamp with time zone default now()
);

-- ────────────────────────────────────────────────────────────
-- COURSES TABLE
-- ────────────────────────────────────────────────────────────
create table if not exists courses (
    id              uuid primary key default uuid_generate_v4(),
    title           varchar(500) not null,
    provider        varchar(255),
    url             varchar(1000),
    skills_covered  jsonb default '[]'::jsonb,    -- [skill_name strings]
    course_type     varchar(50) default 'free'
                        check (course_type in ('free', 'paid', 'certification')),
    rating          float default 0,
    duration_hours  float default 0,
    created_at      timestamp with time zone default now()
);

-- ────────────────────────────────────────────────────────────
-- RECOMMENDATIONS TABLE
-- ────────────────────────────────────────────────────────────
create table if not exists recommendations (
    id                  uuid primary key default uuid_generate_v4(),
    user_id             uuid not null references users(id) on delete cascade,
    job_role_id         uuid not null references job_roles(id) on delete cascade,
    missing_skills      jsonb default '[]'::jsonb,
    recommended_courses jsonb default '[]'::jsonb,
    practice_tasks      jsonb default '[]'::jsonb,
    match_score         float default 0,
    generated_at        timestamp with time zone default now()
);

-- ────────────────────────────────────────────────────────────
-- APPLICATIONS TABLE (HR candidate tracking)
-- ────────────────────────────────────────────────────────────
create table if not exists applications (
    id              uuid primary key default uuid_generate_v4(),
    student_id      uuid not null references users(id) on delete cascade,
    job_role_id     uuid not null references job_roles(id) on delete cascade,
    match_score     float default 0,
    matched_skills  jsonb default '[]'::jsonb,
    missing_skills  jsonb default '[]'::jsonb,
    status          varchar(50) default 'pending'
                        check (status in ('pending', 'shortlisted', 'rejected')),
    applied_at      timestamp with time zone default now()
);

-- ────────────────────────────────────────────────────────────
-- DISABLE ROW LEVEL SECURITY (backend-managed API)
-- ────────────────────────────────────────────────────────────
alter table users              disable row level security;
alter table student_profiles   disable row level security;
alter table job_roles          disable row level security;
alter table courses            disable row level security;
alter table recommendations    disable row level security;
alter table applications       disable row level security;

-- ────────────────────────────────────────────────────────────
-- INDEXES for performance
-- ────────────────────────────────────────────────────────────
create index if not exists idx_users_email           on users(email);
create index if not exists idx_student_profiles_uid  on student_profiles(user_id);
create index if not exists idx_recommendations_uid   on recommendations(user_id);
create index if not exists idx_recommendations_jrid  on recommendations(job_role_id);
create index if not exists idx_applications_sid      on applications(student_id);
create index if not exists idx_applications_jrid     on applications(job_role_id);
create index if not exists idx_applications_status   on applications(status);
