const db = firebase.firestore();
var urlParams = new URLSearchParams(window.location.search);
var userSize = 1;




class Barrage {
    constructor(id) {
        this.domList = [];
        this.dom = document.querySelector('#' + id);
        if (this.dom.style.position == '' || this.dom.style.position == 'static') {
            this.dom.style.position = 'relative';
        }
        this.dom.style.overflow = 'hidden';
        let rect = this.dom.getBoundingClientRect();
        this.domWidth = rect.right - rect.left;
        this.domHeight = rect.bottom - rect.top;
    }

    shoot(text) {
        let div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = this.domWidth + 'px';
        div.style.top = (this.domHeight - 20) * +Math.random().toFixed(2) + 'px';
        div.style.whiteSpace = 'nowrap';
        div.style.color = '#' + Math.floor(Math.random() * 0xffffff).toString(16);
        div.innerText = text;
        this.dom.appendChild(div);

        let roll = (timer) => {
            let now = +new Date();
            roll.last = roll.last || now;
            roll.timer = roll.timer || timer;
            let left = div.offsetLeft;
            let rect = div.getBoundingClientRect();
            if (left < (rect.left - rect.right)) {
                this.dom.removeChild(div);
            } else {
                if (now - roll.last >= roll.timer) {
                    roll.last = now;
                    left -= 3;
                    div.style.left = left + 'px';
                }
                requestAnimationFrame(roll);
            }
        }
        roll(50 * +Math.random().toFixed(2));
    }

}

let barage = new Barrage('content');


async function init(){
    const getRoomInfo = firebase.functions().httpsCallable('getRoomInfo');
    let roomInfo = await getRoomInfo({specialCode: urlParams.get('id')});
    console.log(roomInfo);
    document.getElementById('roomInfo').innerHTML = 'Room Number:' + roomInfo.data.roomID + ' & Room Password: ' + roomInfo.data.roomPassword;
    if(roomInfo.data.url !== ''){
        let video_id = roomInfo.data.url.substring(32);
        document.getElementById('video').src = 'https://www.youtube.com/embed/' + video_id;
    } else {
        alert('you can enter an youtube url to watch youtube video here');
    }
    if(getCookie('mode') !== '0'){
        document.getElementById('mode').checked = true;
        document.documentElement.classList.toggle('dark-mode');
      }
}

document.getElementById('mode').addEventListener('click', function(){
    mode = mode === 1 ? 0 : 1;
    document.cookie = "mode=" + mode;
    document.documentElement.classList.toggle('dark-mode');
})

async function handleURLSubmit(){
    var message = document.getElementById('yturl').value;
    if(message === ''){
        alert('pls input a url');
        return;
    }
    if(message.slice(0,32) !== 'https://www.youtube.com/watch?v=' || message.length <= 32){
        alert('pls input a valid url');
        return;
    }
    console.log(document.getElementById('video').src);
    if(document.getElementById('video').src !== 'about:blank'){
        $('#myModal').modal('show');
        return;
    }
    document.getElementById('yturl').value = '';
    const insertVideo = firebase.functions().httpsCallable('insertVideo');
    await insertVideo({specialCode: urlParams.get('id'), url: message});
}

document.getElementById('submitURL').addEventListener('click', async function(){
    $('#myModal').modal('hide')
    var url = document.getElementById('yturl').value;
    const insertVideo = firebase.functions().httpsCallable('insertVideo');
    document.getElementById('yturl').value = '';
    await insertVideo({specialCode: urlParams.get('id'), url: url});
})

document.getElementById('urlText').addEventListener('click', handleURLSubmit);

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.replace(/\s+/g, '').split(';');
    for(var i=0; i<ca.length; i++) {
       var c = ca[i];
       
       if(c.indexOf(name) == 0)
          return c.substring(name.length,c.length);
    }
    return "";
}


async function handleMessage(){
    // push message to database.

    var username = getCookie('username');
    var message = document.getElementById('chat').value;
    if(message === ''){
        alert('pls input message');
        return;
    }
    document.getElementById('chat').value = '';
    const insertMessage = firebase.functions().httpsCallable('insertMessage');
    await insertMessage({specialCode: urlParams.get('id'), message: message, username: username});

}

function runScript(e) {
    if (e.keyCode == 13) {
        handleMessage();
        return false;
    }
}

function runEnter(event){
    if (event.keyCode == 13) {
        handleURLSubmit();
        return false;
    }
}

document.getElementById('pushChat').addEventListener('click', handleMessage);

db.collection('chats').where('specialCode', '==', urlParams.get('id'))
    .onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            console.log(change);
            if (change.type === "modified") {
                
                let doc = change.doc;
                let newMessage = doc.data().chat[doc.data().chat.length - 1];
                let currentChat = document.getElementById('chatroom').value;
                let newChat;
                barage.shoot(newMessage.message);
                if(currentChat === '') newChat = newMessage.sender + ':\n\t' + newMessage.message;
                else newChat = currentChat + '\n' + newMessage.sender + ':\n\t' + newMessage.message;
                document.getElementById('chatroom').value = newChat;
            }
        });
    });

db.collection('rooms').where('specialCode', '==', urlParams.get('id'))
    .onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            if (change.type === "modified") { 
                console.log(change.doc.data().users.length);
                console.log(userSize);
                if(change.doc.data().users.length > userSize){
                    let doc = change.doc;
                    let newUser = doc.data().users[doc.data().users.length - 1];
                    let currentChat = document.getElementById('chatroom').value;
                    let newChat;
                    if(currentChat === '') newChat = newUser + ' has joined the room.';
                    else newChat = currentChat + '\n' + newUser + ' has joined the room.';
                    document.getElementById('chatroom').value = newChat;
                    userSize = doc.data().users.length;
                } 
            }
        });
    });


db.collection('videos').where('specialCode', '==', urlParams.get('id'))
    .onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            if (change.type === "modified") { 
                let video_id = change.doc.data().url.substring(32);
                document.getElementById('video').src = 'https://www.youtube.com/embed/' + video_id;
            }
        });
    });


init();

