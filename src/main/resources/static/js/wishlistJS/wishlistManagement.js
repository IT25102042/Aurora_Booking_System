const API_BASE = "http://localhost:8080/api";

document.addEventListener('DOMContentLoaded', () => {
    checkSessionAndLoadWishlist();
});

async function checkSessionAndLoadWishlist() {
    try {
        const response = await fetch(`${API_BASE}/users/check-session`, { credentials: 'include' });
        const data = await response.json();
        
        if (data.status && data.user) {
            // Update navigation dropdown
            updateNavbar(data.user);
            // Load wishlist items
            await loadWishlistItems();
        } else {
            // Not logged in, redirect to login page
            window.location.href = "signIn.html";
        }
    } catch (error) {
        console.error("Error checking session:", error);
        window.location.href = "signIn.html";
    }
}

function updateNavbar(user) {
    const welcomeUserText = document.getElementById("welcomeUserText");
    const navSignIn = document.getElementById("navSignIn");
    const navSignUp = document.getElementById("navSignUp");
    const navSignOut = document.getElementById("navSignOut");

    if (welcomeUserText) welcomeUserText.innerHTML = `Welcome ${user.firstName}`;
    if (navSignIn) navSignIn.style.display = "none";
    if (navSignUp) navSignUp.style.display = "none";
    if (navSignOut) navSignOut.style.display = "block";
}

async function signOut() {
    try {
        const response = await fetch(`${API_BASE}/users/signout`, { method: 'POST', credentials: 'include' });
        const data = await response.json();
        
        if (data.status) {
            window.location.href = "home.html";
        }
    } catch (error) {
        console.error("Error signing out:", error);
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
        const wishlistItems = await response.json();
        renderWishlist(wishlistItems);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        grid.innerHTML = `
            <div class="col-12 text-center my-5">
                <p class="text-danger">Failed to load wishlist items. Please try again later.</p>
            </div>
        `;
    }
}

function renderWishlist(items) {
    const grid = document.getElementById('wishlistGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!items || items.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center my-5 py-5" style="background: var(--glass-bg); border-radius: 30px; border: 1px solid rgba(255,255,255,0.1);">
                <i class="bi bi-heartbreak-fill display-1 mb-3" style="color: var(--accent-2);"></i>
                <h3 class="mb-3">Your wishlist is empty</h3>
                <p class="text-secondary mb-4">Discover our top-tier services and add your favorite treatments here!</p>
                <a href="services.html" class="btn btn-edit px-4 py-2" style="background: var(--gradient-2); color: white; border: none; font-weight: 600; border-radius: 60px;">Explore Services</a>
            </div>
        `;
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
