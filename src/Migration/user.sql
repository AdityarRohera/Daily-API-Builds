

-- CREATE TYPE user_role AS ENUM ('User', 'Admin', 'Manager');

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
     id     uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    name    VARCHAR(100)    NOT NULL,
    email   VARCHAR(255)    NOT NULL UNIQUE,
    password VARCHAR(255)   NOT NULL
)

-- ALTER TABLE users
-- ADD password VARCHAR(255)   NOT NULL;

ALTER TABLE users
DROP COLUMN role_id;

-- CREATE TABLE IF NOT EXISTS user_roles(
--     id UUID PRIMARY KAY DEFAULT gen_random_uuid();
--     userId UUID REFERENCES users(id);
--     roleId UUID REFERENCES roles(id);
-- )

CREATE TABLE user_roles (
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,

  CONSTRAINT user_roles_pk PRIMARY KEY (user_id, role_id),

  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_role
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
    ON DELETE CASCADE
);
