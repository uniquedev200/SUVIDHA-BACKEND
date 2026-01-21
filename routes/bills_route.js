import dotenv from "dotenv";
dotenv.config();
import {Client} from "pg";
import { authenticateToken } from "../middleware/authfunction.js";
import {sendOTP,accessToken,refreshToken,generateServiceToken} from "../services/authService.js";
import express from 'express';
import axios from 'axios';
const  router = express.Router();

const client = new Client({
  connectionString: process.env.DBURL,
  ssl: { rejectUnauthorized: false }
});
async function getPaidBills(phone){
  try{
          const query =  `
            SELECT
              u.id AS user_id,
              u.phone_number,

              sa.account_id,
              sa.service_type,
              sa.account_number,
              sa.status AS account_status,

              b.bill_id,
              b.amount,
              b.status AS bill_status,
              b.billing_period_start,
              b.billing_period_end,
              b.bill_pdf_url,
              b.created_at AS bill_created_at

            FROM users u
            JOIN service_accounts sa
              ON sa.user_id = u.id
            LEFT JOIN bills b
              ON b.account_id = sa.account_id
            WHERE u.phone_number = $1
              AND b.status = 'PAID'
            ORDER BY sa.service_type, b.created_at DESC;
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
async function getBills(phone){
  try{
          const query =  `
            SELECT
              u.id AS user_id,
              u.phone_number,

              sa.account_id,
              sa.service_type,
              sa.account_number,
              sa.status AS account_status,

              b.bill_id,
              b.amount,
              b.status AS bill_status,
              b.billing_period_start,
              b.billing_period_end,
              b.bill_pdf_url,
              b.created_at AS bill_created_at

            FROM users u
            JOIN service_accounts sa
              ON sa.user_id = u.id
            LEFT JOIN bills b
              ON b.account_id = sa.account_id
            WHERE u.phone_number = $1
            ORDER BY sa.service_type, b.created_at DESC;
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
async function getPendingBills(phone){
  try{
          const query =  `
            SELECT
              u.id AS user_id,
              u.phone_number,

              sa.account_id,
              sa.service_type,
              sa.account_number,
              sa.status AS account_status,

              b.bill_id,
              b.amount,
              b.status AS bill_status,
              b.billing_period_start,
              b.billing_period_end,
              b.bill_pdf_url,
              b.created_at AS bill_created_at

            FROM users u
            JOIN service_accounts sa
              ON sa.user_id = u.id
            LEFT JOIN bills b
              ON b.account_id = sa.account_id
            WHERE u.phone_number = $1
              AND b.status = 'PENDING'
            ORDER BY sa.service_type, b.created_at DESC;
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
await client.connect()
router.get("/list",authenticateToken,async (req,res)=>{
   const phone = req.user.id;
   const {status} = req.query;
   if(status=="PENDING"){
    const rows = await getPendingBills(phone);
    if(rows){
        res.status(200).json({
          status:"success",
          bills:rows
        })
    }
    else{
        res.status(200).json({
          status:"success",
          bills:null
        })
    }
   }
   else if(status=="PAID"){
    const rows = await getPaidBills(phone);
    if(rows){
        res.status(200).json({
          status:"success",
          bills:rows
        })
    }
    else{
        res.status(200).json({
          status:"success",
          bills:null
        })
    }
   }
   else{
    res.status(404).json({
      status:"error",
      description:"incorrect parameter value"
    })
   }
   
      

}); 
router.get("/insights",authenticateToken,async(req,res)=>{
  let phone = req.user.id;
  let rows = await getBills(phone);
  if(rows){
    const response = await axios.post(
        "http://localhost:8000/insights",
        {
          bills:rows.map(bill=>({
             amount: Number(bill.amount),
             status: bill.bill_status,
             service_type: bill.service_type
          }))
        },
        {
          headers: {
            Authorization: `Bearer ${generateServiceToken()}`
          }
        }
    );
    res.status(200).json({
      status:"succeess",
      response:response.data
    })
    

  }
  else{
    res.status(401).json({
      status:"error",
      description:"Error occured while retrieval for data"
    });
  }
})
export default router;