import type {Request , Response} from 'express'
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import {getUserRoles } from '../Services/pgUser.service.js';


export interface AuthenticatedRequest extends Request {
        user : JwtPayload;
}

export const userAuth = (req : Request , res : Response , next : any) => {
    try{

        const userReq = req as AuthenticatedRequest
        const {token} = req.headers;
        console.log("Inside user auth -> " , token , typeof(token))

        if(!token || typeof token!== "string"){
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
                message: "Invalid Token"
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

export const isAdmin = async(req : Request , res : Response , next : any) => {
    try{

        const AuthRequest = req as AuthenticatedRequest
        const {userId} = AuthRequest.user
        console.log("IsAdmin getting user id -> " , userId);

        // get role of user
        const userRole = await getUserRoles(userId);
        console.log(userRole.rows);
        if(userRole.rows[0].role !== 'Admin'){
            return res.status(400).send({
                success : false,
                message : `Your Role is ${userRole.rows[0].role} , so you are not allowed to access admin route`
            })
        }

        next();

    } catch(err : unknown){
        console.log("Error comes in isAdmin middleware -> " , err);
            let errorMessage;
            if(err instanceof Error){
                errorMessage = err.message
            } else if(typeof(err) === 'string'){
                errorMessage = err
            }
            res.status(500).send({
                success : false,
                message : "Error comes in isAdmin middleware",
                error : errorMessage
            })
        }
}