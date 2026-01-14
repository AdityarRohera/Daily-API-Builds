

ALTER TABLE products 
ADD CONSTRAINT product_name_unique_error UNIQUE (product_name);  

ALTER TABLE products 
    -- Step A: Remove the old constraint
    DROP CONSTRAINT products_product_quantity_check,
    
    -- Step B: Add the new constraint (allows zero)
    ADD CONSTRAINT product_quantity_check 
    CHECK (product_quantity >= 0);