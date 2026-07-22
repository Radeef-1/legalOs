-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Enum Types
CREATE TYPE plan_tier_enum AS ENUM ('solo', 'boutique', 'enterprise');
CREATE TYPE organization_status_enum AS ENUM ('active', 'suspended', 'trial');
CREATE TYPE user_status_enum AS ENUM ('active', 'inactive');
CREATE TYPE case_type_enum AS ENUM ('commercial', 'labor', 'personal_status', 'execution');
CREATE TYPE case_status_enum AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE hearing_source_enum AS ENUM ('manual', 'najiz_sync');
CREATE TYPE document_ocr_status_enum AS ENUM ('pending', 'done', 'not_applicable');
CREATE TYPE invoice_status_enum AS ENUM ('draft', 'sent', 'paid', 'overdue');
CREATE TYPE najiz_env_enum AS ENUM ('internet', 'gsn', 'iam');
CREATE TYPE najiz_conn_status_enum AS ENUM ('connected', 'expired', 'failed');

-- 1. Organizations (Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    commercial_registration VARCHAR(100),
    unified_national_number VARCHAR(100),
    plan_tier plan_tier_enum NOT NULL DEFAULT 'solo',
    status organization_status_enum NOT NULL DEFAULT 'trial',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Branches
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL
);

-- 3. Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- Nullable for system-wide default roles
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, name)
);

-- 4. Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Role Permissions (Many-to-Many)
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 6. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    national_id VARCHAR(100),
    role_id UUID NOT NULL REFERENCES roles(id),
    status user_status_enum NOT NULL DEFAULT 'active',
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    national_id_or_cr VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    portal_access_enabled BOOLEAN NOT NULL DEFAULT FALSE
);

-- 8. Cases (Central Entity)
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    assigned_lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    case_number_internal VARCHAR(100) NOT NULL,
    najiz_case_number VARCHAR(100),
    case_type case_type_enum NOT NULL,
    court_name VARCHAR(255),
    status case_status_enum NOT NULL DEFAULT 'open',
    last_synced_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (organization_id, case_number_internal)
);

-- 9. Hearings
CREATE TABLE hearings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    hearing_date TIMESTAMP WITH TIME ZONE NOT NULL,
    source hearing_source_enum NOT NULL DEFAULT 'manual',
    notes TEXT
);

-- 10. Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    storage_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    ocr_status document_ocr_status_enum NOT NULL DEFAULT 'not_applicable'
);

-- 11. Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status invoice_status_enum NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 12. Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Najiz Connections (Highly Sensitive Security Table)
CREATE TABLE najiz_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    consumer_key_encrypted TEXT NOT NULL,
    consumer_secret_encrypted TEXT NOT NULL,
    access_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    environment najiz_env_enum NOT NULL DEFAULT 'internet',
    connection_status najiz_conn_status_enum NOT NULL DEFAULT 'failed',
    last_verified_at TIMESTAMP WITH TIME ZONE
);

-- 14. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    payload JSONB,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Indices for Performance and Multi-Tenant Lookups
CREATE INDEX idx_branches_org ON branches(organization_id);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_clients_org ON clients(organization_id);
CREATE INDEX idx_cases_org ON cases(organization_id);
CREATE INDEX idx_cases_client ON cases(client_id);
CREATE INDEX idx_hearings_case ON hearings(case_id);
CREATE INDEX idx_documents_org ON documents(organization_id);
CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_case ON invoices(case_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- =========================================================================
-- ROW-LEVEL SECURITY (RLS) SYSTEM INITIALIZATION
-- =========================================================================

-- Enable and FORCE RLS on Tenant-specific tables to ensure it applies even to the owner/superuser
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches FORCE ROW LEVEL SECURITY;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients FORCE ROW LEVEL SECURITY;

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases FORCE ROW LEVEL SECURITY;

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

ALTER TABLE najiz_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE najiz_connections FORCE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- Define Policies based on Session setting 'app.current_tenant_id'
-- Use dynamic session variables set by the backend middleware

CREATE POLICY tenant_isolation_branches ON branches
    USING (organization_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_users ON users
    USING (organization_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_clients ON clients
    USING (organization_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_cases ON cases
    USING (organization_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_documents ON documents
    USING (organization_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_invoices ON invoices
    USING (organization_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_najiz_connections ON najiz_connections
    USING (organization_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_audit_logs ON audit_logs
    USING (organization_id = current_setting('app.current_tenant_id', true)::UUID);

-- =========================================================================
-- CREATE APPLICATION USER AND GRANT ROLE PRIVILEGES
-- =========================================================================

-- Safely create a non-superuser role for the NestJS backend connection
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'legalos_app') THEN
        CREATE ROLE legalos_app WITH LOGIN PASSWORD 'app_secure_password';
    END IF;
END $$;

-- Grant schema privileges
GRANT USAGE ON SCHEMA public TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO legalos_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO legalos_app;
