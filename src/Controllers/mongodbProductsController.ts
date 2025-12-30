import type { Request , Response } from "express";
import { getProductsMongo } from "../Services/product.service.js";

export const getAllProducts = async(req : Request , res : Response) => {
    try{

        const minSellingPrice  : any= req.query.minPrice;
        const maxSellingPrice : any = req.query.maxPrice;
        const page = Number(req.query.page) || 1;
        const LIMIT = Number(req.query.limit) || 2;
        const OFFSET = (page-1) * LIMIT;

        console.log(minSellingPrice , " " , maxSellingPrice  , " ", page , " ", LIMIT , " ", OFFSET , page);

        const products = await getProductsMongo(minSellingPrice , maxSellingPrice , OFFSET , LIMIT , page);
        console.log(products);

        res.status(200).json({
            success : true,
            message : "Fetch products successfully",
            products : products
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