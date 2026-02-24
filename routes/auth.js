import express from "express"
import db from "../configs/db.js"
const router = express.Router(); 
router.post("/login",(req,res,next)=>{
    try {
        const {email,password,code}= req.body;
        if (email === process.env.EMAIL &&
             password === process.env.PASSWORD &&
              code == process.env.VER_CODE){
            res.status(200);
        }else {
            res.status(401);
        }

    } catch (err) {
        next(err);
    }
});