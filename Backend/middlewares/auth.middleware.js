import jwt from 'jsonwebtoken'
import blacklistModel from '../models/blacklist.model.js'
export async function authUser(req,resp,next){
    const token = req.cookies.token
    if(!token){
        return resp.status(401).json({message:"Token not provided"})
    }
    const isTokenBlackList = await blacklistModel.findOne({token})
    if(isTokenBlackList){
        return resp.status(401).json({message:"Token is invalid"})
    }
    try{
    const decoded = await jwt.verify(token,process.env.JWT_SECRET_KEY)
    req.user = decoded
    next()
    }
    catch(error){
        return resp.status(401).json({message:"Invalid token"})
    }
}