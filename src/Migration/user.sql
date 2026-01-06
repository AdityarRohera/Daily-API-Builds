

-- CREATE TYPE user_role AS ENUM ('User', 'Admin', 'Manager');

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
     id     uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    name    VARCHAR(100)    NOT NULL,
    email   VARCHAR(255)    NOT NULL UNIQUE,
    password VARCHAR(255)   NOT NULL,
    role_id     uuid        NOT NULL REFERENCES roles(id)
)

-- ALTER TABLE users
-- ADD password VARCHAR(255)   NOT NULL;

ALTER TABLE users
DROP COLUMN role_id;

CREATE TABLE IF NOT EXISTS user_roles(
    id UUID PRIMARY KAY DEFAULT gen_random_uuid();
    userId UUID REFERENCES users(id);
    roleId UUID REFERENCES roles(id);
)