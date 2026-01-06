import type { Request , Response } from "express";
import { findProduct} from "../Services/product.service.js";
import {newOrder} from "../Services/order.service.js";

export const orderProductHandler = async(req : Request , res : Response) => {
    try{

        const {productId , totalQuantity} = req.body;
        console.log(productId , totalQuantity);

        if(!productId || !totalQuantity){
            return res.status(400).send({
                status : false,
                message : "Invalid Data"
            })
        }
        

        // validate product ID 
        const product = await findProduct(productId);

        if(product.rowCount === 0){
            return res.status(400).send({
                status : false,
                message : "Product not found"
            })
        }
        console.log(product.rows[0])

        // check product quantity // bad practice
        // if(product.rows[0].product_quantity < totalQuantity){
        //     return res.status(400).send({
        //         status : false,
        //         message : "Product is out of stock"
        //     })
        // }

        // Now create order
        const order = await newOrder(productId ,totalQuantity);

        res.status(200).send({
            success : true,
            message : "New product created successfully",
            order : order
        })
        
    } catch(err : unknown){
        console.log("Error comes in creating new order-> " , err);
        let errmessage;

        if (err instanceof Error && err.message === 'OUT_OF_STOCK') {
              return res.status(409).json({   // 409 = conflict
                success: false,
                message: 'Product is out of stock'
              });
        }

        if(err instanceof Error){
            errmessage = err.message
        } else if(typeof err === "string"){
            errmessage = err
        }

        res.status(500).send({
            status : false,
            message : "Something wrong in creating new order",
            error : errmessage
        })
    }
}