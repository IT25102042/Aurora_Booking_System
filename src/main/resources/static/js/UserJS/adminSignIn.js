document.addEventListener("DOMContentLoaded", function () {
    const adminSignInBtn = document.getElementById("adminSignInBtn");
    const adminLogoutBtn = document.getElementById("adminLogoutBtn");

    // Check if we are on the Admin Sign-In page
    if (adminSignInBtn) {
        adminSignInBtn.addEventListener("click", adminSignIn);
    }

    // Check if we are on the Admin Panel
    if (window.location.pathname.includes("adminPanel.html")) {
        checkAdminSession();
    }

    // Attach logout listener if button exists
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            adminLogout();
        });
    }
});

async function adminSignIn() {
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch('/api/users/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.status) {
            // Check session to verify role
            const sessionResp = await fetch('/api/users/check-session');
            const sessionData = await sessionResp.json();

            if (sessionData.status && sessionData.user.userType === 'Admin') {
                window.location.href = "adminPanel.html";
            } else {
                alert("Permission Denied: Only Admins can access this panel.");
                await fetch('/api/users/signout', { method: 'POST' }); // Clear non-admin session
            }
        } else {
            alert(data.message || "Invalid credentials!");
        }
    } catch (error) {
        console.error("Error during admin sign-in:", error);
        alert("An error occurred. Please try again.");
    }
}

async function checkAdminSession() {
    try {
        const response = await fetch('/api/users/check-session');
        const data = await response.json();

        if (data.status && data.user && data.user.userType === 'Admin') {
            updateAdminUI(data.user);
        } else {
            window.location.href = "adminSignInAuth.html";
        }
    } catch (error) {
        console.error("Error checking admin session:", error);
        window.location.href = "adminSignInAuth.html";
    }
}

function updateAdminUI(user) {
    const fullNameEl = document.getElementById("adminFullName");
    const emailEl = document.getElementById("adminEmailText");
    const avatarEl = document.getElementById("adminAvatar");

    if (fullNameEl) fullNameEl.innerText = `${user.firstName} ${user.lastName}`;
    if (emailEl) emailEl.innerText = user.email;
    if (avatarEl) {
        // Initials for avatar
        avatarEl.innerText = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
        
        // Try to load user image if exists (usually image1.png in folder id)
        const img = new Image();
        img.src = `/user_images/${user.id}/image1.png?v=${new Date().getTime()}`;
        img.onload = function() {
            avatarEl.style.backgroundImage = `url(${img.src})`;
            avatarEl.style.backgroundSize = 'cover';
            avatarEl.style.backgroundPosition = 'center';
            avatarEl.innerText = ''; // Clear initials if image loads
        };
    }
}

async function adminLogout() {
    try {
        const response = await fetch('/api/users/signout', { method: 'POST' });
        const data = await response.json();
        if (data.status) {
            window.location.href = "adminSignInAuth.html";
        }
    } catch (error) {
        console.error("Error signing out admin:", error);
        alert("Logout failed. Please try again.");
    }
}
