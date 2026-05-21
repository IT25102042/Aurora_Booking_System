document.addEventListener("DOMContentLoaded", function () {
    loadGenders();
});

function loadGenders() {
    fetch('http://localhost:8080/api/users/genders')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('regGender');
            if (select) {
                // Keep the first option (Select Gender)
                select.innerHTML = '<option value="" disabled selected>Select Gender</option>';
                data.forEach(item => {
                    select.innerHTML += `<option value="${item.id}">${item.gender}</option>`;
                });
            }
        })
        .catch(error => console.error('Error loading genders:', error));
}

function signUp() {
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const mobile = document.getElementById('regMobile').value.trim();
    const genderId = document.getElementById('regGender').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const terms = document.getElementById('terms').checked;

    // --- Frontend Validation ---
    if (!firstName || !lastName || !email || !mobile || !genderId || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (!terms) {
        alert("You must agree to the Terms & Privacy policy.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    if (mobile.length !== 10 || isNaN(mobile)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    const userDto = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        mobile: mobile,
        genderId: parseInt(genderId),
        password: password,
        confirmPassword: confirmPassword
    };

    fetch('http://localhost:8080/api/users/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userDto)
    })
    .then(async response => {
        const message = await response.text();
        if (response.ok) {
            alert("Success: " + message);
            window.location.href = "signIn.html";
        } else {
            throw new Error(message || "Registration failed");
        }
    })
    .catch(error => {
        console.error('Error during signup:', error);
        alert("Error: " + error.message);
    });
}
