const mongoos=require("mongoose")

const clientmembershipsSchema= new mongoos.Schema({
    MembershipName:{
        type:String,
        required:true
    },
    Services:{
        type:Array,
        required:true
    },
    MembershipCost:{
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
    isunlimited:{
        type:Boolean,
        required:true
    },
    count:{
        type:Number,
        required:true
    },
    validity:{
        type:Number,
        required:true
    },
})

module.exports=mongoos.model('clientMembership',clientmembershipsSchema)