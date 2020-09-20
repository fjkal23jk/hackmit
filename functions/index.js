const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const FieldValue = admin.firestore.FieldValue;
const { v4: uuidv4 } = require('uuid');


exports.getChatInfo = functions.https.onCall( async (data, context) => {
    const specialCode = data.specialCode;
    let roomSnapShot = await admin.firestore().collection('rooms').where('specialCode', '==', specialCode).get();
    let roomID = '';
    roomSnapShot.forEach(doc => {
        roomID = doc.id;
    });
    let chatRef = await admin.firestore().collection('chats').doc(roomID).get();
    let chat = chatRef.data().chat;
    return {chat: chat};
});

exports.getRoomInfo = functions.https.onCall( async (data, context) => {
    const specialCode = data.specialCode;
    let roomSnapShot = await admin.firestore().collection('rooms').where('specialCode', '==', specialCode).get();
    let roomID = '';
    roomSnapShot.forEach(doc => {
        roomID = doc.id;
    });
    let roomRef = await admin.firestore().collection('rooms').doc(roomID).get();
    let videoRef = await admin.firestore().collection('videos').doc(roomID).get();
    let roomPassword = roomRef.data().password;
    return {roomID: roomID, roomPassword: roomPassword, url: videoRef.data().url};
})


exports.removeUser = functions.https.onCall( async (data, context) => {
    const username = data.username;
    const specialCode = data.specialCode;
    let roomSnapShot = await admin.firestore().collection('rooms').where('specialCode', '==', specialCode).get();
    let roomID = '';
    roomSnapShot.forEach(doc => {
        roomID = doc.id;
    });
    let roomRef = await admin.firestore().collection('rooms').doc(roomID).get();
    let users = roomRef.data().users;
    for(let i = 0; i < users.length; i++){
        if(username === users[i]){
            users.splice(i, 1);
            break;
        }
    }
    let leavers = roomRef.data().leavers;
    leavers.push(username);
    await admin.firestore().collection('rooms').doc(roomID).update({
        users: users,
        leavers: leavers
    })
    return `true`;
})


exports.insertMessage = functions.https.onCall(async (data, context) => {
    const message = data.message;
    const specialCode = data.specialCode;
    const username = data.username;

    let roomSnapShot = await admin.firestore().collection('rooms').where('specialCode', '==', specialCode).get();
    let roomID = '';
    roomSnapShot.forEach(doc => {
        roomID = doc.id;
    });

    let roomRef = await admin.firestore().collection('chats').doc(roomID).get();
    let chat = roomRef.data().chat;

    chat.push({sender: username, message: message});
    await admin.firestore().collection('chats').doc(roomID).update({
        chat: chat
    });

    return `true`;
})


exports.insertVideo = functions.https.onCall( async (data, context) => {
    const specialCode = data.specialCode;
    const url = data.url;
    let roomSnapShot = await admin.firestore().collection('rooms').where('specialCode', '==', specialCode).get();
    let roomID = '';
    roomSnapShot.forEach(doc => {
        roomID = doc.id;
    });
    await admin.firestore().collection('videos').doc(roomID).update({
        url: url
    }); 
    return `true`;
})

exports.createroom = functions.https.onCall( async (data, context) =>{
    const username = data.username;
    const password = data.password;
    var roomcode = Math.floor(100000 + Math.random() * 900000).toString() + 'a';

    let roomSnapShot = await admin.firestore().collection('rooms').doc(roomcode).get();
    while(roomSnapShot.exists){
        roomcode = Math.floor(100000 + Math.random() * 900000).toString();
        // eslint-disable-next-line no-await-in-loop
        roomSnapShot = await admin.firestore().collection('rooms').doc(roomcode).get();
    }
    const specialCode = uuidv4();
    await admin.firestore().collection('rooms').doc(roomcode).set({
        users: [username],
        leavers: [],
        password: password,
        specialCode: specialCode
    });
    await admin.firestore().collection('chats').doc(roomcode).set({
        chat: [],
        specialCode: specialCode
    })

    await admin.firestore().collection('videos').doc(roomcode).set({
        url: '',
        specialCode: specialCode
    })
    return {specialCode: specialCode, password: password};
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
    return {specialCode: roomSnapShot.data().specialCode};
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





