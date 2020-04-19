const firebase = require("firebase");
const db = require("../utils/firebaseConfig")();

function postFeedback(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var repeatPassword = req.body.passwordRepeat;
    var firstName = req.body.firstname;
    var lastName = req.body.lastname;

    if (email && password && (password == repeatPassword)) {
        firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
            console.log("logged in")
            req.session.email = email;
            req.session.loggedin = true;
            let docRef = db.collection('users').doc(email)
            req.session.userData = {
                email: email,
                first: firstName,
                last: lastName,
                userType: "Student",
                prof_pic: "https://i.ibb.co/HtsTkv5/profile-pic.png",
                myTutors: []
            };
            let setInfo = docRef.set(req.session.userData);
            console.log("DONE!")
            return res.redirect("/profile")
        }).catch((err) => {
            console.log(err)
            return res.send(err.message)
        });
    }
}

module.exports = postFeedback;