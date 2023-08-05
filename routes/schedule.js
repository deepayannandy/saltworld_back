const express = require("express")
const router= express.Router()
const clientmodel= require("../models/clientModel")
const schedulemodel= require("../models/scheduleModel")
const verifie_token= require("../validators/verifyToken")
const mongodb=require("mongodb");


router.post('/',verifie_token,async (req,res)=>{
    if (req.tokendata.UserType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    var starttime=addMinutes(new Date(req.body.startdatetime),330);
    var endtime =addMinutes(starttime,(req.body.duration));
    console.log(endtime);
    const servicePackage= new schedulemodel({
        clientname:req.body.clientname,
        clientid:req.body.clientid,
        startdatetime:starttime,
        enddatetime:endtime,
        resource:req.body.resource,
        titel:req.body.servicedetails+" for "+req.body.clientname+"("+req.body.personcount+") at "+req.body.startdatetime,
        servicedetails:req.body.servicedetails,
        duration:req.body.duration,
        personcount:req.body.personcount,
        reschedulecount:0,

    })
    try{
        const newSchedule=await servicePackage.save()
        res.status(201).json(newSchedule._id)
    }
    catch(error){
        res.status(400).json({message:error.message})
    }
})

//get a service
router.get('/:id', getSchedule,(req,res)=>{
    res.send(res.schedule)
})

//get all services
router.get('/',async (req,res)=>{
    try{
        const allschedules=await schedulemodel.find()
        res.json(allschedules)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

//middleware
async function getSchedule(req,res,next){
    let schedule
    try{
        schedule=await memberships.findById(req.params.id)
        if(schedule==null){
            return res.status(404).json({message:"Branch unavailable!"})
        }

    }catch(error){
        res.status(500).json({message: error.message})
    }
    res.schedule=schedule
    next()
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}
module.exports=router