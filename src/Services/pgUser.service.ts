import pool from "../Config/dbConnect.js"

export const defaultRole = () => {
    return pool.query(
        `
        SELECT id FROM roles WHERE name = $1
        ` , ['User']
    )
}

export const newRole = (role : string) => {
    return pool.query(
        `
        INSERT INTO roles (name) VALUES($1)
        RETURNING *;
        `,[role]
    )
}

export const findUser = (email : string) => {
    return pool.query(
        `
        SELECT * FROM users
        WHERE email = $1;
        ` , [email]
    )
}

export const getUserRole = (userId : string) => {
    return pool.query(
        `
        SELECT r.name FROM users AS u
        JOIN roles AS r ON r.id = u.role_id
        WHERE u.id = $1;
        ` , [userId]
    )
}

export const roleExists = (roleId : string) => {
    return pool.query(
        `
        SELECT * FROM roles
        WHERE id = $1;
        ` , [roleId]
    )
}

export const assignRoleToUser = (
  userId: string,
  roleId: string
) => {
  return pool.query(
    `
    WITH inserted_user_role AS (
      INSERT INTO user_roles (userId, roleId)
      VALUES ($1, $2)
      ON CONFLICT (userId, roleId) DO NOTHING
      RETURNING userId, roleId
    )
    SELECT 
      u.id,
      u.email,
      r.name AS role
    FROM inserted_user_role ur
    JOIN users u ON u.id = ur.userId
    JOIN roles r ON r.id = ur.roleId;
    `,
    [userId, roleId]
  );
};


export const createUSer = ({name , email , password} : any) => {
    return pool.query(
        `
        INSERT INTO users (name, email, password)
        VALUES($1 , $2 , $3)
        RETURNING name , email;
        ` , [name , email , password]
    )
}