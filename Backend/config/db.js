import mongoose from "mongoose";
export async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Database is connected")
    }
    catch(error){
        console.log("Database is not connected",error)
    }
}