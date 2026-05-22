// adminReviewManagement.js
// Handles Review Management section in adminPanel.html
// Loads all reviews, search by service name, delete review

let allAdminReviews = [];

// ─── Load All Reviews ─────────────────────────────────────────────────────────

async function loadAllReviews() {
    try {
        const res = await fetch('http://localhost:8080/api/reviews/all', {
            credentials: 'include'
        });

        allAdminReviews = await res.json();
        renderReviewTable(allAdminReviews);

    } catch (error) {
        console.error("Error loading reviews:", error);
        document.getElementById('reviewTableBody').innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">
                    <i class="fas fa-exclamation-circle me-2"></i>Failed to load reviews.
                </td>
            </tr>
        `;
    }
}

// ─── Render Table ─────────────────────────────────────────────────────────────

function renderReviewTable(reviews) {
    const tbody = document.getElementById('reviewTableBody');

    if (!reviews || reviews.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">
                    <i class="fas fa-inbox me-2"></i>No reviews found.
                </td>
            </tr>
        `;
        return;
    }

    let html = '';

    reviews.forEach(review => {
        const date = formatReviewDate(review.createdAt);
        const stars = renderAdminStars(review.rating);
        const shortText = review.reviewText.length > 60
            ? review.reviewText.substring(0, 60) + '...'
            : review.reviewText;

        html += `
            <tr id="review-row-${review.id}">
                <td>#${review.id}</td>
                <td>${review.reviewerName}</td>
                <td>#${review.id}</td>
                <td>${review.serviceName}</td>
                <td>${stars}</td>
                <td title="${review.reviewText}">${shortText}</td>
                <td>${date}</td>
                <td style="text-align:center;vertical-align:middle;">
                    <button
                        class="action-btn btn-delete"
                        onclick="adminDeleteReview(${review.id})"
                        title="Delete Review"
                        style="background:#dc3545;color:white;margin:0 auto;display:block;"
                    >
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ─── Search By Service Name ───────────────────────────────────────────────────

function initReviewSearch() {
    const searchInput = document.getElementById('reviewSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();

        if (query.length === 0) {
            renderReviewTable(allAdminReviews);
            return;
        }

        const filtered = allAdminReviews.filter(review =>
            review.serviceName.toLowerCase().includes(query)
        );

        renderReviewTable(filtered);
    });
}

// ─── Admin Delete Review ──────────────────────────────────────────────────────

async function adminDeleteReview(reviewId) {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;

    // Get admin userId from session
    try {
        const sessionRes = await fetch('http://localhost:8080/api/users/check-session', {
            credentials: 'include'
        });
        const sessionData = await sessionRes.json();
        const adminId = sessionData.user.id;

        const res = await fetch(`http://localhost:8080/api/reviews/${reviewId}?userId=${adminId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (res.ok) {
            // Remove row from table immediately
            const row = document.getElementById(`review-row-${reviewId}`);
            if (row) row.remove();

            // Also remove from allAdminReviews array
            allAdminReviews = allAdminReviews.filter(r => r.id !== reviewId);

            // Check if table is now empty
            if (allAdminReviews.length === 0) {
                renderReviewTable([]);
            }

            showReviewToast("Review deleted successfully.");

        } else {
            const msg = await res.text();
            alert(msg);
        }

    } catch (error) {
        console.error("Error deleting review:", error);
        alert("Something went wrong. Please try again.");
    }
}

// ─── Refresh Button ───────────────────────────────────────────────────────────

function refreshReviews() {
    loadAllReviews();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderAdminStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating
            ? '<i class="fas fa-star" style="color:#ffc107;font-size:0.8rem"></i>'
            : '<i class="far fa-star" style="color:#ffc107;font-size:0.8rem"></i>';
    }
    return stars;
}

function formatReviewDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showReviewToast(message) {
    // Use existing admin panel toast if available, otherwise alert
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    } else {
        alert(message);
    }
}

// ─── Initialize ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    initReviewSearch();
});