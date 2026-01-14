import mongoose from "mongoose";
import pool from "../Config/dbConnect.js"
// import { newClient } from "../Config/radisConfig.js";


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

// not good approach
// export const getCategoryProductQuery = (category_id : string) => {
//   return pool.query(
//     `
//     SELECT * FROM "products"
//     WHERE category_id = $1;
//     `,
//     [category_id]
//   )
// }

// best approach
// ✔ LEFT JOIN is important
// → It allows category to exist even if no products
export const getCategoryProductQuery = (category_id : string) => {
  return pool.query(
    `
      SELECT 
        c.id AS category_id,
        c.category_name,
        p.id AS product_id,
        p.product_name,
        p.selling_price
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      WHERE c.id = $1;
    `,
    [category_id]
  );
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

// soft delete product
export const softDeleteProduct = async(productId : string , adminId : string) => {

    const client =  await pool.connect()
    try{  

        await client.query('BEGIN');

        // set admin id to postgres for getting performed_by in product_audit field
        await client.query(
          `SELECT set_config('app.user_id', $1, true)`,
          [adminId]
        );

        // 2. mark product as delete (update deleted_at date)
        const deletedProduct = await client.query(
          `
          UPDATE products
          SET deleted_at = NOW()
          WHERE id = $1 AND deleted_at IS NULL
          RETURNING *
          ` , [productId]
        )

        await client.query('COMMIT');
      
        return deletedProduct;

    } catch(err : unknown){

      await client.query('ROLLBACK');
      console.log(err)

        if(err instanceof Error){
          throw new Error(`Error comes while deleting the product ${err.message}`);
        } else{
          throw new Error(`Error comes while deleting the product ${err}`);
        }
    } finally{
       client.release();
    }
}

// export const getProductsMongo = (minSellingPrice : number , maxSellingPrice : number) => {
//      const db = mongoose.connection.db;
     
//      return db?.collection('products').aggregate([
//         // {$match : 
//         //   {$expr : {$and : [
//         //                {$gte : ["$selling_price" , Number(minSellingPrice) || 0]},
//         //                {$lte : ["$selling_price" , Number(maxSellingPrice) || 5000]}
//         //   ]}}
//         // } , 

//         // also in simple 
//         {
//             $match: {
//                 selling_price: {
//                   $gte: Number(minSellingPrice) || 0,
//                   $lte: Number(maxSellingPrice) || 5000
//                   }
//               }
//         },

//         {
//           $project : {_id : 0 , product_name : 1 , product_quantity : 1 , price : "$selling_price"}
//         },
        
//         { $sort: { price: -1 } },

//         {
//           $group : {_id : null , count : {$sum : 1} , products : {$push : "$$ROOT"}}
//         },

//      ])
//      .toArray();
// }

// this is good approach
export const getProductsMongo = async(minSellingPrice : number , maxSellingPrice : number , OFFSET : number , LIMIT : number , page : number) => {
     const db = mongoose.connection.db;

     const priceFilter: any = {};

      if (minSellingPrice !== undefined) {
        priceFilter.$gte = Number(minSellingPrice);
      }
    
      if (maxSellingPrice !== undefined) {
        priceFilter.$lte = Number(maxSellingPrice);
      }
    
      const matchStage =
        Object.keys(priceFilter).length > 0
          ? { $match: { selling_price: priceFilter } }
          : { $match: {} };

     
     return db?.collection('products').aggregate([
      // not good to set max price manually
        // {
        //     $match: {
        //         selling_price: {
        //                       $gte: Number(minSellingPrice) || 0,
        //                       $lte: Number(maxSellingPrice) || 5000
        //           }
        //       }
        // },

        matchStage,

        {
          $facet : {

                Totalcount : [{$group : {_id : null , total : {$sum : 1}}}],

                products : [
                    {
                      $project : {_id : 0 , product_name : 1 , product_quantity : 1 , price : "$selling_price"}
                    },

                    {$sort : {price : -1}},

                    {$skip : OFFSET},

                    {$limit : LIMIT}
                ]
          }
        },
         {
            $project: {
              products: 1,
              Totalcount: { $arrayElemAt: ["$Totalcount.total", 0] },
              ResultCount: { $size: "$products" },
              totalPages: {
                            $ceil: {
                              $divide: [
                                { $arrayElemAt: ["$Totalcount.total", 0] },
                                LIMIT
                              ]
                            }
                          },
               page: { $literal: page }
            }
         }

     ])
     .toArray();
}



// Bulk Insert product 

export const bulkInsertProducts = async(products : any , adminId : string) => {

    const client =  await pool.connect();

    try{

      await client.query('BEGIN');

       // set admin id to postgres for getting performed_by in product_audit field
        await client.query(
          `SELECT set_config('app.user_id', $1, true)`,
          [adminId]
        );


      // 2. insert into products
      const names = [];
      const quantities = [];
      const buyingPrices = [];
      const sellingPrices = [];
      const descriptions = [];
      const categoryIds = [];

      for (const p of products) {
        names.push(p.product_name);
        quantities.push(p.product_quantity);
        buyingPrices.push(p.buying_price);
        sellingPrices.push(p.selling_price);
        descriptions.push(p.product_desc || null);
        categoryIds.push(p.category_id);
      }

      // console.log(names , quantities , buyingPrices , sellingPrices , descriptions , categoryIds)

        
      const insertedProducts = await client.query(
                                  `
                                  INSERT INTO products (
                                    product_name,
                                    product_quantity,
                                    buying_price,
                                    selling_price,
                                    product_desc,
                                    category_id
                                    )
                                    SELECT *
                                    FROM UNNEST(
                                      $1::text[],
                                      $2::int[],
                                      $3::numeric[],
                                      $4::numeric[],
                                      $5::text[],
                                      $6::uuid[]
                                    )
                                    ON CONFLICT (product_name) DO NOTHING
                                    RETURNING *;
                                  ` , [ names, quantities, buyingPrices, sellingPrices, descriptions, categoryIds]
                                );

      
       await client.query('COMMIT');

       console.log("checking for inserted data -> " , insertedProducts.rows);

      return {
              inserted: insertedProducts.rowCount,
              failed: products.length - (insertedProducts.rowCount ?? 0)
       };

    } catch(err : any){

      await client.query('ROLLBACK');
      throw new Error(err);

    } finally{
        client.release();
    }
}