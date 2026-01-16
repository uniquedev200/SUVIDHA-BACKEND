import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export function authenticateToken(req,res,next){
    const access_token = req.cookies.access_token;
    if(!access_token){
        return res.status(404).json({
            status:"error",
            description:"Not Authenticated"
        })
    }
    try{
        req.user = jwt.verify(access_token,process.env.ACCESS_SECRET);
        next();
    }catch{
        return res.status(401).json({
            status:"error",
            description:"Token expired or invalid"
        })
    }   
}