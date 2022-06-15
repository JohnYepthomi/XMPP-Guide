function loginView(root){
    let login_template = `
        <div class="login-container">
            <div class="login-header">
                <h3>Piperchat</h3>
            </div>
            <div class="login-body">
                <h5> Login to Piperchat </h5>
                <div class="login-form">
                    <div class="login-form-input">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" placeholder="enter your user id">
                    </div>
                    <div class="login-form-input">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="enter your password">
                    </div>
                    <div class="login-form-input">
                        <button id="login-button">Login</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    root.innerHTML = login_template;

    let login_button = document.querySelector('#login-button');
    login_button.addEventListener('click', () => {
        let username = document.querySelector('#username').value;
        let password = document.querySelector('#password').value;

        initXmpp({username, password}, successCallback, failureCallback);
    });

    function successCallback(){
        root.innerHTML = '';
        viewNavigator('home');
        console.log('login success');
    }

    function failureCallback(){
        console.log('failure');
    }
}