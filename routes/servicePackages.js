import { Router } from "express";
import ServicePackages from "../models/servicePackagesModel.js";
import verifyToken from "../validators/verifyToken.js";
import { ObjectId } from "mongodb";

const router = Router();

//add services
router.post('/',verifyToken,async (req,res)=>{
    if (req.tokendata.UserType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    const servicePackage= new ServicePackages({
        PackageName:req.body.PackageName,
        PackageDescription:req.body.PackageDescription,
        ServicesId: req.body.ServicesId,
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


//get a service
router.patch('/:id', getServices,async (req,res)=>{
    if(req.body.PackageName!=null){
        res.service.PackageName=req.body.PackageName
    }
    if(req.body.PackageDescription!=null){
        res.service.PackageDescription=req.body.PackageDescription
    }
    if(req.body.ServicesId!=null){
        res.service.ServicesId=req.body.ServicesId
    }
    if(req.body.ServiceCost!=null){
        res.service.ServiceCost=req.body.ServiceCost
    }
    if(req.body.SellingCost!=null){
        res.service.SellingCost=req.body.SellingCost
    }
    if(req.body.Taxrate!=null){
        res.service.Taxrate=req.body.Taxrate
    }
    if(req.body.HsnCode!=null){
        res.service.HsnCode=req.body.HsnCode
    }
    try{
        const newservice=await  res.service.save()
        res.status(201).json(newservice._id)
    }
    catch(error){
        res.status(400).json({message:error.message})
    }
})


//get all services
router.get('/',async (req,res)=>{
    try{
        const servicep=await ServicePackages.find()
        res.json(servicep)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

router.delete("/:id",async (req,res)=>{
    console.log(req.params.id)
    s=await ServicePackages.findById(req.params.id)
        if(s==null){
            return res.status(404).json({message:"Package unavailable!"})
        }
    try{
        const reasult= await ServicePackages.deleteOne({_id: new ObjectId(req.params.id)})
        res.json(reasult)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})


//middleware
async function getServices(req,res,next){
    let servicep
    try{
        servicep=await ServicePackages.findById(req.params.id)
        if(servicep==null){
            return res.status(404).json({message:"Branch unavailable!"})
        }

    }catch(error){
        res.status(500).json({message: error.message})
    }
    res.service=servicep
    next()
}
export default router;