-- Disable RLS on users and workspace_invitations tables (global/anonymous tables)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations DISABLE ROW LEVEL SECURITY;

-- Enable RLS on membership and structural tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches FORCE ROW LEVEL SECURITY;

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members FORCE ROW LEVEL SECURITY;

ALTER TABLE organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE organization_member_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_member_preferences FORCE ROW LEVEL SECURITY;

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments FORCE ROW LEVEL SECURITY;

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams FORCE ROW LEVEL SECURITY;

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members FORCE ROW LEVEL SECURITY;

ALTER TABLE workspace_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_branding FORCE ROW LEVEL SECURITY;

ALTER TABLE workspace_localization ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_localization FORCE ROW LEVEL SECURITY;

ALTER TABLE workspace_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_preferences FORCE ROW LEVEL SECURITY;

ALTER TABLE workspace_numbering ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_numbering FORCE ROW LEVEL SECURITY;

ALTER TABLE workspace_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_feature_flags FORCE ROW LEVEL SECURITY;

ALTER TABLE workspace_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_statistics FORCE ROW LEVEL SECURITY;

ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings FORCE ROW LEVEL SECURITY;

ALTER TABLE holiday_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_calendars FORCE ROW LEVEL SECURITY;

ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays FORCE ROW LEVEL SECURITY;

-- Create Policies matching the active tenant (safely handling empty settings)
DROP POLICY IF EXISTS tenant_isolation_branches ON branches;
CREATE POLICY tenant_isolation_branches ON branches
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_org_members ON organization_members;
CREATE POLICY tenant_isolation_org_members ON organization_members
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_org_profiles ON organization_profiles;
CREATE POLICY tenant_isolation_org_profiles ON organization_profiles
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_member_prefs ON organization_member_preferences;
CREATE POLICY tenant_isolation_member_prefs ON organization_member_preferences
    USING (EXISTS (
        SELECT 1 FROM organization_members WHERE organization_members.id = member_id
        AND organization_members.organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    ));

DROP POLICY IF EXISTS tenant_isolation_departments ON departments;
CREATE POLICY tenant_isolation_departments ON departments
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_teams ON teams;
CREATE POLICY tenant_isolation_teams ON teams
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_team_members ON team_members;
CREATE POLICY tenant_isolation_team_members ON team_members
    USING (EXISTS (
        SELECT 1 FROM organization_members WHERE organization_members.id = member_id
        AND organization_members.organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    ));

DROP POLICY IF EXISTS tenant_isolation_workspace_settings ON workspace_settings;
CREATE POLICY tenant_isolation_workspace_settings ON workspace_settings
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_workspace_branding ON workspace_branding;
CREATE POLICY tenant_isolation_workspace_branding ON workspace_branding
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_workspace_localization ON workspace_localization;
CREATE POLICY tenant_isolation_workspace_localization ON workspace_localization
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_workspace_preferences ON workspace_preferences;
CREATE POLICY tenant_isolation_workspace_preferences ON workspace_preferences
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_workspace_numbering ON workspace_numbering;
CREATE POLICY tenant_isolation_workspace_numbering ON workspace_numbering
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_workspace_feature_flags ON workspace_feature_flags;
CREATE POLICY tenant_isolation_workspace_feature_flags ON workspace_feature_flags
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_workspace_statistics ON workspace_statistics;
CREATE POLICY tenant_isolation_workspace_statistics ON workspace_statistics
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_holiday_calendars ON holiday_calendars;
CREATE POLICY tenant_isolation_holiday_calendars ON holiday_calendars
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

DROP POLICY IF EXISTS tenant_isolation_holidays ON holidays;
CREATE POLICY tenant_isolation_holidays ON holidays
    USING (EXISTS (
        SELECT 1 FROM holiday_calendars WHERE holiday_calendars.id = holiday_calendar_id
        AND holiday_calendars.organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    ));

-- Grant privileges to legalos_app
GRANT SELECT, INSERT, UPDATE, DELETE ON branches TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_members TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_profiles TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_member_preferences TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON departments TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON teams TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON team_members TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspace_invitations TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspace_settings TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspace_statistics TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON holiday_calendars TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON holidays TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspace_branding TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspace_localization TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspace_preferences TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspace_numbering TO legalos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspace_feature_flags TO legalos_app;
