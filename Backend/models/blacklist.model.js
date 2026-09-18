import mongoose from "mongoose";
const blacklistTokenSchema =  mongoose.Schema({
    token:{
        type:String,
        required:[true,"Token is required to be added in blacklist"],
    }
},{
    timestamps:true
})
export default mongoose.model("BlackListToken",blacklistTokenSchema)