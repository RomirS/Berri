const firebaseConfig = require("./utils/firebaseConfig");
const expressConfig = require("./utils/expressConfig");
const {serverConfig, createServer} = require("./utils/serverConfig");
const socketio = require('socket.io');

const {signup, postFeedback, loginAuth, googleSignup, logout, home} = require("./src/loginActions");
const profile = require("./src/profile");
const {becomeTutor, saveNewTutor} = require("./src/becomeTutorActions");
const {foundTutors, chooseTutor, retryTutor, tutorProfiles, noTutorFound} = require("./src/findTutorActions");

const formatMessage = require("./utils/messages");

const db = firebaseConfig();
const app = expressConfig();
serverConfig();
const server = createServer();

const io = socketio(server);

//Logins
app
.get("/signup", signup)
.post('/postFeedback', postFeedback)
.post('/loginAuth', loginAuth)
.post('/googleSignup', googleSignup)
.post('/logout', logout)
.get("/", home)

//Profile setup
.get("/profile", profile)
.get("/becomeTutor", becomeTutor)
.post('/saveNewTutor', saveNewTutor)

//Find tutor
.get('/foundTutors', foundTutors)
.get('/chooseTutor', chooseTutor)
.get('/retryTutor', retryTutor)
.get("/tutorProfiles", tutorProfiles)
.get("/noTutorFound", noTutorFound)

var search = (value, arrayObj) => {
    var found = false;
    for (var i = 0; !found && i < arrayObj.length; i++) {
        var arrayValues = Object.values(arrayObj[i]);
        arrayValues.forEach(item => {
            if (item == value) {
                found = true;
            }
        });
    }
    return found;
};

app.post("/messages", (req, res) => {
    if (req.session.loggedin) {
        if (req.body.newTutor == "true") { //stores new tutor when person finds new tutor
            //Updates student's myTutor list
            let tutors = req.session.userData["myTutors"];
            let docRef = db.collection('users').doc(req.session.userData["email"]);
            if (tutors.length === 0 || !search(req.session.tutorUserData["email"], tutors)) {
                var tutor = {
                    email: req.session.tutorUserData["email"],
                    first: req.session.tutorUserData["first"],
                    last: req.session.tutorUserData["last"],
                    prof_pic: req.session.tutorUserData["prof_pic"],
                    age: req.session.tutorData["age"],
                    city: req.session.tutorData["city"],
                    subjects: req.session.tutorData["subjects"],
                    subjectChosen: req.session.chosenSubject
                };
                //Adds tutor to myTutors list in Firebase
                tutors.push(tutor);
                let setInfo = docRef.update({
                    myTutors: tutors
                });

                //Adds chatroom for tutor and student in Firebase to store messages
                let chatRef = db.collection('chatrooms').doc(`${tutor.email}?${req.session.userData["email"]}`);
                setInfo = chatRef.set({
                    tutor: tutor.email,
                    student: req.session.userData["email"],
                    subject: req.session.chosenSubject,
                    chats: []
                });
            }

            //Update tutor's myStudent list
            let students = req.session.tutorData["myStudents"];
            let tutorRef = db.collection('tutors').doc(req.session.tutorUserData["email"]);
            if (students.length === 0 || !search(req.session.userData["email"], students)) {
                var student = {
                    email: req.session.userData["email"],
                    first: req.session.userData["first"],
                    last: req.session.userData["last"],
                    prof_pic: req.session.userData["prof_pic"],
                    subjectChosen: req.session.chosenSubject
                };

                students.push(student);
                let setInfo = tutorRef.update({
                    myStudents: students
                });
            }
        }


        //Access chat data where user is student to pass to front end
        db.collection('chatrooms').where('student', '==', `${req.session.userData["email"]}`).get()
            .then(snapshot => {
                req.session.tutorChatData = [];
                snapshot.forEach(doc => {
                    req.session.tutorChatData.push(doc.data());
                });
                //Access chat data where user is tutor to pass to front end
                if (req.session.userData["userType"] == "Registered Tutor") {
                    db.collection('chatrooms').where('tutor', '==', `${req.session.userData["email"]}`).get()
                        .then(snapshot => {
                            req.session.studentChatData = [];
                            snapshot.forEach(doc => {
                                req.session.studentChatData.push(doc.data());
                            });
                            //Access user's personal tutor data to pass to front end
                            db.collection('tutors').doc(req.session.userData["email"]).get()
                                .then(doc => {
                                    if (!doc.exists) {
                                        console.log('No such document');
                                    } else {
                                        req.session.personalTutorData = doc.data()
                                        res.render("messages", {
                                            title: "Message Board",
                                            userData: req.session.userData,
                                            tutorChatData: req.session.tutorChatData,
                                            studentChatData: req.session.studentChatData,
                                            personalTutorData: req.session.personalTutorData
                                        })
                                    }
                                }).catch(err => {
                                    console.log('Error getting document', err);
                                });
                        }).catch(err => {
                            console.log('Error1 getting document', err);
                        });
                } else {
                    res.render("messages", {
                        title: "Message Board",
                        userData: req.session.userData,
                        tutorChatData: req.session.tutorChatData,
                        studentChatData: req.session.userData["userType"],
                        personalTutorData: req.session.userData["userType"]
                    })
                }
            }).catch(err => {
                console.log('Error2 getting document', err);
            });
    } else {
        res.redirect("/");
    }
})

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