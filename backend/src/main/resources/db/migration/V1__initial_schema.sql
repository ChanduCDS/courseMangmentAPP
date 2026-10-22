-- V1__initial_schema.sql
-- Initial database schema for Course Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (base table for all user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system_role BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Roles junction table
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7), -- Hex color code
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL UNIQUE,
    short_description VARCHAR(500),
    full_description TEXT,
    category_id UUID NOT NULL REFERENCES categories(id),
    thumbnail_url VARCHAR(500),
    duration INTEGER NOT NULL DEFAULT 0, -- in hours
    duration_unit VARCHAR(20) NOT NULL DEFAULT 'HOURS', -- HOURS, DAYS, WEEKS, MONTHS
    fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    difficulty_level VARCHAR(20) NOT NULL DEFAULT 'BEGINNER', -- BEGINNER, INTERMEDIATE, ADVANCED
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, INACTIVE, ARCHIVED
    enrollment_capacity INTEGER,
    enrollment_start_date TIMESTAMP WITH TIME ZONE,
    enrollment_end_date TIMESTAMP WITH TIME ZONE,
    course_start_date TIMESTAMP WITH TIME ZONE,
    course_end_date TIMESTAMP WITH TIME ZONE,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    meta_keywords VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Course Instructors junction table
CREATE TABLE course_instructors (
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (course_id, instructor_id)
);

-- Enrollments table
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, ENROLLED, IN_PROGRESS, COMPLETED, CANCELLED, WAITLISTED
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    progress_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    final_grade VARCHAR(10),
    certificate_issued BOOLEAN NOT NULL DEFAULT false,
    certificate_issued_at TIMESTAMP WITH TIME ZONE,
    certificate_url VARCHAR(500),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'NOT_REQUIRED', -- NOT_REQUIRED, PENDING, PAID, REFUNDED, FAILED
    payment_amount NUMERIC(12, 2),
    payment_currency VARCHAR(3) DEFAULT 'USD',
    payment_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    UNIQUE (student_id, course_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- ENROLLMENT_CREATED, ENROLLMENT_STATUS_CHANGED, COURSE_PUBLISHED, COURSE_UPDATED, PASSWORD_RESET, ANNOUNCEMENT, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_type VARCHAR(50), -- COURSE, ENROLLMENT, USER, etc.
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, PUBLISH, ARCHIVE, ENROLL, CANCEL, etc.
    entity_type VARCHAR(50) NOT NULL, -- COURSE, CATEGORY, USER, ENROLLMENT, etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, FAILURE
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token);

CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

CREATE INDEX idx_courses_category_id ON courses(category_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_is_featured ON courses(is_featured);
CREATE INDEX idx_courses_course_code ON courses(course_code);
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_courses_enrollment_dates ON courses(enrollment_start_date, enrollment_end_date);

CREATE INDEX idx_course_instructors_instructor_id ON course_instructors(instructor_id);

CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_enrolled_at ON enrollments(enrolled_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_reference ON notifications(reference_type, reference_id);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Insert default roles
INSERT INTO roles (id, name, description, is_system_role) VALUES
    (uuid_generate_v4(), 'ADMIN', 'System administrator with full access', true),
    (uuid_generate_v4(), 'INSTRUCTOR', 'Course instructor with course management permissions', true),
    (uuid_generate_v4(), 'STUDENT', 'Student with enrollment and learning permissions', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default categories
INSERT INTO categories (id, name, description, icon, color, sort_order, is_active) VALUES
    (uuid_generate_v4(), 'Programming', 'Software development and programming courses', 'code', '#007BA7', 1, true),
    (uuid_generate_v4(), 'Data Science', 'Data analysis, machine learning, and AI courses', 'database', '#10B981', 2, true),
    (uuid_generate_v4(), 'Design', 'UI/UX, graphic design, and creative courses', 'palette', '#F59E0B', 3, true),
    (uuid_generate_v4(), 'Business', 'Business, marketing, and entrepreneurship courses', 'briefcase', '#8B5CF6', 4, true),
    (uuid_generate_v4(), 'Marketing', 'Digital marketing, SEO, and social media courses', 'megaphone', '#EC4899', 5, true),
    (uuid_generate_v4(), 'Cloud Computing', 'Cloud platforms, DevOps, and infrastructure courses', 'cloud', '#06B6D4', 6, true)
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();