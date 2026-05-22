document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch('/api/users/check-session', { credentials: 'include' });
        const data = await response.json();
        
        if (data.status && data.user) {
            window.currentUser = data.user; // Set global user object
            const welcomeUserText = document.getElementById("welcomeUserText");
            const navSignIn = document.getElementById("navSignIn");
            const navSignUp = document.getElementById("navSignUp");
            const navSignOut = document.getElementById("navSignOut");

            if (welcomeUserText) welcomeUserText.innerHTML = `Welcome ${data.user.firstName}`;
            if (navSignIn) navSignIn.style.display = "none";
            if (navSignUp) navSignUp.style.display = "none";
            if (navSignOut) navSignOut.style.display = "block";
        } else {
            window.currentUser = null;
        }
    } catch (e) {
        console.error("Global Navbar session check failed", e);
        window.currentUser = null;
    }

    // Centralized redirection for protected navbar links
    const protectedLinks = [
        { selector: 'a[href="myAccount.html"]', redirect: '/myAccount.html' },
        { selector: 'a[href="wishlist.html"]', redirect: '/wishlist.html' }
    ];

    protectedLinks.forEach(link => {
        const elements = document.querySelectorAll(link.selector);
        elements.forEach(el => {
            el.addEventListener('click', function(e) {
                if (!window.currentUser) {
                    e.preventDefault();
                    sessionStorage.setItem('postLoginRedirect', link.redirect);
                    window.location.href = `signIn.html?redirect=${link.redirect}`;
                }
            });
        });
    });
});

async function signOut() {
    try {
        const response = await fetch('/api/users/signout', { method: 'POST', credentials: 'include' });
        const data = await response.json();
        if (data.status) {
            window.location.href = "home.html";
        }
    } catch (error) {
        console.error("Error signing out:", error);
    }
}
