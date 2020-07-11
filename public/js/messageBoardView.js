const socket = io(); 

var userData = document.getElementById('userData').value;
var tutorChatData = document.getElementById('tutorChatData').value;
var studentChatData = document.getElementById('studentChatData').value;

function compareTimes(a,b) {
    let time1 = new Date(a.chats[a.chats.length-1].time.slice(0,19));
    let time2 = new Date(b.chats[b.chats.length-1].time.slice(0,19));
    if (time1 > time2) return -1;
    else if (time1 < time2) return 1;
    else return 0;
}

tutorChatData.sort(compareTimes);
if (userData.userType == "Registered Tutor") studentChatData.sort(compareTimes);


var myStudents = [];
var selectedRoom;
let CHATMSGS = $('.chatMessages');
let imgsrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAC0CAYAAAAuPxHvAAAAAXNSR0IArs4c6QAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAA8VJREFUeAHt0IEAAAAAw6D5Ux/khVBhwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAy8DA0yhAAG/dsitAAAAAElFTkSuQmCC';

//Outputs list of tutors under "Your Tutors"
let YT = $('#yourTutors');
if (tutorChatData.length > 0) {
    YT.prev().css('display', 'block');
    renderChats(tutorChatData, YT);
}

//Ouputs list of students under "Your Students"
let YS = $('#yourStudents');
if (userData.userType == "Registered Tutor" && studentChatData.length > 0) {
    YS.prev().css('display', 'block');
    renderChats(studentChatData, YS);
}

var executed = false;

function renderChats(arrayObj, divElement) {
    //Load chats
    arrayObj.forEach(obj => {
        divElement.append(createChat(obj, arrayObj.indexOf(obj)));
        socket.emit('joinRoom', obj.id);
    });
    //Join default room
    if (!executed) {
        executed = true;
        if (divElement.attr('id') == 'yourTutors') {
            selectedRoom = `${arrayObj[0].tutor}?${userData.email}`;
        } else {
            selectedRoom = `${userData.email}?${arrayObj[0].student}`;
        }
        selectChat(arrayObj[0]);
    }
}

function createChat(obj, orderNum) {
    let CHAT = document.createElement("div");
    CHAT.style.order = orderNum;
    CHAT.classList.add("chat");
    let chatArray = obj.chats;
    CHAT.innerHTML = `<img src=${obj.other.profPic} class="circleCrop" alt="Profile Pic"><h5>${obj.other.first} ${obj.other.last}</h5> <p>${chatArray[chatArray.length - 1].chat}</p>`;
    CHAT.id = obj.id;
    let lastChat = chatArray[chatArray.length-1];
    if (lastChat.status == 'unread' && lastChat.sender != userData.email) {
        CHAT.style.fontWeight = "800";
        CHAT.getElementsByTagName('p')[0].style.fontWeight = "800";
    } else {
        CHAT.style.fontWeight = "200";
        CHAT.getElementsByTagName('p')[0].style.fontWeight = "200";
    }
    CHAT.addEventListener("click", () => {
        if (selectedRoom != CHAT.id) {
            selectChat(obj);
        }
    });
    return CHAT;
}

var currentRef;
var chatRef;
function selectChat(obj) {
    let chatID = obj.id;
    $('#imgHeading').attr("src", obj.other.profPic);
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
    NEWRM.getElementsByTagName('p')[0].style.fontWeight = "200";
    selectedRoom = chatID;

    //Load chat data for clicked room
    currentRef = obj;
    chatRef = obj.chats;
    if (chatRef.length > 1) {
        for (let i = 1; i < chatRef.length; i++) {
            outputMessage(chatRef[i], obj.other.profPic);
        }
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

//Handles message that has been sent to user
socket.on('message', message => {
    saveNewMessage(message);
    if (message.sender != userData.email && message.room == selectedRoom) {
        socket.emit('changeStatus', message);
    }
});

//saves message to browser side data
function saveNewMessage(message) {
    var msg = {
        chat: message.chat,
        sender: message.sender,
        time: message.time,
        status: message.status
    }
    let CHAT = document.getElementById(`${message.room}`);
    CHAT.getElementsByTagName('p')[0].innerHTML = message.chat;
    rearrangeChats(message);
    if (message.room == selectedRoom) {
        chatRef.push(msg);
        outputMessage(message, currentRef.other.profPic);
    } else {
        CHAT.style.fontWeight = "800";
        CHAT.getElementsByTagName('p')[0].style.fontWeight = "800";
        //finds reference to user's browser data for the specific chat that has been messaged
        let senderType = findSenderType(message);
        var bgChatData;
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

//outputs new message to front end
function outputMessage(message, pfp) {
    let MSGDIV = document.createElement('div');
    MSGDIV.classList.add('message');
    let millTime = message.time.substring(0, 20);
    let fixedTime = message.time.slice(20);
    if (message.sender == userData.email) {
        MSGDIV.classList.add('userMsg');
        MSGDIV.innerHTML = `<p class="text">${message.chat}</p> <span>${fixedTime}</span>`;
    } else {
        MSGDIV.classList.add('otherMsg');
        MSGDIV.innerHTML = `<img src=${pfp} id = "chatpic" class = "circleCrop" alt="Chat Profile Pic"><p class="text">${message.chat}</p> <span>${fixedTime}</span>`;
    }
    MSGDIV.setAttribute('time', millTime);
    toggleLastMessageStyle(message.sender, millTime);
    CHATMSGS.append(MSGDIV);
    CHATMSGS[0].scrollTop = CHATMSGS[0].scrollHeight;
}

function toggleLastMessageStyle(sender, time) {
    let LASTMSG = $('.chatMessages .message').last();
    let newTime = new Date(time);
    let prevTime = new Date(LASTMSG.attr('time'));
    let timeDiff = Math.floor( (newTime-prevTime)/60000 );
    if (LASTMSG.length > 0) {
        if (timeDiff < 5) {
            var CLASSLIST = LASTMSG.attr('class').split(/\s+/);
            if (CLASSLIST[1] == 'userMsg' && sender == userData.email) {
                LASTMSG.find('span')[0].innerText = '';
            } else if (CLASSLIST[1] == 'otherMsg' && sender != userData.email) {
                LASTMSG.find('span')[0].innerText = '';
                LASTMSG.find('img')[0].src = imgsrc;
            }
        } else {
            LASTMSG[0].lastChild.style.marginBottom = '15px';
        }
    }
}

function findSenderType(message) {
    if (message.room.indexOf('?') > message.room.indexOf(message.sender)) {
        return 'tutor'
    } else {
        return 'student'
    }
}

function findRoomType(message) {
    if (message.room.indexOf('?') > message.room.indexOf(userData.email)) {
        return 'tutor'
    } else {
        return 'student'
    }
}

function rearrangeChats(message) {
    let type = findRoomType(message);
    var chats;
    if (type == 'student') chats = document.getElementById("yourTutors").getElementsByTagName("div");
    else chats = document.getElementById("yourStudents").getElementsByTagName("div");
    for (let i = 0; i < chats.length; i++) {
        let divEl = chats[i]
        if (divEl.id == message.room) divEl.style.order = 0;
        else divEl.style.order = (parseInt(divEl.style.order) + 1);
    }
}

var isStarted;
var isInitiator = false;
var doNotDeny = true;
var signalTo;
var notifAlreadyReceived = false;
var denyReceived = false;

function sendMessage(message) {
    if (!message.to) message.to = signalTo;
    if (message.notif) message.sender = userData.first + ' ' + userData.last;
    socket.emit('broadcast', message);
}

socket.on('broadcastReceived', async message => {
    if (message.notif) {
        if (notifAlreadyReceived) return;
        notifAlreadyReceived = true;
        signalTo = message.to;
        createNotif(message);
    } else if (message.notifAccepted) {
        doNotDeny = true;
        removeRinger();
    } else if (message.notifDenied) {
        if (denyReceived) return;
        denyReceived = true;
        callIsDenied();
    } else if (message.callFinished) {
        if (!isStarted) return;
        isStarted = false;
        console.log('hungup!');
        isInitiator = false;
        startButton.disabled = false;
    }
});

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', startAction);
async function startAction() {
    isInitiator = true;
    startButton.disabled = true;
    doNotDeny = false;
    createRinger();
    setTimeout(callIsDenied, 10000);

    signalTo = currentRef.id;
    sendMessage({notif: true});

    transferData();
}

function transferData() {
    isStarted = true;
    let payload = {
        'isInitiator': isInitiator, 
        'signalTo': signalTo + '+call'
    }

    $.ajax({
        type: "POST",
        url: "readyVideo",
        data: payload,
        dataType: "json",
        success: function(data, textStatus) {
            window.open(data.url, 'popUpWindow','height=700,width=1000,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes');
        }
    });
}

function createRinger() {
  let RINGER = $(`<div class="notif" id="ringer"><p>Ringing...</p></div>`);
  $('body').append(RINGER);
}

function createNotif(offerMessage) {
    let NOTIF = $(`<div class="notif" id="callNotif"><p>${offerMessage.sender} would like to call...</p><div class="notifButtons"><button id="accept">Accept</button><button id="deny">Deny</button></div></div>`);
    $('body').append(NOTIF);

    $('#accept').click(async function() {
        removeNotif();
        sendMessage({notifAccepted: true});
        transferData();
    });
    $('#deny').click(denyCall);
    setTimeout(removeNotif, 10000);

    function denyCall() {
        signalTo = currentRef.id;
        removeNotif();
        sendMessage({notifDenied: true});
    }

    function removeNotif() {
        $('#callNotif').remove();
        notifAlreadyReceived = false;
    }
}

function callIsDenied() {
    if (doNotDeny) return;
    doNotDeny = true;
    removeRinger();
    sendMessage({'to': signalTo + '+call', 'denied': true});

    isInitiator = false;
    startButton.disabled = false;
}

function removeRinger() {
    $('#ringer').remove();
}