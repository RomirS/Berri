const expressConfig = require("./utils/expressConfig");
const serverConfig = require("./utils/serverConfig");

const app = expressConfig();
serverConfig();

const { signup, postFeedback, loginAuth, googleSignup, logout, home } = require("./src/loginActions");
const { profile, changeProfPic, toggleActiveStatus } = require("./src/profile");
const { becomeTutor, saveNewTutor } = require("./src/becomeTutorActions");
const { foundTutors, searchTutor, chooseTutor, retryTutor, tutorProfiles, noTutorFound } = require("./src/findTutorActions");
const { messageBoard, deleteUser } = require("./src/messageBoard");

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
    .post("/changeProfPic", changeProfPic)
    .post("/toggleActiveStatus", toggleActiveStatus)

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