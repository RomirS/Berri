const db = require("../utils/firebaseConfig")();

function search(value, arrayObj) {
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

module.exports = function(req, res) {
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
                setInfo = tutorRef.update({
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
                                        res.render("messageBoard", {
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
};