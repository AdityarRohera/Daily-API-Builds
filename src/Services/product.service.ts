import pool from "../Config/dbConnect.js"

interface getProductsType{
  limit : number;
  offset : number;
  search : any;
  order : any;
}

export const getProducts = ({limit , offset , search , order} : getProductsType) => {

    const allowedOrderColumns = ["product_name", "product_quantity", "created_at"];
    const orderBy = allowedOrderColumns.includes(order)
      ? order
      : "product_name";

    return pool.query(`
                        SELECT * FROM "products"
                        WHERE
                            product_name ILIKE '%' || COALESCE($3, '') || '%'
                            ORDER BY ${orderBy} ASC
                            LIMIT $1 OFFSET $2
                      `,
                      [limit , offset , search ?? null]
                     )
}

export const newProductQuery =({product_name , product_quantity , buying_price , selling_price , product_desc ,category_id} : any) => {
  return pool.query(
    `
    INSERT INTO products (
    product_name,
    product_quantity,
    buying_price,
    selling_price,
    product_desc,
    category_id
    )
    VALUES ($1 , $2 , $3 , $4 , $5 , $6)
    RETURNING id , product_name , selling_price
    ` , [product_name , product_quantity , buying_price , selling_price , product_desc , category_id]
  )
}

export const getCategoryProductQuery = (category_id : string) => {
  return pool.query(
    `
    SELECT * FROM "products"
    WHERE category_id = $1;
    `,
    [category_id]
  )
}