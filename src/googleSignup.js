const firebase = require("firebase");
const db = require("../utils/firebaseConfig")();
const providerConfig = require("../utils/providerConfig");
const provider = providerConfig();

function googleSignup(req, res) {
    var id_token = req.body.idToken;
    // Build Firebase credential with the Google ID token.
    var credential = provider.credential(id_token);

    // Sign in with credential from the Google user.
    firebase.auth().signInWithCredential(credential).then(authResult => {
        req.session.loggedin = true;
        console.log("GOOGLE SIGN IN");
        var user = authResult.user;
        var email = user.email;
        req.session.email = email;
        var name = user.displayName;
        var firstName = name.split(" ")[0]
        var lastName = name.split(" ")[1]
        var picURL = user.photoURL;

        let docRef = db.collection('users').doc(email);
        let userRef = docRef.get()
        userRef.then(doc => {
                if (!doc.exists) {
                    console.log("SIGNING USER UP")
                    req.session.userData = {
                        email: email,
                        first: firstName,
                        last: lastName,
                        userType: "Student",
                        prof_pic: picURL,
                        myTutors: []
                    }
                    let setInfo = docRef.set(req.session.userData);
                    console.log("DONE!")
                    return res.status(200).send({ result: 'redirect', url: '/profile' })
                } else {
                    req.session.userData = doc.data()
                    return res.status(200).send({ result: 'redirect', url: '/profile' })
                }
            })
            .catch(err => {
                console.log('Error getting document', err);
            });
        //return res.redirect("/profile")

    }).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode, errorMessage)
            // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log("error")
    });
}

module.exports = googleSignup;