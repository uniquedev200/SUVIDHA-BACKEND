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
async function addPayments(inputObj){
    const query = `
        INSERT INTO payments (
            bill_id,
            transaction_id,
            payment_method,
            status
        )
        SELECT
            b.bill_id,
            $3 AS transaction_id,
            $4 AS payment_method,
            $5 AS status
        FROM users u
        JOIN service_accounts sa
            ON sa.user_id = u.id
        JOIN bills b
            ON b.account_id = sa.account_id
        WHERE
            u.phone_number = $1
            AND b.bill_id = $2
        RETURNING payment_id, bill_id, status;
        `;

    try{
        let result = await client.query(query,[inputObj.phone,inputObj.bill_id,inputObj.transaction_id,inputObj.payment_method,inputObj.status])
        let rows = result.rows;
        if(result.rowCount>0){
            return rows
        }
        else{
            null;
        }
    }catch(err){
        console.log(err);
        return null;
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
router.post('/initiate',authenticateToken,async(req,res)=>{
    let body = req.body;
    let phone = req.user.id;
    body["phone"] = phone;
    let rows = await addPayments(body);
    if(!rows){
        res.status(401).json({
            status:"error",
            description:"Error encountered or bill doesnt belong to user"
        })
    }
    else{
        res.status(200).json({
            status:"success",
            data:rows
        })
    }
})
export default router;