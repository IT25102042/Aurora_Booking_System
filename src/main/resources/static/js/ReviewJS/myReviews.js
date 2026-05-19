// myReviews.js
// Triggered when user clicks My Reviews tab

document.addEventListener("DOMContentLoaded", function () {

    // Find the My Reviews tab link and attach click listener
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
        renderMyReviews(reviews);

    } catch (error) {
        console.error("Error loading reviews:", error);
    }
}

function renderMyReviews(reviews) {
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
            </div>
        `;
    });

    container.innerHTML = html;
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