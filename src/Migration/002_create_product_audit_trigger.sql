

-- 1. Trigger Function
CREATE OR REPLACE FUNCTION product_audit_fn()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO products_audit_logs(
        action,
        table_name,
        product_id,
        old_data,
        new_data,
        performed_by
        ) VALUES (  TG_OP, 'products_audit_logs' , COALESCE(NEW.id, OLD.id), to_jsonb(OLD) , to_jsonb(NEW) , current_setting('app.user_id', true));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger 
CREATE TRIGGER trg_product_audit
AFTER INSERT OR UPDATE OR DELETE
ON products
FOR EACH ROW
EXECUTE FUNCTION product_audit_fn();