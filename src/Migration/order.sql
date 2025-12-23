

CREATE TABLE IF NOT EXISTS orders(
    id   UUID   PRIMARY KEY DEFAULT gen_random_uuid(),

    productId UUID NOT NULL,
    total_Quantity  INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    CONSTRAINT check_status_valid CHECK(status IN ('pending' , 'confirmed', 'cancelled')),
    FOREIGN KEY (productId) References products(id)
)