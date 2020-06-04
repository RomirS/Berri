import { Firestore } from '../utils/firestoreConfig';
import { Request, Response } from 'express';
import { formatMessage } from '../helpers/message'
const db = Firestore();
let chatrooms = db.collection('chatrooms');

export function messageBoard(req: Request, res: Response): void {
    const session = req.session as Express.Session;
    if (session.loggedin) {
        let newTutor = req.body.newTutor;
        let userid = session.userData["email"];

        //Adds chatroom for tutor and student in Firebase to store messages
        if (newTutor == 'true') {
            let tutorid = session.tutorUserData.email;
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
                        subject: session.chosenSubject,
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
                session.tutorChatData = await getChatData(userid, 'student', 'tutor');
                if (session.userData["userType"] == "Registered Tutor") {
                    session.studentChatData = await getChatData(userid, 'tutor', 'student');
                    res.render("messageBoard", {
                        title: "Message Board",
                        userData: session.userData,
                        tutorChatData: session.tutorChatData,
                        studentChatData: session.studentChatData
                    });
                } else {
                    res.render("messageBoard", {
                        title: "Message Board",
                        userData: session.userData,
                        tutorChatData: session.tutorChatData,
                        studentChatData: session.userData['userType']
                    });
                }
            } catch (err) {
                console.log(err);
            }
        }

    } else {
        res.redirect("/");
    }
}

export function deleteUser(req: Request, res: Response): void {
    const session = req.session as Express.Session;
}

function getChatData(id: string, type: string, pfpType: string) {
    return new Promise(async(resolve, reject) => {
        try {
            const snapshot = await chatrooms.where(`${type}`, '==', `${id}`).get();
            var rooms: {id: string, data: any}[] = [];
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

function handleRooms(rooms: {id: string, data: any}[], pfpType: string) {
    return new Promise((resolve, reject) => {
        var arr: {id: string, subject: string, chats: any, student: string, tutor: string, other: {first: string, last: string, profPic: string} }[] = [];
        asyncForEach(rooms, async(chatroom: {id: string, data: any}) => {
            try {
                let data = chatroom.data;
                const doc = await db.collection('users').doc(data[`${pfpType}`]).get();
                let otherData = doc.data() as FirebaseFirestore.DocumentData;
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

async function asyncForEach(array: any[], callback: (item: any, index: number, array: any[]) => void) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}