import { Firestore } from '../utils/firestoreConfig';
import { Request, Response } from 'express';
const db = Firestore();

function shuffle(array: any[]) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

export function foundTutors(req: Request, res: Response): void {
    const session = req.session as Express.Session;
    if (session.loggedin) {
        session.foundTutorsList = [];
        session.chosenSubject = req.query.chosenSubject;
        if (session.chosenSubject) {
            db.collection('tutors').get()
                .then(snapshot => {
                    snapshot.forEach(doc => {
                        if (doc.data().subjects.includes(session.chosenSubject) && doc.data().isActive && doc.id != session.userData["email"]) {
                            session.foundTutorsList.push({
                                id: doc.id,
                                data: doc.data()
                            });
                        }
                    });
                    session.foundTutorsList = shuffle(session.foundTutorsList);
                    session.foundTutorsIndex = 0;
                    return res.redirect("/chooseTutor")
                }).catch(err => {
                    console.log('Error getting documents', err);
                });
        }
    }
}

export function searchTutor(req: Request, res: Response): void {
    const session = req.session as Express.Session;
    if (session.loggedin) {
        session.foundTutorsList = [];
        session.searchTutorEmail = req.query.searchTutor;
        if (session.searchTutorEmail) {
            db.collection('tutors').get().then(snapshot => {
                snapshot.forEach(doc => {
                    if (doc.id == session.searchTutorEmail && doc.id != session.userData["email"]) {
                        session.foundTutorsList.push({
                            id: doc.id,
                            data: doc.data()
                        });
                    }
                });
                session.foundTutorsIndex = 0;
                return res.redirect("/chooseTutor")
            }).catch(err => {
                console.log('Error getting documents', err);
            });
        }
    }
}

export function chooseTutor(req: Request, res: Response): void {
    const session = req.session as Express.Session;
    if (session.foundTutorsIndex >= session.foundTutorsList.length) { return res.redirect("/noTutorFound") };
    let tutor = session.foundTutorsList[session.foundTutorsIndex];
    session.tutorData = tutor.data;
    db.collection('users').doc(tutor.id).get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                session.tutorUserData = doc.data()
                // session.save()
                return res.redirect("/tutorProfiles")
            }
        }).catch(err => {
            console.log('Error1 getting document', err);
        });
}

export function retryTutor(req: Request, res: Response): void {
    const session = req.session as Express.Session;
    if (session.loggedin) {
        session.foundTutorsIndex++;
        return res.redirect("/chooseTutor")
    } else {
        res.redirect("/");
    }
}

export function tutorProfiles(req: Request, res: Response): void {
    const session = req.session as Express.Session;
    if (session.loggedin) {
        res.render("tutorProfiles", {
            title: "Tutor Profiles",
            tutorUserData: session.tutorUserData,
            tutorData: session.tutorData,
            subjects: session.tutorData["subjects"],
        })
    } else {
        res.redirect("/");
    }
}

export function noTutorFound(req: Request, res: Response): void {
    res.send("Could not find a tutor.");
}


// app.get("/findTutor", (req, res) => {
//     if (req.session.loggedin) {
//         console.log(req.session.tutorSubjects)
//         res.render("findTutor", {
//             title: "Find a Tutor",
//             tutorSubjects: req.session.tutorSubjects
//         })
//     } else {
//         res.redirect("/")
//     }
// })