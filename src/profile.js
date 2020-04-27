const db = require("../utils/firebaseConfig")();

module.exports = {
    profile: function(req, res) {
        if (req.session.loggedin) {
            db.collection('subjects').doc("subjects").get()
                .then(doc => {
                    if (!doc.exists) {
                        console.log('No such document!');
                    } else {
                        req.session.tutorSubjects = doc.data()["all_subjects"]
                        req.session.save()
                    }
                }).catch(err => {
                    console.log('Error getting document', err);
                });

            db.collection('tutors').doc(req.session.userData["email"]).get()
                .then(tutorDoc => {
                    if (!tutorDoc.exists) {
                        console.log('NOT TUTOR');
                        res.render("profile", {
                            title: "Profile",
                            userData: req.session.userData,
                            tutorData: req.session.userData["userType"],
                            tutorSubjects: req.session.tutorSubjects
                        })
                    } else {
                        req.session.tutorData = tutorDoc.data()
                        res.render("profile", {
                            title: "Profile",
                            userData: req.session.userData,
                            tutorData: req.session.tutorData,
                            tutorSubjects: req.session.tutorSubjects
                        })
                    }
                }).catch(err => {
                    console.log('Error getting document', err);
                });

        } else {
            res.redirect("/");
        }
    },
    changeProfPic: function(req, res) {
        if (req.session.loggedin) {
            let email = req.session.userData["email"]
            let newUrl = req.body.newUrl;
            let docRef = db.collection('users').doc(email);
            let userRef = docRef.get()
            userRef.then(doc => {
                    req.session.userData["prof_pic"] = newUrl;
                    let setInfo = docRef.set(req.session.userData);
                    console.log("DONE!")
                    return res.status(200).send({ result: 'redirect', url: '/profile' })

                })
                .catch(err => {
                    console.log('Error getting document', err);
                });
        }
    }
}