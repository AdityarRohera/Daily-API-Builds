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

export const findProduct = (productId : string) => {
  return pool.query(
    `
      SELECT * FROM "products"
      WHERE id = $1;
    `,[productId]
  )
}

// Not good for performance because it search each and every rows
// export const getSearchedProduct = (search : any) => {
//   return pool.query(
//     `
//       SELECT * FROM "products"
//       WHERE to_tsvector('english' , product_name || ' ' || product_desc)
//       @@ plainto_tsquery('english' , $1);
//     ` , [search]
//   )
// }


export const getSearchedProduct = (search : any) => {
  return pool.query(
    `
      SELECT * , 
      ts_rank(search_vector_product, plainto_tsquery('english', $1)) AS rank
      FROM "products"
      WHERE search_vector_product
      @@ plainto_tsquery('english' , $1);
    ` , [search]
  )
}