const { object } = require("joi")
const mongoos=require("mongoose")

const clientmembershipsSchema= new mongoos.Schema({
    clientid:
    {
        type:String,
        required:true
    },
    MembershipName:{
        type:String,
        required:true
    },
    Services:{
        type:Object,
        required:true
    },
    paidAmount:{
        type:Number,
        required:true
    },
    Taxrate:{
        type:Number,
        required:true
    },
    HsnCode:{
        type:String,
        required:true
    },
    active:{
        type:Boolean,
        required:true
    },
    count:{
        type:Number,
        required:true
    },
    countleft:{
        type:Number,
        required:true
    },
    StartDate:{
        type:Date,
        required:true
    },
    EndDate:{
        type:Date,
        required:true
    },
})

module.exports=mongoos.model('clientMembership',clientmembershipsSchema)