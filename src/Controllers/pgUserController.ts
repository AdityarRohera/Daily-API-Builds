import type{ Request , Response } from "express";
import { findUser , createUSer , defaultRole , newRole, roleExists  , assignRoleToUser} from "../Services/pgUser.service.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import type { AuthenticatedRequest } from "../Middlewares/pgAuth.js";


export const newUserHandler = async(req : Request , res : Response) => {
    try{

        const {name , email , password} = req.body;
        console.log(name , email , password);

        if(!name || !email || !password){
            return res.status(400).send({
                status : false,
                message : "Invalid data"
            })
        }

        const user = await findUser(email);
        if(user.rowCount !== 0){
            return res.status(400).send({
                status : false,
                message : "User Already Exists"
            })
        }

        const hashPassword = await bcrypt.hash(password , 10);

        // fetch default role (USER)
         const role = await defaultRole();
         console.log(role)
        if (role.rowCount === 0) {
            return res.status(500).json({
              success: false,
              message: "Default role not configured"
            });
        }

        // create user
        const createdUser = await createUSer({name , email , password : hashPassword});

         // assign role (RBAC-safe)
        const assignedResult =  await assignRoleToUser(createdUser.rows[0].id, role.rows[0].id);
        const responseBody = assignedResult.rows[0]
        
        return res.status(200).send({
            success : true,
            message : 'New User Registered successfully',
            user : responseBody
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

 
export const newRoleHandler = async(req : Request , res : Response) => {
    try{

        const {role} = req.body;
        console.log(role);

        if(!role){
            return res.status(400).send({
                status : false,
                message : "Invalid data"
            })
        }


        const createdRole = await newRole(role)
        
        return res.status(200).send({
            success : true,
            message : 'New Role is created successfully',
            role : createdRole.rows[0]
        })
        
    } catch(err : unknown){
        console.log("Error comes in creating new role -> " , err);
        let errmessage;
        if(err instanceof Error){
            errmessage = err.message
        } else if(typeof err === "string"){
            errmessage = err
        }

        res.status(500).send({
            status : false,
            message : "Something wrong in creating new role",
            error : errmessage
        })
    }
}

export const assignRoleHandler = async(req : Request , res : Response) => {
    try{

        const userId = req.params.id;
        const {assignRoleId} = req.body;

         if(!userId || typeof userId !== "string"){
            return res.status(400).send({
                success : false,
                message : "User id required"
            })
        }

        // Check role
        const roleCheck = await roleExists(assignRoleId);
        console.log(roleCheck.rows[0])
        
        if (roleCheck.rowCount === 0) {
          return res.status(400).json({
            status: false,
            message: 'Role not found'
          });
        }

          // Assign role
        const result = await assignRoleToUser(userId, assignRoleId);
        if (result.rowCount === 0) {
          return res.status(400).json({
            status: false,
            message: 'User not found'
          });
        }
        
        return res.status(200).send({
            success : true,
            message : 'User role updated successfully',
            data : result.rows[0]
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

export const signInUserHandler = async(req : Request , res : Response) => {
    try{

        const {email , password} = req.body;
        console.log(email , password);

        if(!email || !password){
            return res.status(400).send({
                status : false,
                message : "Invalid data"
            })
        }

        const user = await findUser(email);
        if(user.rowCount === 0){
            return res.status(400).send({
                status : false,
                message : "User not found"
            })
        }

        // check password
        const matchPassword = await bcrypt.compare(password , user.rows[0].password);
        if(!matchPassword){
            return res.status(400).send({
                status : false,
                message : "Incorrect Password"
            })
        }

         // token
        const token = jwt.sign({
            userId : user.rows[0].id,
            email : user.rows[0].email
        } , process.env.SECRET! ,  { expiresIn: "1h" });
        
        
         return res.status(200).send({
            success : true,
            message : 'User login successfully',
            token : token,
            user : {id : user.rows[0].id , email : user.rows[0].email}
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
