REVOKE ai_ops_ro FROM CURRENT_USER;
REVOKE SELECT ON orders, audit_logs FROM ai_ops_ro;
DROP ROLE IF EXISTS ai_ops_ro;
