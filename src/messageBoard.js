const db = require("../utils/firebaseConfig")();
let chatrooms = db.collection('chatrooms');
let formatMessage = require("../helpers/message").formatMessage;

module.exports = {
    messageBoard: function(req, res) {
        if (req.session.loggedin) {
            let newTutor = req.body.newTutor;
            let userid = req.session.userData["email"];

            //Adds chatroom for tutor and student in Firebase to store messages
            if (newTutor == 'true') {
                let tutorid = req.session.tutorUserData.email;
                let room = `${tutorid}?${userid}`;
                chatrooms.get().then(snapshot => {
                    var found = false;
                    snapshot.forEach(doc => {
                        if (doc.id == room) found = true;
                    });
                    if (!found) {
                        let firstChat = formatMessage(room, '?', '')
                        chatrooms.doc(room).set({
                            tutor: tutorid,
                            student: userid,
                            subject: req.session.chosenSubject,
                            chats: [{
                                chat: firstChat.chat,
                                sender: firstChat.sender,
                                time: firstChat.time,
                                status: firstChat.status
                            }]
                        });
                    }
                }).then( () => {
                    renderMessageBoard();
                }).catch(err => {
                    console.log('Error getting document', err);
                });
            } else {
                renderMessageBoard();
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
                } catch (err) {
                    console.log(err);
                }
            }

        } else {
            res.redirect("/");
        }
    },
    deleteUser: function(req, res) {

    }
}

function getChatData(id, type, pfpType) {
    return new Promise(async(resolve, reject) => {
        try {
            const snapshot = await chatrooms.where(`${type}`, '==', `${id}`).get();
            var rooms = [];
            snapshot.forEach(chatroom => {
                rooms.push({ 'id': chatroom.id, 'data': chatroom.data() });
            });
            const arr = await handleRooms(rooms, pfpType);
            resolve(arr);
        } catch (err) {
            reject(err);
        }
    });
}

function handleRooms(rooms, pfpType) {
    return new Promise((resolve, reject) => {
        var arr = [];
        asyncForEach(rooms, async(chatroom) => {
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
            } catch (err) {
                reject(err);
            }
        }).then(() => {
            resolve(arr);
        }).catch(err => {
            console.log(err)
        });
    });
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}