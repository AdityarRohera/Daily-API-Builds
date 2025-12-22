import mongoose from "mongoose";

export const dbConnect = async() => {
    try{

        const connect = await mongoose.connect(process.env.MONGODB_URL!);
        if(connect){
            console.log("Database connect successfully")
        }
        

    } catch(err){
        console.log("Error in connecting to mongodb -> " , err)
    }
}