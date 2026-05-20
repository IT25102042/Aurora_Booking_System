document.addEventListener("DOMContentLoaded", function () {
    getUserData();
});

async function getUserData() {
    try {
        const response = await fetch('http://localhost:8080/api/users/check-session', { credentials: 'include' });
        const data = await response.json();
        
        if (data.status && data.user) {
            const user = data.user;
            
            // Update Dropdown
            document.getElementById("welcomeUserText").innerHTML = `Welcome ${user.firstName}`;
            document.getElementById("navSignIn").style.display = "none";
            document.getElementById("navSignUp").style.display = "none";
            document.getElementById("navSignOut").style.display = "block";

            // Update Sidebar
            document.getElementById("sidebarName").innerHTML = `${user.firstName} ${user.lastName}`;
            document.getElementById("sidebarEmail").innerHTML = user.email;

            // Update Profile Tab
            document.getElementById("profileName").innerHTML = `${user.firstName} ${user.lastName}`;
            document.getElementById("profileEmail").innerHTML = user.email;
            document.getElementById("profilePhone").innerHTML = user.mobile;
            
            const sinceDate = new Date(user.createdAt);
            document.getElementById("profileMemberSince").innerHTML = sinceDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            // Populate Settings Tab
            document.getElementById("settingsFirstName").value = user.firstName;
            document.getElementById("settingsLastName").value = user.lastName;
            document.getElementById("settingsEmail").value = user.email;
            document.getElementById("settingsMobile").value = user.mobile;

            // Update Sidebar Avatar
            const avatarImg = document.getElementById("sidebarAvatar");
            avatarImg.src = `http://localhost:8080/user_images/${user.id}/image1.png?t=${new Date().getTime()}`;
            avatarImg.onerror = function() {
                this.src = 'https://www.w3schools.com/howto/img_avatar.png'; // Fallback avatar
            };

        } else {
            // Not logged in
            window.location.href = "signIn.html";
        }
    } catch (error) {
        console.error("Error getting user data:", error);
        window.location.href = "signIn.html";
    }
}

async function updateAccountDetails() {
    const firstName = document.getElementById("settingsFirstName").value.trim();
    const lastName = document.getElementById("settingsLastName").value.trim();
    const email = document.getElementById("settingsEmail").value.trim();
    const mobile = document.getElementById("settingsMobile").value.trim();
    const imageFile = document.getElementById("settingsImage").files[0];

    if (!firstName || !lastName || !email || !mobile) {
        alert("Please fill all account details.");
        return;
    }

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("mobile", mobile);
    if (imageFile) {
        formData.append("image", imageFile);
    }

    try {
        const response = await fetch('http://localhost:8080/api/users/update-profile', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();
        if (data.status) {
            alert("Account details updated successfully!");
            getUserData(); // Refresh data
        } else {
            alert(data.message || "Update failed!");
        }
    } catch (error) {
        console.error("Error updating account:", error);
        alert("An error occurred during update.");
    }
}

async function updatePassword() {
    const currentPassword = document.getElementById("settingsCurrentPassword").value;
    const newPassword = document.getElementById("settingsNewPassword").value;
    const confirmPassword = document.getElementById("settingsConfirmPassword").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Please fill all password fields.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("New passwords do not match!");
        return;
    }

    const passwordData = {
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword
    };

    try {
        const response = await fetch('http://localhost:8080/api/users/update-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(passwordData)
        });

        const data = await response.json();
        if (data.status) {
            alert("Password updated successfully!");
            // Clear fields
            document.getElementById("settingsCurrentPassword").value = "";
            document.getElementById("settingsNewPassword").value = "";
            document.getElementById("settingsConfirmPassword").value = "";
        } else {
            alert(data.message || "Password update failed!");
        }
    } catch (error) {
        console.error("Error updating password:", error);
        alert("An error occurred during password update.");
    }
}

async function signOut() {
    try {
        const response = await fetch('http://localhost:8080/api/users/signout', { method: 'POST', credentials: 'include' });
        const data = await response.json();
        
        if (data.status) {
            window.location.href = "home.html";
        }
    } catch (error) {
        console.error("Error signing out:", error);
    }
}

// Load Booking History
async function loadBookingHistory(userId) {
    try {
        const response = await fetch('http://localhost:8080/api/appointments/user/${userId}', { credentials: 'include' });
        const appointments = await response.json();

        // Get the booking items container
        const bookingsTab = document.getElementById("bookings");
        const bookingsContainer = bookingsTab.querySelector('.account-card');

        // Clear existing hardcoded booking items
        const existingItems = bookingsContainer.querySelectorAll('.booking-item');
        existingItems.forEach(item => item.remove());

        // If no appointments, show a message
        if (!appointments || appointments.length === 0) {
            const noAppointmentsMsg = document.createElement('div');
            noAppointmentsMsg.className = 'no-appointments-message';
            noAppointmentsMsg.innerHTML = '<p>No appointments yet. <a href="booking.html">Book an appointment</a></p>';
            bookingsContainer.appendChild(noAppointmentsMsg);
            return;
        }

        // Sort appointments by date (most recent first)
        appointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

        // Create booking items for each appointment
        appointments.forEach(appointment => {
            const bookingItem = createBookingItem(appointment);
            bookingsContainer.appendChild(bookingItem);
        });

    } catch (error) {
        console.error("Error loading booking history:", error);
    }
}

// Create a booking item element
function createBookingItem(appointment) {
    const bookingItem = document.createElement('div');
    bookingItem.className = 'booking-item';

    // Format date and time
    const appointmentDate = new Date(appointment.appointmentDate);
    const dateStr = appointmentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    const timeStr = appointment.startTime || 'TBD';

    // Get status badge class
    const statusClass = getStatusClass(appointment.appointmentStatus);

    // Only show Review button for completed appointments
    const isCompleted = appointment.appointmentStatus && appointment.appointmentStatus.toLowerCase() === 'completed';
    const reviewButton = isCompleted
        ? `<button class="btn-add-review" onclick="openReviewModal('${appointment.id}', '${appointment.serviceName}')">Add Review</button>`
        : '';

    bookingItem.innerHTML = `
        <div>
            <div class="booking-service">${appointment.serviceName}</div>
            <div class="booking-date">${dateStr} · ${timeStr}</div>
        </div>
        <div class="booking-actions">
            <span class="booking-status ${statusClass}">${appointment.appointmentStatus}</span>
            ${reviewButton}
        </div>
    `;

    return bookingItem;
}

// Get CSS class for appointment status
function getStatusClass(status) {
    if (!status) return 'status-pending';

    const statusLower = status.toLowerCase();

    if (statusLower === 'completed') {
        return 'status-completed';
    } else if (statusLower === 'confirmed') {
        return 'status-confirmed';
    } else if (statusLower === 'cancelled') {
        return 'status-cancelled';
    } else if (statusLower === 'pending') {
        return 'status-pending';
    }

    return 'status-pending';
}

// Open Review Modal
function openReviewModal(appointmentId, serviceName) {
    alert('Review functionality coming soon for appointment ' + appointmentId);
}
