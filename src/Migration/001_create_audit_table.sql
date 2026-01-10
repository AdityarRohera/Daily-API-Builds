


CREATE TABLE products_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    action TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE'))

    table_name VARCHAR(100) NOT NULL,

    product_id UUID NOT NULL,

    old_data JSONB,
    new_data JSONB,

    performed_by UUID, -- user id (nullable if system action)

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
