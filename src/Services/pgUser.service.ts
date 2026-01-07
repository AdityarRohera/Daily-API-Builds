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

export const getUserRoles = (userId: string) => {
  return pool.query(
    `
    SELECT r.name as Role
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = $1;
    `,
    [userId]
  );
};


export const userExists = (userId : string) => {
    return pool.query(
        `
        SELECT * FROM users
        WHERE id = $1;
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
    console.log(userId , roleId)
  return pool.query(
    `
    WITH inserted_user_role AS (
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, role_id) DO NOTHING
      RETURNING user_id, role_id
    )
    SELECT 
      u.id,
      u.email,
      r.name AS role
    FROM inserted_user_role ur
    JOIN users u ON u.id = ur.user_id
    JOIN roles r ON r.id = ur.role_id;
    `,
    [userId, roleId]
  );
};


export const createUSer = ({name , email , password} : any) => {
    return pool.query(
        `
        INSERT INTO users (name, email, password)
        VALUES($1 , $2 , $3)
        RETURNING id , name , email;
        ` , [name , email , password]
    )
}