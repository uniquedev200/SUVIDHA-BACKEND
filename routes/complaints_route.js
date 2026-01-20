import dotenv from "dotenv";
dotenv.config();
import {Client} from "pg";
import { authenticateToken } from "../middleware/authfunction.js";
import express from 'express';
const  router = express.Router();

const client = new Client({
  connectionString: process.env.DBURL,
  ssl: { rejectUnauthorized: false }
});
await client.connect();
async function getComplaints(phone){
    try{
        const query = `
            SELECT
                u.id AS user_id,
                u.phone_number,

                c.complaint_id,
                c.service_type,
                c.category,
                c.description,
                c.status AS complaint_status,
                c.priority,
                c.created_at,
                c.updated_at,
                c.resolved_at,

                sa.account_id,
                sa.account_number,
                sa.service_type AS account_service_type

            FROM users u
            JOIN complaints c
                ON c.user_id = u.id
            LEFT JOIN service_accounts sa
                ON sa.account_id = c.account_id

            WHERE u.phone_number = $1
            ORDER BY c.created_at DESC;
            `;
        let result = await client.query(query,[phone]);
        let rows = result.rows;
        if(rows){
            return rows;
        }
        else{
            return null;
        }
    }catch(err){
        console.log(err);
    }
}
async function addComplaint(inputObj){
    const query = `
        INSERT INTO complaints (
            user_id,
            account_id,
            service_type,
            category,
            description,
            priority,
            bill_id
        )
        VALUES (
            (SELECT id FROM users WHERE phone_number = $1),
            (
            SELECT sa.account_id
            FROM service_accounts sa
            JOIN users u ON u.id = sa.user_id
            WHERE u.phone_number = $1
                AND sa.service_type = $2
            LIMIT 1
            ),
            $2,
            $3,
            $4,
            $5,
            $6
        )
        RETURNING complaint_id, status, created_at;
        `;
    try{
        let result = await client.query(query,[inputObj.phone,inputObj.service_type,inputObj.category,inputObj.description,inputObj.priority,inputObj.bill_id]);
        let rows = result.rows;
        if(rows){
            return rows;
        }
        else{
            return null;
        }
    }catch(err){    
        console.log(err);
    }
}
router.get('/list',authenticateToken,async(req,res)=>{
    const phone = req.user.id;
    let rows = await getComplaints(phone);
    if(rows){
        res.status(200).json({
            status:"success",
            complaints:rows
        })
    }
    else{
        res.status(200).json({
            status:"success",
            complaints:null
        })
    }
})
router.post('/create',authenticateToken,async(req,res)=>{
    const phone = req.user.id;
    const usrObj  = req.body;
    if(!usrObj.bill_id){
        usrObj.bill_id = null;
    }
    usrObj["phone"] = phone
    let rows = await addComplaint(usrObj);
    if(rows){
        res.status(200).json({
            status:"success",
            data:rows
        })
    }else{
        res.status(404),json({
            status:"error",
            description:"Something went wrong with complaint creation"
        })
    }
})
export default router;