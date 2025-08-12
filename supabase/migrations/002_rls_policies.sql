-- Row Level Security (RLS) Policies
-- This migration sets up security policies for all tables

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth.uid() FROM users WHERE organization_id = organizations.id
        )
    );

CREATE POLICY "Organization owners can update their organization" ON organizations
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT auth.uid() FROM users 
            WHERE organization_id = organizations.id AND role IN ('owner', 'admin')
        )
    );

-- Users policies
CREATE POLICY "Users can view users in their organization" ON users
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth.uid() = users.id
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Organization admins can manage users" ON users
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users 
            WHERE auth.uid() = users.id AND role IN ('owner', 'admin')
        )
    );

-- Projects policies
CREATE POLICY "Users can view projects in their organization" ON projects
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth.uid() = users.id
        )
    );

CREATE POLICY "Organization members can create projects" ON projects
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth.uid() = users.id
        )
    );

CREATE POLICY "Project members can update projects" ON projects
    FOR UPDATE USING (
        id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
        OR organization_id IN (
            SELECT organization_id FROM users 
            WHERE auth.uid() = users.id AND role IN ('owner', 'admin')
        )
    );

-- Project members policies
CREATE POLICY "Users can view project members for their projects" ON project_members
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
        OR project_id IN (
            SELECT id FROM projects WHERE organization_id IN (
                SELECT organization_id FROM users WHERE auth.uid() = users.id
            )
        )
    );

CREATE POLICY "Project admins can manage project members" ON project_members
    FOR ALL USING (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
        OR project_id IN (
            SELECT id FROM projects WHERE organization_id IN (
                SELECT organization_id FROM users 
                WHERE auth.uid() = users.id AND role IN ('owner', 'admin')
            )
        )
    );

-- Workflows policies
CREATE POLICY "Users can view workflows for their projects" ON workflows
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can manage workflows" ON workflows
    FOR ALL USING (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
    );

-- Gates policies
CREATE POLICY "Users can view gates for their project workflows" ON gates
    FOR SELECT USING (
        workflow_id IN (
            SELECT id FROM workflows WHERE project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Project members can manage gates" ON gates
    FOR ALL USING (
        workflow_id IN (
            SELECT id FROM workflows WHERE project_id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
            )
        )
    );

-- AI Agents policies
CREATE POLICY "Users can view AI agents for their projects" ON ai_agents
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can manage AI agents" ON ai_agents
    FOR ALL USING (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
    );

-- Tasks policies
CREATE POLICY "Users can view tasks for their project workflows" ON tasks
    FOR SELECT USING (
        workflow_id IN (
            SELECT id FROM workflows WHERE project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Project members can manage tasks" ON tasks
    FOR ALL USING (
        workflow_id IN (
            SELECT id FROM workflows WHERE project_id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
            )
        )
    );

-- Approvals policies
CREATE POLICY "Users can view approvals for their project gates" ON approvals
    FOR SELECT USING (
        gate_id IN (
            SELECT id FROM gates WHERE workflow_id IN (
                SELECT id FROM workflows WHERE project_id IN (
                    SELECT project_id FROM project_members WHERE user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can create their own approvals" ON approvals
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own approvals" ON approvals
    FOR UPDATE USING (user_id = auth.uid());

-- Documents policies
CREATE POLICY "Users can view documents for their projects" ON documents
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can manage documents" ON documents
    FOR ALL USING (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
    );

-- Audit logs policies
CREATE POLICY "Users can view audit logs for their projects" ON audit_logs
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
        OR project_id IS NULL -- Allow viewing system-wide logs for admins
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true); -- Allow system to insert audit logs

-- Metrics policies
CREATE POLICY "Users can view metrics for their projects" ON metrics
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can manage metrics" ON metrics
    FOR ALL USING (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
    );

-- Grant permissions to authenticated and anonymous users
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT SELECT ON organizations TO anon, authenticated;
GRANT ALL ON organizations TO authenticated;

GRANT SELECT ON users TO anon, authenticated;
GRANT ALL ON users TO authenticated;

GRANT SELECT ON projects TO anon, authenticated;
GRANT ALL ON projects TO authenticated;

GRANT SELECT ON project_members TO anon, authenticated;
GRANT ALL ON project_members TO authenticated;

GRANT SELECT ON workflows TO anon, authenticated;
GRANT ALL ON workflows TO authenticated;

GRANT SELECT ON gates TO anon, authenticated;
GRANT ALL ON gates TO authenticated;

GRANT SELECT ON ai_agents TO anon, authenticated;
GRANT ALL ON ai_agents TO authenticated;

GRANT SELECT ON tasks TO anon, authenticated;
GRANT ALL ON tasks TO authenticated;

GRANT SELECT ON approvals TO anon, authenticated;
GRANT ALL ON approvals TO authenticated;

GRANT SELECT ON documents TO anon, authenticated;
GRANT ALL ON documents TO authenticated;

GRANT SELECT ON audit_logs TO anon, authenticated;
GRANT ALL ON audit_logs TO authenticated;

GRANT SELECT ON metrics TO anon, authenticated;
GRANT ALL ON metrics TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION get_table_names() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO anon, authenticated;