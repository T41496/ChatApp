//Exports formatTime
const formatTime=require("./formatTime");

module.exports=(user,message)=>{
    return {
        user,
        message,
        time:formatTime(new Date)
    }
}
