const express = require("express")
const router= express.Router()
const usermodel=require("../models/userModel")
const validator= require("../validators/validation")
const bcrypt = require("bcryptjs")
const jwt= require("jsonwebtoken")
const nodemailer = require('nodemailer');
const mongodb=require("mongodb");
require("dotenv").config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'appsdny@gmail.com',
    pass: process.env.MAILER_PASS,
  },
  port:465,
  host:"smtp.gmail.com"
});

const verifie_token= require("../validators/verifyToken")

//login user
router.post('/login',async (req,res)=>{
    //validate the data
    const valid=validator.login_validation(req.body);
    if(valid.error){
        return res.status(400).send({"message":valid.error.details[0].message});
    };
    const user=await usermodel.findOne({email:req.body.email});
    if(!user) return res.status(400).send({"message":"User dose not exist!"});

    // validate password
    const validPass=await bcrypt.compare(req.body.password,user.password);
    if(!validPass) return res.status(400).send({"message":"Emailid or password is invalid!"});
    if (!user.UserStatus) return res.status(400).send({"message":"User is not an active user!"});

    //create and assign token
    const token= jwt.sign({_id:user._id,UserType:user.UserType},process.env.SECREAT_TOKEN);
    res.header('auth-token',token).send(token);
})
//create user
router.post('/register',async (req,res)=>{
    let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    //validate the data
    const valid=validator.resistration_validation(req.body);
    if(valid.error){
        return res.status(400).send(valid.error.details[0].message);
    }
    const email_exist=await usermodel.findOne({email:req.body.email});
    if(email_exist) return res.status(400).send({"message":"Email already exist!"});

    //hash the password
    const salt= await bcrypt.genSalt(10);
    const hashedpassword= await bcrypt.hash(req.body.password,salt);
    
    const datenow=year + "-" + ("0" + month).slice(-2) + "-" + ("0" + date).slice(-2);
    console.log(datenow);
    console.log(req.body.nickname);
    const user= new usermodel({
        FirstName:req.body.FirstName,
        LastName:req.body.LastName,
        mobile:req.body.mobile,
        email:req.body.email,
        UserType:req.body.UserType,
        UserBranch:req.body.UserBranch,
        UserStatus:true, 
        password:hashedpassword,
        Status:"Pending",
        StatusBg:"#FEC90F",
        onBoardingDate:datenow,
    })
    try{
        const newUser=await user.save()
        var regestereduserMail = {
            from: 'appsdny@gmail.com',
            to: req.body.email,
            subject: 'Welcome to Salt World',
            text: `Hi ${req.body.FirstName},
    Congratulations on your successful registration at Salt World. User these Credentials to login to our system.
          
    Your login id: ${req.body.email}
    Password: ${req.body.password}
          
    * Do Not Share this mail *
          
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
        
        res.status(201).json({"_id":newUser.id})
        
    }
    catch(error){
        res.status(400).json({message:error.message})
    }
})


//get a user
router.get('/:id' ,getUser, (req,res,)=>{

    res.send(res.user)
})
// get my data
router.get("/mydata/me",verifie_token,async (req,res)=>{
    console.log(req.tokendata._id)
    const user=await usermodel.findOne({_id:req.tokendata._id});
    if(!user) return res.status(400).send({"message":"User dose not exist!"});
    res.send(user)

})

//get all user
router.get('/',verifie_token,async (req,res)=>{
    const user=await usermodel.findOne({_id:req.tokendata._id});
    if(!user) return res.status(400).send({"message":"User dose not exist!"});
    if(!user.UserBranch) return res.status(400).send({"message":"No Employee branch found"});
    console.log(user.UserBranch)
    try{
        const users=await usermodel.find({UserBranch:user.UserBranch});
        res.json(users)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/getall/get',async (req,res)=>{
    try{
        const users=await usermodel.find();
        res.json(users)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})


//update user
router.patch('/:id',verifie_token, getUser,async(req,res)=>{
    console.log(req.tokendata.UserType);
    if (req.tokendata.UserType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    if(req.body.FirstName!=null){
        res.user.FirstName=req.body.FirstName;
    }
    if(req.body.LastName!=null){
        res.user.LastName=req.body.LastName;
    }
    if(req.body.email!=null){
        res.user.email=req.body.email;
    }
    if(req.body.mobile!=null){
        res.user.mobile=req.body.mobile;
    }
    if(req.body.UserStatus!=null){
        res.user.UserStatus=req.body.UserStatus;
    }
    if(req.body.UserType!=null){
        
        res.user.UserType=req.body.UserType;
    }
    try{
        const newUser=await res.user.save()
        res.status(201).json({"_id":newUser.id})
    }catch(error){
        res.status(500).json({message: error.message})
    }
})


router.delete("/:id",async (req,res)=>{
    console.log(req.params.id)
    user=await usermodel.findById(req.params.id)
        if(user==null){
            return res.status(404).json({message:"User unavailable!"})
        }


    try{
        const reasult= await usermodel.deleteOne({_id: new mongodb.ObjectId(req.params.id)})
        res.json(reasult)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

//middleware
async function getUser(req,res,next){
    let user
    try{
        user=await usermodel.findById(req.params.id)
        if(user==null){
            return res.status(404).json({message:"User unavailable!"})
        }

    }catch(error){
        res.status(500).json({message: error.message})
    }
    res.user=user
    next()
}
module.exports=router