-- NOLOGIN: ai-ops-service connects as the shared DB user and does SET ROLE ai_ops_ro (ADR 0021).
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ai_ops_ro') THEN
        CREATE ROLE ai_ops_ro NOLOGIN;
    END IF;
END
$$;

GRANT SELECT ON orders, audit_logs TO ai_ops_ro;
GRANT ai_ops_ro TO CURRENT_USER;
