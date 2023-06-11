const express = require("express")
const router= express.Router()
const memberships=require("../models/membershipsModel")
const verifie_token= require("../validators/verifyToken")

//add services
router.post('/',verifie_token,async (req,res)=>{
    if (req.tokendata.UserType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    let servicesDetails=[]
    
    const newmemberships= new memberships({
        MembershipName:req.body.MembershipName,
        MembershipDescription:req.body.MembershipDescription,
        Services:req.body.Services,
        MembershipCost:req.body.MembershipCost,
        SellingCost:req.body.SellingCost,
        Taxrate:req.body.Taxrate,
        HsnCode:req.body.HsnCode,
        active:true,
        Branch:req.body.Branch,
        count:req.body.count,
        isunlimited:req.body.isunlimited,
        validity:req.body.validity
    })
    try{
        const newmembership=await newmemberships.save()
        res.status(201).json(newmembership._id)
    }
    catch(error){
        res.status(400).json({message:error.message})
    }
})

//get a service
router.get('/:id', getMemberships,(req,res)=>{
    res.send(res.membership)
})



//get all services
router.get('/',async (req,res)=>{
    try{
        const allmemberships=await memberships.find()
        res.json(allmemberships)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

//middleware
async function getMemberships(req,res,next){
    let membership
    try{
        membership=await memberships.findById(req.params.id)
        if(membership==null){
            return res.status(404).json({message:"Branch unavailable!"})
        }

    }catch(error){
        res.status(500).json({message: error.message})
    }
    res.membership=membership
    next()
}
module.exports=router