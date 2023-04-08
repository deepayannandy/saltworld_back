const express = require("express")
const router= express.Router()
const clientModel=require("../models/clientModel")
const verifie_token= require("../validators/verifyToken")
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'appsdny@gmail.com',
      pass: process.env.MAILER_PASS,
    },
    port:465,
    host:"smtp.gmail.com"
  });


//create clients
router.post('/',verifie_token,async (req,res)=>{
    if (req.tokendata.UserType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    const brachOffice= new clientModel({
        FirstName:req.body.FirstName,
        LastName:req.body.LastName,
        MobileNumber:req.body.MobileNumber,
        Email:req.body.Email,
        Gender:req.body.Gender,
        DateofBirth:req.body.DateofBirth,
        Anniversary:req.body.Anniversary,
        Occupation:req.body.Occupation,
        ClientSource:req.body.ClientSource,
        ClientType:req.body.ClientType,
        PAN:req.body.PAN,
        GST:req.body.GST,
        CompanyLegalName:req.body.CompanyLegalName,
        CompanyTradeName:req.body.CompanyTradeName,
        BillingAddress:req.body.BillingAddress,
        ShippingAddress:req.body.ShippingAddress,
        EmailNotification:true,
        EmailMarketingNotification:true,
        ParentBranchId:req.body.ParentBranchId,
    })
    try{
        const newBranch=await brachOffice.save()
        var regestereduserMail = {
            from: 'appsdny@gmail.com',
            to: req.body.Email,
            subject: `👋 Welcome to Salt World Family ${req.body.FirstName}`,
            text: `Hi ${req.body.FirstName},
Welcome to SaltWorld Family. Thank you for choosing us! 

Know More about our services visit: https://saltworld.in/
Contact Details:  +91 76878 78793
Visit us at: https://g.co/kgs/DwpfsY

Thank you 
Team Salt World`      
          };
          transporter.sendMail(regestereduserMail, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        res.status(201).json(newBranch._id)
    }
    catch(error){
        res.status(400).json({message:error.message})
    }
})

//get a clients
router.get('/:id', getClient,(req,res)=>{
    res.send(res.client)
})



//get all clients
router.get('/',async (req,res)=>{
    try{
        const clients=await clientModel.find()
        res.json(clients)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

//middleware
async function getClient(req,res,next){
    let client
    try{
        client=await clientModel.findById(req.params.id)
        if(client==null){
            return res.status(404).json({message:"Client unavailable!"})
        }

    }catch(error){
        res.status(500).json({message: error.message})
    }
    res.client=client
    next()
}
module.exports=router
