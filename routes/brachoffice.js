const express = require("express")
const router= express.Router()
const branch=require("../models/branchOfficeModel")
//create branch
const verifie_token= require("../validators/verifyToken")

router.post('/',verifie_token,async (req,res)=>{
    if (req.tokendata.UserType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    const brachOffice= new branch({
        BranchName:req.body.BranchName,
        BranchDetails:req.body.BranchDetails,
        BranchAddress:req.body.BranchAddress,
        GST:req.body.GST,
        LegalName:req.body.LegalName,
        active:true,
        Mobile:req.body.Mobile,
    })
    try{
        const newBranch=await brachOffice.save()
        res.status(201).json(newBranch._id)
    }
    catch(error){
        res.status(400).json({message:error.message})
    }
})

//get a branch
router.get('/:id', getBranch,(req,res)=>{
    res.send(res.branch)
})



//get all branch
router.get('/',async (req,res)=>{
    try{
        const branchOffices=await branch.find()
        res.json(branchOffices)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

//middleware
async function getBranch(req,res,next){
    let branch
    try{
        branch=await branch.findById(req.params.id)
        if(branch==null){
            return res.status(404).json({message:"Branch unavailable!"})
        }

    }catch(error){
        res.status(500).json({message: error.message})
    }
    res.branch=branch
    next()
}
module.exports=router
