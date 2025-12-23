import pool from "../Config/dbConnect.js";


export const newOrder = async(productId : string , totalQuantity : number) => {

        const client = await pool.connect(); // Acquire a specific client
  try{

        await client.query('BEGIN');

        // first update product_quantity
        const stockResult = await client.query(
          `
            UPDATE products
            SET
                product_quantity = product_quantity - $1
            WHERE 
                id = $2 AND product_quantity >= $1
            RETURNING product_quantity;

          ` , [totalQuantity , productId]
        )

        if (stockResult.rowCount === 0) {
             throw new Error('OUT_OF_STOCK');
        }

        console.log("Working")

        // second create order

        //  this is wrong resons : 
        // Problems:
        // RETURNING cannot contain a subquery   
        // PostgreSQL RETURNING only works with columns of the row being inserted/updated
        // You are re-querying the orders table inside RETURNING, which is not allowed.
        // products table cannot be joined directly inside RETURNING.



        // await client.query(
        //   `
        //     INSERT INTO orders(
        //       productId,
        //       total_quantity
        //     )
        //     VALUES ($1 , $2)

        //     RETURNING
        //                 (SELECT o.id , (o.total_quantity * p.selling_price) as totalAmount , o.status FROM orders o
        //                 JOIN products p on p.id = o.productId);
        //   ` , [productId , totalQuantity]
        // )


        // correct approach
        
        const result = await client.query(
            `
            WITH inserted_order AS (
              INSERT INTO orders (productId, total_quantity , status)
              VALUES ($1, $2 , $3)
              RETURNING id, productId, total_quantity, status
            )
            SELECT
              o.id,
              o.status,
              o.total_quantity * p.selling_price AS totalAmount
            FROM inserted_order o
            JOIN products p ON p.id = o.productId;
            `,
            [productId, totalQuantity , 'confirmed']
        );


        await client.query('commit');

        console.log('Order Transaction successful');
        return result.rows[0];

  } catch(err){
        await client.query('ROLLBACK'); 
        console.error('Transaction failed, rolled back:', err);
        console.log("Error comes in create order transaction");
        throw err;   // 🔥 THIS IS THE KEY CHANGE
  } finally{
        client.release();
  }
}