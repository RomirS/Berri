import socketIo from 'socket.io';
import { networkInterfaces, NetworkInterfaceInfo } from 'os';
import { Firestore } from './firestoreConfig';
const db = Firestore();
let formatMessage = require("../helpers/message").formatMessage;

export class Socket {
    private io!: socketIo.Server;

    constructor(io: socketIo.Server) {
        this.io = io;
        this.listen();
    }

    private listen(): void {
        this.io.on('connection', (socket) => {
            var roomID: string;
            //Joins each chat that user is a part of
            socket.on('joinRoom', newID => {
                socket.join(newID)
            });
            //Sets current room ID to access Firebase and when user sends message
            socket.on('currentRoom', chatroom => {
                roomID = chatroom.id;
                let useremail = chatroom.useremail;

                var clientsInRoom = this.io.sockets.adapter.rooms[roomID];
                var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
                if (numClients === 2) this.io.to(roomID).emit('isReady');

                socket.removeAllListeners('chatMessage');
                socket.removeAllListeners('changeStatus');
                socket.removeAllListeners('message');

                //Listens for chat message and adds message to Firebase
                let chatRef = db.collection('chatrooms').doc(`${roomID}`);

                chatRef.get().then(doc => {
                    var cont = true;
                    let data = doc.data() as FirebaseFirestore.DocumentData;
                    var myChats = data.chats;
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
                    chatRef.update({
                        chats: myChats
                    });
                }).catch((err) => {
                    console.log(err)
                });

                socket.on('chatMessage', async msg => {
                    let message = formatMessage(roomID, useremail, msg);
                    const doc = await db.collection('chatrooms').doc(`${roomID}`).get();
                    let data = doc.data() as FirebaseFirestore.DocumentData;
                    var myChats = data.chats;
                    myChats.push({
                        chat: message.chat,
                        sender: message.sender,
                        time: message.time,
                        status: message.status
                    });
                    await chatRef.update({
                        chats: myChats
                    });
                    this.io.to(roomID).emit('message', message);
                });

                socket.on('changeStatus', async message => {
                    const doc = await db.collection('chatrooms').doc(`${message.room}`).get();
                    if (!doc.exists) {
                        console.log('No such document');
                    } else {
                        let data = doc.data() as FirebaseFirestore.DocumentData;
                        var myChats = data.chats;
                        myChats[myChats.length - 1].status = 'read';
                        db.collection('chatrooms').doc(`${message.room}`).update({
                            chats: myChats
                        });
                    }
                });

                socket.on('broadcast', function(message) {
                    socket.to(roomID).broadcast.emit('broadcastReceived', message);
                });

            });
            
            // socket.on('ipaddr', function() {
            //     var ifaces = networkInterfaces();
            //     for (var dev in ifaces) {
            //         ifaces?[dev].forEach(function(details) {
            //             if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
            //                 socket.emit('ipaddr', details.address);
            //             }
            //         });
            //     }
            // });

            //Runs when user disconnects by leaving message board
            socket.on('disconnect', () => {
                console.log(`DISCONNECTED! from ${roomID}`)
            });
        });
    }
}