import mongoose from "mongoose";
import { Schema , Model ,model } from "mongoose";
import { Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
}

const userSchema : Schema<IUser> = new Schema<IUser>({
    username : {
        type : String,
        required : true,
        trim : true,
    },
    email : {
        type : String,
        required: [true, "Email address is required"],
        unique : true,
        lowercase : true,
        trim : true,
         match: [
                    /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, // A common email regex pattern
                    'Please enter a valid email address' // Custom error message
                ],
    },
    password : {
        type : String,
        required : true,
        min : [5 , 'passowrd is too short']
    }
} , { timestamps: true })

const UserModel : Model<IUser> = mongoose.models.User || model<IUser>('Users' , userSchema);
export default UserModel;