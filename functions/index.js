const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const FieldValue = admin.firestore.FieldValue;

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.createroom = functions.https.onCall( async (data, context) =>{
    const username = data.username;
    const password = data.password;
    const type = data.type;
    var roomcode = Math.floor(100000 + Math.random() * 900000).toString() + 'a';

    let roomSnapShot = await admin.firestore().collection('rooms').doc(roomcode).get();
    while(roomSnapShot.exists){
        roomcode = Math.floor(100000 + Math.random() * 900000).toString();
        // eslint-disable-next-line no-await-in-loop
        roomSnapShot = await admin.firestore().collection('rooms').doc(roomcode).get();
    }

    await admin.firestore().collection('rooms').doc(roomcode).set({
        chat: [],
        users: [username],
        password: password,
        type: type
    })
    return {roomcode: roomcode, password: password};
})

exports.joinroom = functions.https.onCall(async (data, context) => {
    const username = data.username;
    const password = data.password;
    const roomcode = data.roomcode;
    let roomSnapShot = await admin.firestore().collection('rooms').doc(roomcode).get();
    if(!roomSnapShot.exists) return `false`;

    if(roomSnapShot.data().password !== password || roomSnapShot.data().users.length === 0) return `false`;
    let userLists = roomSnapShot.data().users;
    userLists.push(username);
    await admin.firestore().collection('rooms').doc(roomcode).update({
        users: userLists
    })
    return `true`;
});

exports.createuser = functions.https.onCall( async (data, context) => {
    const userEmail = data.email;
    const userPassword = data.password;
    let userSnapShot = await admin.firestore().collection('users').where('email', '==', userEmail).get();
    if(userSnapShot._size !== 0){
        return {status: `false`, id: ''};
    } 
    const docRef = await admin.firestore().collection('users').add({
        email: userEmail,
        password: userPassword,
        verified: 'false'
    });
    const docID = docRef.id;
    return {status: `true`, id: docID};
})

exports.handleLogin = functions.https.onCall( async (data, context) => {
    const userEmail = data.email;
    const userPassword = data.password;
    let userSnapShot = await admin.firestore().collection('users').where('email', '==', userEmail).where('password', '==', userPassword).where('verified', '==', 'true').get();
    if(userSnapShot._size === 0) return `false`;
    return `true`;
})

exports.handleVerify = functions.https.onCall( async (data, context) => {
    const userEmail = data.email;
    const userPassword = data.password;
    const userID = data.id;
    let userDoc = await admin.firestore().collection('users').doc(userID).get();
    if(userEmail !== userDoc.data().email || userPassword !== userDoc.data().password) return `false`;
    await admin.firestore().collection('users').doc(userID).update({
        verified: `true`
    });
    return `true`;
});


