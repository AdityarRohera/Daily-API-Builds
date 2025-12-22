import type { Request , Response } from "express";
import { checkUser , newUser } from "../Services/user.service.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import type { AuthenticatedRequest } from "../Middlewares/auth.js";


export const newUserHandler = async(req : Request , res : Response) => {
    try{

        const {username , email , password} = req.body;
        console.log(username , email , password);

        if(!username || !email || !password){
            return res.status(400).send({
                status : false,
                message : "Invalid data"
            })
        }

        const user = await checkUser(email);
        if(user){
            return res.status(400).send({
                status : false,
                message : "User Already Exists"
            })
        }

        const hashPassword = await bcrypt.hash(password , 10);
        console.log(hashPassword)

        await newUser({username , email , hashPassword});
        
        return res.status(200).send({
            success : true,
            message : 'New User Registered successfully',
        })
        
    } catch(err : unknown){
        console.log("Error comes in New User Registered -> " , err);
        let errmessage;
        if(err instanceof Error){
            errmessage = err.message
        } else if(typeof err === "string"){
            errmessage = err
        }

        res.status(500).send({
            status : false,
            message : "Something wrong in New User Registered",
            error : errmessage
        })
    }
}

export const userLoginHandler = async(req : Request , res : Response) => {
    try{

        const {email , password} = req.body;

        if(!email && !password){
            return res.status(400).send({
                status : false,
                message : "Invalid data"
            })
        }

        const user = await checkUser(email);
        if(!user){
            return res.status(400).send({
                status : false,
                message : "User Not Registered"
            })
        }

        const checkPassword = await bcrypt.compare(password , user.password);
        if(!checkPassword){
            return res.status(400).send({
                status : false,
                message : "Incorrect Password"
            })
        }

        // token
        const token = jwt.sign({
            userId : user._id
        } , process.env.SECRET!);

        
        return res.status(200).send({
            success : true,
            message : 'User login successfully',
            token : token,
            user : {id : user._id , email : user.email}
        })
        
    } catch(err : unknown){
        console.log("Error comes in User login -> " , err);
        let errmessage;
        if(err instanceof Error){
            errmessage = err.message
        } else if(typeof err === "string"){
            errmessage = err
        }

        res.status(500).send({
            status : false,
            message : "Something wrong in User login",
            error : errmessage
        })
    }
}

export const userProfile = async(req : Request , res : Response) => {
    try{

        const {user} = req as AuthenticatedRequest
        
        return res.status(200).send({
            success : true,
            user : user
        })
        
    } catch(err : unknown){
        console.log("Error comes in auth profile -> " , err);
        let errmessage;
        if(err instanceof Error){
            errmessage = err.message
        } else if(typeof err === "string"){
            errmessage = err
        }

        res.status(500).send({
            status : false,
            message : "Something wrong in auth profile",
            error : errmessage
        })
    }
}