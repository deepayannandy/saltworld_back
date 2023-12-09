const express = require("express")
const router= express.Router()
const clientNotesModel= require("../models/notesModel")
const verifie_token= require("../validators/verifyToken")

//add services
router.post('/',verifie_token,async (req,res)=>{
    if (req.tokendata.UserType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    var time=new Date(req.body.date);
    const notes= new clientNotesModel({
        clientid:req.body.clientid,
        author:req.tokendata._id,
        note:req.body.note,
        date:time,
    })
    try{
        const newnotes=await notes.save()
        res.status(201).json(newnotes._id)
    }
    catch(error){
        res.status(400).json({message:error.message})
    }
})
router.get('/:clientid',verifie_token,async(req,res)=>{
    if (req.tokendata.UserType!="Admin") return res.status(500).json({message:"Access Pohibited!"})
    try{
        const clientNotes=await clientNotesModel.find({clientid:req.params.clientid})
        res.json(clientNotes)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})
module.exports=router