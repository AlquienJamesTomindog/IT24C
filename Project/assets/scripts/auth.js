const USER = { username: "admin", password: "12345" };

function login(event) {
    event.preventDefault();

    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === USER.username && pass === USER.password) {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "dashboard.html";
    } else {
        alert("Incorrect username or password!");
    }
}

function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
}

function checkAuth() {
    if (!localStorage.getItem("loggedIn")) {
        window.location.href = "index.html";
    }
}
