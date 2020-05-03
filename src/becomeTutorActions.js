const db = require("../utils/firebaseConfig")();

module.exports = {
    becomeTutor: function (req, res) {
        if (req.session.loggedin) {
            res.render("becomeTutor", {
                title: "Become a Tutor",
                tutorSubjects: req.session.tutorSubjects
            })
        } else {
            res.redirect("/")
        }
    },
    saveNewTutor: function saveNewTutor(req, res) {
        var age = req.body.age;
        var city = req.body.city;
        var subjects = req.body.subjects;
        req.session.tutorSubjects = subjects;
        if (age && subjects && city) {
            console.log("CREATING NEW TUTOR")
            req.session.tutorLogIn = true;
            db.collection('tutors').doc(req.session.userData["email"]).set({
                age: age,
                subjects: subjects,
                city: city
            });
            db.collection('users').doc(req.session.userData["email"]).update({
                userType: "Registered Tutor"
            });
            req.session.userData["userType"] = "Registered Tutor";
            return res.redirect("/profile")
        }
    }
};
