import { Firestore } from '../utils/firestoreConfig';
import { Request, Response } from 'express';
const db = Firestore();
import formidable from 'formidable';
import * as path from 'path';

export function profile(req: Request, res: Response): void {
    const session = req.session as Express.Session;
    if (session.loggedin) {
        db.collection('subjects').doc("subjects").get().then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                let data = doc.data() as FirebaseFirestore.DocumentData; 
                session.tutorSubjects = data["all_subjects"];
            }
        }).catch(err => {
            console.log('Error getting document', err);
        });

        db.collection('tutors').doc(session.userData["email"]).get().then(tutorDoc => {
            if (!tutorDoc.exists) {
                console.log('NOT TUTOR');
                res.render("profile", {
                    title: "Profile",
                    userData: session.userData,
                    tutorData: session.userData["userType"],
                    tutorSubjects: session.tutorSubjects
                })
            } else {
                session.tutorData = tutorDoc.data()
                res.render("profile", {
                    title: "Profile",
                    userData: session.userData,
                    tutorData: session.tutorData,
                    tutorSubjects: session.tutorSubjects
                })
            }
        }).catch(err => {
            console.log('Error getting document', err);
        });

    } else {
        res.redirect("/");
    }
}

export function toggleActiveStatus(req: Request, res: Response): void {
    const session = req.session as Express.Session;
    if (session.loggedin) {
        let docRef = db.collection('tutors').doc(session.userData["email"]);
        docRef.get().then(_ => {
            docRef.update({
                isActive: !session.tutorData.isActive
            }).then(_ => {
                return res.redirect("/profile")
            }).catch(err => {
                console.log('Error getting document', err);
            });
        }).catch(err => {
            console.log('Error getting document', err);
        });
    }
}

export function newPfp(req: Request, res: Response): void {
    const session = req.session as Express.Session;
    if (session.loggedin) {
        var filePath: string;
        let form = new formidable.IncomingForm();
        form.on('field', (name: string, field: any) => {
                console.log('Field', name, field);
            })
        form.on('fileBegin', (name: string, file: any) => {
                let fileName = `${session.userData["email"]}.JPG`;
                filePath = path.resolve('/img', name, fileName);
                if (file.type == 'image/jpeg') file.path = path.resolve(__dirname, '../public/img', name, fileName);
                else console.log('invalid file');
            })
        form.on('file', (name: string) => {
                console.log('Uploaded file', name);
            })
        form.on('aborted', () => {
                console.error('Request aborted by the user');
            })
        form.on('error', (err: any) => {
                console.error('Error', err);
                throw err;
            })
        form.on('end', () => {
                let docRef = db.collection('users').doc(session.userData["email"]);
                docRef.get().then(doc => {
                    let data = doc.data() as FirebaseFirestore.DocumentData;
                    data.prof_pic = filePath;
                    session.userData = data;
                    docRef.set(data);
                    return res.redirect('/profile');
                }).catch(err => {
                    console.log('Error getting document', err);
                });
            })
        form.parse(req, (err: any, fields: any, files: any) => {
            console.log(err, fields, files)
        });
    }
}


// changeProfPic: function(req, res) {
//     if (req.session.loggedin) {
//         let email = req.session.userData["email"]
//         let newUrl = req.body.newUrl;
//         let docRef = db.collection('users').doc(email);
//         let userRef = docRef.get()
//         userRef.then(doc => {
//                 req.session.userData["prof_pic"] = newUrl;
//                 let setInfo = docRef.set(req.session.userData);
//                 console.log("DONE!")
//                 return res.status(200).send({ result: 'redirect', url: '/profile' })

//             })
//             .catch(err => {
//                 console.log('Error getting document', err);
//             });
//     }
// }