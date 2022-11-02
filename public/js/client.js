//Instantiate Socket
const socket=io();

//Grab elements from the DOM
const sendButton=document.getElementById("send-btn");
const message=document.getElementById("message");
const messageSection=document.querySelector(".message-section");
const usersList=document.getElementById("users-list");

//Current user data
let currentUser;

//Fetch active user details
fetch("http://localhost:3000/details").then((data)=>{
    return data.json();
    
}).then(data=>{
    currentUser=data;

    //Join Room
    socket.emit("joinRoom",currentUser);
    
    
    //Define grabChat Method
     const grabChat=()=>{
    
   //Message from the DOM
    let msg=message.value;
    if(msg.length>0){
        //Emit message to the server
        socket.emit("chatMessage",msg);
        //Clear meg and focus
        message.value="";
        message.focus();

    }


}


// Grab chat from the DOM
sendButton.addEventListener("click",grabChat);
message.addEventListener("keyup",(e)=>{
    if(e.key==="Enter"){
        grabChat();
    }
})

//Listen events or fire events

//For message
socket.on("message",(data)=>{
    outputMessage(data);
    //Scroll Down
    messageSection.scrollTop=messageSection.scrollHeight;

})

//Listening events for user status
socket.on("user-status",msg=>{
    outputStatus(msg);

    //Scroll Down
    messageSection.scrollTop=messageSection.scrollHeight;
})

//Function to display status
const outputStatus=msg=>{
    const p=document.createElement("p");
    p.classList.add("user-status");
    p.innerText=`${msg.message}`;
    messageSection.appendChild(p);
}

//Function to display message in DOM
const outputMessage=(data)=>{
    const div=document.createElement("div");
    let className=data.id===currentUser._id ? "outgoing" : "incoming";
    //Check message is either incoming or outgoing and set appropriate class here
    div.classList=`message-container ${className}`;
    div.innerHTML=`
                            <div class="message">
                                <div class="icon">
                                    <p>${data.icon}</p>
                                </div>
                                <div class="meta-data">
                                    <p class="sender-name">${data.user}</p>
                                    <p class="send-date">${data.time}</p>
                                </div>
                                <p class="msg">${data.message}</p>
                            </div>
    `;
    messageSection.appendChild(div);

}

}).catch(err=>{
    console.log(err);
})


//Listen "room-users" event
socket.on("room-users",(users)=>{
    displayUsers(users);
});

//Method to display users in DOM
const displayUsers=(users)=>{
    let html="";
    users.forEach(element=>{
        html+=`
        <div class="user">
                                <div class="icon">
                                    <p>${element.firstName[0]}${element.lastName[0]}</p>
                                </div>
                                <div class="user-details">
                                    <h3>${element.firstName} ${element.lastName}</h3>
                                    <p>${element.email}</p>
                                </div>
                                <p class="joined-time">${element.joinedTime}</p>
                            </div>
        `

    })
    usersList.innerHTML=html;
}