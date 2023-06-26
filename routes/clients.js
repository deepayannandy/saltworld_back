const express = require("express")
const router= express.Router()
const clientModel=require("../models/clientModel")
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


router.patch('/:id',verifie_token, getClient,async(req,res)=>{
    console.log(req.tokendata.UserType);
    if (req.tokendata.UserType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    if(req.body.FirstName!=null){
        res.client.FirstName=req.body.FirstName;
    }
    if(req.body.LastName!=null){
        res.client.LastName=req.body.LastName;
    }
    if(req.body.Email!=null){
        res.client.Email=req.body.Email;
    }
    if(req.body.MobileNumber!=null){
        res.client.MobileNumber=req.body.MobileNumber;
    }
    if(req.body.Gender!=null){
        res.client.Gender=req.body.Gender;
    }
    if(req.body.DateofBirth!=null){
        res.client.DateofBirth=req.body.DateofBirth;
    }
    if(req.body.Anniversary!=null){
        res.client.Anniversary=req.body.Anniversary;
    }
    if(req.body.Occupation!=null){
        res.client.Occupation=req.body.Occupation;
    }
    if(req.body.ClientSource!=null){
        res.client.ClientSource=req.body.ClientSource;
    }
    if(req.body.PAN!=null){
        res.client.PAN=req.body.PAN;
    }
    if(req.body.GST!=null){
        res.client.GST=req.body.GST;
    }
    if(req.body.CompanyLegalName!=null){
        res.client.CompanyLegalName=req.body.CompanyLegalName;
    }
    if(req.body.CompanyTradeName!=null){
        res.client.CompanyTradeName=req.body.CompanyTradeName;
    }
    if(req.body.ParentBranchId!=null){
        res.client.ParentBranchId=req.body.ParentBranchId;
    }
    if(req.body.BillingAddress!=null){
        res.client.BillingAddress=req.body.BillingAddress;
    }
    if(req.body.ShippingAddress!=null){
        res.client.ShippingAddress=req.body.ShippingAddress;
    }
    try{
        const newclient=await res.client.save()
        res.status(201).json({"_id":newclient.id})
    }catch(error){
        res.status(500).json({message: error.message})
    }
})
//get a clients
router.get('/:id', getClient,(req,res)=>{
    res.send(res.client)
})

router.delete("/:id",async (req,res)=>{
    console.log(req.params.id)
    clientdata=await clientModel.findById(req.params.id)
        if(clientdata==null){
            return res.status(404).json({message:"Client Data unavailable!"})
        }

    try{
        const reasult= await clientModel.deleteOne({_id: new mongodb.ObjectId(req.params.id)})
        res.json(reasult)
    }catch(error){
        res.status(500).json({message: error.message})
    }
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
