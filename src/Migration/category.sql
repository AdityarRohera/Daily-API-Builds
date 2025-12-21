

CREATE TABLE IF NOT EXISTS category(
    id  uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(200) NOT NULL
);