const firebase = require("firebase");
const admin = require("firebase-admin");
// for romir: 
// const serviceAccount = require("/Users/romirsingla/Desktop/serviceAccountKey.json");

// for sohan:
const serviceAccount = require("/Users/romirsingla/Desktop/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://berri-c0bb3.firebaseio.com"
});

firebase.initializeApp({
    apiKey: "AIzaSyD0HmBdRKbpexLH-Z9dk16gjf_9i20-KaY",
    authDomain: "berri-c0bb3.firebaseapp.com",
    databaseURL: "https://berri-c0bb3.firebaseio.com",
    projectId: "berri-c0bb3",
    storageBucket: "berri-c0bb3.appspot.com",
    messagingSenderId: "787660474330",
    appId: "1:787660474330:web:26e867d764bd464f1e62e3",
    measurementId: "G-BB398RGVHB"
});

module.exports = function() { return admin.firestore(); }