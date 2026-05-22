// myReviews.js
// Handles the Reviews tab in myAccount.html
// Fetches reviews from GET /api/reviews/my?userId=X and renders them

document.addEventListener("DOMContentLoaded", function () {
    const reviewTabLink = document.querySelector('[data-tab="reviews"]');
    if (reviewTabLink) {
        reviewTabLink.addEventListener('click', function () {
            loadMyReviews();
        });
    }
});

async function loadMyReviews() {
    try {
        const sessionRes = await fetch('http://localhost:8080/api/users/check-session', {
            credentials: 'include'
        });
        const sessionData = await sessionRes.json();

        if (!sessionData.status || !sessionData.user) {
            window.location.href = "signIn.html";
            return;
        }

        const userId = sessionData.user.id;

        const reviewRes = await fetch(`http://localhost:8080/api/reviews/my?userId=${userId}`, {
            credentials: 'include'
        });

        const reviews = await reviewRes.json();
        renderMyReviews(reviews, userId);

    } catch (error) {
        console.error("Error loading reviews:", error);
    }
}

function renderMyReviews(reviews, userId) {
    const container = document.querySelector('#reviews .account-card');

    if (!reviews || reviews.length === 0) {
        container.innerHTML = `
            <h3>Review History</h3>
            <p class="text-secondary" style="margin-top: 1rem;">
                You have not submitted any reviews yet.
            </p>
        `;
        return;
    }

    let html = '<h3>Review History</h3>';

    reviews.forEach(review => {
        const stars = renderStars(review.rating);
        const date = formatDate(review.createdAt);
        const photoUrl = `http://localhost:8080/review_images/${review.id}/image1.png`;

        // Show Edit button only if not yet updated
        const editBtn = review.isUpdated
            ? `<span style="font-size:11px; color:var(--text-secondary); font-style:italic;">Already updated</span>`
            : `<button class="btn-review-edit" onclick="goToEditReview(${review.id})">
                   <i class="bi bi-pencil-square"></i> Edit
               </button>`;

        html += `
            <div class="review-item" id="review-${review.id}">
                <div class="review-author">
                    <div class="review-pic">
                        <img
                            src="${photoUrl}"
                            alt="Review Photo"
                            onerror="this.src='https://www.w3schools.com/howto/img_avatar.png'"
                        >
                    </div>
                    <div class="author-info">
                        <h5>${review.reviewerName}</h5>
                        <p class="text-secondary">${review.serviceName} · ${date}</p>
                    </div>
                </div>
                <div class="review-rating">
                    ${stars}
                </div>
                <p>${review.reviewText}</p>
                <div class="review-actions">
                    ${editBtn}
                    <button class="btn-review-delete" onclick="deleteReview(${review.id}, ${userId})">
                        <i class="bi bi-trash-fill"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ─── Go to Edit Page ──────────────────────────────────────────────────────────

function goToEditReview(reviewId) {
    window.location.href = `editReview.html?reviewId=${reviewId}`;
}

// ─── Delete Review ────────────────────────────────────────────────────────────

async function deleteReview(reviewId, userId) {

    // Confirm before deleting
    if (!confirm("Are you sure you want to permanently delete this review?")) {
        return;
    }

    try {
        const res = await fetch(`http://localhost:8080/api/reviews/${reviewId}?userId=${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (res.ok) {
            // Remove the review card from DOM immediately
            const reviewCard = document.getElementById(`review-${reviewId}`);
            if (reviewCard) reviewCard.remove();

            // Check if no reviews left
            const remaining = document.querySelectorAll('.review-item');
            if (remaining.length === 0) {
                const container = document.querySelector('#reviews .account-card');
                container.innerHTML = `
                    <h3>Review History</h3>
                    <p class="text-secondary" style="margin-top: 1rem;">
                        You have not submitted any reviews yet.
                    </p>
                `;
            }
        } else {
            const msg = await res.text();
            alert(msg);
        }

    } catch (error) {
        console.error("Error deleting review:", error);
        alert("Something went wrong. Please try again.");
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating
            ? '<i class="bi bi-star-fill"></i>'
            : '<i class="bi bi-star"></i>';
    }
    return stars;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}