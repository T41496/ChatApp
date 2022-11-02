//Import models
const shortID = require("shortid");

//Import models
const Room = require("../models/Room");
const User = require("../models/User");

exports.getIndex = (req, res) => {
    res.render("index");
}

exports.getJoinRoom = (req, res) => {
    res.render("join-room", {
        pageTitle: "Join Room- Sandes",
        hasError: false,
        errorMessages: req.flash("error-message")
    })
}


exports.getCreateRoom = (req, res) => {
    res.render("create-room", {
        pageTitle: "Create Room-Sandes",
        hasResult: false
    })
}

exports.postCreateRoom = (req, res) => {
    const body = JSON.parse(JSON.stringify(req.body));
    let uniqueID = shortID.generate();
    const room = new Room({
        name: body.roomName,
        ID: uniqueID,
        createdBy: req.session.user._id,
        activeUsers: []
    });
    room.save().then(() => {
        res.render("create-room", {
            pageTitle: "Create Room-Sandes",
            hasResult: true,
            ID: uniqueID
        })

    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        throw error;
    })
}

exports.postJoinRoom = (req, res) => {
    const body = JSON.parse(JSON.stringify(req.body));
    Room.findOne({ ID: body.roomID }).then(room => {
        if (room) {
            let icon;
            icon = `${req.session.user.firstName[0]}${req.session.user.lastName[0]}`;

            User.findOne({ _id: req.session.user._id }).then(user => {

                //Check user is in already another room or not
                if (!user.isInRoom) {
                    req.session.user = { ...req.session.user, room: room };
                    res.render("room", {
                        pageTitle: "Room-Sandes",
                        user: { ...req.session.user, icon },
                        room: room
                    })
                } else {
                    res.status(422).render("join-room", {
                        pageTitle: "Join Room-Sandes",
                        hasError: true,
                        oldValue: body,
                        errorMessages: ["You are already in other room"]

                    })

                }

            }).catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                throw error;

            })



        } else {
            res.status(422).render("join-room", {
                pageTitle: "Join Room-Sandes",
                hasError: true,
                oldValue: body,
                errorMessages: ["Invalid room ID"]

            })
        }


    }).catch(err => {
        const error=new Error(err);
        error.httpStatusCode=500;
        throw error;

    })
}



exports.postLeaveRoom = (req, res) => {
    //On redirect "disconnect" event generated which handles leave room functionality
    res.redirect("/");
}

exports.getDeleteRoom = (req, res) => {
    Room.find({ createdBy: req.session.user._id }).then(rooms => {
        res.render("delete-room", {
            pageTitle: "Delete Room -Sandes",
            errorMessages: [],
            rooms: rooms
        })

    }).catch(err => {
        const error=new Error(err);
        error.httpStatusCode=500;
        throw error;

    })

}

exports.postDeleteRoom = (req, res) => {
    const body = JSON.parse(JSON.stringify(req.body));
    Room.deleteOne({ _id: body.roomID.trim() }).then(() => {
        res.redirect("/delete-room");

    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        throw error;
    })
}