import { Schema, model } from "mongoose"

const testSchema= new Schema({
    dataArray:{
        type:Array,
        required:false
    },
    dataString:{
        type:String,
        required:false
    },
    timeStamp:{
        type:String,
        required:true
    },
})

export default model('TestData', testSchema);