import mongoose from "mongoose"
import UserModel from "../Models/User.Schema.js"
import type { IUser } from "../Models/User.Schema.js";


export const checkUser = async(email : string) : Promise<IUser | null> => {
    return await UserModel.findOne({email}).exec();
}

export const newUser = async({username , email , hashPassword} : any) : Promise<IUser | null> => {
    return await UserModel.create({username , email , password : hashPassword})
}