import type { Request , Response } from "express"
import { getProducts , newProductQuery , getCategoryProductQuery , getSearchedProduct } from "../Services/product.service.js"

import type { AuthenticatedRequest } from "../Middlewares/pgAuth.js";
import { findProduct , softDeleteProduct } from "../Services/product.service.js";

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
