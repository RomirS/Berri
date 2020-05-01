const expressConfig = require("./expressConfig");
const app = expressConfig();
const http = require('http').createServer(app);

const io = require('socket.io')(http);
const db = require("../utils/firebaseConfig")();
let formatMessage = require("../helpers/message").formatMessage;

//Socketio
io.on('connection', socket => {
    var roomID;
    //Joins each chat that user is a part of
    socket.on('joinRoom', newID => {
        socket.join(newID)
    });
    //Sets current room ID to access Firebase and when user sends message
    socket.on('currentRoom', chatroom => {
        roomID = chatroom.id;
        let useremail = chatroom.useremail;

        socket.removeAllListeners('chatMessage');

        //Listens for chat message and adds message to Firebase
        let chatRef = db.collection('chatrooms').doc(`${roomID}`);

        chatRef.get().then(doc => {
            var cont = true;
            var myChats = doc.data().chats;
            var i = myChats.length - 1;
            while (i >= 0 && cont) {
                let chat = myChats[i];
                if (chat.sender != useremail) {
                    if (chat.status == 'read') {
                        cont = false;
                    } else {
                        chat.status = 'read';
                    }
                }
                i--;
            }
            chatRef.update ({
                chats: myChats
            });
        }).catch((err) => {
            console.log(err)
        });

        socket.on('chatMessage', async msg => {
            let message = formatMessage(roomID, useremail, msg);
            const doc = await db.collection('chatrooms').doc(`${roomID}`).get()
            if (!doc.exists) {
                console.log('No such document');
            } else {
                var myChats = doc.data().chats;
                let newChat = {
                    chat: message.chat,
                    sender: message.sender,
                    time: message.time,
                    status: message.status
                }
                myChats.push(newChat);
                chatRef.update({
                    chats: myChats
                });
            }
            io.to(roomID).emit('message', message);
        });

        socket.on('changeStatus', async message => {
            const doc = await db.collection('chatrooms').doc(`${message.room}`).get();
            if (!doc.exists) {
                console.log('No such document');
            } else {
                var myChats = doc.data().chats;
                myChats[myChats.length - 1].status = 'read';
                console.log(myChats[myChats.length - 1]);
                db.collection('chatrooms').doc(`${message.room}`).update({
                    chats: myChats
                });
            }
        });
    });
    
    //Runs when user disconnects by leaving message board
    socket.on('disconnect', () => {
        console.log(`DISCONNECTED! from ${roomID}`)
    });
});

const PORT = process.env.PORT || 3000;
module.exports = function() { http.listen(PORT, () => console.log(`Server running on port ${PORT}`)); };