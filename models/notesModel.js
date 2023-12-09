const mongoos=require("mongoose")

const clientNotesSchema= new mongoos.Schema({
    clientid:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    note:{
        type:String,
        required:false
    },
    date:{
        type:Date,
        required:true
    },
})

module.exports=mongoos.model('ClientNotes',clientNotesSchema)