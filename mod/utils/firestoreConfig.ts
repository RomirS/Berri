import firebase from 'firebase';
import admin from 'firebase-admin';
// for romir: 
import serviceAccount from '../serviceAccountKey.json';

// for sohan:
// const serviceAccount = require("C:/Users/rayha/Desktop/serviceAccountKey.json");

type ServiceAccount = {
    type: string, 
    projectId: string, 
    privateKeyId: string, 
    privateKey: string, 
    clientEmail: string, 
    clientId: string, 
    authUri: string, 
    tokenUri: string, 
    authProviderX509CertUrl: string, 
    clientC509CertUrl: string
}

const params: ServiceAccount = {
    type: serviceAccount.type,
    projectId: serviceAccount.project_id,
    privateKeyId: serviceAccount.private_key_id,
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
    clientId: serviceAccount.client_id,
    authUri: serviceAccount.auth_uri,
    tokenUri: serviceAccount.token_uri,
    authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
    clientC509CertUrl: serviceAccount.client_x509_cert_url
}

admin.initializeApp({
    credential: admin.credential.cert(params),
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

export function Firestore(): FirebaseFirestore.Firestore {
    return admin.firestore()
}