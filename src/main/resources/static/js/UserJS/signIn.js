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
        const response = await fetch('/api/users/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(signInDto)
        });

        const data = await response.json();

        if (response.ok && data.status) {
            // Success - Determine where to redirect
            const queryParams = new URLSearchParams(window.location.search);
            const urlRedirect = queryParams.get('redirect');
            const sessionRedirect = sessionStorage.getItem('postLoginRedirect');
            
            // Prioritize URL parameter then sessionStorage
            let redirectUrl = urlRedirect || sessionRedirect;
            
            if (redirectUrl) {
                // Clear the temporary storage
                sessionStorage.removeItem('postLoginRedirect');
                
                // Decode if it's double encoded for some reason
                try {
                   if (redirectUrl.includes('%')) {
                       redirectUrl = decodeURIComponent(redirectUrl);
                   }
                } catch(e) {}

                // If not absolute and not external, make it absolute from site root
                if (!redirectUrl.startsWith('/') && !redirectUrl.startsWith('http')) {
                    redirectUrl = '/' + redirectUrl;
                }

                console.log("Redirecting to: " + redirectUrl);
                window.location.href = redirectUrl;
            } else {
                console.log("No redirect found, going to home.html");
                window.location.href = "home.html";
            }
        } else {
            // Failed
            alert(data.message || "Sign In Failed!");
        }
    } catch (error) {
        console.error("Error during sign in:", error);
        alert("An error occurred while connecting to the server.");
    }
}
