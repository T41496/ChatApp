//Import modules
const http=require("http");
const path=require("path");

const express=require("express");
const dotenv=require("dotenv");
const socket=require("socket.io");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const session=require("express-session");
const mongoDBStore=require("connect-mongodb-session")(session);
const flash=require("connect-flash");
const csrf=require("csurf");

//Import routers
const authRoutes=require("./routes/authRoutes");
const appRoutes=require("./routes/appRoutes");

//Import controllers
const errorController=require("./controllers/errController");

//Import format message
const formatMessage=require("./utils/formatMessage");
//Import user related utils
const user=require("./utils/user");
const Relation = require("./models/Relation");
const User = require("./models/User");


//Load config
dotenv.config({path:"./config/config.env"});

//Instantiate express app
const app=express();
//Instantiate csrf Protection
const csrfProtection=csrf();

//Create server
const server=http.createServer(app);

//Serve static files
app.use(express.static(path.join(__dirname,"public")));

//Set view engine
app.set("view engine","ejs");
app.set("views","views");

//Set Store Variable
const store=new mongoDBStore({
    uri:process.env.MONGODB_URI,
    collections:"Sessions"
})

//Set Session
app.use(session({
secret:"Gautam buddha was born in nepal",
resave:false,
saveUninitialized:false,
store:store,
}))

//Set body parser
app.use(bodyParser.urlencoded({extended:false}));

//Set flash
app.use(flash());

//Set csrfProtection
app.use(csrfProtection);

//Set local variables
app.use((req,res,next)=>{
    res.locals.csrfToken=req.csrfToken();
    next();
})

//Use routes
app.use(authRoutes);
app.use(appRoutes);
//Routes for 404 Page
app.use(errorController.get404);
//Default error handler
app.use((error,req,res,next)=>{
    if(!error.httpStatusCode)
        error.httpStatusCode=500;
        res.status(error.httpStatusCode).render("errors/500",{
            pageTitle:"Sever Error-Sandes"
        })
})

//Instantiate socket
const io=socket(server);

io.on("connection",(socket)=>{

    socket.on("joinRoom",currentUser=>{
    //Store information in database 
    user.joinUser(socket.id,currentUser).then(()=>{
        //Join user to room
        socket.join(currentUser.room.name);
        
        //Welcome current user
        //Generates user-status event on->Greet,new user join and remove
        socket.emit("user-status",formatMessage("Bot",`Hello ${currentUser.firstName},Welcome to ${currentUser.room.name}.`));
        
        //Broadcast message to all the user
        socket.broadcast.to(currentUser.room.name).emit("user-status",formatMessage("Bot",`${currentUser.firstName} joined the room.`));

        //emit event to display current room users
        user.fetchRoomUsers(currentUser.room._id).then((users)=>{
            io.to(currentUser.room.name).emit("room-users",users);
        });

    }).catch(err=>{
        const error=new Error(err);
        error.httpStatusCode=500;
        throw error;
    })
    })

    //Receive chat message from the client
    socket.on("chatMessage",async (message)=>{
        const currentUser=await user.fetchUser(socket.id);
        const currentRoom=await user.fetchRoom(socket.id);
        let icon=`${currentUser.firstName[0]}${currentUser.lastName[0]}`
        io.to(currentRoom.name).emit("message",{id:currentUser._id,...formatMessage(currentUser.firstName,message),icon});

    })

    //Broadcast message to the all user when user disconnect
    socket.on("disconnect",async()=>{
        const currentUser=await user.fetchUser(socket.id);
        const currentRoom=await user.fetchRoom(socket.id);
        user.disconnectRelation(socket.id).then(()=>{
            //emit event to display current room users
            User.updateOne({_id:currentUser._id},{$set:{isInRoom:false}}).then(async()=>{
                const users=await user.fetchRoomUsers(currentRoom._id);
                io.to(currentRoom.name).emit("user-status",formatMessage("User",`${currentUser.firstName} left the room.`));
                io.to(currentRoom.name).emit("room-users",users);

            })
            
        }).catch(err=>{
        const error=new Error(err);
        error.httpStatusCode=500;
        throw error;
        });
        
        
    })
})

mongoose.connect(process.env.MONGODB_URI,{
    useUnifiedTopology:true,
    useNewUrlParser:true,
    useCreateIndex:true
}).then(()=>{
    //Listen server
    server.listen(process.env.PORT || 5000);
}).catch(err=>{
    const error=new Error(err);
    error.httpStatusCode=500;
    throw error;

})


