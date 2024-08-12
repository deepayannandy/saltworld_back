import { Router } from "express";
import test from "../models/testModel.js";
const router = Router();

router.post("/",async(req, res)=>{
    try{
        const testData= new test({
            dataArray:req.body.dataArray,
            dataString:req.body.dataString,
            timeStamp:new Date(),
        })
        const newTestData=await testData.save()
        res.status(201).json(newTestData._id)
    }catch(error){
        res.status(400).json({message:error.message})
    }
})

router.get("/",async(req, res)=>{
    try{
        const newTestData=await test.find()
        res.status(201).json(newTestData)
    }catch(error){
        res.status(400).json({message:error.message})
    }
})

export default router;