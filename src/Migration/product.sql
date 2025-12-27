

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_name VARCHAR(100) NOT NULL,

    product_quantity INT NOT NULL
        CHECK (product_quantity > 0),

    buying_price DECIMAL(10, 2) NOT NULL
        CHECK (buying_price > 0),

    selling_price DECIMAL(10, 2) NOT NULL
        CHECK (selling_price > 0),

    product_desc TEXT NOT NULL,

    category_id  uuid NOT NULL,

    created_at  DATE DEFAULT CURRENT_DATE,

    -- Optional business rule
    CHECK (selling_price >= buying_price),
    FOREIGN KEY (category_id) References category (id)
);

INSERT INTO products (
  product_name,
  product_quantity,
  buying_price,
  selling_price,
  product_desc,
  category_id
)
VALUES
('Rice', 10, 45.00, 55.00, 'Basmati rice 1kg' , 'b923ff9d-02d0-4eda-bd7c-ddbd70d430cc'),
('Wheat Flour', 15, 38.00, 45.00, 'Whole wheat flour' , 'b923ff9d-02d0-4eda-bd7c-ddbd70d430cc'),
('Sugar', 20, 40.00, 48.00, 'Refined white sugar' , 'b923ff9d-02d0-4eda-bd7c-ddbd70d430cc'),
('Salt', 25, 18.00, 22.00, 'Iodized salt' , 'b923ff9d-02d0-4eda-bd7c-ddbd70d430cc'),
('Cooking Oil', 12, 120.00, 140.00, 'Sunflower cooking oil' , 'b923ff9d-02d0-4eda-bd7c-ddbd70d430cc'),
('Tea Powder', 8, 210.00, 250.00, 'Premium tea leaves' , 'b923ff9d-02d0-4eda-bd7c-ddbd70d430cc'),
('Coffee Powder', 6, 280.00, 330.00, 'Instant coffee powder' , 'b923ff9d-02d0-4eda-bd7c-ddbd70d430cc'),
('Milk Packet', 30, 22.00, 26.00, 'Toned milk 500ml' , 'b923ff9d-02d0-4eda-bd7c-ddbd70d430cc'),
('Butter', 10, 95.00, 110.00, 'Salted butter' , 'b923ff9d-02d0-4eda-bd7c-ddbd70d430cc'),
('Cheese', 7, 180.00, 210.00, 'Processed cheese slices' , 'b923ff9d-02d0-4eda-bd7c-ddbd70d430cc'),
-- ('Eggs', 24, 5.00, 6.50, 'Farm fresh eggs'),
-- ('Bread', 18, 25.00, 30.00, 'Whole wheat bread'),
-- ('Biscuits', 40, 12.00, 15.00, 'Cream biscuits'),
-- ('Chocolate', 20, 35.00, 45.00, 'Milk chocolate bar'),
-- ('Jam', 9, 85.00, 100.00, 'Mixed fruit jam'),
-- ('Honey', 5, 220.00, 260.00, 'Natural honey'),
-- ('Peanut Butter', 6, 190.00, 230.00, 'Crunchy peanut butter'),
-- ('Pasta', 14, 60.00, 75.00, 'Durum wheat pasta'),
-- ('Noodles', 25, 30.00, 38.00, 'Instant noodles'),
-- ('Tomato Sauce', 11, 70.00, 85.00, 'Tomato ketchup'),
-- ('Green Tea', 8, 160.00, 195.00, 'Organic green tea'),
-- ('Oats', 13, 95.00, 115.00, 'Rolled oats'),
-- ('Cornflakes', 10, 130.00, 155.00, 'Breakfast cornflakes'),
-- ('Spices Mix', 16, 55.00, 68.00, 'Mixed spices pack'),
-- ('Dry Fruits', 4, 420.00, 500.00, 'Assorted dry fruits');


ALTER TABLE products
ADD COLUMN search_vector_product tsvector;


UPDATE products
SET search_vector_product =  to_tsvector('english', product_name || ' ' || product_desc);
    

CREATE INDEX idx_products_search
ON products
USING GIN (search_vector_product);