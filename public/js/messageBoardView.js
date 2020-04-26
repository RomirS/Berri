const socket = io();

var userData = document.getElementById('userData').value;
var tutorChatData = document.getElementById('tutorChatData').value;
var studentChatData = document.getElementById('studentChatData').value;
var personalTutorData = document.getElementById('personalTutorData').value;

function setParams(ud, tcd, scd, ptd) {
    userData = ud;
    tutorChatData = tcd;
    studentChatData = scd;
    personalTutorData = ptd;
}

var myTutors = [];
var myStudents = [];
var selectedRoom;
var chatData;
let CHATMSGS = $('.chatMessages');

//Outputs list of tutors under "Your Tutors"
myTutors = userData.myTutors;
let YT = $('#yourTutors');
if (myTutors.length > 0) {
    YT.css("display", "block");
    renderChats(myTutors, yourTutors, tutorChatData);
} else {
    YT.css("display", "none");
}

//Ouputs list of students under "Your Students"
if (userData.userType == "Registered Tutor") {
    myStudents = personalTutorData.myStudents;
    let YS = $('#yourStudents');
    if (myStudents.length > 0) {
        YS.css("display", "block");
        renderChats(myStudents, yourStudents, studentChatData);
    } else {
        YS.css("display", "none");
    }
}

var executed = false;
function renderChats(arrayObj, divElement, objChatData) {
    var loadTutor = false;
    if (divElement.id == "yourTutors") {
        loadTutor = true;
    }

    arrayObj.forEach(obj => {
        let CHAT = document.createElement("div");
        CHAT.classList.add("chat");
        CHAT.innerHTML = `<img src=${obj.prof_pic} class="circleCrop" alt="Profile Pic"><h5>${obj.first} ${obj.last}</h5> <p></p>`
        divElement.append(CHAT);

        if (loadTutor) {
            CHAT.id = `${obj.email}?${userData.email}`;
        } else {
            CHAT.id = `${userData.email}?${obj.email}`;
        }
        socket.emit('joinRoom', CHAT.id);

        CHAT.addEventListener("click", (e) => {
            if (selectedRoom != CHAT.id) {
            selectChat(obj, loadTutor, CHAT.id);
            }
        });
    });

    //Join default room
    if (!executed) {
        executed = true;
        if (loadTutor) {
            selectedRoom = `${arrayObj[0].email}?${userData.email}`;
        } else {
            selectedRoom = `${userData.email}?${arrayObj[0].email}`;
        }
        selectChat(arrayObj[0], loadTutor, selectedRoom);
    }
}

function selectChat(person, loadTutor, chatID) {
    $('#imgHeading').attr("src", person.prof_pic);
    $('#chatHeading').text(`${person.first} ${person.last} for ${person.subjectChosen}`);
    CHATMSGS.empty();
    let LASTRM = document.getElementById(`${selectedRoom}`);
    let NEWRM = document.getElementById(`${chatID}`);
    LASTRM.style.background = "white";
    LASTRM.addEventListener('mouseenter', (e) => {
        e.target.classList.add('chat_hover');
    });
    LASTRM.addEventListener('mouseleave', (e) => {
        e.target.classList.remove('chat_hover');
    });
    NEWRM.style.background = "rgba(253, 145, 145, 0.486)";
    NEWRM.style.fontWeight = "200";
    selectedRoom = chatID;

    //Load chat data for clicked room
    if (loadTutor) {
        chatData = tutorChatData.filter(chatObj => {
            return chatObj.tutor === person.email
        });
    } else {
        chatData = studentChatData.filter(chatObj => {
            return chatObj.student === person.email
        });
    }
    if (chatData[0].chats.length != 0) {
        chatData[0].chats.forEach(chatObj =>{
            let message = {
                chat: chatObj.chat,
                sender: chatObj.sender,
                prof_pic: chatObj.prof_pic,
                time: chatObj.time
            }
            outputMessage(message);
        });
    } else {
        chatData[0].chats = [];
    }

    let chatroom = {
        id: chatID,
        useremail: userData.email,
        prof_pic: userData.prof_pic
    }
    socket.emit('currentRoom', chatroom);
}

//Sends message to server when form is submitted
let CHATFORM = $('#chat-form')[0];
let MSG = $('#textmsg')[0];
MSG.addEventListener('input', (e) => {
    $('#send').css("display", "block");
});
CHATFORM.addEventListener('submit', (e) => {
    e.preventDefault();
    if (MSG.value != '') {
        socket.emit('chatMessage', MSG.value);
        MSG.value = '';
        $('#send').css("display", "none");
    }
})

//Handles message that has been sent to user
socket.on('message', message => {
    saveNewMessage(message);
    if (message.room == selectedRoom) {
        outputMessage(message);
    }
});

//outputs new message to front end
function outputMessage(message) {
    let MSGDIV = document.createElement('div');
    MSGDIV.classList.add('message');
    if (message.sender == userData.email) {
        MSGDIV.setAttribute('id', 'userMsg');
        MSGDIV.innerHTML = `<p class="text">${message.chat}</p> <p class="meta"><span>${message.time}</span></p>`;
    } else {
        MSGDIV.setAttribute('id', 'otherMsg');
        MSGDIV.innerHTML = `<img src=${message.prof_pic} id = "chatpic" class = "circleCrop" alt="Chat Profile Pic"><p class="text">${message.chat}</p> <p class="meta"><span>${message.time}</span></p>`;
    }
    CHATMSGS.append(MSGDIV);
    CHATMSGS[0].scrollTop = CHATMSGS[0].scrollHeight;
}

//saves message to browser side data
function saveNewMessage(message) {
    var msg = {
        chat: message.chat,
        sender: message.sender,
        prof_pic: message.prof_pic,
        time: message.time
    }
    //whenever user messages or person in the same room as user messages, this happens
    if (message.room == selectedRoom) {
        chatData[0].chats.push(msg);
    } else {
        document.getElementById(`${message.room}`).style.fontWeight = "600";
        let senderType = findSenderType(message.room, message.sender);
        var bgChatData;
        //finds reference to user's browser data for the specific chat that has been messaged
        if (senderType == 'tutor') {
            bgChatData = tutorChatData.filter(obj => {
            return obj.tutor === message.sender
            });
        } else {
            bgChatData = studentChatData.filter(obj => {
            return obj.student === message.sender
            });
        }
        if (bgChatData.length == 0) {
            console.log('Could not find chat reference');
        } else {
            bgChatData[0].chats.push(msg);
        }
    }
}

function findSenderType(roomID, sender) {
    if (roomID.indexOf('?') > roomID.indexOf(sender)) {
        return 'tutor'
    } else {
        return 'student'
    }
}