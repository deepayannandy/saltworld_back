import { Schema, model } from "mongoose"

const servicePackagesSchema= new Schema({
    PackageName:{
        type:String,
        required:true
    },
    PackageDescription:{
        type:String,
        required:true
    },
    ServicesId:{
        type:Array,
        required:true
    },
    ServiceCost:{
        type:Number,
        required:true
    },
    SellingCost:{
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
    Branch:{
        type:String,
        required:true
    },
})

export default model('ServicePackages', servicePackagesSchema);