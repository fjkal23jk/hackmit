
let mode = getCookie('mode');
document.getElementById('joinroom').addEventListener('click', async function(){
    const username = document.getElementById('inputUserName').value;
    const roomcode = document.getElementById('inputRoomNumber').value;
    const password = document.getElementById('inputPassword').value;
    if(username === '' || password === '' || roomcode === '') {
        alert('input everything');
        return;
    }
    const joinroom = firebase.functions().httpsCallable('joinroom');
    let joinRes = await joinroom({roomcode: roomcode, username: username, password: password});
    if(joinRes.data === 'false'){
        alert('incorrect room/password or not exist');
    } else {
        document.cookie = "username="+ username +"; path=/chatroom";
        window.location.replace("https://hackmit-ec262.web.app/chatroom/?id="+joinRes.data.specialCode);
    }

})

document.getElementById('createroom').addEventListener('click', async function(){
    const username = document.getElementById('inputNewUserName').value;
    const password = document.getElementById('inputNewRoomPassword').value;
    if(username === '' || password === '' ) {
        alert('input everything');
        return;
    }
    const createroom = firebase.functions().httpsCallable('createroom');
    let createRes = await createroom({username: username, password: password});
    document.cookie = "username="+ username +"; path=/chatroom";
    window.location.replace("https://hackmit-ec262.web.app/chatroom/?id="+createRes.data.specialCode);
})

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

  if(getCookie('mode') !== '0'){
    document.getElementById('mode').checked = true;
    document.documentElement.classList.toggle('dark-mode');
  }

  document.getElementById('mode').addEventListener('click', function(){
    mode = mode === 0 ? 1 : 0;
    document.cookie = "mode=" + mode;
    document.documentElement.classList.toggle('dark-mode');
})
