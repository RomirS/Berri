const firebase = require("firebase");
const db = require("../utils/firebaseConfig")();
const providerConfig = require("../utils/providerConfig");
const provider = providerConfig();

module.exports = {
    signup: function (req, res) {
        if (req.session.loggedin) {
            res.redirect("/profile")
        } else {
            res.render("signup", { title: "Login" })
        }
    },
    postFeedback: function postFeedback(req, res) {
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
    },
    loginAuth: function (req, res) {
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
    },
    googleSignup: function(req, res) {
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
    },
    logout: function(req, res) {
        console.log("LOGGING OUT");
        req.session.loggedin = false;
        firebase.auth().signOut();
        res.redirect("/")
    },
    home: function(req, res) {
        if (req.session.loggedin) {
            res.redirect("/profile")
        } else {
            console.log(req.session.loggedin)
            res.render("login", { title: "Home" })
        }
    }
}