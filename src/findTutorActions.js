const db = require("../utils/firebaseConfig")();

function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

module.exports = {
    foundTutors: function(req, res) {
        if (req.session.loggedin) {
            req.session.foundTutorsList = [];
            req.session.chosenSubject = req.query.chosenSubject;
            if (req.session.chosenSubject) {
                db.collection('tutors').get()
                    .then(snapshot => {
                        snapshot.forEach(doc => {
                            if (doc.data().subjects.includes(req.session.chosenSubject) && doc.data().isActive && doc.id != req.session.userData["email"]) {
                                req.session.foundTutorsList.push({
                                    id: doc.id,
                                    data: doc.data()
                                });
                            }
                        });
                        req.session.foundTutorsList = shuffle(req.session.foundTutorsList);
                        req.session.foundTutorsIndex = 0;
                        return res.redirect("/chooseTutor")
                    }).catch(err => {
                        console.log('Error getting documents', err);
                    });
            }
        }
    },
    searchTutor: function(req, res) {
        if (req.session.loggedin) {
            req.session.foundTutorsList = [];
            req.session.searchTutorEmail = req.query.searchTutor;
            if (req.session.searchTutorEmail) {
                db.collection('tutors').get()
                    .then(snapshot => {
                        snapshot.forEach(doc => {
                            if (doc.id == req.session.searchTutorEmail && doc.id != req.session.userData["email"]) {
                                req.session.foundTutorsList.push({
                                    id: doc.id,
                                    data: doc.data()
                                });
                            }
                        });
                        req.session.foundTutorsIndex = 0;
                        return res.redirect("/chooseTutor")
                    }).catch(err => {
                        console.log('Error getting documents', err);
                    });
            }
        }
    },
    chooseTutor: function(req, res) {
        if (req.session.foundTutorsIndex >= req.session.foundTutorsList.length) { return res.redirect("/noTutorFound") };
        let tutor = req.session.foundTutorsList[req.session.foundTutorsIndex];
        req.session.tutorData = tutor.data;
        db.collection('users').doc(tutor.id).get()
            .then(doc => {
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
    },
    retryTutor: function(req, res) {
        if (req.session.loggedin) {
            req.session.foundTutorsIndex++;
            return res.redirect("/chooseTutor")
        } else {
            res.redirect("/");
        }
    },
    tutorProfiles: function(req, res) {
        if (req.session.loggedin) {
            res.render("tutorProfiles", {
                title: "Tutor Profiles",
                tutorUserData: req.session.tutorUserData,
                tutorData: req.session.tutorData,
                subjects: req.session.tutorData["subjects"],
            })
        } else {
            res.redirect("/");
        }
    },
    noTutorFound: function(req, res) {
        res.send("Could not find a tutor.");
    }
};


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