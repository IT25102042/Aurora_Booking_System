async function signIn() {
    const email = document.getElementById('signInEmail').value.trim();
    const password = document.getElementById('signInPassword').value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    const signInDto = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('http://localhost:8080/api/users/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(signInDto)
        });

        const data = await response.json();

        if (response.ok && data.status) {
            // Success
            window.location.href = "home.html";
        } else {
            // Failed
            alert(data.message || "Sign In Failed!");
        }
    } catch (error) {
        console.error("Error during sign in:", error);
        alert("An error occurred while connecting to the server.");
    }
}
