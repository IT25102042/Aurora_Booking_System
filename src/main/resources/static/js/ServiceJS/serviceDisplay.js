/**
 * serviceDisplay.js
 * Handles the public services.html page:
 *   - Load active services on page load
 *   - Load filter options dynamically (categories, genders, durations, max price)
 *   - Advanced filtering via "Apply Filters" button
 *   - Basic search by service name
 *   - Sort by dropdown
 *   - Pagination (6 services per page)
 *   - Services count display
 */

const BASE_URL = 'http://localhost:8080/api/service-display';
const PAGE_SIZE = 6;

// ===== State =====
let currentPage = 0;
let currentSearch = '';
let currentSort = 'recommended';
let currentFilters = {
    categoryIds: [],
    genderIds: [],
    maxPrice: null,
    durations: []
};
let filterMaxPriceLimit = 500; // Will be updated from backend
let currentUser = null;
let userWishlistIds = new Set();

// ===== DOM Elements =====
const servicesGrid = document.getElementById('servicesGrid');
const servicesCount = document.getElementById('servicesCount');
const servicesPagination = document.getElementById('servicesPagination');
const searchInput = document.getElementById('serviceSearchInput');
const searchBtn = document.getElementById('serviceSearchBtn');
const sortSelect = document.getElementById('serviceSortSelect');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const filterResetBtn = document.getElementById('filterResetBtn');
const filterCategoryList = document.getElementById('filterCategoryList');
const filterGenderList = document.getElementById('filterGenderList');
const filterDurationList = document.getElementById('filterDurationList');
const filterPriceRange = document.getElementById('filterPriceRange');
const filterPriceMaxLabel = document.getElementById('filterPriceMaxLabel');

// ===== Initialize on Page Load =====
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const isSinglePage = path.includes('singleServicePage.html');

    if (isSinglePage) {
        initSingleServicePage();
    } else {
        initServicesPage();
    }
});

function initServicesPage() {
    loadFilterOptions();
    checkSessionAndWishlist().finally(() => {
        loadActiveServices();
    });
    bindEventListeners();
}

function initSingleServicePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');

    if (serviceId) {
        loadSingleService(serviceId);
        loadRelatedServices(serviceId);
    } else {
        window.location.href = 'services.html';
    }
}

// ===== Single Service Page Logic =====

function loadSingleService(id) {
    fetch(`${BASE_URL}/service/${id}`)
        .then(response => {
            if (!response.ok) throw new Error('Service not found');
            return response.json();
        })
        .then(service => {
            renderSingleService(service);
        })
        .catch(error => {
            console.error('Error loading service:', error);
            document.body.innerHTML = `<div class="container text-center py-5"><h1>Service Not Found</h1><a href="services.html" class="btn btn-primary mt-3">Back to Services</a></div>`;
        });
}

function renderSingleService(service) {
    // Update breadcrumbs
    const bcCat = document.getElementById('breadcrumbCategory');
    const bcTitle = document.getElementById('breadcrumbTitle');
    if (bcCat) {
        bcCat.textContent = service.categoryName;
        bcCat.href = `services.html?categoryId=${service.categoryId}`;
    }
    if (bcTitle) bcTitle.textContent = service.title;

    // Update main info
    const title = document.getElementById('serviceTitle');
    const price = document.getElementById('currentPrice');
    const descShort = document.getElementById('serviceDescriptionShort');
    const duration = document.getElementById('serviceDuration');
    const catMeta = document.getElementById('serviceCategoryMeta');

    if (title) title.textContent = service.title;
    if (price) price.textContent = `Rs. ${service.price.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    if (descShort) descShort.textContent = service.description;
    if (duration) duration.textContent = service.durationMinutes;
    if (catMeta) catMeta.textContent = service.categoryName;

    // Update accordion
    const descFull = document.getElementById('serviceDescriptionFull');
    const specDur = document.getElementById('specDuration');
    const specCat = document.getElementById('specCategory');
    const specGender = document.getElementById('specGender');

    if (descFull) descFull.textContent = service.description;
    if (specDur) specDur.textContent = `${service.durationMinutes} minutes`;
    if (specCat) specCat.textContent = service.categoryName;
    if (specGender) specGender.textContent = service.genderName;

    // Update images
    const mainImg = document.getElementById('mainImage');
    const thumbContainer = document.getElementById('thumbnailContainer');

    if (mainImg) {
        mainImg.src = `service_images/${service.id}/image1.png`;
        mainImg.onerror = () => mainImg.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800';
    }

    if (thumbContainer) {
        thumbContainer.innerHTML = '';
        // Assume up to 3 images for now (image1.png, image2.png, image3.png)
        for (let i = 1; i <= 3; i++) {
            const imgSrc = `service_images/${service.id}/image${i}.png`;
            const thumb = document.createElement('div');
            thumb.className = `thumbnail ${i === 1 ? 'active' : ''}`;
            thumb.dataset.image = imgSrc;
            thumb.innerHTML = `<img src="${imgSrc}" onerror="this.parentElement.style.display='none'">`;
            
            thumb.addEventListener('click', function() {
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                if (mainImg) mainImg.src = this.dataset.image;
            });
            
            thumbContainer.appendChild(thumb);
        }
    }

    // Update Stylists
    const stylistContainer = document.querySelector('.stylist-options');
    if (stylistContainer) {
        const optionGroup = stylistContainer.closest('.option-group');
        stylistContainer.innerHTML = '';
        
        if (service.stylists && service.stylists.length > 0) {
            if (optionGroup) optionGroup.style.display = 'block';
            service.stylists.forEach(stylist => {
                const opt = document.createElement('div');
                opt.className = 'stylist-option';
                
                if (stylist.status && stylist.status.toLowerCase() === 'available') {
                    opt.classList.add('active');
                }
                
                opt.innerHTML = `<img src="user_images/${stylist.userId}/image1.png" onerror="this.src='https://ui-avatars.com/api/?name=${stylist.firstName}+${stylist.lastName}&background=random'" alt="stylist"> ${stylist.firstName}`;
                
                stylistContainer.appendChild(opt);
            });
        } else {
            if (optionGroup) optionGroup.style.display = 'none';
        }
    }
}

function loadRelatedServices(id) {
    fetch(`${BASE_URL}/related/${id}?limit=4`)
        .then(response => response.json())
        .then(services => {
            renderRelatedServices(services);
        })
        .catch(error => console.error('Error loading related services:', error));
}

function renderRelatedServices(services) {
    const grid = document.getElementById('relatedServicesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-3';
        card.innerHTML = `
            <div class="service-card-sm" style="cursor: pointer" onclick="window.location.href='singleServicePage.html?id=${service.id}'">
                <img src="service_images/${service.id}/image1.png" alt="${service.title}" onerror="this.src='https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'">
                <div class="card-body">
                    <h5 class="card-title">${service.title}</h5>
                    <p class="card-price">Rs. ${service.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ===== Event Listeners =====
function bindEventListeners() {
    // Search: pressing Enter or clicking search button
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                currentSearch = searchInput.value.trim();
                currentPage = 0;
                loadActiveServices();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            currentSearch = searchInput.value.trim();
            currentPage = 0;
            loadActiveServices();
        });
    }

    // Sort dropdown change
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            currentPage = 0;
            loadActiveServices();
        });
    }

    // Apply Filters button
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            collectFilters();
            currentPage = 0;
            loadActiveServices();
        });
    }

    // Clear All filters
    if (filterResetBtn) {
        filterResetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetFilters();
            currentPage = 0;
            loadActiveServices();
        });
    }

    // Price range slider - update label in real time
    if (filterPriceRange) {
        filterPriceRange.addEventListener('input', () => {
            filterPriceMaxLabel.textContent = `Rs. ${filterPriceRange.value}`;
        });
    }
}

// ===== Collect Filter Values from Sidebar =====
function collectFilters() {
    // Categories
    const categoryCheckboxes = filterCategoryList.querySelectorAll('input[type="checkbox"]:checked');
    currentFilters.categoryIds = Array.from(categoryCheckboxes).map(cb => parseInt(cb.value));

    // Genders
    const genderCheckboxes = filterGenderList.querySelectorAll('input[type="checkbox"]:checked');
    currentFilters.genderIds = Array.from(genderCheckboxes).map(cb => parseInt(cb.value));

    // Price
    const priceVal = parseFloat(filterPriceRange.value);
    if (priceVal < filterMaxPriceLimit) {
        currentFilters.maxPrice = priceVal;
    } else {
        currentFilters.maxPrice = null; // No filter if at max
    }

    // Durations
    const durationCheckboxes = filterDurationList.querySelectorAll('input[type="checkbox"]:checked');
    currentFilters.durations = Array.from(durationCheckboxes).map(cb => parseInt(cb.value));
}

// ===== Reset All Filters =====
function resetFilters() {
    // Uncheck all category checkboxes
    filterCategoryList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

    // Uncheck all gender checkboxes
    filterGenderList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

    // Reset price range to max
    filterPriceRange.value = filterMaxPriceLimit;
    filterPriceMaxLabel.textContent = `Rs. ${filterMaxPriceLimit}`;

    // Uncheck all duration checkboxes
    filterDurationList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

    // Clear search
    searchInput.value = '';
    currentSearch = '';

    // Reset sort
    sortSelect.value = 'recommended';
    currentSort = 'recommended';

    // Clear filter state
    currentFilters = {
        categoryIds: [],
        genderIds: [],
        maxPrice: null,
        durations: []
    };
}

// ===== Load Filter Options from Backend =====
function loadFilterOptions() {
    fetch(`${BASE_URL}/filters`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load filter options');
            return response.json();
        })
        .then(data => {
            renderCategoryFilters(data.categories || []);
            renderGenderFilters(data.genders || []);
            renderDurationFilters(data.durations || []);
            setupPriceRange(data.maxPrice || 500);
        })
        .catch(error => {
            console.error('Error loading filter options:', error);
        });
}

// ===== Render Category Filter Checkboxes =====
function renderCategoryFilters(categories) {
    if (!filterCategoryList) return;
    filterCategoryList.innerHTML = '';

    categories.forEach(cat => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" id="filterCat${cat.id}" value="${cat.id}">
            <label for="filterCat${cat.id}">${cat.category}</label>
        `;
        filterCategoryList.appendChild(li);
    });
}

// ===== Render Gender Filter Checkboxes =====
function renderGenderFilters(genders) {
    if (!filterGenderList) return;
    filterGenderList.innerHTML = '';

    genders.forEach(g => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" id="filterGender${g.id}" value="${g.id}">
            <label for="filterGender${g.id}">${g.gender}</label>
        `;
        filterGenderList.appendChild(li);
    });
}

// ===== Render Duration Filter Checkboxes =====
function renderDurationFilters(durations) {
    if (!filterDurationList) return;
    filterDurationList.innerHTML = '';

    durations.forEach(dur => {
        const div = document.createElement('div');
        div.className = 'form-check';
        div.innerHTML = `
            <input class="form-check-input" type="checkbox" id="filterDur${dur}" value="${dur}">
            <label class="form-check-label" for="filterDur${dur}">${dur}min</label>
        `;
        filterDurationList.appendChild(div);
    });
}

// ===== Setup Price Range Slider =====
function setupPriceRange(maxPrice) {
    filterMaxPriceLimit = Math.ceil(maxPrice / 10) * 10; // Round up to nearest 10
    if (filterMaxPriceLimit < 100) filterMaxPriceLimit = 100; // Minimum 100

    if (filterPriceRange) {
        filterPriceRange.max = filterMaxPriceLimit;
        filterPriceRange.value = filterMaxPriceLimit;
    }
    if (filterPriceMaxLabel) {
        filterPriceMaxLabel.textContent = `Rs. ${filterMaxPriceLimit}`;
    }
}

// ===== Load Active Services from Backend =====
function loadActiveServices() {
    // Build query params
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('size', PAGE_SIZE);
    params.append('sortBy', currentSort);

    if (currentSearch) {
        params.append('search', currentSearch);
    }

    if (currentFilters.categoryIds.length > 0) {
        currentFilters.categoryIds.forEach(id => params.append('categoryIds', id));
    }

    if (currentFilters.genderIds.length > 0) {
        currentFilters.genderIds.forEach(id => params.append('genderIds', id));
    }

    if (currentFilters.maxPrice !== null) {
        params.append('maxPrice', currentFilters.maxPrice);
    }

    if (currentFilters.durations.length > 0) {
        currentFilters.durations.forEach(d => params.append('durations', d));
    }

    fetch(`${BASE_URL}/active?${params.toString()}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load services');
            return response.json();
        })
        .then(data => {
            renderServices(data.services || []);
            renderPagination(data.currentPage, data.totalPages);
            updateServicesCount(data.services ? data.services.length : 0, data.totalElements || 0);
        })
        .catch(error => {
            console.error('Error loading active services:', error);
            if (servicesGrid) {
                servicesGrid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: var(--accent-2);"></i>
                        <p class="mt-3" style="color: var(--text-secondary);">Failed to load services. Please try again later.</p>
                    </div>
                `;
            }
        });
}

// ===== Render Service Cards =====
function renderServices(services) {
    if (!servicesGrid) return;
    servicesGrid.innerHTML = '';

    if (services.length === 0) {
        servicesGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search" style="font-size: 3rem; color: var(--accent-2);"></i>
                <h4 class="mt-3" style="color: var(--text-primary);">No Services Found</h4>
                <p style="color: var(--text-secondary);">Try adjusting your filters or search query.</p>
            </div>
        `;
        return;
    }

    services.forEach(service => {
        const imgSrc = `service_images/${service.id}/image1.png`;
        const price = service.price ? `Rs. ${service.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'Rs. 0.00';
        const duration = service.durationMinutes ? `${service.durationMinutes} min` : '';
        const category = service.categoryName || '';

        const isWished = userWishlistIds.has(service.id);
                const heartIconClass = isWished ? 'bi-heart-fill' : 'bi-heart';
                const heartTitle = isWished ? 'Remove from Wishlist' : 'Add to Wishlist';
                const heartActiveClass = isWished ? 'active' : '';

        const cardHtml = `
            <div class="col-md-6 col-lg-4">
                <div class="service-card-item">
                    <div class="service-img">
                        <img src="${imgSrc}" alt="${service.title}" onerror="this.src='https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500'">
                        <div class="service-overlay">
                            <div class="service-action ${heartActiveClass}" title="${heartTitle}" onclick="toggleWishlist(event, ${service.id})">
                                                            <i class="bi ${heartIconClass}"></i>
                                                        </div>
                            <div class="service-action" title="View Details" onclick="window.location.href='singleServicePage.html?id=${service.id}'"><i class="bi bi-eye"></i></div>
                        </div>
                    </div>
                    <div class="service-content">
                        <p class="service-category">${category}</p>
                        <h3 class="service-title">${service.title}</h3>
                        <div class="service-price">${price}</div>
                        ${duration ? `<p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 5px;"><i class="bi bi-clock"></i> ${duration}</p>` : ''}
                    </div>
                </div>
            </div>
        `;

        servicesGrid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// ===== Render Pagination =====
function renderPagination(current, totalPages) {
    if (!servicesPagination) return;
    servicesPagination.innerHTML = '';

    if (totalPages <= 1) return; // No pagination needed for single page

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${current === 0 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#"><i class="bi bi-chevron-left"></i></a>`;
    prevLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (current > 0) {
            currentPage = current - 1;
            loadActiveServices();
            scrollToServicesTop();
        }
    });
    servicesPagination.appendChild(prevLi);

    // Page numbers (show max 5 pages with ellipsis logic)
    let startPage = Math.max(0, current - 2);
    let endPage = Math.min(totalPages - 1, current + 2);

    // Adjust if near start
    if (current < 2) {
        endPage = Math.min(totalPages - 1, 4);
    }
    // Adjust if near end
    if (current > totalPages - 3) {
        startPage = Math.max(0, totalPages - 5);
    }

    // First page + ellipsis
    if (startPage > 0) {
        servicesPagination.appendChild(createPageItem(0, current));
        if (startPage > 1) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = `<a class="page-link" href="#">...</a>`;
            servicesPagination.appendChild(ellipsis);
        }
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
        servicesPagination.appendChild(createPageItem(i, current));
    }

    // Last page + ellipsis
    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = `<a class="page-link" href="#">...</a>`;
            servicesPagination.appendChild(ellipsis);
        }
        servicesPagination.appendChild(createPageItem(totalPages - 1, current));
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${current === totalPages - 1 ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#"><i class="bi bi-chevron-right"></i></a>`;
    nextLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (current < totalPages - 1) {
            currentPage = current + 1;
            loadActiveServices();
            scrollToServicesTop();
        }
    });
    servicesPagination.appendChild(nextLi);
}

// ===== Create a Single Page Item =====
function createPageItem(pageNum, currentPageNum) {
    const li = document.createElement('li');
    li.className = `page-item ${pageNum === currentPageNum ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${pageNum + 1}</a>`;
    li.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = pageNum;
        loadActiveServices();
        scrollToServicesTop();
    });
    return li;
}

// ===== Update Services Count Display =====
function updateServicesCount(showing, total) {
    if (!servicesCount) return;
    servicesCount.textContent = `Showing ${showing} of ${total} services`;
}

// ===== Scroll to Services Section Top =====
function scrollToServicesTop() {
    const servicesSection = document.querySelector('.products-section');
    if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ===== Session and Wishlist Status Loaders =====
async function checkSessionAndWishlist() {
    try {
        const sessionResp = await fetch('http://localhost:8080/api/users/check-session', { credentials: 'include' });
        const sessionData = await sessionResp.json();

        if (sessionData.status && sessionData.user) {
            currentUser = sessionData.user;
            updateNavbar(currentUser);

            // Fetch wishlist
            const wishlistResp = await fetch('http://localhost:8080/api/wishlist', { credentials: 'include' });
            if (wishlistResp.ok) {
                const wishlist = await wishlistResp.json();
                userWishlistIds = new Set(wishlist.map(item => item.id));
            }
        }
    } catch (error) {
        console.error("Error loading session/wishlist status:", error);
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
        const response = await fetch('http://localhost:8080/api/users/signout', { method: 'POST', credentials: 'include' });
        const data = await response.json();

        if (data.status) {
            window.location.href = "home.html";
        }
    } catch (error) {
        console.error("Error signing out:", error);
    }
}

// ===== Toggle Service Wishlist Status =====
async function toggleWishlist(event, serviceId) {
    event.stopPropagation();

    if (!currentUser) {
        // Not logged in, redirect to login page
        window.location.href = "signIn.html";
        return;
    }

    const actionElement = event.currentTarget;
    const isWished = actionElement.classList.contains('active');
    const iconElement = actionElement.querySelector('i');

    try {
        if (isWished) {
            // Remove from wishlist
            const response = await fetch(`http://localhost:8080/api/wishlist/remove/${serviceId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await response.json();
            if (data.status) {
                userWishlistIds.delete(serviceId);
                actionElement.classList.remove('active');
                actionElement.setAttribute('title', 'Add to Wishlist');
                if (iconElement) {
                    iconElement.className = 'bi bi-heart';
                }
            } else {
                alert("Failed to remove from wishlist: " + data.message);
            }
        } else {
            // Add to wishlist
            const response = await fetch(`http://localhost:8080/api/wishlist/add/${serviceId}`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            if (data.status) {
                userWishlistIds.add(serviceId);
                actionElement.classList.add('active');
                actionElement.setAttribute('title', 'Remove from Wishlist');
                if (iconElement) {
                    iconElement.className = 'bi bi-heart-fill';
                }
            } else {
                alert("Failed to add to wishlist: " + data.message);
            }
        }
    } catch (error) {
        console.error("Error toggling wishlist item:", error);
        alert("An error occurred. Please try again.");
    }
}

