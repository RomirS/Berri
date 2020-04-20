const firebase = require('firebase');

function logout(req, res) {
    console.log("LOGGING OUT");
    req.session.loggedin = false;
    firebase.auth().signOut();
    res.redirect("/")
}

module.exports = logout;