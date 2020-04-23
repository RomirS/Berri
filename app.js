const firebaseConfig = require("./utils/firebaseConfig");
const expressConfig = require("./utils/expressConfig");
const {serverConfig, createServer} = require("./utils/serverConfig");
const socketio = require('socket.io');

const {signup, postFeedback, loginAuth, googleSignup, logout, home} = require("./src/loginActions");
const profile = require("./src/profile");
const {becomeTutor, saveNewTutor} = require("./src/becomeTutorActions");
const {foundTutors, chooseTutor, retryTutor, tutorProfiles, noTutorFound} = require("./src/findTutorActions");
const messageBoard = require("./src/messageBoard");

const formatMessage = require("./utils/messages");

const db = firebaseConfig();
const app = expressConfig();
serverConfig();
const server = createServer();

const io = socketio(server);

//Logins
app
.get('/signup', signup)
.post('/postFeedback', postFeedback)
.post('/loginAuth', loginAuth)
.post('/googleSignup', googleSignup)
.post('/logout', logout)
.get('/', home)

//Profile setup
.get('/profile', profile)
.get('/becomeTutor', becomeTutor)
.post('/saveNewTutor', saveNewTutor)

//Find tutor
.get('/foundTutors', foundTutors)
.get('/chooseTutor', chooseTutor)
.get('/retryTutor', retryTutor)
.get('/tutorProfiles', tutorProfiles)
.get('/noTutorFound', noTutorFound)

//Message Board
.post('/messageBoard', messageBoard)

//Socket io
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
                            prof_pic: userpfp,
                            time: message.time
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
})



// app.get("/findTutor", (req, res) => {
//     if (req.session.loggedin) {
//         console.log(req.session.tutorSubjects)
//         res.render("findTutor", {
//             title: "Find a Tutor",
//             tutorSubjects: req.session.tutorSubjects
//         })
//     } else {
//         res.redirect("/")
//     }
// })