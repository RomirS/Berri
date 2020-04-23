const db = require("../utils/firebaseConfig")();

module.exports = function(req, res) {
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
}