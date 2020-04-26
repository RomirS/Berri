const expressConfig = require("./expressConfig");
const app = expressConfig();
const http = require('http').createServer(app);

const io = require('socket.io')(http);
const db = require("../utils/firebaseConfig")();
let formatMessage = require("../helpers/message").formatMessage;

//Socketio
io.on('connection', socket => {
    var roomID;
    var useremail;
    var userpfp;
    //Joins each chat that user is a part of
    socket.on('joinRoom', newID => {
        socket.join(newID)
    });
    //Sets current room ID to access Firebase and when user sends message
    socket.on('currentRoom', chatroom => {
        roomID = chatroom.id;
        useremail = chatroom.useremail;
        userpfp = chatroom.prof_pic;

        socket.removeAllListeners('chatMessage');

        //Listens for chat message and adds message to Firebase
        let chatRef = db.collection('chatrooms').doc(`${roomID}`);

        chatRef.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document');
            } else {
                var cont = true;
                var myChats = doc.data().chats;
                var i = myChats.length - 1;
                while(i >= 0 && cont) {
                    if (myChats[i].sender != useremail) {
                        if (myChats[i].status == 'read') {
                            cont = false;
                        } else {
                            myChats[i].status = 'read';
                        }
                    }
                    i--;
                }
                chatRef.update({
                    chats: myChats
                });
            }
        }).catch((err) => {
            console.log(err)
        });

        socket.on('chatMessage', msg => {
            let message = formatMessage(roomID, `${useremail}`, userpfp, msg);
            chatRef.get()
                .then(doc => {
                    if (!doc.exists) {
                        console.log('No such document');
                    } else {
                        var myChats = doc.data().chats;
                        let newChat = {
                            chat: message.chat,
                            sender: message.sender,
                            prof_pic: message.prof_pic,
                            time: message.time,
                            status: message.status
                        }
                        myChats.push(newChat);
                        chatRef.update({
                            chats: myChats
                        });
                    }
                }).catch((err) => {
                    console.log(err)
                });
            io.to(roomID).emit('message', message);
        })
    });
    //Runs when user disconnects by leaving message board
    socket.on('disconnect', () => {
        console.log(`DISCONNECTED! from ${roomID}`)
    })
});

const PORT = process.env.PORT || 3000;
module.exports = function(){ http.listen(PORT, () => console.log(`Server running on port ${PORT}`)); };
