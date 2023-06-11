const express = require("express")
const router= express.Router()
const services=require("../models/servicesModel")
const verifie_token= require("../validators/verifyToken")
const mongodb=require("mongodb");
//add services
router.post('/',verifie_token,async (req,res)=>{
    if (req.tokendata.UserType!="Admin") return res.status(400).json({message:"Access Pohibited!"})
    let foundservices= await services.find({"ServiceName":req.body.ServiceName})
    if (foundservices==null)
    {
        res.status(400).json({message:"The Service name is already availabe!"})
        return 
    }
    const service= new services({
        ServiceName:req.body.ServiceName,
        ServiceCategory:req.body.ServiceCategory,
        ServiceDescription:req.body.ServiceDescription,
        Duration:req.body.Duration,
        ServiceCost:req.body.ServiceCost,
        SellingCost:req.body.SellingCost,
        Taxrate:req.body.Taxrate,
        HsnCode:req.body.HsnCode,
        ResourceType:req.body.ResourceType,
        IncludeTax:(req.body.SellingCost*((100+req.body.Taxrate)/100)),
        Branch:req.body.Branch,
        active:true
    })
    try{
        const newservice=await service.save()
        res.status(201).json(newservice._id)
    }
    catch(error){
        res.status(400).json({message:error.message})
    }
})

//get a service
router.get('/:id', getServices,(req,res)=>{
    res.send(res.service)
})

router.patch('/:id', getServices,async (req,res)=>{
    if(req.body.ServiceName!=null){
        res.service.ServiceName=req.body.ServiceName
    }
    if(req.body.ServiceCategory!=null){
        res.service.ServiceCategory=req.body.ServiceCategory
    }
    if(req.body.ServiceDescription!=null){
        res.service.ServiceDescription=req.body.ServiceDescription
    }
    if(req.body.Duration!=null){
        res.service.Duration=req.body.Duration
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
    if(req.body.active!=null){
        res.service.active=req.body.active
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
        const Services=await services.find()
        res.json(Services)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

router.delete("/:id",async (req,res)=>{
    console.log(req.params.id)
    s=await services.findById(req.params.id)
        if(s==null){
            return res.status(404).json({message:"Service unavailable!"})
        }
        console.log(s.ServiceName)

    try{
        const reasult= await services.deleteOne({_id: new mongodb.ObjectId(req.params.id)})
        res.json(reasult)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

//middleware
async function getServices(req,res,next){
    let service
    try{
        service=await services.findById(req.params.id)
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