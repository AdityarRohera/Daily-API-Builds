import type { Request , Response } from "express"
import { getProducts , newProductQuery , getCategoryProductQuery } from "../Services/product.service.js"

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
