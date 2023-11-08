const mongoos=require("mongoose")

const userSchema= new mongoos.Schema({
    FirstName:{
        type:String,
        required:true
    },
    LastName:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    UserType:{
        type:String,
        required:true
    },
    UserBranch:{
        type:String,
        required:true
    },
    UserStatus:{
        type:Boolean,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    onBoardingDate:{
        type:String,
        required:false
    },
    Status:{
        type:String,
        required:false
    },
    StatusBg:{
        type:String,
        required:false
    },
})

module.exports=mongoos.model('User',userSchema )