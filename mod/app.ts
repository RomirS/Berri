import { ChatServer } from './utils/chatServer';
import { Socket } from './utils/socketConfig';

let chatServer = new ChatServer();
let app = chatServer.getApp();
let io = chatServer.getIo();
new Socket(io);

import { signup, postFeedback, googleSignup, loginAuth, logout, home } from './src/loginActions';
import { profile, toggleActiveStatus, newPfp } from './src/profile';
import { becomeTutor, saveNewTutor } from './src/becomeTutorActions';
import { foundTutors, searchTutor, chooseTutor, retryTutor, tutorProfiles, noTutorFound } from './src/findTutorActions';
import { messageBoard, deleteUser } from './src/messageBoard';
import { readyVideo, videoChat } from './src/videoChat';

//Logins
app
.get('/signup', signup)
.post('/postFeedback', postFeedback)
.post('/loginAuth', loginAuth)
.post('/googleSignup', googleSignup)
.post('/logout', logout)
.get('/', home)

//Profile setup
.get('/profile', profile)
.get('/becomeTutor', becomeTutor)
.post('/saveNewTutor', saveNewTutor)
.post("/toggleActiveStatus", toggleActiveStatus)
.post("/newPfp", newPfp)

//Find tutor
.get('/foundTutors', foundTutors)
.get('/chooseTutor', chooseTutor)
.get('/retryTutor', retryTutor)
.get('/tutorProfiles', tutorProfiles)
.get('/noTutorFound', noTutorFound)
.get('/searchTutor', searchTutor)

//Message Board
.post('/messageBoard', messageBoard)
.post('/deleteUser', deleteUser)

//VideoChat
.post('/readyVideo', readyVideo)
.get('/videoChat', videoChat)