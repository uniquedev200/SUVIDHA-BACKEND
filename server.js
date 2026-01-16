import https from "https";
import fs from "fs";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

const options = {
    key:fs.readFileSync("./certs/localhost+2-key.pem"),
    cert:fs.readFileSync("./certs/localhost+2.pem")
}

https.createServer(options,app).listen(process.env.PORT,()=>{
    console.log("HTTPS SERVER STARTED AT PORT:",process.env.PORT);
})