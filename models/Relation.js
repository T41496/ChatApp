//Import models
const mongoose=require("mongoose");

//Define Schema
const relationSchema=mongoose.Schema({
    socketID:{
        type:String,
        required:true
    },
    roomID:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Room"
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
        
    },
    joinedTime:{
        type:Date,
        default:Date.now
    }
})

//Export schema
module.exports=mongoose.model("Relation",relationSchema);