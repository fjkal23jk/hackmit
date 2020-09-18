// get query string
document.getElementById('signin').addEventListener('click', async function(){
    var urlParams = new URLSearchParams(window.location.search);
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;
    if(urlParams.get('id') === null){
        const handleLogin = firebase.functions().httpsCallable('handleLogin');
        let loginRes = await handleLogin({email: email, password: password});
        if(loginRes.data === 'false'){
            alert('wrong email/password');
        } else {
            // redirect 
            
            window.location.replace("http://localhost:5000/home.html");
        }
    } else {
        const handleVerify = firebase.functions().httpsCallable('handleVerify');
        let verifyRes = await handleVerify({id: urlParams.get('id'), email: email, password: password});
        if(verifyRes.data === 'false'){
            alert('wrong email/password');
        } else {
            
            window.location.replace("http://localhost:5000/home.html");
        }
    }
});


document.getElementById('signup').addEventListener('click', async function(){
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;
    const subEmail = email.substring(email.length-4);
    var n = email.indexOf('@');
    var periodIndex = email.indexOf('.');
    console.log()
    if(subEmail !== '.edu' || periodIndex === -1 || n < 1){
        alert('must be a valid .edu email');
        return;
    } 
    const createuser = firebase.functions().httpsCallable('createuser');
    let createResult = await createuser({email: email, password: password});
    console.log(createResult);
    if(createResult.data.status === 'true'){
        const actionCodeSettings = {
            // URL you want to redirect back to. The domain (www.example.com) for
            // this URL must be whitelisted in the Firebase Console.
            url: 'http://localhost:5000/?id='+createResult.data.id,
            // This must be true for email link sign-in.
            handleCodeInApp: true,
            
          };
          firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
            .then(function() {
                // The link was successfully sent. Inform the user.
                // Save the email locally so you don't need to ask the user for it again
                // if they open the link on the same device.
                alert('email has been sent to ' + email);
            })
            .catch(function(error) {
                // Some error occurred, you can inspect the code: error.code
                console.log(error);
            });
    } else {    
        alert('email already exists');
    }
});