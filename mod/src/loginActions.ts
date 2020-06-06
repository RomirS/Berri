import firebase from 'firebase';
import { Request, Response } from 'express';
import { Firestore } from '../utils/firestoreConfig';
const db = Firestore();

export function signup(req: Request, res: Response): void {
    if (req.session!.loggedin) {
        res.redirect("/profile")
    } else {
        res.render("signup", { title: "Login" })
    }
}

export function postFeedback(req: Request, res: Response): void {
    let email = req.body.email;
    let password = req.body.password;
    let repeatPassword = req.body.passwordRepeat;
    let firstName = req.body.firstname;
    let lastName = req.body.lastname;
    if (email && password && (password == repeatPassword)) {
        firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
            const session = req.session as Express.Session;
            session.loggedin = true;
            session.userData = {
                email: email,
                first: firstName,
                last: lastName,
                userType: "Student",
                prof_pic: "https://i.ibb.co/HtsTkv5/profile-pic.png"
            };
            db.collection('users').doc(email).set(session.userData);
            console.log("Signed up!");
            return res.redirect("/profile")
        }).catch((err) => {
            console.log(err)
            return res.send(err.message)
        });
    }
}

export function googleSignup(req: Request, res: Response): void {
    let id_token = req.body.idToken as string;
    let credential = firebase.auth.GoogleAuthProvider.credential(id_token);
    firebase.auth().signInWithCredential(credential).then(authResult => {
        const session = req.session as Express.Session;
        session.loggedin = true;
        const user = authResult.user as firebase.User;
        let email = user.email as string;
        let name = user.displayName as string;
        let picUrl =  user.photoURL as string;
        let firstName = name.split(" ")[0];
        let lastName = name.split(" ")[1];
        let pic = picUrl.slice(0, -6);

        let docRef = db.collection('users').doc(email);
        docRef.get().then(doc => {
            if (!doc.exists) {
                session.userData = {
                    email: email,
                    first: firstName,
                    last: lastName,
                    userType: "Student",
                    prof_pic: pic,
                    myTutors: []
                }
                docRef.set(session.userData);
                console.log("Signed up google user!")
                return res.status(200).send({ result: 'redirect', url: '/profile' })
            } else {
                session.userData = doc.data()
                return res.status(200).send({ result: 'redirect', url: '/profile' })
            }
        }).catch(err => {
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
}

export function loginAuth(req: Request, res: Response): void {
    let email = req.body.email;
    let password = req.body.password;
    if (email && password) {
        firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
            const session = req.session as Express.Session;
            session.email = email;
            session.loggedin = true;
            db.collection('users').doc(email).get().then(doc => {
                if (!doc.exists) {
                    console.log('No such document!');
                } else {
                    session.userData = doc.data()
                    console.log("Logged in!");
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

export function logout(req: Request, res: Response): void {
    console.log("LOGGING OUT");
    const session = req.session as Express.Session;
    session.loggedin = false;
    firebase.auth().signOut();
    res.redirect("/")
}

export function home(req: Request, res: Response): void {
    const session = req.session as Express.Session;
    if (session.loggedin) {
        res.redirect("/profile")
    } else {
        console.log(session.loggedin)
        res.render("login", { title: "Home" })
    }
}