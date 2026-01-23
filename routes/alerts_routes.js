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
async function getAlerts(phone){
    try{
        const query = `
            SELECT
                a.alert_id,
                a.alert_type,
                a.severity,
                a.title,
                a.message,
                a.is_read,
                a.created_at,

                sa.service_type,
                sa.account_number,

                b.bill_id,
                b.amount AS bill_amount,
                b.status AS bill_status

            FROM users u
            JOIN alerts a
                ON a.user_id = u.id

            LEFT JOIN service_accounts sa
                ON sa.account_id = a.account_id

            LEFT JOIN bills b
                ON b.bill_id = a.bill_id

            WHERE u.phone_number = $1

            ORDER BY a.created_at DESC
            `;
        let result = await client.query(query,[phone])
        let rows = result.rows;
        if(rows){
            return rows
        }
        else{
            return [];
        }
    }catch(err){
        console.log(err)
        return null;
    }
}
router.get('/get',authenticateToken,async (req,res)=>{
    const phone = req.user.id;
    const alerts = await getAlerts(phone);
    if(alerts){
        res.status(200).json({
            status:"success",
            alerts:alerts
        })
    }
    else{
        res.status(404).json({
            status:"error",
            description:"error occured while retrieving data"
        })
    }

})
export default router;