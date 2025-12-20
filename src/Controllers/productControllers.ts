import type { Request , Response } from "express"
import { getProducts } from "../Services/product.service.js"

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