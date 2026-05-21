const API_BASE = "http://localhost:8080/api";
let allWishlistItems = [];

document.addEventListener('DOMContentLoaded', () => {
    checkSessionAndLoadWishlist();
    setupSearch();
});

function setupSearch() {
    const searchInput = document.getElementById('wishlistSearchInput');
    const searchBtn = document.getElementById('wishlistSearchBtn');

    const performSearch = () => {
        if (!searchInput) return;
        const query = searchInput.value.toLowerCase().trim();

        if (query === "") {
            renderWishlist(allWishlistItems, false);
            return;
        }

        const filteredItems = allWishlistItems.filter(item =>
            (item.title && item.title.toLowerCase().includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query)) ||
            (item.categoryName && item.categoryName.toLowerCase().includes(query))
        );
        renderWishlist(filteredItems, true);
    };

    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch();
        });
    }
}

async function checkSessionAndLoadWishlist() {
    try {
        const response = await fetch(`${API_BASE}/users/check-session`, { credentials: 'include' });
        const data = await response.json();

        if (data.status && data.user) {
            // Load wishlist items
            await loadWishlistItems();
        } else {
            // Not logged in, redirect to login page
            sessionStorage.setItem('postLoginRedirect', '/wishlist.html');
            window.location.href = "signIn.html?redirect=/wishlist.html";
        }
    } catch (error) {
        console.error("Error checking session:", error);
        sessionStorage.setItem('postLoginRedirect', '/wishlist.html');
        window.location.href = "signIn.html?redirect=/wishlist.html";
    }
}

async function loadWishlistItems() {
    const grid = document.getElementById('wishlistGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="col-12 text-center my-5">
            <div class="spinner-border text-pink" role="status" style="color: var(--accent-2);">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE}/wishlist`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error("Failed to fetch wishlist");
        }
        allWishlistItems = await response.json();

        // Reset search input value on reload
        const searchInput = document.getElementById('wishlistSearchInput');
        if (searchInput) searchInput.value = '';

        renderWishlist(allWishlistItems, false);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        grid.innerHTML = `
            <div class="col-12 text-center my-5">
                <p class="text-danger">Failed to load wishlist items. Please try again later.</p>
            </div>
        `;
    }
}

function renderWishlist(items, isSearching = false) {
    const grid = document.getElementById('wishlistGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const countSpan = document.getElementById('wishlistCount');
    if (countSpan) {
        countSpan.textContent = items.length;
    }

    if (!items || items.length === 0) {
        if (isSearching) {
            grid.innerHTML = `
                <div class="col-12 text-center my-5 py-5" style="background: var(--glass-bg); border-radius: 30px; border: 1px solid rgba(255,255,255,0.1);">
                    <i class="bi bi-search display-1 mb-3" style="color: var(--accent-2);"></i>
                    <h3 class="mb-3">No matching services found</h3>
                    <p class="text-secondary mb-4">Try searching with a different term.</p>
                </div>
            `;
        } else {
            grid.innerHTML = `
                <div class="col-12 text-center my-5 py-5" style="background: var(--glass-bg); border-radius: 30px; border: 1px solid rgba(255,255,255,0.1);">
                    <i class="bi bi-heartbreak-fill display-1 mb-3" style="color: var(--accent-2);"></i>
                    <h3 class="mb-3">Your wishlist is empty</h3>
                    <p class="text-secondary mb-4">Discover our top-tier services and add your favorite treatments here!</p>
                    <a href="services.html" class="btn btn-edit px-4 py-2" style="background: var(--gradient-2); color: white; border: none; font-weight: 600; border-radius: 60px;">Explore Services</a>
                </div>
            `;
        }
        return;
    }

    items.forEach(item => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3';

        const imageSrc = `service_images/${item.id}/image1.png`;
        const formattedPrice = `Rs. ${item.price.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

        col.innerHTML = `
            <div class="wishlist-card h-100" data-id="${item.id}">
                <img src="${imageSrc}" class="card-img-top" alt="${item.title}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500';">
                <div class="wishlist-body d-flex flex-column justify-content-between">
                    <div>
                        <h5 class="wishlist-title">${item.title}</h5>
                        <div class="wishlist-price mb-2">
                            ${formattedPrice}
                        </div>
                        <p class="wishlist-desc">${item.description || 'No description available for this service.'}</p>
                    </div>
                    <div class="card-actions mt-3">
                        <button class="btn-wishlist-book" onclick="bookNow(${item.id})">
                            <i class="bi bi-calendar-plus"></i> Book Now
                        </button>
                        <button class="btn-remove" onclick="removeItem(${item.id})">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });
}

async function removeItem(serviceId) {
    if (!confirm("Are you sure you want to remove this service from your wishlist?")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/wishlist/remove/${serviceId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.status) {
            await loadWishlistItems();
        } else {
            alert("Failed to remove item: " + data.message);
        }
    } catch (error) {
        console.error("Error removing item:", error);
        alert("An error occurred while removing the item.");
    }
}

function bookNow(serviceId) {
    window.location.href = `appointment.html?serviceId=${serviceId}`;
}
