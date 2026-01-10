

ALTER TABLE products_audit_logs RENAME TO audit_logs;

ALTER TABLE audit_logs
RENAME COLUMN product_id TO record_id;