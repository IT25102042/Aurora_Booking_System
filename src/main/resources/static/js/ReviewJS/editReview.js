// editReview.js
// Handles loading existing review data and submitting the update
// Placed in js/ReviewJS/editReview.js

let selectedRating = 0;
let reviewId = null;
let userId = null;

document.addEventListener("DOMContentLoaded", function () {
    loadReviewData();
    initStarRating();
    initCharCounter();
});

// ─── Load Existing Review Data ────────────────────────────────────────────────

async function loadReviewData() {
    try {
        // 1. Get reviewId from URL
        const urlParams = new URLSearchParams(window.location.search);
        reviewId = urlParams.get('reviewId');

        if (!reviewId) {
            alert("No review found. Redirecting back.");
            window.location.href = "myAccount.html";
            return;
        }

        // 2. Check session
        const sessionRes = await fetch('http://localhost:8080/api/users/check-session', {
            credentials: 'include'
        });
        const sessionData = await sessionRes.json();

        if (!sessionData.status || !sessionData.user) {
            window.location.href = "signIn.html";
            return;
        }

        userId = sessionData.user.id;

        // 3. Fetch this user's reviews and find the matching one
        const reviewRes = await fetch(`http://localhost:8080/api/reviews/my?userId=${userId}`, {
            credentials: 'include'
        });

        const reviews = await reviewRes.json();
        const review = reviews.find(r => r.id == reviewId);

        if (!review) {
            alert("Review not found. Redirecting back.");
            window.location.href = "myAccount.html";
            return;
        }

        // 4. If already updated — block the page
        if (review.isUpdated) {
            document.querySelector('.review-card').innerHTML = `
                <h3>Edit Your Review</h3>
                <div class="notice-box" style="margin-top:20px">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    This review has already been updated. You cannot edit it again.
                </div>
                <button class="btn-cancel" style="margin-top:20px" onclick="window.location.href='myAccount.html'">
                    <i class="bi bi-arrow-left"></i> Back to My Account
                </button>
            `;
            return;
        }

        // 5. Pre-fill form with existing data
        document.getElementById('serviceNameBadge').textContent = review.serviceName;
        document.getElementById('reviewText').value = review.reviewText;
        document.getElementById('charCount').textContent = review.reviewText.length;

        // 6. Pre-fill stars
        selectedRating = review.rating;
        updateStars(selectedRating);
        document.getElementById('ratingLabel').textContent = `${selectedRating} out of 5`;

    } catch (error) {
        console.error("Error loading review:", error);
        alert("Something went wrong. Please try again.");
    }
}

// ─── Submit Update ────────────────────────────────────────────────────────────

async function submitUpdate() {

    // 1. Validate rating
    if (selectedRating === 0) {
        alert("Please select a rating.");
        return;
    }

    // 2. Validate review text
    const reviewText = document.getElementById('reviewText').value.trim();
    if (reviewText.length < 10) {
        alert("Review must be at least 10 characters.");
        return;
    }
    if (reviewText.length > 1000) {
        alert("Review cannot exceed 1000 characters.");
        return;
    }

    // 3. Send PUT request
    try {
        const res = await fetch(`http://localhost:8080/api/reviews/${reviewId}?userId=${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                rating: selectedRating,
                reviewText: reviewText
            })
        });

        if (res.ok) {
            alert("Review updated successfully!");
            window.location.href = "myAccount.html";
        } else {
            const msg = await res.text();
            alert(msg);
        }

    } catch (error) {
        console.error("Error updating review:", error);
        alert("Something went wrong. Please try again.");
    }
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function initStarRating() {
    const stars = document.querySelectorAll('#starRating i');

    stars.forEach(star => {
        // Hover effect
        star.addEventListener('mouseenter', function () {
            const hoverRating = parseInt(this.dataset.rating);
            updateStars(hoverRating);
        });

        // Mouse leave — revert to selected
        star.addEventListener('mouseleave', function () {
            updateStars(selectedRating);
        });

        // Click — set selected rating
        star.addEventListener('click', function () {
            selectedRating = parseInt(this.dataset.rating);
            updateStars(selectedRating);
            document.getElementById('ratingLabel').textContent = `${selectedRating} out of 5`;
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

// ─── Char Counter ─────────────────────────────────────────────────────────────

function initCharCounter() {
    document.getElementById('reviewText').addEventListener('input', function () {
        document.getElementById('charCount').textContent = this.value.length;
    });
}