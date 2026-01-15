import type { Request , Response } from "express"
import { getProducts , newProductQuery , getCategoryProductQuery , getSearchedProduct, bulkInsertProducts } from "../Services/product.service.js"

import type { AuthenticatedRequest } from "../Middlewares/pgAuth.js";
import { findProduct , softDeleteProduct } from "../Services/product.service.js";
import { validateCategoryId } from "../Services/category.service.js";

export const newProductHandler = async(req : Request , res : Response) => {
    try{

        const {product_name , product_quantity , buying_price , selling_price , product_desc ,category_id} = req.body;

        if(!product_name && !product_quantity && !buying_price && !selling_price && !product_desc && !category_id){
            return res.status(400).send({
                status : false,
                message : "Invalide Data"
            })
        }

        const newProduct = await newProductQuery({product_name , product_quantity , buying_price , selling_price , product_desc ,category_id});

        res.status(200).send({
            success : true,
            message : "New product created successfully",
            product : newProduct.rows[0]
        })
        
    } catch(err : unknown){
        console.log("Error comes in creating new product -> " , err);
        let errmessage;
        if(err instanceof Error){
            errmessage = err.message
        } else if(typeof err === "string"){
            errmessage = err
        }

        res.status(500).send({
            status : false,
            message : "Something wrong in creating new product",
            error : errmessage
        })
    }
}

export const getAllProducts = async(req : Request , res : Response) => {
    try{

        const page : number = Number(req.query.page) || 1;
        const limit : number = Number(req.query.page) || 10;
        const search : any = req.query.search || '';
        const order : any = req.query.order;

        console.log(order , typeof search)

        const offset = (page - 1) * limit;

        const products = await getProducts({limit , offset , search , order});

        res.status(200).send({
            success : true,
            message : "fetch product successfully",
            data : products.rows
        })

    } catch(err){
        console.log("Error comes in getting products -> " , err)
    }
}

export const searchProducts = async(req : Request , res : Response) => {
    try{

        const search = req.query.q;

        if(!search){
            return res.status(400).json({
                status : false,
                message : "Invalid data"
            })
        }

        console.log(search , typeof search);

        const findProduct = await getSearchedProduct(search);
        // console.log("Output getting ***********" , findProduct.rows);

        res.status(200).send({
            success : true,
            message : "fetch product successfully",
            data : findProduct.rows
        })

    } catch(err){
        console.log("Error comes in getting products -> " , err)
    }
}

export const softDeleteProductHandler = async(req : Request , res : Response) => {
    try{

       const adminId = (req as AuthenticatedRequest).user.userId;
       const productId = req.params.id;

       console.log("Admin id -> " , adminId , "Product id -> " , productId);

       // now first validate product id
       if(!productId || typeof productId !== "string"){
        return res.status(400).send({
            success : false,
            message : "Product id required"
        })
       }

       // find product
    //    const product = await findProduct(productId);
    //    if(product.rowCount === 0){
    //     return res.status(400).send({
    //         success : false,
    //         message : "Invalid Product id"
    //     })
    //    }

       // Perform soft delete 
       const deleteProduct = await softDeleteProduct(productId , adminId);
       if(deleteProduct.rowCount === 0){

        // 2 reasons of fails 
        // 1. Invalid product id and 2. product already deleted

            const check = await findProduct(productId)

            if (check.rowCount === 0) {
              return res.status(404).send({
                success: false,
                message: "Product not found"
              });
            }

            return res.status(409).send({
              success: false,
              message: "Product already deleted"
            });
       }

        res.status(200).send({
            success : true,
            message : "Product delete successfully",
            action: "DELETE",
            table: "products",
            product : deleteProduct.rows[0],
            performed_by : adminId
        })

    } catch(err : unknown){
        console.log("Error comes in creating new product -> " , err);
        let errmessage;
        if(err instanceof Error){
            errmessage = err.message
        } else if(typeof err === "string"){
            errmessage = err
        }

        res.status(500).send({
            status : false,
            message : "Something wrong in creating new product",
            error : errmessage
        })
    }
}

// Bulk Insert operations 
export const bulkInsertProductHandler = async(req : Request , res : Response) => {
    try{

        const adminId = (req as AuthenticatedRequest).user.userId;
        const products = req.body.products;
        console.log("Getting products -> ************" , products , typeof products)

        if (!Array.isArray(products) || products.length === 0){
            return res.status(400).send({
                success : false,
                message : "Products must be a non-empty array"
            })
        }

        // Restrict more insert entries 
        if(products.length > 10){
            return res.status(400).send({
                success : false,
                message: "Maximum 10 products allowed per request"
            })
        }

        // feild validation
        for (const p of products) {
            if (
              !p.product_name ||
              p.product_quantity == null ||
              p.buying_price == null ||
              p.selling_price == null ||
              !p.category_id
            ) {
              return res.status(400).json({
                success: false,
                message: "Missing required product fields"
              });
            }
        }

        // validate catagory id's 
        // const categories = products.map((p : any) => (p.category_id)); // this also has duplicates categories and result return without duplicates so error check conditions fails correct approach is to use set which removes duplicates from array.
        const categoryIds = [...new Set(products.map(p => p.category_id))];
        console.log(categoryIds)


        // 2️⃣ Validate UUID format (BEFORE DB)
        const UUID_REGEX =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            
        const invalidUUIDs = categoryIds.filter(id => !UUID_REGEX.test(id));
            
        if (invalidUUIDs.length > 0) {
          return res.status(400).send({
            success: false,
            message: "One or more category IDs are not valid UUIDs",
            invalidUUIDs
          });
        }

        const categoryResult = await validateCategoryId(categoryIds);

        const validCategorySet = new Set(categoryResult.rows.map(r => r.id)); 

        const invalidCategoryIds = categoryIds.filter(
            id => !validCategorySet.has(id)
        );

        if(categoryResult.rowCount !== categoryIds.length){
            return res.status(400).send({
                success : false,
                message : "One or more category IDs are invalid",
                invalidCategoryIds
            })
        }

        // now perform bulk operations
        const result = await bulkInsertProducts(products ,adminId);

        res.status(200).send({
            success : true,
            message : "You successfully create products in bulk",
            result : result
        })

    } catch(err){
        console.log("Error comes in getting products -> " , err)
    }
}
