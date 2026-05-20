// review.js
// Handles the Write a Review form on review.html
// Reads ?appointmentId=X & ?serviceId=X & ?serviceName=X from URL

let selectedRating = 0;
let userId = null;

document.addEventListener("DOMContentLoaded", function () {
    checkSessionAndInit();
    initStarRating();
    initCharCounter();
});

// ─── Session Check & Page Init ────────────────────────────────────────────────

async function checkSessionAndInit() {
    try {
        const sessionRes = await fetch('http://localhost:8080/api/users/check-session', {
            credentials: 'include'
        });
        const sessionData = await sessionRes.json();

        if (!sessionData.status || !sessionData.user) {
            window.location.href = "signIn.html";
            return;
        }

        userId = sessionData.user.id;

        // Read URL params
        const urlParams = new URLSearchParams(window.location.search);
        const serviceName = urlParams.get('serviceName');
        const appointmentId = urlParams.get('appointmentId');

        if (!appointmentId) {
            showError("No appointment found. Please go back and try again.");
            document.getElementById('submitBtn').disabled = true;
            return;
        }

        // Fill service badge
        const badge = document.getElementById('serviceNameBadge');
        if (badge) {
            badge.textContent = serviceName ? decodeURIComponent(serviceName) : "Service";
        }

    } catch (error) {
        console.error("Session check failed:", error);
        window.location.href = "signIn.html";
    }
}

// ─── Submit Review ────────────────────────────────────────────────────────────

async function submitReview() {
    // 1. Validate rating
    if (selectedRating === 0) {
        showError("Please select a rating before submitting.");
        return;
    }

    // 2. Validate review text
    const reviewText = document.getElementById('reviewText').value.trim();
    if (reviewText.length < 10) {
        showError("Your review must be at least 10 characters.");
        return;
    }
    if (reviewText.length > 1000) {
        showError("Your review cannot exceed 1000 characters.");
        return;
    }

    // 3. Get appointmentId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const appointmentId = urlParams.get('appointmentId');

    if (!appointmentId) {
        showError("Missing appointment information. Please go back and try again.");
        return;
    }

    // 4. Build FormData (multipart — backend expects "review" part + optional "photo")
    const reviewBlob = new Blob([JSON.stringify({
        appointmentId: parseInt(appointmentId),
        rating: selectedRating,
        reviewText: reviewText
    })], { type: 'application/json' });

    const formData = new FormData();
    formData.append('review', reviewBlob);

    // Optional photo
    const photoInput = document.getElementById('photoInput');
    if (photoInput && photoInput.files.length > 0) {
        formData.append('photo', photoInput.files[0]);
    }

    // 5. Disable button to prevent double submit
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Submitting...';

    // 6. POST to API
    try {
        const res = await fetch(`http://localhost:8080/api/reviews?userId=${userId}`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (res.ok) {
            showSuccess("Your review has been submitted! Thank you.");
            setTimeout(() => {
                window.location.href = "myAccount.html";
            }, 2000);
        } else {
            const msg = await res.text();
            showError(msg || "Something went wrong. Please try again.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-send"></i> Submit Review';
        }

    } catch (error) {
        console.error("Error submitting review:", error);
        showError("Network error. Please check your connection and try again.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-send"></i> Submit Review';
    }
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function initStarRating() {
    const stars = document.querySelectorAll('#starRating i');

    stars.forEach(star => {
        // Hover — highlight up to hovered star
        star.addEventListener('mouseenter', function () {
            updateStars(parseInt(this.dataset.rating));
        });

        // Mouse leave — revert to selected rating
        star.addEventListener('mouseleave', function () {
            updateStars(selectedRating);
        });

        // Click — lock in the rating
        star.addEventListener('click', function () {
            selectedRating = parseInt(this.dataset.rating);
            updateStars(selectedRating);
            const label = document.getElementById('ratingLabel');
            if (label) label.textContent = `${selectedRating} out of 5`;
        });
    });
}

function updateStars(rating) {
    const stars = document.querySelectorAll('#starRating i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('bi-star');
            star.classList.add('bi-star-fill', 'active');
        } else {
            star.classList.remove('bi-star-fill', 'active');
            star.classList.add('bi-star');
        }
    });
}

// ─── Character Counter ────────────────────────────────────────────────────────

function initCharCounter() {
    const textarea = document.getElementById('reviewText');
    if (!textarea) return;
    textarea.addEventListener('input', function () {
        const count = this.value.length;
        const counter = document.getElementById('charCount');
        if (counter) counter.textContent = count;

        // Warn when approaching limit
        if (count > 900) {
            counter.style.color = '#ffc107';
        } else {
            counter.style.color = '';
        }
    });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function showError(message) {
    removeNotice();
    const notice = document.createElement('div');
    notice.id = 'reviewNotice';
    notice.style.cssText = `
        margin-top: 16px;
        padding: 12px 20px;
        border-radius: 12px;
        background: rgba(220, 53, 69, 0.15);
        border: 1px solid rgba(220, 53, 69, 0.4);
        color: #ff6b7a;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    notice.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i> ${message}`;
    document.querySelector('.review-card').appendChild(notice);
    setTimeout(removeNotice, 4000);
}

function showSuccess(message) {
    removeNotice();
    const notice = document.createElement('div');
    notice.id = 'reviewNotice';
    notice.style.cssText = `
        margin-top: 16px;
        padding: 12px 20px;
        border-radius: 12px;
        background: rgba(25, 200, 120, 0.15);
        border: 1px solid rgba(25, 200, 120, 0.4);
        color: #19c878;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    notice.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${message}`;
    document.querySelector('.review-card').appendChild(notice);
}

function removeNotice() {
    const existing = document.getElementById('reviewNotice');
    if (existing) existing.remove();
}