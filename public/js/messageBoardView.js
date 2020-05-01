const socket = io();

var userData = document.getElementById('userData').value;
var tutorChatData = document.getElementById('tutorChatData').value;
var studentChatData = document.getElementById('studentChatData').value;

var myStudents = [];
var selectedRoom;
let CHATMSGS = $('.chatMessages');
let imgsrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAC0CAYAAAAuPxHvAAAAAXNSR0IArs4c6QAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAA8VJREFUeAHt0IEAAAAAw6D5Ux/khVBhwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAy8DA0yhAAG/dsitAAAAAElFTkSuQmCC';

//Outputs list of tutors under "Your Tutors"
let YT = $('#yourTutors');
if (tutorChatData.length > 0) {
    YT.css("display", "block");
    renderChats(tutorChatData, YT);
} else {
    YT.css("display", "none");
}

//Ouputs list of students under "Your Students"
if (userData.userType == "Registered Tutor") {
    let YS = $('#yourStudents');
    if (studentChatData.length > 0) {
        YS.css("display", "block");
        renderChats(studentChatData, YS);
    } else {
        YS.css("display", "none");
    }
}

var executed = false;
var chatData;

function renderChats(arrayObj, divElement) {
    var loadTutor = false;
    if (divElement.attr('id') == 'yourTutors') {
        loadTutor = true;
    }
    //Load chats
    arrayObj.forEach(obj => {
        let CHAT = document.createElement("div");
        CHAT.classList.add("chat");
        CHAT.innerHTML = `<img src=${imgsrc} class="circleCrop" alt="Profile Pic"><h5>${obj.other.first} ${obj.other.last}</h5> <p></p>`;
        CHAT.id = obj.id;
        let chatArray = obj.chats;
        if (chatArray.length > 0) {
            if (chatArray[chatArray.length - 1].status == 'unread' && chatArray[chatArray.length - 1].sender != userData.email) {
                CHAT.style.fontWeight = "800";
            } else {
                CHAT.style.fontWeight = "200";
            }
        }
        divElement.append(CHAT);
        socket.emit('joinRoom', CHAT.id);
        CHAT.addEventListener("click", () => {
            if (selectedRoom != CHAT.id) {
                selectChat(obj, CHAT.id);
            }
        });
    });
    //Join default room
    if (!executed) {
        executed = true;
        if (loadTutor) {
            selectedRoom = `${arrayObj[0].tutor}?${userData.email}`;
        } else {
            selectedRoom = `${userData.email}?${arrayObj[0].student}`;
        }
        selectChat(arrayObj[0], selectedRoom);
    }
}

var currentRef;
var chatRef;
function selectChat(obj, chatID) {
    $('#imgHeading').attr("src", imgsrc);
    $('#chatHeading').text(`${obj.other.first} ${obj.other.last} for ${obj.subject}`);
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
    currentRef = obj;
    chatRef = obj.chats;
    if (chatRef.length != 0) {
        for (let i = 0; i < chatRef.length; i++) {
            var toggleStyle = false;
            if (i == chatRef.length - 1) toggleStyle = true; 
            else if (chatRef[i + 1].sender != chatRef[i].sender) toggleStyle = true;
            outputMessage(chatRef[i], toggleStyle);
        }
    } else {
        chatRef = [];
    }

    let chatroom = {
        id: chatID,
        useremail: userData.email
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
});

socket.on('check', message => {
    if (message.sender != userData.email && message.room == selectedRoom) {
        console.log('here!');
        socket.emit('changeStatus', message);
    }
});

//Handles message that has been sent to user
socket.on('message', message => {
    saveNewMessage(message);
    if (message.sender != userData.email && message.room == selectedRoom) {
        socket.emit('changeStatus', message);
    }
});

//outputs new message to front end
function outputMessage(message, toggleStyle) {
    let MSGDIV = document.createElement('div');
    MSGDIV.classList.add('message');
    if (message.sender == userData.email) {
        MSGDIV.classList.add('userMsg');
        if (toggleStyle) {
            MSGDIV.innerHTML = `<p class="text">${message.chat}</p> <span>${message.time}</span>`;
        } else {
            MSGDIV.innerHTML = `<p class="text">${message.chat}</p> <span></span>`;
        }
    } else {
        MSGDIV.classList.add('otherMsg');
        if (toggleStyle) {
            MSGDIV.innerHTML = `<img src=${imgsrc} id = "chatpic" class = "circleCrop" alt="Chat Profile Pic"><p class="text">${message.chat}</p> <span>${message.time}</span>`;
        } else {
            MSGDIV.innerHTML = `<img src=${imgsrc} id = "chatpic" class = "circleCrop" alt=""><p class="text">${message.chat}</p> <span></span>`;
        }
    }
    CHATMSGS.append(MSGDIV);
    CHATMSGS[0].scrollTop = CHATMSGS[0].scrollHeight;
}

//saves message to browser side data
function saveNewMessage(message) {
    var msg = {
            chat: message.chat,
            sender: message.sender,
            time: message.time,
            status: message.status
        }
        //whenever user messages or person in the same room as user messages, this happens
    if (message.room == selectedRoom) {
        chatRef.push(msg);
        outputMessage(message, true);
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