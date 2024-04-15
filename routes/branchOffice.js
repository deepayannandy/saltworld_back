import { Router } from "express";
import Branch from "../models/branchOfficeModel.js";
import verifyToken from "../validators/verifyToken.js";

const router = Router();

router.post('/',verifyToken,async (req,res)=>{
    if (req.tokendata.userType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    const brachOffice= new Branch({
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
        const branchOffices=await Branch.find()
        res.json(branchOffices)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

//middleware
async function getBranch(req,res,next){
    let branch
    try{
        branch=await branch.Branch.findById(req.params.id)
        if(branch==null){
            return res.status(404).json({message:"Branch unavailable!"})
        }

    }catch(error){
        res.status(500).json({message: error.message})
    }
    res.branch=branch
    next()
}
export default router;
