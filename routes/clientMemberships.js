const express = require("express")
const router= express.Router()
const clientMembershipsModel= require("../models/clientMembershipModel")
const verifie_token= require("../validators/verifyToken")

//add services
router.post('/',verifie_token,async (req,res)=>{
    if (req.tokendata.UserType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    var StartDate=new Date(req.body.StartDate);
    var EndDate = new Date(StartDate + ((req.body.validDuration) * 24 * 60 * 60 * 1000))
    console.log(EndDate)
    const clientmembeship= new clientMembershipsModel({
        clientid:req.body.clientid,
        MembershipName:req.body.MembershipName,
        Services:req.body.Services,
        paidAmount:req.body.paidAmount,
        Taxrate:req.body.Taxrate,
        HsnCode:req.body.HsnCode,
        active:true,
        count:req.body.count,
        countleft:req.body.count,
        StartDate:StartDate,
        EndDate:EndDate,
    })
    try{
        const newclientmembeship=await clientmembeship.save()
        res.status(201).json(newclientmembeship._id)
    }
    catch(error){
        res.status(400).json({message:error.message})
    }
})

router.get('/:clientid',verifie_token,async(req,res)=>{
    if (req.tokendata.UserType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    try{
        const clientNotes=await clientMembershipsModel.find({clientid:req.params.clientid})
        res.json(clientNotes)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})
module.exports=router