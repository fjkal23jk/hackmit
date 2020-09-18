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
        alert('joined successfully');
    }

})

document.getElementById('createroom').addEventListener('click', async function(){
    const username = document.getElementById('inputNewUserName').value;
    const password = document.getElementById('inputNewRoomPassword').value;
    const rbs = document.querySelectorAll('input[name="optradio"]');
    let selectedValue;
    for (const rb of rbs) {
        console.log(rb.value);
        if (rb.checked) {
            selectedValue = rb.value;
            break;
        }
    }
    console.log(selectedValue);
    if(username === '' || password === '' ) {
        alert('input everything');
        return;
    }
    const createroom = firebase.functions().httpsCallable('createroom');
    let createRes = await createroom({username: username, password: password, type: selectedValue});
    console.log(createRes);
    alert('create room successfully');
})