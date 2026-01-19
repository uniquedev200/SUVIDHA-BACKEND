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
async function getFailedPayments(phone){
    
    try{
        const query = `
        SELECT
        u.id AS user_id,
        u.phone_number,

        sa.account_id,
        sa.service_type,
        sa.account_number,

        b.bill_id,
        b.amount,
        b.status AS bill_status,

        p.payment_id,
        p.transaction_id,
        p.payment_method,
        p.status AS payment_status,
        p.paid_at
        FROM users u
        JOIN service_accounts sa
        ON sa.user_id = u.id
        JOIN bills b
        ON b.account_id = sa.account_id
        JOIN payments p
        ON p.bill_id = b.bill_id
        WHERE u.phone_number = $1
        AND p.status = 'FAILED'
        ORDER BY p.paid_at DESC;
    `;
    const result = await client.query(query,[phone]);
    const rows = result.rows;
    if(rows){
        return rows

    }
    else{
          return null;
    }
    }catch(err){
        console.log(err);
      }
}
async function getPayments(phone){
    try{
        const query = `
        SELECT
        u.id AS user_id,
        u.phone_number,

        sa.account_id,
        sa.service_type,
        sa.account_number,

        b.bill_id,
        b.amount,
        b.status AS bill_status,

        p.payment_id,
        p.transaction_id,
        p.payment_method,
        p.status AS payment_status,
        p.paid_at
        FROM users u
        JOIN service_accounts sa
        ON sa.user_id = u.id
        JOIN bills b
        ON b.account_id = sa.account_id
        JOIN payments p
        ON p.bill_id = b.bill_id
        WHERE u.phone_number = $1
        ORDER BY p.paid_at DESC;
    `;
    const result = await client.query(query,[phone]);
    const rows = result.rows;
    if(rows){
        return rows

    }
    else{
          return null;
    }
    }catch(err){
        console.log(err);
      }
}
router.get("/list",authenticateToken,async(req,res)=>{
    const phone = req.user.id;
    const {status} = req.query;
    if(status=="FAILED"){
        const rows = await getFailedPayments(phone);
        if(rows){
            res.status(200).json({
                status:"success",
                payments:rows
            })
        }
        else{
            res.status(200).json({
                status:"success",
                payments:null
            })
        }
    }
    else if(status=="ALL"){
        const rows = await getPayments(phone);
        if(rows){
            res.status(200).json({
                status:"success",
                payments:rows
            })
        }
        else{
            res.status(200).json({
                status:"success",
                payments:null
            })
        }
    }
    else{
        res.status(200).json({
            status:"error",
            description:"Invalid parameter value"
        })
    }
})
export default router;