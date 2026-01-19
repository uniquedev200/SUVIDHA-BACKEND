import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export function sendOTP(phone,otp){
    axios.post(process.env.SMS_GATEWAY,{
        phone:phone.toString(),
        message:`Your OTP for Goverment Kiosk Services is:${otp.toString()}`
    })
    .then(function(response){
        console.log(response.data);
    })
}
export function accessToken(payload){
    return jwt.sign(payload,process.env.ACCESS_SECRET,{
        expiresIn:"15m"
    });
}
export function refreshToken(payload){
    return jwt.sign(payload,process.env.REFRESH_SECRET,{
        expiresIn:"10d"
    });
}

