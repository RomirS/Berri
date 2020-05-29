const formidable = require('formidable')
const path = require('path');
const db = require("../utils/firebaseConfig")();


module.exports = {
    profile: function(req, res) {
        if (req.session.loggedin) {
            db.collection('subjects').doc("subjects").get()
                .then(doc => {
                    if (!doc.exists) {
                        console.log('No such document!');
                    } else {
                        req.session.tutorSubjects = doc.data()["all_subjects"]
                        req.session.save()
                    }
                }).catch(err => {
                    console.log('Error getting document', err);
                });

            db.collection('tutors').doc(req.session.userData["email"]).get()
                .then(tutorDoc => {
                    if (!tutorDoc.exists) {
                        console.log('NOT TUTOR');
                        res.render("profile", {
                            title: "Profile",
                            userData: req.session.userData,
                            tutorData: req.session.userData["userType"],
                            tutorSubjects: req.session.tutorSubjects
                        })
                    } else {
                        req.session.tutorData = tutorDoc.data()
                        res.render("profile", {
                            title: "Profile",
                            userData: req.session.userData,
                            tutorData: req.session.tutorData,
                            tutorSubjects: req.session.tutorSubjects
                        })
                    }
                }).catch(err => {
                    console.log('Error getting document', err);
                });

        } else {
            res.redirect("/");
        }
    },
    toggleActiveStatus: function(req, res) {
        if (req.session.loggedin) {
            let docRef = db.collection('tutors').doc(req.session.userData["email"]);
            let userRef = docRef.get()
            userRef.then(doc => {
                    let setInfo = docRef.update({
                        isActive: !req.session.tutorData.isActive
                    })
                    setInfo.then(done => {
                        return res.redirect("/profile")
                    })
                })
                .catch(err => {
                    console.log('Error getting document', err);
                });
        }
    },
    newPfp: function(req, res) {
        if (req.session.loggedin) {
            var filePath;
            new formidable.IncomingForm().parse(req)
                .on('field', (name, field) => {
                    console.log('Field', name, field);
                })
                .on('fileBegin', (name, file) => {
                    let fileName = `${req.session.userData["email"]}.JPG`;
                    filePath = path.resolve('/img', name, fileName);
                    if (file.type == 'image/jpeg') file.path = path.resolve(__dirname, '../public/img', name, fileName);
                    else console.log('invalid file');
                })
                .on('file', (name, file) => {
                    console.log('Uploaded file', name);
                })
                .on('aborted', () => {
                    console.error('Request aborted by the user');
                })
                .on('error', (err) => {
                    console.error('Error', err);
                    throw err;
                })
                .on('end', () => {
                    let docRef = db.collection('users').doc(req.session.userData["email"]);
                    docRef.get().then(doc => {
                        let data = doc.data()
                        data.prof_pic = filePath;
                        req.session.userData = data;
                        docRef.set(data);
                        return res.redirect('/profile');
                    }).catch(err => {
                        console.log('Error getting document', err);
                    });
                })
        }
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