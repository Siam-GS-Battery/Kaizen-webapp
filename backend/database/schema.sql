-- Kaizen Web Application Database Schema
-- This file contains the complete database schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Supervisor', 'User');
CREATE TYPE five_s_type AS ENUM ('ส1', 'ส2', 'ส3', 'ส4', 'ส5');
CREATE TYPE improvement_topic AS ENUM ('Safety', 'Env', 'Quality', 'Cost', 'Delivery');
CREATE TYPE sgs_smart AS ENUM ('People', 'Factory');
CREATE TYPE sgs_strong AS ENUM ('Energy_3R', 'Workplace');
CREATE TYPE sgs_green AS ENUM ('Teamwork', 'Branding');
CREATE TYPE form_type AS ENUM ('genba', 'suggestion', 'best_kaizen');
CREATE TYPE project_status AS ENUM ('EDIT', 'WAITING', 'APPROVED', 'REJECTED');

-- Users table (employees)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    five_s_area VARCHAR(100),
    project_area VARCHAR(100),
    role user_role DEFAULT 'User',
    password_hash TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Five S Groups table
CREATE TABLE five_s_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Areas table
CREATE TABLE project_areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    department_id INTEGER REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (main tasklist data)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(200) NOT NULL,
    employee_id VARCHAR(20) REFERENCES users(employee_id) ON DELETE CASCADE,
    position VARCHAR(100) DEFAULT 'เจ้าหน้าที่',
    department VARCHAR(50) NOT NULL,
    five_s_group_name VARCHAR(100),
    project_area VARCHAR(100),
    project_start_date DATE NOT NULL,
    project_end_date DATE NOT NULL,
    problems_encountered TEXT NOT NULL,
    solution_approach TEXT NOT NULL,
    results_achieved TEXT,
    five_s_type five_s_type NOT NULL,
    improvement_topic improvement_topic NOT NULL,
    sgs_smart sgs_smart,
    sgs_strong sgs_strong,
    sgs_green sgs_green,
    before_project_image VARCHAR(255),
    after_project_image VARCHAR(255),
    created_date_th VARCHAR(20),
    submitted_date_th VARCHAR(20),
    status project_status DEFAULT 'EDIT',
    form_type form_type NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for user session management∆
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) REFERENCES users(employee_id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table for tracking uploaded files
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) UNIQUE NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    mimetype VARCHAR(100),
    size_bytes INTEGER,
    uploaded_by VARCHAR(20) REFERENCES users(employee_id),
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_projects_employee_id ON projects(employee_id);
CREATE INDEX idx_projects_department ON projects(department);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_form_type ON projects(form_type);
CREATE INDEX idx_projects_created_date ON projects(created_date);
CREATE INDEX idx_projects_submitted_date ON projects(submitted_date);

CREATE INDEX idx_sessions_employee_id ON sessions(employee_id);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);
CREATE INDEX idx_sessions_last_activity ON sessions(last_activity);

-- Triggers for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_five_s_groups_updated_at BEFORE UPDATE ON five_s_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_areas_updated_at BEFORE UPDATE ON project_areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and admins can read all
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.jwt() ->> 'employee_id' = employee_id OR 
                     (auth.jwt() ->> 'role')::user_role IN ('Admin', 'Manager'));

-- Users can update their own data (except role), admins can update all
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.jwt() ->> 'employee_id' = employee_id OR 
                     (auth.jwt() ->> 'role')::user_role = 'Admin');

-- Projects policies
CREATE POLICY "Users can view projects" ON projects
    FOR SELECT USING (
        employee_id = auth.jwt() ->> 'employee_id' OR
        (auth.jwt() ->> 'role')::user_role IN ('Admin', 'Manager', 'Supervisor')
    );

CREATE POLICY "Users can create own projects" ON projects
    FOR INSERT WITH CHECK (employee_id = auth.jwt() ->> 'employee_id');

CREATE POLICY "Users can update own projects or supervisors can update any" ON projects
    FOR UPDATE USING (
        employee_id = auth.jwt() ->> 'employee_id' OR
        (auth.jwt() ->> 'role')::user_role IN ('Admin', 'Manager', 'Supervisor')
    );

CREATE POLICY "Users can delete own projects or admins can delete any" ON projects
    FOR DELETE USING (
        employee_id = auth.jwt() ->> 'employee_id' OR
        (auth.jwt() ->> 'role')::user_role = 'Admin'
    );

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (employee_id = auth.jwt() ->> 'employee_id');

CREATE POLICY "Users can create own sessions" ON sessions
    FOR INSERT WITH CHECK (employee_id = auth.jwt() ->> 'employee_id');

CREATE POLICY "Users can update own sessions" ON sessions
    FOR UPDATE USING (employee_id = auth.jwt() ->> 'employee_id');

-- Files policies
CREATE POLICY "Users can view files" ON files
    FOR SELECT USING (
        uploaded_by = auth.jwt() ->> 'employee_id' OR
        (auth.jwt() ->> 'role')::user_role IN ('Admin', 'Manager', 'Supervisor')
    );

CREATE POLICY "Users can upload files" ON files
    FOR INSERT WITH CHECK (uploaded_by = auth.jwt() ->> 'employee_id');

CREATE POLICY "Users can delete own files or admins can delete any" ON files
    FOR DELETE USING (
        uploaded_by = auth.jwt() ->> 'employee_id' OR
        (auth.jwt() ->> 'role')::user_role = 'Admin'
    );

-- Insert initial data
INSERT INTO departments (code, name, description) VALUES
('IT&DM', 'IT & Digital Management', 'Information Technology and Digital Management Department'),
('HR&AD', 'HR & Administration', 'Human Resources and Administration Department'),
('PD', 'Production', 'Production Department'),
('PC', 'Production Control', 'Production Control Department'),
('QA', 'Quality Assurance', 'Quality Assurance Department'),
('SD', 'Sales', 'Sales Department'),
('AF', 'Accounting & Finance', 'Accounting and Finance Department'),
('TD', 'Technical', 'Technical Department');

INSERT INTO five_s_groups (name, description, location) VALUES
('5ส ณ บางปูใหม่', 'Five S Group at Bangpoo New', 'Bangpoo New Office'),
('5ส ณ โรงงาน A', 'Five S Group at Factory A', 'Factory A'),
('5ส ณ โรงงาน B', 'Five S Group at Factory B', 'Factory B'),
('5ส ณ คลังสินค้า', 'Five S Group at Warehouse', 'Main Warehouse'),
('กลุ่มวางแผนการผลิต', 'Production Planning Group', 'Planning Office');

INSERT INTO project_areas (name, description, department_id) VALUES
('IT', 'Information Technology Area', 1),
('HR', 'Human Resources Area', 2),
('Production', 'Production Area', 3),
('Production Control', 'Production Control Area', 4),
('Quality', 'Quality Assurance Area', 5),
('Sales', 'Sales Area', 6),
('Accounting', 'Accounting Area', 7),
('Technical', 'Technical Area', 8),
('ออฟฟิศฝ่ายวางแผน', 'Planning Office Area', 3);

-- Insert sample users (matching the frontend mock data)
INSERT INTO users (employee_id, first_name, last_name, department, five_s_area, project_area, role) VALUES
('241303', 'รัชนก', 'ราชรามทอง', 'IT&DM', '5ส ณ บางปูใหม่', 'IT', 'User'),
('251307', 'ภัณฑิรา', 'ศรีพิมพ์เมือง', 'IT&DM', '5ส ณ บางปูใหม่', 'IT', 'Supervisor'),
('261401', 'มนตรี', 'ธนวัฒน์', 'PD', '5ส ณ โรงงาน A', 'Production', 'Manager'),
('admin', 'admin', 'admin', 'Admin', 'กลุ่มวางแผนการผลิต', 'ออฟฟิศฝ่ายวางแผน', 'Admin'),
('241304', 'สมชาย', 'ใจดี', 'HR&AD', '5ส ณ บางปูใหม่', 'HR', 'User'),
('241305', 'นภัสกร', 'สมบูรณ์', 'PC', '5ส ณ โรงงาน B', 'Production Control', 'User'),
('251308', 'อนุชา', 'มั่นคง', 'QA', '5ส ณ คลังสินค้า', 'Quality', 'Supervisor'),
('261402', 'วิชัย', 'เจริญ', 'SD', '5ส ณ โรงงาน A', 'Sales', 'Manager'),
('241306', 'สุดา', 'แก้วใส', 'AF', '5ส ณ บางปูใหม่', 'Accounting', 'User'),
('251309', 'ธนาคาร', 'ศรีสุข', 'TD', '5ส ณ โรงงาน B', 'Technical', 'Supervisor');

-- Comments for tables
COMMENT ON TABLE users IS 'User accounts and employee information';
COMMENT ON TABLE departments IS 'Department master data';
COMMENT ON TABLE five_s_groups IS 'Five S group master data';
COMMENT ON TABLE project_areas IS 'Project area master data';
COMMENT ON TABLE projects IS 'Main projects/tasks data from Kaizen forms';
COMMENT ON TABLE sessions IS 'User session tracking';
COMMENT ON TABLE files IS 'Uploaded file tracking';

-- Grant appropriate permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;