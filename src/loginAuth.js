const firebase = require("firebase");
const db = require("../utils/firebaseConfig")();

function loginAuth(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    if (email && password) {
        firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
            console.log("logged in")
            req.session.email = email;
            req.session.loggedin = true;
            let userRef = db.collection('users').doc(email).get();
            userRef.then(doc => {
                if (!doc.exists) {
                    console.log('No such document!');
                } else {
                    req.session.userData = doc.data()
                    console.log("DONE!")
                    return res.redirect("/profile")
                }
            }).catch(err => {
                console.log('Error getting document', err);
            });
        }).catch((err) => {
            console.log(err)
            return res.send(err.message)
        })
    }
}

module.exports = loginAuth;