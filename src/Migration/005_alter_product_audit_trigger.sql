

CREATE OR REPLACE FUNCTION product_audit_fn()
RETURNS TRIGGER AS $$ 
BEGIN

    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs( action, table_name, record_id, old_data, new_data, performed_by)
        VALUES (  'INSERT', 'products' , NEW.id , NULL , to_jsonb(NEW) ,  NULLIF(current_setting('app.user_id', true), '')::UUID);
        RETURN NEW;

    END IF;

    IF TG_OP = 'UPDATE' THEN

        IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN 
        INSERT INTO audit_logs( action, table_name, record_id, old_data, new_data, performed_by)
        VALUES (  'DELETE', 'products' , OLD.id , to_jsonb(OLD) , to_jsonb(NEW) ,  NULLIF(current_setting('app.user_id', true), '')::UUID);

        ELSE 
        INSERT INTO audit_logs( action, table_name, record_id, old_data, new_data, performed_by)
        VALUES (  'UPDATE', 'products' , OLD.id , to_jsonb(OLD) , to_jsonb(NEW) ,  NULLIF(current_setting('app.user_id', true), '')::UUID);
        END IF;
        RETURN NEW;

    END IF;

    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs( action, table_name, record_id, old_data, new_data, performed_by)
        VALUES (  'DELETE', 'products' , OLD.id , to_jsonb(old) , NULL , NULLIF(current_setting('app.user_id', true), '')::UUID);
        RETURN OLD;
    END IF;

    RETRUN NULL;
END;
$$ LANGUAGE plpgsql;