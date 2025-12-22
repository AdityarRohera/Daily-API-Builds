
import type { Request , Response } from "express";
import type {JwtPayload} from "jsonwebtoken";
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
        user : JwtPayload;
}

export const userAuth = (req : Request , res : Response , next : any) => {
    try{

        const userReq = req as AuthenticatedRequest
        const {token} = req.headers;
        console.log("Inside user auth -> " , token , typeof(token))

        if(!token && typeof token!== "string"){
            return res.status(400).send({
                status : false,
                message : "Token Required"
            })
        }

        //verify token 
        const verifyToken = jwt.verify(token as string , process.env.SECRET!) as JwtPayload;

         if(!verifyToken){
            return res.status(403).send({
                success : false,
                message: "Token invalid"
            })
         }

          userReq.user = verifyToken;
          next();

    } catch(err : unknown){
        console.log("Error comes in auth middleware -> " , err);
            let errorMessage;
            if(err instanceof Error){
                errorMessage = err.message
            } else if(typeof(err) === 'string'){
                errorMessage = err
            }
            res.status(500).send({
                success : false,
                message : "Error comes in user auth",
                error : errorMessage
            })
        }
}