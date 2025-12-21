import type { Request , Response } from "express";
import { newCategory , getCategoryById } from "../Services/category.service.js";
import { getCategoryProductQuery } from "../Services/product.service.js";

export const newCategoryHandler = async(req : Request , res : Response) => {
    try{

        const {category} = req.body;

        if(!category){
            return res.status(400).send({
                message : "category required"
            })
        }

        const createdCategory = await newCategory(category);

        return res.status(200).send({
            message : "category created successful",
            category : createdCategory.rows[0]
        })

    } catch(err : unknown){
        console.log("Error comes in creating new category -> " , err);
        let errmessage;
        if(err instanceof Error){
            errmessage = err.message
        } else if(typeof err === "string"){
            errmessage = err
        }

        res.status(500).send({
            status : false,
            message : "Something wrong in new category",
            error : errmessage
        })
    }
}

export const getCategoryHandler = async(req : Request , res : Response) => {
    try{

        const {category_id} = req.body;

        if(!category_id){
            return res.status(400).send({
                message : "category_id required"
            })
        }

        const createdCategory = await getCategoryById(category_id);

        return res.status(200).send({
            message : "fetch category successful",
            category : createdCategory.rows[0]
        })

    } catch(err : unknown){
        console.log("Error comes in fetching category -> " , err);
        let errmessage;
        if(err instanceof Error){
            errmessage = err.message
        } else if(typeof err === "string"){
            errmessage = err
        }

        res.status(500).send({
            status : false,
            message : "Something wrong in fetching category",
            error : errmessage
        })
    }
}

export const getAllCategoryProducts = async(req : Request , res : Response) => {
    try{

        const category_id  : string | undefined= req.params.id;
        console.log(category_id)

        if(!category_id){
            return res.status(400).send({
                status : false,
                message : "category_id required"
            })
        }

        const category = await getCategoryById(category_id);
        if(!category){
            return res.status(400).send({
                success : false,
                message : "Invalid category_id"
            })
        }

        const categoryProducts = await getCategoryProductQuery(category_id);
        
        return res.status(200).send({
            success : true,
            message : `Fetched all products of category ${category.rows[0].category_name}`,
            categoryProducts : categoryProducts.rows
        })
        
    } catch(err : unknown){
        console.log("Error comes in fetching categories product -> " , err);
        let errmessage;
        if(err instanceof Error){
            errmessage = err.message
        } else if(typeof err === "string"){
            errmessage = err
        }

        res.status(500).send({
            status : false,
            message : "Something wrong in fetching categories product",
            error : errmessage
        })
    }
}