import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import { sendOTP,accessToken,refreshToken } from "../services/authService.js";
import { accessOptions,refreshOptions} from "../config/cookies.js";
import jwt from "jsonwebtoken";
dotenv.config();

const router = express.Router();

const client = new Client({
  connectionString: process.env.DBURL,
  ssl: { rejectUnauthorized: false }
});
await client.connect();
let tempObj = {};
let mapObj = {
    aadhar:"aadhaar_number",
    pan:"pan_number",
    voter:"voter_id",
    passport:"passport_number",
    driving:"driving_license_number",
    ration:"ration_number"    
}
async function getRow(data,mapObj){
        const query = `SELECT *FROM USERS WHERE ${mapObj[data.id]}  = $1 LIMIT 1`;
        try{
            const row = await client.query(query,[data.id_val]);
            if(row){
                return row.rows[0].phone_number;
            }   
            else{
                return null;
            }
        }catch(err){
            console.log(err);
        }
}
router.get('/generate-otp', async (req,res)=>{
    let data = req.body;
    let otp = Math.floor(1000 + Math.random() * 9000);
    let phone = await getRow(data,mapObj);
    if(phone){
        tempObj[phone] = otp;
        sendOTP(phone,otp);
        res.status(200).json({
            status:"success",
            description:"OTP has been sent successfully"
        })
    }
    else{
        res.status(404).json({
            status:"error",
            description:"Invalid ID"
        })
    }
    
})

router.post('/verify-otp',async(req,res)=>{
    let data = req.body;
    let phone = await getRow(data,mapObj);
    console.log(tempObj);
    if(tempObj[phone] && tempObj[phone] == data.otp){
        delete tempObj[phone];
        const accessLoad = {
            id:phone,
            role:"citizen",
            source:"login"
        }
        const refreshLoad = {
            id:phone,
            role:"citizen"
        }
        const access = accessToken(accessLoad);
        const refresh = refreshToken(refreshLoad);
        res.cookie("access_token",access,accessOptions);
        res.cookie("refresh_token",refresh,refreshOptions);
        res.status(200).json({
            status:"success",
            description:"Verification was successful.Tokens have been sent"
        })
    }
    else{
        res.status(404).json({
            status:"error",
            description:"OTP validation error,please try again"
        })
    }
})
router.post('/refresh',(req,res)=>{
    console.log(req.cookies);
    const refresh_token = req.cookies.refresh_token;
    if(!refresh_token){
        return res.status(404).json({
            status:"error",
            description:"Token not provided"
        });
    }
    try{
        const payload = jwt.verify(refresh_token,process.env.REFRESH_SECRET);
        payload["source"] = "refresh";
        delete payload["exp"];
        const access = accessToken(payload);
        res.cookie("access_token",access,accessOptions);
        res.status(200).json({
            status:"success",
            description:"Token has been refreshed"
        })
    }catch(err){
        console.log(err);
        res.status(401).json({
            status:"error",
            description:"Token expired or invalid"
        })
    }
})
export default router;