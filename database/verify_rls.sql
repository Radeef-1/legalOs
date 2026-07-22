-- RLS Isolation Verification Script
-- This script validates that PostgreSQL Row Level Security behaves as expected.

BEGIN;

-- 1. Insert seed data (acting as database superuser/admin bypass session restrictions)
SET LOCAL app.current_tenant_id = '00000000-0000-0000-0000-000000000000';

-- Create Tenants
INSERT INTO organizations (id, name, plan_tier, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Firm A (Tenant A)', 'boutique', 'active'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Firm B (Tenant B)', 'solo', 'active')
ON CONFLICT (id) DO NOTHING;

-- Create System Roles
INSERT INTO roles (id, organization_id, name) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Partner'),
('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Partner')
ON CONFLICT (id) DO NOTHING;

-- Create Users
INSERT INTO users (id, organization_id, full_name, email, role_id) VALUES
('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lawyer A', 'lawyer.a@firma.sa', '11111111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Lawyer B', 'lawyer.b@firmb.sa', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (email) DO NOTHING;

-- Create Clients
INSERT INTO clients (id, organization_id, name, national_id_or_cr) VALUES
('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Client A', '1010101010'),
('66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Client B', '2020202020')
ON CONFLICT (id) DO NOTHING;

-- Create Cases
INSERT INTO cases (id, organization_id, client_id, assigned_lawyer_id, case_number_internal, case_type, court_name, status) VALUES
('77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'CASE-A-001', 'commercial', 'Commercial Court Riyadh', 'open'),
('88888888-8888-8888-8888-888888888888', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'CASE-B-001', 'labor', 'Labor Court Jeddah', 'open')
ON CONFLICT (id) DO NOTHING;

-- Switch session role to legalos_app to enforce RLS (non-superuser)
SET ROLE legalos_app;

-- =========================================================================
-- RUN ISOLATION TESTS
-- =========================================================================

-- Test 1: Set Session to Tenant A
SET app.current_tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Query Cases - Should ONLY see Case A
DO $$
DECLARE
    case_count INTEGER;
BEGIN
    SELECT count(*) INTO case_count FROM cases;
    IF case_count != 1 THEN
        RAISE EXCEPTION 'TEST_FAILED: Tenant A sees % cases, expected 1', case_count;
    END IF;
END $$;

-- Try to update Tenant B's case while logged in as Tenant A
UPDATE cases SET court_name = 'Hacked Court' WHERE id = '88888888-8888-8888-8888-888888888888';

-- Verify update did not happen (or wasn't visible)
DO $$
BEGIN
    IF EXISTS(SELECT 1 FROM cases WHERE id = '88888888-8888-8888-8888-888888888888') THEN
        RAISE EXCEPTION 'TEST_FAILED: Tenant A can query Tenant B case directly by ID';
    END IF;
END $$;


-- Test 2: Set Session to Tenant B
SET app.current_tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Query Cases - Should ONLY see Case B
DO $$
DECLARE
    case_count INTEGER;
BEGIN
    SELECT count(*) INTO case_count FROM cases;
    IF case_count != 1 THEN
        RAISE EXCEPTION 'TEST_FAILED: Tenant B sees % cases, expected 1', case_count;
    END IF;
END $$;

-- Verify Tenant B case was not affected by Tenant A update
DO $$
DECLARE
    court_name_val VARCHAR;
BEGIN
    SELECT court_name INTO court_name_val FROM cases WHERE id = '88888888-8888-8888-8888-888888888888';
    IF court_name_val = 'Hacked Court' THEN
        RAISE EXCEPTION 'TEST_FAILED: Tenant A successfully modified Tenant B case';
    END IF;
END $$;

-- Clean up test session parameters
RESET app.current_tenant_id;
RESET ROLE;

-- If we reached this point, RLS tests passed successfully
DO $$
BEGIN
    RAISE NOTICE 'SUCCESS: Row-Level Security isolation test passed.';
END $$;

ROLLBACK;
