const db = require("../utils/firebaseConfig")();
let chatrooms = db.collection('chatrooms');

module.exports = {
    messageBoard: function(req, res) {
        if (req.session.loggedin) {
            let newTutor = req.body.newTutor;
            let userid = req.session.userData["email"];
            let tutorid = req.session.tutorData.email;
            let room = `${tutorid}?${userid}`;

            //Adds chatroom for tutor and student in Firebase to store messages
            if (newTutor == 'true') {
                chatrooms.get().then(snapshot => {
                    var found = false;
                    snapshot.forEach(doc => {
                        if (doc.id == room) found = true;
                    });
                    if (!found) {
                        chatrooms.doc(room).set({
                            tutor: tutorid,
                            student: userid,
                            subject: req.session.chosenSubject,
                            chats: []
                        });
                    }
                }).catch(err => {
                    console.log('Error getting document', err);
                });
            }

            async function renderMessageBoard() {
                try {
                    req.session.tutorChatData = await getChatData(userid, 'student', 'tutor');
                    if (req.session.userData["userType"] == "Registered Tutor") {
                        req.session.studentChatData = await getChatData(userid, 'tutor', 'student');
                        res.render("messageBoard", {
                            title: "Message Board",
                            userData: req.session.userData,
                            tutorChatData: req.session.tutorChatData,
                            studentChatData: req.session.studentChatData
                        });
                    } else {
                        res.render("messageBoard", {
                            title: "Message Board",
                            userData: req.session.userData,
                            tutorChatData: req.session.tutorChatData,
                            studentChatData: req.session.userData['userType']
                        });
                    }
                } catch(err) {
                    console.log(err);
                }
            }
            renderMessageBoard();
        } else {
            res.redirect("/");
        }
    },
    deleteUser: function(req, res) {

    }
}

function getChatData(id, type, pfpType) {
    return new Promise (async (resolve, reject) => {
        try {
            const snapshot = await chatrooms.where(`${type}`, '==', `${id}`).get();
            var rooms = [];
            snapshot.forEach(chatroom => {
                rooms.push({ 'id': chatroom.id, 'data': chatroom.data() });
            });
            const arr = await handleRooms(rooms, pfpType)
            resolve(arr);
            
        } catch (err) {
            reject(err);
        }
    });
}

function handleRooms(rooms, pfpType) {
    return new Promise((resolve, reject) => {
        var arr = [];
        asyncForEach(rooms, async (chatroom, index) => {
            try {
                let data = chatroom.data;
                const doc = await db.collection('users').doc(data[`${pfpType}`]).get();
                let otherData = doc.data();
                arr.push({
                    'id': chatroom.id,
                    'subject': data.subject,
                    'chats': data.chats,
                    'student': data.student,
                    'tutor': data.tutor,
                    'other': { 'first': otherData.first, 'last': otherData.last, 'profPic': otherData.prof_pic }
                });
                if (index === rooms.length -1) resolve(arr);
            } catch (err) {
                reject(err);
            }
        });
    });
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}