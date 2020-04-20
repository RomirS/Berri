const firebaseConfig = require("./utils/firebaseConfig");
const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

const postFeedback = require("./src/postFeedback");
const loginAuth = require("./src/loginAuth");
const googleSignup = require("./src/googleSignup");
const logout = require("./src/logout");

const app = express();
const db = firebaseConfig();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, 'public')));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", 'pug');
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));


function shuffle(array) {
    let counter = array.length;
    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);
        // Decrease counter by 1
        counter--;
        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

app.post('/post-feedback', function(req,res){postFeedback(req, res)});

app.post('/loginAuth', function(req,res){loginAuth(req, res)});

app.post('/googleSignup', function(req,res){googleSignup(req, res)})

app.post('/logout', function(req,res){logout(req, res)})

app.get("/", (req, res) => {
    if (req.session.loggedin) {
        res.redirect("/profile")
    } else {
        console.log(req.session.loggedin)
        res.render("login", { title: "Home" })
    }
})

app.get("/signup", (req, res) => {
    if (req.session.loggedin) {
        res.redirect("/profile")
    } else {
        res.render("signup", { title: "Login" })
    }
})

app.get("/profile", (req, res) => {
    if (req.session.loggedin) {
        username = req.session.userData["first"];
        useremail = req.session.userData["email"];
        let subjectRef = db.collection('subjects').doc("subjects").get();
        subjectRef.then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                req.session.tutorBlacklist = []
                req.session.tutorBlacklist.push(req.session.userData["email"])
                req.session.tutorSubjects = doc.data()["all_subjects"]
                req.session.save()
            }
        }).catch(err => {
            console.log('Error getting document', err);
        });

        let grabTutor = db.collection('tutors').doc(req.session.userData["email"]).get();
        grabTutor.then(tutorDoc => {
            if (!tutorDoc.exists) {
                console.log('NOT TUTOR');
                res.render("profile", {
                    title: "Profile",
                    name: req.session.userData["first"],
                    userType: req.session.userData["userType"],
                    prof_pic: req.session.userData["prof_pic"],
                    tutorSubjects: req.session.tutorSubjects
                })
            } else {
                req.session.tutorData = tutorDoc.data()
                res.render("profile", {
                    title: "Profile",
                    name: req.session.userData["first"],
                    userType: req.session.userData["userType"],
                    prof_pic: req.session.userData["prof_pic"],
                    subjects: req.session.tutorData["subjects"],
                    tutorSubjects: req.session.tutorSubjects
                })
            }
        }).catch(err => {
            console.log('Error getting document', err);
        });

    } else {
        res.redirect("/");
    }
})

app.get("/becomeTutor", (req, res) => {
    if (req.session.loggedin) {
        console.log(req.session.tutorSubjects)
        res.render("becomeTutor", {
            title: "Become a Tutor",
            tutorSubjects: req.session.tutorSubjects
        })
    } else {
        res.redirect("/")
    }
})

app.post('/become-tutor', function(req, res) {
    var age = req.body.age;
    var city = req.body.city;
    var subjects = req.body.subjects;
    console.log(subjects)
    if (age && subjects && city) {
        console.log("signed up as tutor")
        req.session.tutorLogIn = true;
        let docRef = db.collection('tutors').doc(req.session.userData["email"])
        let setInfo = docRef.set({
            age: age,
            subjects: subjects,
            city: city,
            myStudents: []
        });
        docRef = db.collection('users').doc(req.session.userData["email"])
        setInfo = docRef.update({
            userType: "Registered Tutor"
        });
        req.session.userData["userType"] = "Registered Tutor";
        return res.redirect("/profile")
    }

});

app.get('/find-tutor', function(req, res) {
    if (req.session.loggedin) {
        var subjectChosen = req.query.chosenSubject;
        req.session.subjectChosen = subjectChosen;
        var allTutors = []
        var foundTutors = []
        if (subjectChosen) {
            let tutorRef = db.collection('tutors').get()
            tutorRef.then(snapshot => {
                snapshot.forEach(doc => {
                    var currTutor = [doc.id, doc.data()]
                    allTutors.push(currTutor)
                })
                allTutors.forEach(tutor => {
                    if (tutor[1]["subjects"].includes(subjectChosen) && !(req.session.tutorBlacklist.includes(tutor[0]))) {
                        foundTutors.push(tutor)
                    }
                })
                foundTutors = shuffle(foundTutors)
                if (foundTutors.length == 0)
                    return res.redirect("/noTutorFound")

                tutor = foundTutors[0];
                var tutorEmail = tutor[0]
                let tutors = db.collection('tutors').doc(tutorEmail).get();
                tutors.then(tutorDoc => {
                    if (!tutorDoc.exists) {
                        console.log('No such document!');
                    } else {
                        req.session.tutorData = tutorDoc.data()
                        let userRef = db.collection('users').doc(tutorEmail).get();
                        userRef.then(doc => {
                            if (!doc.exists) {
                                console.log('No such document!');
                            } else {
                                req.session.tutorUserData = doc.data()
                                req.session.save()
                                return res.redirect("/tutorProfiles")
                            }
                        }).catch(err => {
                            console.log('Error1 getting document', err);

                        });
                    }
                }).catch(err => {
                    console.log('Error2 getting document', err);
                });



            }).catch(err => {
                console.log('Error getting documents', err);
            });
        }
    } else {
        res.redirect("/");
    }
});

app.get('/retry-tutor', function(req, res) {
    if (req.session.loggedin) {
        req.session.tutorBlacklist.push(req.query["email"])
        return res.redirect("/find-tutor?chosenSubject=" + req.session.subjectChosen)
    } else {
        res.redirect("/");
    }
})

app.get("/noTutorFound", (req, res) => {
    res.send("Could not find a tutor.");
})

app.get("/tutorProfiles", (req, res) => {
    if (req.session.loggedin) {
        res.render("tutorProfiles", {
            title: "Tutor Profiles",
            tutorUserData: req.session.tutorUserData,
            tutorData: req.session.tutorData,
            chosen_subject: req.session.subjectChosen,
            subjects: req.session.tutorData["subjects"],
        })
    } else {
        res.redirect("/");
    }
})

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

const socketio = require('socket.io');
const formatMessage = require("./utils/messages");
const server = http.createServer(app);
const io = socketio(server);

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
                    subjectChosen: req.session.subjectChosen
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
                    subject: tutor.subjectChosen,
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
                    subjectChosen: req.session.subjectChosen
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

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



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