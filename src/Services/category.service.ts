import pool from "../Config/dbConnect.js"

export const newCategory = (category : string) => {
    return pool.query(
        `
        INSERT INTO category(category_name)
        VALUES($1)
        returning *
        `,
        [category]
    )
}

export const getCategoryById = (category_id : string) => {
    return pool.query(
        `
         SELECT * FROM "category"
         WHERE id = $1
        `,
        [category_id]
    )
}