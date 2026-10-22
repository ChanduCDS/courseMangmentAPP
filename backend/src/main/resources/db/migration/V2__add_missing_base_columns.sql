-- V2__add_missing_base_columns.sql
-- Aligns the schema with the JPA entities (BaseEntity audit columns, Category.courseCount).
-- V1 is left untouched because it has already been applied (Flyway checksum).

-- roles: BaseEntity expects created_by / updated_by
ALTER TABLE roles ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS updated_by UUID;

-- notifications: BaseEntity expects updated_at / created_by / updated_by
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_by UUID;

-- audit_logs: BaseEntity expects updated_at / created_by / updated_by
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS updated_by UUID;

-- categories: Category entity maps course_count
ALTER TABLE categories ADD COLUMN IF NOT EXISTS course_count INTEGER NOT NULL DEFAULT 0;