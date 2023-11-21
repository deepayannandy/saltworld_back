const express = require("express")
const router= express.Router()
const clientmodel= require("../models/clientModel")
const schedulemodel= require("../models/scheduleModel")
const verifie_token= require("../validators/verifyToken")
const nodemailer = require('nodemailer');
const mongodb=require("mongodb");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'appsdny@gmail.com',
      pass: process.env.MAILER_PASS,
    },
    port:465,
    host:"smtp.gmail.com"
  });

process.env.TZ = "Asia/Calcutta";

router.post('/',verifie_token,async (req,res)=>{
    if (req.tokendata.UserType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    var starttime=new Date(req.body.startdatetime);
    var endtime =addMinutes(starttime,(req.body.Duration));
    console.log(endtime);
    const servicePackage= new schedulemodel({
        clientname:req.body.clientname,
        clientid:req.body.Client,
        startdatetime:starttime,
        enddatetime:endtime,
        resource:req.body.resource,
        title:req.body.SelectedService+" for "+req.body.clientname+"("+req.body.personcount+") at "+req.body.startdatetime,
        servicedetails:req.body.SelectedService,
        duration:req.body.Duration,
        personcount:req.body.personcount,
        reschedulecount:0,
        location:req.body.location,

    })
    try{
        const newSchedule=await servicePackage.save()
        const clientdata= await clientmodel.findById(req.body.Client)
        var regestereduserMail = {
            from: 'appsdny@gmail.com',
            to: clientdata.Email,
            subject: `🤗  Hi  ${req.body.clientname}, your appointment is confirmed!`,
            text: `Booking ref: ${newSchedule._id}
${starttime} with Salt World
            
Appointment details
${req.body.SelectedService}
            
Location
Salt World
Site #1, 2nd Floor, Sri Chakra building, 18th Main, HSR Layout Sec 3, Behind Saibaba temple, Bengaluru (HSR Layout), 560102, Karnataka, IN
GPS: http://tinyurl.com/saltworld
            
Cancellation / Reschedule policy
    1. Reschedule is allowed 48 hours prior to the scheduled session, however under circumstances like high fever, monthly period cycle or any other health complications reschedule is still permitted before 3 hours of the scheduled session.
    2. If the reschedule request is NOT received within the above-mentioned window, then it will be considered as session availed.
    3. In case of cancellation due to unavoidable situations, if we receive the cancellation request before 3 hours of the scheduled session, we will provide the credit note, that can be availed within a year.
    4. If the scheduled session is canceled, it cannot be provided back on the weekend / public holiday. It can be availed only on the weekdays.
            
Important info
Please be available at the location 30 minutes prior to your appointment. Please know that delays in reaching the location will impact the duration of the session.
            
For any assistance dial / WhatsApp: +91 7687878793
            `      
          };
          transporter.sendMail(regestereduserMail, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        res.status(201).json(newSchedule._id)
    }
    catch(error){
        res.status(400).json({message:error.message})
    }
})

//get a Schedule
router.get('/:id', getSchedule,(req,res)=>{
    res.send(res.schedule)
})

//get a Schedule by Userid 
router.get('/byuser/:uid',async (req,res)=>{
  let schedule
    try{
        schedule=await schedulemodel.find({clientid:req.params.uid})
  }catch(e){
    res.statusCode(404).send({message:"Something went wrong"})
  }
  res.send(schedule)
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

//get all services
router.get('/existing/:time&:service&:duration',async (req,res)=>{
    console.log(req.params.service)
    let starttime=new Date(req.params.time)
    let endtime=addMinutes( starttime,req.params.duration)
    try{
        const allschedules=await schedulemodel.find({ 
            resource:req.params.service,
            startdatetime: { $gte: starttime, 
                    $lte: endtime
                  } 
            })
        res.json(allschedules)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get('/searchbydate/:starttime&:endtime&:branch',async (req,res)=>{
  console.log(req.params.starttime)
  console.log(req.params.endtime)
  console.log(req.params.branch)
  let starttime=new Date(req.params.starttime)
  let endtime= new Date(req.params.endtime)
  console.log(starttime+" "+endtime)
  try{
      const schedules= await schedulemodel.find({startdatetime :{$gte: starttime,$lte:endtime},location :req.params.branch })
      res.json(schedules)
  }catch(error){
      res.status(500).json({message: error.message})
  }
})


//reschedule 
router.patch('/:id',getSchedule ,async (req,res)=>{
    console.log(res.schedule)
    if(req.body.StartTime!=null){
        res.schedule.startdatetime=new Date(req.body.StartTime);
    }
    if(req.body.EndTime!=null){
        res.schedule.enddatetime=new Date(req.body.EndTime);
    }
    try{
        res.schedule.reschedulecount=res.schedule.reschedulecount+1
        res.schedule.title=res.schedule.servicedetails+" for "+res.schedule.clientname+"("+res.schedule.personcount+") at "+res.schedule.startdatetime;
        const newdata= await res.schedule.save()
        const clientdata= await clientmodel.findById(newdata.clientid)
        console.log(clientdata)
        var regestereduserMail = {
            from: 'appsdny@gmail.com',
            to: clientdata.Email,
            subject: `⌛ Hi ${newdata.clientname}, your appointment has been rescheduled!`,
            text: `Booking ref: ${newdata._id}
Your appointment with Salt World is now booked for ${newdata.startdatetime}
            
Appointment details
${newdata.servicedetails}
            
Location
Salt World
Site #1, 2nd Floor, Sri Chakra building, 18th Main, HSR Layout Sec 3, Behind Saibaba temple, Bengaluru (HSR Layout), 560102, Karnataka, IN
GPS: http://tinyurl.com/saltworld
            
Cancellation / Reschedule policy
 1. Reschedule is allowed 48 hours prior to the scheduled session, however under circumstances like high fever, monthly period cycle or any other health complications reschedule is still permitted before 3 hours of the scheduled session.
 2. If the reschedule request is NOT received within the above-mentioned window, then it will be considered as session availed.
 3. In case of cancellation due to unavoidable situations, if we receive the cancellation request before 3 hours of the scheduled session, we will provide the credit note, that can be availed within a year.
 4. If the scheduled session is canceled, it cannot be provided back on the weekend / public holiday. It can be availed only on the weekdays.

Important info
Please be available at the location 30 minutes prior to your appointment. Please know that delays in reaching the location will impact the duration of the session.

For any assistance dial / WhatsApp: +91 7687878793
            `      
          };
          transporter.sendMail(regestereduserMail, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        res.status(201).json(newdata._id)
    }catch(error){
        res.status(500).json({message: error.message})
    }

})
//delete schedule
router.delete("/:id",getSchedule,async (req,res)=>{
    try{
        console.log(req.params.id)
        const deldata= await schedulemodel.deleteOne({_id: new mongodb.ObjectId(req.params.id)})
        const newdata=res.schedule;
        const clientdata= await clientmodel.findById(newdata.clientid)
        console.log(newdata)
        var regestereduserMail = {
            from: 'appsdny@gmail.com',
            to: clientdata.Email,
            subject: `🥺 Hi ${newdata.clientname}, your appointment has been canceled`,
            text: `Booking ref: ${newdata._id}
Appointment was scheduled for ${newdata.startdatetime} with Salt World
            
Appointment details
${newdata.servicedetails}
            
Location
Salt World
Site #1, 2nd Floor, Sri Chakra building, 18th Main, HSR Layout Sec 3, Behind Saibaba temple, Bengaluru (HSR Layout), 560102, Karnataka, IN
GPS: http://tinyurl.com/saltworld
            
Cancellation / Reschedule policy
 1. Reschedule is allowed 48 hours prior to the scheduled session, however under circumstances like high fever, monthly period cycle or any other health complications reschedule is still permitted before 3 hours of the scheduled session.
 2. If the reschedule request is NOT received within the above-mentioned window, then it will be considered as session availed.
 3. In case of cancellation due to unavoidable situations, if we receive the cancellation request before 3 hours of the scheduled session, we will provide the credit note, that can be availed within a year.
 4. If the scheduled session is canceled, it cannot be provided back on the weekend / public holiday. It can be availed only on the weekdays.

Important info
Please be available at the location 30 minutes prior to your appointment. Please know that delays in reaching the location will impact the duration of the session.

For any assistance dial / WhatsApp: +91 7687878793
            `      
          };
          transporter.sendMail(regestereduserMail, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        res.status(201).json(newdata._id)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})
//middleware
async function getSchedule(req,res,next){
    let schedule
    try{
        schedule=await schedulemodel.findById(req.params.id)
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