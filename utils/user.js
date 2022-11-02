
//Import Models
const Relation = require("../models/Relation");
const User = require("../models/User");
const Room=require("../models/Room");

//Import formatAMPM Method
const formatTime=require("./formatTime");

//Join user
exports.joinUser = (socketID, currentUser) => {
    const relation = new Relation({
        socketID: socketID,
        roomID: currentUser.room._id,
        userID: currentUser._id
    })
    //Save relation in database
    return relation.save().then(()=>{
        User.findOne({ _id: currentUser._id }).then(data => {
            data.isInRoom = true;
            return data.save();
        })
        
    }).catch(err=>{
        const error=new Error(err);
        error.httpStatusCode=500;
        throw error;
    })
}

//Disconnect user
//1.Remove relation
//2.Set user isInRoom status false
exports.disconnectRelation = (socketID) => {
    return Relation.deleteOne({socketID:socketID}).exec();
}


exports.fetchUser=(socketID)=>{
    return Relation.findOne({socketID:socketID}).then(relation=>{
        return User.findById({_id:relation.userID}).exec();
    }).catch(err=>{
        const error=new Error(err);
        error.httpStatusCode=500;
        throw error;

    })
}

exports.fetchRoom=(socketID)=>{
    return Relation.findOne({socketID:socketID}).then(relation=>{
        return Room.findById({_id:relation.roomID}).exec();
    }).catch(err=>{
        const error=new Error(err);
        error.httpStatusCode=500;
        throw error;
    })
}

exports.fetchRoomUsers=roomID=>{
    return Relation.find({roomID:roomID}).populate('userID').then(users=>{
        roomUsers=users.map(i=>{return {...i.userID._doc,joinedTime:formatTime(i.joinedTime)}});
        return roomUsers;
    })
}
