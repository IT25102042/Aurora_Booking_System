// SingleServiceReviews.js
// Loads and renders reviews inside the Reviews accordion on singleServicePage.html
// serviceId comes from URL ?id=X — same as serviceDisplay.js

document.addEventListener("DOMContentLoaded", function () {

    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');

    if (!serviceId) return;

    // Load reviews when the Reviews accordion is opened
    const reviewAccordion = document.getElementById('reviewCollapse');
    if (reviewAccordion) {
        reviewAccordion.addEventListener('show.bs.collapse', function () {
            loadServiceReviews(serviceId);
        });
    }

    // Also load immediately in case accordion is already open
    loadServiceReviews(serviceId);
});

async function loadServiceReviews(serviceId) {
    try {
        const res = await fetch(`http://localhost:8080/api/reviews/service/${serviceId}`, {
            credentials: 'include'
        });

        const reviews = await res.json();
        renderServiceReviews(reviews);

    } catch (error) {
        console.error("Error loading service reviews:", error);
    }
}

function renderServiceReviews(reviews) {
    const container = document.querySelector('#reviewCollapse .reviews-scroll-container');
    if (!container) return;

    if (!reviews || reviews.length === 0) {
        container.innerHTML = `
            <p class="text-secondary" style="padding: 1rem 0;">
                No reviews yet for this service.
            </p>
        `;
        return;
    }

    // Average rating summary
    const avg = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    const totalReviews = reviews.length;

    let html = `
        <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <span style="font-size: 1.5rem; font-weight: 600; color: var(--accent-2);">${avg}</span>
            <span style="color: #ffc107; margin-left: 6px;">${renderStars(Math.round(avg))}</span>
            <span style="color: var(--text-secondary); font-size: 0.9rem; margin-left: 8px;">(${totalReviews} review${totalReviews > 1 ? 's' : ''})</span>
        </div>
    `;

    reviews.forEach(review => {
        const stars = renderStarsText(review.rating);
        const date = formatDate(review.createdAt);
        const photoUrl = `http://localhost:8080/review_images/${review.id}/image1.png`;

        html += `
            <div class="review-item">
                <div class="review-avatar">
                    <img
                        src="${photoUrl}"
                        alt="${review.reviewerName}"
                        onerror="this.src='https://www.w3schools.com/howto/img_avatar.png'"
                    >
                </div>
                <div class="review-content">
                    <div class="reviewer-name">
                        ${review.reviewerName}
                        <span class="review-stars">${stars}</span>
                    </div>
                    <div class="review-text">${review.reviewText}</div>
                    <div class="review-date">${date}</div>
                </div>
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
            ? '<i class="bi bi-star-fill" style="color:#ffc107"></i>'
            : '<i class="bi bi-star" style="color:#ffc107"></i>';
    }
    return stars;
}

function renderStarsText(rating) {
    // Matches existing static HTML style — plain star characters
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '★' : '☆';
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