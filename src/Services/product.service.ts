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
                        SELECT * FROM "shopping_list"
                        WHERE
                            product_name ILIKE '%' || COALESCE($3, '') || '%'
                        ORDER BY ${orderBy} ASC
                        LIMIT $1 OFFSET $2
                      `,
                      [limit , offset , search ?? null]
                     )
}