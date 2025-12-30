import type { Request , Response } from "express";
import { getProductsMongo } from "../Services/product.service.js";
import { newClient } from "../Config/radisConfig.js";

export const getAllProducts = async(req : Request , res : Response) => {

    let client = await newClient();

    try{

        const minSellingPrice  : any= req.query.minPrice;
        const maxSellingPrice : any = req.query.maxPrice;
        const page = Number(req.query.page) || 1;
        const LIMIT = Number(req.query.limit) || 2;
        const OFFSET = (page-1) * LIMIT;
        console.log(minSellingPrice , " " , maxSellingPrice  , " ", page , " ", LIMIT , " ", OFFSET , page);

        let productData : any = [];

        const cachedData = await client.get("products");
        console.log("Getting cachedData##################" , cachedData);

        if(cachedData){
            console.log("Inside cached Data");   
            productData = await JSON.parse(cachedData);

        } else {
            console.log("Inside computing data from db")
            const products = await getProductsMongo(minSellingPrice , maxSellingPrice , OFFSET , LIMIT , page);
            console.log(products);

            // set to redis
            await client.set("products" , JSON.stringify(products) , {EX : 60}); // expires in 1 min
            productData = products;
        }

        res.status(200).json({
            success : true,
            message : "Fetch products successfully",
            data : productData 
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