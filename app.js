var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const firebase = require("firebase")
const session = require('express-session')
const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

var provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({
    prompt: 'select_account consent'
});


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://berri-c0bb3.firebaseio.com"
});

firebase.initializeApp({
    apiKey: "AIzaSyD0HmBdRKbpexLH-Z9dk16gjf_9i20-KaY",
    authDomain: "berri-c0bb3.firebaseapp.com",
    databaseURL: "https://berri-c0bb3.firebaseio.com",
    projectId: "berri-c0bb3",
    storageBucket: "berri-c0bb3.appspot.com",
    messagingSenderId: "787660474330",
    appId: "1:787660474330:web:26e867d764bd464f1e62e3",
    measurementId: "G-BB398RGVHB"
});
var db = admin.firestore();

var app = express();

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



app.post('/post-feedback', function(req, res) {
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
                userType: "none"
            }
            let setInfo = docRef.set(req.session.userData);
            console.log("DONE!")
            return res.redirect("/profile")
        }).catch((err) => {
            // res.send("Incorrect email or password");
            console.log(err)
            return res.send(err.message)
        })
    }

});

app.post('/become-tutor', function(req, res) {
    var age = req.body.age;
    var subjects = req.body.subjects;
    var city = req.body.city;

    if (age && subjects && city) {
        console.log("signed up as tutor")
        req.session.tutorLogIn = true;
        let docRef = db.collection('tutors').doc(req.session.userData["email"])
        let setInfo = docRef.set({
            age: age,
            subjects: subjects,
            city: city,
        });
        docRef = db.collection('users').doc(req.session.userData["email"])
        setInfo = docRef.update({
            userType: "tutor"
        });
        req.session.userData["userType"] = "tutor";
        console.log("DONE!")
        return res.redirect("/profile")
    }

});

app.post('/loginAuth', function(req, res) {
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
                        console.log(req.session.userData["first"])
                        console.log("DONE!")
                        return res.redirect("/profile")
                    }
                })
                .catch(err => {
                    console.log('Error getting document', err);
                });
        }).catch((err) => {
            // res.send("Incorrect email or password");
            console.log(err)
            return res.send(err.message)
        })
    }

});

app.post("/logout", (req, res) => {
    console.log("logging out!")
    req.session.loggedin = false;
    firebase.auth().signOut();
    res.redirect("/")
})

app.post("/google_signup", (req, res) => {
    console.log(req.body)
    var id_token = req.body.idToken;
    // Build Firebase credential with the Google ID token.
    var credential = provider.credential(id_token);

    // Sign in with credential from the Google user.
    firebase.auth().signInWithCredential(credential).then(authResult => {
        req.session.loggedin = true;
        console.log("signed up with google!")
        var user = authResult.user;
        var email = user.email;
        req.session.email = email;
        var name = user.displayName;
        var firstName = name.split(" ")[0]
        var lastName = name.split(" ")[1]

        console.log("first: " + firstName, "last: " + lastName)
        let userRef = db.collection('users').doc(email).get()
        userRef.then(doc => {
                if (!doc.exists) {
                    console.log('No such document!');
                    console.log("SIGNING USER UP")
                    req.session.userData = {
                        email: email,
                        first: firstName,
                        last: lastName,
                        userType: "none"
                    }
                    let setInfo = docRef.set(req.session.userData);
                    console.log("DONE!")
                    return res.status(200).send({ result: 'redirect', url: '/profile' })
                } else {
                    req.session.userData = doc.data()
                    console.log(req.session.userData["first"])
                    console.log("DONE!")
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
            // ...
    });
})

app.get("/", (req, res) => {
    if (req.session.loggedin) {
        res.redirect("/profile")
    } else {
        console.log(req.session.loggedin)
        res.render("signup", { title: "Home" })
    }
})

app.get("/login", (req, res) => {
    if (req.session.loggedin) {
        res.redirect("/profile")
    } else {
        res.render("login", { title: "Login" })
    }
})

app.get("/profile", (req, res) => {
    if (true) { //req.session.loggedin) {
        res.render("profile", { title: "Profile", name: req.session.userData["first"], userType: req.session.userData["userType"] })
    } else {
        res.redirect("/");
    }
})

app.get("/tutorProfile", (req, res) => {
    if (req.session.loggedin) {
        res.render("tutorProfile", { title: "Tutor Profile", name: req.session.userData["first"], userType: req.session.userData["userType"] })
    } else {
        res.redirect("/");
    }
})

app.get("/becomeTutor", (req, res) => {
    if (req.session.loggedin) {
        res.render("becomeTutor", { title: "Become a tutor" })
    } else {
        res.redirect("/")
    }
})

app.listen(8000);