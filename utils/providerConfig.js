const firebase = require("firebase");
const provider = new firebase.auth.GoogleAuthProvider();

provider.setCustomParameters({
    prompt: 'select_account consent'
});

module.exports = function(){ return provider; }