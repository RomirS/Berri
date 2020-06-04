import { Firestore } from '../utils/firestoreConfig';
import { Request, Response } from 'express';
const db = Firestore();

export function becomeTutor(req: Request, res: Response): void {
    const session = req.session as Express.Session;
    if (session.loggedin) {
        res.render("becomeTutor", {
            title: "Become a Tutor",
            tutorSubjects: session.tutorSubjects
        })
    } else {
        res.redirect("/")
    }
}

export function saveNewTutor(req: Request, res: Response): void {
    const session = req.session as Express.Session;
    var age = req.body.age;
    var city = req.body.city;
    var subjects = req.body.subjects;
    session.tutorSubjects = subjects;
    if (age && subjects && city) {
        console.log("CREATING NEW TUTOR")
        session.tutorLogIn = true;
        db.collection('tutors').doc(session.userData["email"]).set({
            age: age,
            subjects: subjects,
            city: city
        });
        db.collection('users').doc(session.userData["email"]).update({
            userType: "Registered Tutor"
        });
        session.userData["userType"] = "Registered Tutor";
        return res.redirect("/profile")
    }
}
