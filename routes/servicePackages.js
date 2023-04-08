const express = require("express")
const router= express.Router()
const servicePackages=require("../models/servicePackagesModel")
const verifie_token= require("../validators/verifyToken")

//add services
router.post('/',verifie_token,async (req,res)=>{
    if (req.tokendata.UserType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    let servicesDetails=[]
    for (serviceid in req.body.ServicesId){
        console.log(serviceid)
    }
    const servicePackage= new servicePackages({
        PackageName:req.body.PackageName,
        PackageDescription:req.body.PackageDescription,
        ServicesId:servicesDetails,
        ServiceCost:req.body.ServiceCost,
        SellingCost:req.body.SellingCost,
        Taxrate:req.body.Taxrate,
        HsnCode:req.body.HsnCode,
        active:true,
        Branch:req.body.Branch
    })
    try{
        const newservicePackage=await servicePackage.save()
        res.status(201).json(newservicePackage._id)
    }
    catch(error){
        res.status(400).json({message:error.message})
    }
})

//get a service
router.get('/:id', getServices,(req,res)=>{
    res.send(res.service)
})



//get all services
router.get('/',async (req,res)=>{
    try{
        const Services=await servicePackages.find()
        res.json(Services)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

//middleware
async function getServices(req,res,next){
    let service
    try{
        service=await servicePackages.findById(req.params.id)
        if(service==null){
            return res.status(404).json({message:"Branch unavailable!"})
        }

    }catch(error){
        res.status(500).json({message: error.message})
    }
    res.service=service
    next()
}
module.exports=router