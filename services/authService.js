import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export async function sendOTP(phone,otp){
    await axios.post(process.env.SMS_GATEWAY,{
        phone:phone.toString(),
        message:`Your OTP for Goverment Kiosk Services is:${otp.toString()}`
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

export function generateServiceToken() {
  return jwt.sign(
    { service: "SUVIDHA_BACKEND" },
    process.env.SERVICE_JWT_SECRET,
    { expiresIn: "5m" }
  );
}

