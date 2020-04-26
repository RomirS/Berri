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
        socket.on('chatMessage', msg => {
            let message = formatMessage(roomID, `${useremail}`, userpfp, msg);
            db.collection('chatrooms').doc(`${roomID}`).get()
                .then(doc => {
                    if (!doc.exists) {
                        console.log('No such document');
                    } else {
                        myChats = doc.data().chats;
                        let newChat = {
                            chat: message.chat,
                            sender: message.sender,
                            prof_pic: message.prof_pic,
                            time: message.time,
                            status: message.status
                        }
                        myChats.push(newChat);
                        let setInfo = chatRef.update({
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
