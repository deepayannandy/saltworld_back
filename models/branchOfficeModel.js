import { Schema, model } from "mongoose"

const branchSchema= new Schema({
    BranchName:{
        type:String,
        required:true
    },
    BranchDetails:{
        type:String,
        required:true
    },
    BranchAddress:{
        type:String,
        required:true
    },
    LegalName:{
        type:String,
        required:true
    },
    GST:{
        type:String,
        required:true
    },
    Mobile:{
        type:String,
        required:true
    },
    active:{
        type:Boolean,
        required:true
    },
})

export default model('Branch', branchSchema);