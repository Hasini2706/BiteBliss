// =========================================================
// Mini Zomato / Swiggy - Core Frontend Engine
// =========================================================

const API_URL = 'http://localhost:8081/api';

// Global State
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let userFavorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Menu Filter & Sort State
let currentCategory = '';
let currentDietFilter = 'all'; // 'all', 'veg', 'nonveg'
let currentSearch = '';
let currentSort = 'default';
let currentMinRating = 0;
let currentMaxPrepTime = 999;
let currentPage = 0;
let totalPages = 1;
let allFetchedItems = [];

// Checkout State
let selectedAddressId = null;
let appliedCoupon = null;
try {
    const savedCoupon = localStorage.getItem('appliedCoupon');
    if (savedCoupon) {
        appliedCoupon = JSON.parse(savedCoupon);
    }
} catch (e) {
    appliedCoupon = null;
}
const baseDeliveryFee = 40;
const platformFee = 5;
const freeDeliveryThreshold = 499;

// Group Order & Bill Split State
let groupOrder = null;
try {
    const savedGroup = localStorage.getItem('groupOrder');
    if (savedGroup) {
        groupOrder = JSON.parse(savedGroup);
    }
} catch (e) {
    groupOrder = null;
}
if (!groupOrder) {
    groupOrder = {
        active: false,
        roomCode: 'FOOD-' + Math.floor(1000 + Math.random() * 9000),
        splitMode: 'itemized',
        members: [
            { id: 'm_host', name: 'You (Host)', avatar: '👑', isHost: true },
            { id: 'm_1', name: 'Rahul', avatar: '🚴', isHost: false },
            { id: 'm_2', name: 'Priya', avatar: '🌸', isHost: false }
        ]
    };
    localStorage.setItem('groupOrder', JSON.stringify(groupOrder));
}

// =========================================================
// HTML Sanitizer
// =========================================================
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

// =========================================================
// Toast Notification
// =========================================================
function showToast(message, icon = '🍽️') {
    const existing = document.querySelector('.custom-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// =========================================================
// Global Fetch Helper with JWT Token
// =========================================================
async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem('token');
    if (!token) {
        try {
            const loginRes = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'demo@food.com', password: 'password123' })
            });
            if (loginRes.ok) {
                const loginData = await loginRes.json();
                if (loginData.accessToken) {
                    token = loginData.accessToken;
                    localStorage.setItem('token', token);
                    if (!localStorage.getItem('currentUser')) {
                        currentUser = loginData.user;
                        localStorage.setItem('currentUser', JSON.stringify(loginData.user));
                    }
                }
            }
        } catch (e) {
            console.warn('Auto-auth fallback:', e);
        }
    }

    const headers = options.headers ? { ...options.headers } : {};
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    
    return fetch(url, {
        ...options,
        headers: headers
    });
}

// =========================================================
// DOM Initialization
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    renderFloatingCart();

    if (document.getElementById('menu-container')) {
        initMenuPage();
    }
    if (document.getElementById('cart-container')) {
        renderCartPage();
    }
    if (document.getElementById('checkout-container')) {
        initCheckoutPage();
    }
    if (document.getElementById('orders-container')) {
        fetchOrders();
    }
    if (document.getElementById('bill-container')) {
        initBillPage();
    }
    if (document.getElementById('profile-container')) {
        initProfilePage();
    }
    if (document.getElementById('admin-container')) {
        initAdminPage();
    }
    if (document.getElementById('home-popular-container')) {
        fetchHomePopularDishes();
    }
});

// =========================================================
// Navbar & Auth State
// =========================================================
function updateNavbar() {
    const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    // Sync modern BiteBliss navbar badge
    const navCartBadge = document.getElementById('nav-cart-badge');
    if (navCartBadge) navCartBadge.textContent = totalCartCount;

    // Sync modern profile dropdown
    const userName = document.getElementById('dropdown-user-name');
    const adminLink = document.getElementById('admin-link-item');
    const authAction = document.getElementById('auth-action-btn');
    if (currentUser) {
        if (userName) userName.textContent = currentUser.name;
        if (adminLink && currentUser.role === 'ROLE_ADMIN') adminLink.classList.remove('d-none');
        if (authAction) authAction.innerHTML = '<a class="dropdown-item text-danger fw-bold" href="#" onclick="logout()">Logout</a>';
    } else {
        if (userName) userName.textContent = 'Guest';
        if (adminLink) adminLink.classList.add('d-none');
        if (authAction) authAction.innerHTML = '<a class="dropdown-item text-primary fw-bold" href="login.html">Login / Register</a>';
    }

    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return;

    if (currentUser) {
        authLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="menu.html">Explore Menu</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="cart.html">
                    🛒 Cart <span class="cart-nav-badge" id="nav-cart-count">${totalCartCount}</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="orders.html">My Orders</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle text-primary fw-bold" href="#" role="button" data-bs-toggle="dropdown">
                    👤 ${escapeHTML(currentUser.name)}
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
                    <li><a class="dropdown-item" href="profile.html">My Profile & Addresses</a></li>
                    ${currentUser.role === 'ROLE_ADMIN' ? '<li><a class="dropdown-item text-danger fw-bold" href="admin.html">⚙️ Admin Dashboard</a></li>' : ''}
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()">Logout</a></li>
                </ul>
            </li>
        `;
    } else {
        authLinks.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="menu.html">Explore Menu</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="cart.html">
                    🛒 Cart <span class="cart-nav-badge" id="nav-cart-count">${totalCartCount}</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link btn btn-outline-custom px-3 py-1 ms-2" href="login.html">Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link btn btn-primary-gradient px-3 py-1 ms-2 text-white" href="register.html">Sign Up</a>
            </li>
        `;
    }
}

// Authentication Handlers
async function register(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value.trim();

    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone })
        });

        if (response.ok) {
            showToast('Account created successfully! Please login.', '🎉');
            setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        } else {
            const err = await response.json();
            showError(err.message || 'Registration failed');
        }
    } catch (error) {
        showError('Network error connecting to server');
    }
}

async function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.accessToken) {
                currentUser = data.user;
                localStorage.setItem('token', data.accessToken);
            } else {
                currentUser = data;
            }
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast(`Welcome back, ${currentUser.name}!`, '👋');
            setTimeout(() => {
                if (currentUser.role === 'ROLE_ADMIN') {
                    window.location.href = 'admin.html';
                } else if (cart.length > 0) {
                    window.location.href = 'checkout.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 800);
        } else {
            const err = await response.json();
            showError(err.message || 'Invalid credentials');
        }
    } catch (error) {
        showError('Network error logging in');
    }
}

function logout() {
    currentUser = null;
    cart = [];
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    showToast('Logged out successfully', '👋');
    setTimeout(() => { window.location.href = 'index.html'; }, 600);
}

function showError(msg) {
    const errorDiv = document.getElementById('error-msg');
    if (errorDiv) {
        errorDiv.textContent = msg;
        errorDiv.classList.remove('d-none');
    } else {
        alert(msg);
    }
}

// =========================================================
// Menu Page & Filtering
// =========================================================
function initMenuPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    if (catParam) {
        currentCategory = catParam;
    }
    const searchParam = urlParams.get('search');
    if (searchParam) {
        currentSearch = searchParam;
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = currentSearch;
    }
    fetchMenu(0);
}

async function fetchMenu(page = 0) {
    currentPage = page;
    const container = document.getElementById('menu-container');
    if (!container) return;

    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Loading food...</span>
            </div>
            <p class="mt-3 text-muted fw-semibold">Fetching delicious dishes from top restaurants...</p>
        </div>
    `;

    try {
        let url = `${API_URL}/menu?page=${page}&size=12`;
        if (currentCategory) url += `&category=${encodeURIComponent(currentCategory)}`;
        if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;

        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            allFetchedItems = data.content || [];
            totalPages = data.totalPages || 1;
            applyClientFiltersAndRender(data.number || 0, data.totalElements || 0);
        } else {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5"><h4>No menu items found.</h4></div>';
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="col-12 text-center text-danger py-5"><h4>Error connecting to food server.</h4></div>';
    }
}

function applyClientFiltersAndRender(pageIndex, totalElements) {
    let items = [...allFetchedItems];

    // Filter Diet (Veg / Non-Veg)
    if (currentDietFilter === 'veg') {
        items = items.filter(i => i.isVeg === true);
    } else if (currentDietFilter === 'nonveg') {
        items = items.filter(i => i.isVeg === false);
    }

    // Filter Rating
    if (currentMinRating > 0) {
        items = items.filter(i => (i.rating || 4.2) >= currentMinRating);
    }

    // Filter Fast Delivery
    if (currentMaxPrepTime < 999) {
        items = items.filter(i => (i.prepTimeMinutes || 25) <= currentMaxPrepTime);
    }

    // Sorting
    if (currentSort === 'price-low') {
        items.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
        items.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'rating') {
        items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    renderMenuGrid(items);
    renderPagination(totalPages, pageIndex);
    updateFilterCounts(totalElements, items.length);
}

function renderMenuGrid(items) {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div style="font-size: 3.5rem;">🔍</div>
                <h4 class="mt-3 fw-bold">No dishes match your filters</h4>
                <p class="text-muted">Try clearing some filters or searching for something else.</p>
                <button class="btn btn-outline-custom mt-2" onclick="resetAllFilters()">Reset All Filters</button>
            </div>
        `;
        return;
    }

    items.forEach(item => {
        const cartItem = cart.find(ci => ci.menuItemId === item.id);
        const qty = cartItem ? cartItem.quantity : 0;
        const isFav = userFavorites.includes(item.id);

        const card = document.createElement('div');
        card.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
        card.innerHTML = `
            <div class="food-card-modern">
                <div class="food-card-img-wrapper">
                    <img src="${escapeHTML(item.imageUrl)}" alt="${escapeHTML(item.name)}" loading="lazy">
                    <div class="discount-ribbon">50% OFF UPTO ₹100</div>
                    <button class="fav-btn-heart" onclick="toggleFavorite(${item.id})">
                        ${isFav ? '❤️' : '🤍'}
                    </button>
                </div>
                <div class="food-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="${item.isVeg ? 'veg-badge' : 'nonveg-badge'}" title="${item.isVeg ? 'Pure Veg' : 'Non-Veg'}"></span>
                        <span class="restaurant-title">${escapeHTML(item.restaurantName || 'BiteBliss Express')}</span>
                    </div>
                    <h5 class="dish-name mt-1">${escapeHTML(item.name)}</h5>
                    
                    <div class="meta-badges">
                        <span class="rating-badge">★ ${(item.rating || 4.5).toFixed(1)}</span>
                        <span class="text-muted">•</span>
                        <span class="prep-time">⏱️ ${item.prepTimeMinutes || 25} mins</span>
                    </div>

                    <p class="dish-desc">${escapeHTML(item.description || 'Prepared fresh with chef secret spices.')}</p>

                    <div class="card-bottom-action">
                        <span class="dish-price">₹${item.price}</span>
                        <div class="swiggy-btn-container" id="btn-container-${item.id}">
                            ${renderStepperOrAddButton(item.id, qty, item.name, item.price, item.imageUrl, item.isVeg)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderStepperOrAddButton(id, qty, name, price, img, isVeg) {
    if (qty > 0) {
        return `
            <div class="swiggy-stepper">
                <button class="stepper-btn" onclick="updateItemQty(${id}, -1, '${escapeHTML(name).replace(/'/g, "\\'")}', ${price}, '${img}', ${isVeg})">-</button>
                <span class="stepper-qty">${qty}</span>
                <button class="stepper-btn" onclick="updateItemQty(${id}, 1, '${escapeHTML(name).replace(/'/g, "\\'")}', ${price}, '${img}', ${isVeg})">+</button>
            </div>
        `;
    } else {
        return `
            <button class="btn-swiggy-add" onclick="updateItemQty(${id}, 1, '${escapeHTML(name).replace(/'/g, "\\'")}', ${price}, '${img}', ${isVeg})">
                + ADD
            </button>
        `;
    }
}

// Live Search with Debounce
let searchTimeout;
function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const input = document.getElementById('search-input');
        currentSearch = input ? input.value.trim() : '';
        fetchMenu(0);
    }, 400);
}

function filterCategory(category, btnElement) {
    currentCategory = category;
    document.querySelectorAll('.category-pill-card').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    fetchMenu(0);
}

function setDietFilter(filter, el) {
    currentDietFilter = filter;
    document.querySelectorAll('.diet-filter-btn').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
    applyClientFiltersAndRender(currentPage, allFetchedItems.length);
}

function toggleRatingFilter(el) {
    currentMinRating = currentMinRating === 0 ? 4.5 : 0;
    if (el) el.classList.toggle('active', currentMinRating > 0);
    applyClientFiltersAndRender(currentPage, allFetchedItems.length);
}

function toggleFastDelivery(el) {
    currentMaxPrepTime = currentMaxPrepTime === 999 ? 20 : 999;
    if (el) el.classList.toggle('active', currentMaxPrepTime === 20);
    applyClientFiltersAndRender(currentPage, allFetchedItems.length);
}

function handleSortChange(sortVal) {
    currentSort = sortVal;
    applyClientFiltersAndRender(currentPage, allFetchedItems.length);
}

function resetAllFilters() {
    currentCategory = '';
    currentDietFilter = 'all';
    currentSearch = '';
    currentSort = 'default';
    currentMinRating = 0;
    currentMaxPrepTime = 999;
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.category-pill-card').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
    fetchMenu(0);
}

function updateFilterCounts(total, current) {
    const counterEl = document.getElementById('items-count-display');
    if (counterEl) {
        counterEl.textContent = `Showing ${current} dishes`;
    }
}

function renderPagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 0 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<button class="page-link" onclick="fetchMenu(${currentPage - 1})">Prev</button>`;
    pagination.appendChild(prevLi);

    for (let i = 0; i < totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<button class="page-link" onclick="fetchMenu(${i})">${i + 1}</button>`;
        pagination.appendChild(li);
    }

    // Next
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
    nextLi.innerHTML = `<button class="page-link" onclick="fetchMenu(${currentPage + 1})">Next</button>`;
    pagination.appendChild(nextLi);
}

// =========================================================
// Cart & Stepper Synchronization
// =========================================================
function quickAddToCart(id, name, price, imageUrl, isVeg) {
    updateItemQty(id, 1, name, price, imageUrl, isVeg);
}

function updateItemQty(id, change, name, price, img, isVeg) {
    let item = cart.find(i => i.menuItemId === id);
    if (!item) {
        if (change > 0) {
            item = { menuItemId: id, name, price, quantity: 1, imageUrl: img, isVeg };
            cart.push(item);
            showToast(`Added ${name} to cart!`, '🛒');
        }
    } else {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.menuItemId !== id);
            showToast(`Removed ${name} from cart`, '🗑️');
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateNavbar();
    renderFloatingCart();

    // Update the button on the card if on menu page
    const btnContainer = document.getElementById(`btn-container-${id}`);
    if (btnContainer) {
        const newQty = item && item.quantity > 0 ? item.quantity : 0;
        btnContainer.innerHTML = renderStepperOrAddButton(id, newQty, name, price, img, isVeg);
    }

    if (cart.length === 0) {
        removeCoupon(false);
    }

    // If on Cart page, re-render cart
    if (document.getElementById('cart-container') || document.getElementById('cart-items-list')) {
        renderCartPage();
    }
    if (document.getElementById('checkout-items-summary')) {
        renderCheckoutBillSummary();
    }
}

function removeItemFromCart(menuItemId, itemName = 'Item') {
    cart = cart.filter(i => i.menuItemId !== menuItemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateNavbar();
    renderFloatingCart();

    if (cart.length === 0) {
        removeCoupon(false);
    }

    // Reset button on menu page if present
    const btnContainer = document.getElementById(`btn-container-${menuItemId}`);
    if (btnContainer) {
        btnContainer.innerHTML = `<button class="btn btn-sm btn-foodie-explore w-100 py-2 rounded-3 fw-bold" onclick="quickAddToCart(${menuItemId}, '${escapeHTML(itemName).replace(/'/g, "\\'")}', 0, '', true)">+ ADD</button>`;
    }

    showToast(`Removed "${itemName}" from cart`, '🗑️');

    if (document.getElementById('cart-items-list')) {
        renderCartPage();
    }
    if (document.getElementById('checkout-items-summary')) {
        if (cart.length === 0) {
            window.location.href = 'cart.html';
        } else {
            renderCheckoutBillSummary();
        }
    }
}

function clearEntireCart() {
    if (!cart || cart.length === 0) {
        showToast('Your cart is already empty', 'ℹ️');
        return;
    }
    if (!confirm('Are you sure you want to remove all items from your cart?')) {
        return;
    }

    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    removeCoupon(false);
    updateNavbar();
    renderFloatingCart();

    showToast('All items removed from cart', '🗑️');

    if (document.getElementById('cart-items-list')) {
        renderCartPage();
    }
    if (document.getElementById('checkout-items-summary')) {
        window.location.href = 'cart.html';
    }
}

function renderFloatingCart() {
    let existingBar = document.getElementById('floating-cart-bar');
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    // Hide if empty or on cart/checkout/bill pages
    const isCartPage = window.location.pathname.includes('cart.html') || window.location.pathname.includes('checkout.html') || window.location.pathname.includes('bill.html');
    if (totalItems === 0 || isCartPage) {
        if (existingBar) existingBar.remove();
        return;
    }

    if (!existingBar) {
        existingBar = document.createElement('div');
        existingBar.id = 'floating-cart-bar';
        existingBar.className = 'floating-cart-bar';
        existingBar.onclick = () => { window.location.href = 'cart.html'; };
        document.body.appendChild(existingBar);
    }

    existingBar.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <span style="font-size: 1.3rem;">🛍️</span>
            <div>
                <div class="fw-bold">${totalItems} ${totalItems === 1 ? 'ITEM' : 'ITEMS'} ADDED</div>
                <div class="small text-white-50">₹${subtotal} plus taxes</div>
            </div>
        </div>
        <div class="d-flex align-items-center gap-2 fw-bold">
            VIEW CART ➔
        </div>
    `;
}

// =========================================================
// Favorites System
// =========================================================
function toggleFavorite(id) {
    if (!currentUser) {
        showToast('Please login to save favorites', '🔒');
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        return;
    }

    const index = userFavorites.indexOf(id);
    if (index > -1) {
        userFavorites.splice(index, 1);
        showToast('Removed from favorites', '🤍');
    } else {
        userFavorites.push(id);
        showToast('Saved to your favorites!', '❤️');
    }
    localStorage.setItem('favorites', JSON.stringify(userFavorites));

    if (document.getElementById('menu-container')) {
        applyClientFiltersAndRender(currentPage, allFetchedItems.length);
    }
}

// =========================================================
// Cart Page Implementation
// =========================================================
function renderCartPage() {
    const listContainer = document.getElementById('cart-items-list');
    const emptyState = document.getElementById('cart-empty-state');
    const fullState = document.getElementById('cart-full-state');
    if (!listContainer) return;

    if (cart.length === 0) {
        if (emptyState) emptyState.classList.remove('d-none');
        if (fullState) fullState.classList.add('d-none');
        return;
    }

    if (emptyState) emptyState.classList.add('d-none');
    if (fullState) fullState.classList.remove('d-none');

    // Update Group Order Banner & Active Strip
    const activeSummaryStrip = document.getElementById('active-group-summary-strip');
    const groupToggleBtn = document.getElementById('group-order-toggle-btn');
    const groupRoomCodeBadge = document.getElementById('group-room-code-badge');
    const groupMembersCountBadge = document.getElementById('group-members-count-badge');

    if (groupOrder && groupOrder.active) {
        if (activeSummaryStrip) activeSummaryStrip.classList.remove('d-none');
        if (groupToggleBtn) groupToggleBtn.innerHTML = '⚙️ Manage Group';
        if (groupRoomCodeBadge) groupRoomCodeBadge.textContent = `ROOM #${groupOrder.roomCode}`;
        if (groupMembersCountBadge) groupMembersCountBadge.textContent = `${groupOrder.members.length} Friends in room`;
    } else {
        if (activeSummaryStrip) activeSummaryStrip.classList.add('d-none');
        if (groupToggleBtn) groupToggleBtn.innerHTML = '👥 Start Group Split';
    }

    listContainer.innerHTML = '';
    let itemTotal = 0;

    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        itemTotal += itemSubtotal;

        const row = document.createElement('div');
        row.className = 'p-3 border-bottom';

        let memberSelectHtml = '';
        if (groupOrder && groupOrder.active && groupOrder.members && groupOrder.members.length > 0) {
            const currentAssignment = item.assignedTo || 'shared';
            const memberOptions = groupOrder.members.map(m => 
                `<option value="${m.id}" ${currentAssignment === m.id ? 'selected' : ''}>${m.avatar} ${escapeHTML(m.name)}</option>`
            ).join('');

            memberSelectHtml = `
                <div class="mt-2 pt-2 border-top d-flex align-items-center justify-content-between flex-wrap gap-2 bg-light p-2 rounded-3">
                    <span class="small text-muted fw-semibold d-flex align-items-center gap-1" style="font-size: 0.82rem;">
                        <span>🎯</span> <strong>Ordered For:</strong>
                    </span>
                    <select class="form-select form-select-sm group-member-select w-auto shadow-sm" style="border-radius: 20px; font-weight: 600; font-size: 0.82rem; border-color: #6366f1; color: #4338ca;" onchange="assignCartItemMember(${item.menuItemId}, this.value)">
                        <option value="shared" ${currentAssignment === 'shared' ? 'selected' : ''}>🤝 Shared by All</option>
                        ${memberOptions}
                    </select>
                </div>
            `;
        }

        row.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-3">
                    <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'}" alt="${escapeHTML(item.name)}" class="rounded-3 shadow-sm cart-item-thumb" style="width: 64px; height: 64px; object-fit: cover; flex-shrink: 0;" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="${item.isVeg ? 'veg-badge' : 'nonveg-badge'}" style="width: 13px; height: 13px;"></span>
                            <h6 class="mb-0 fw-bold text-dark">${escapeHTML(item.name)}</h6>
                        </div>
                        <small class="text-muted">₹${item.price} per item</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <div class="swiggy-stepper" style="width: 86px; height: 32px;">
                        <button class="stepper-btn" onclick="updateItemQty(${item.menuItemId}, -1, '${escapeHTML(item.name).replace(/'/g, "\\'")}', ${item.price}, '${item.imageUrl}', ${item.isVeg})">-</button>
                        <span class="stepper-qty">${item.quantity}</span>
                        <button class="stepper-btn" onclick="updateItemQty(${item.menuItemId}, 1, '${escapeHTML(item.name).replace(/'/g, "\\'")}', ${item.price}, '${item.imageUrl}', ${item.isVeg})">+</button>
                    </div>
                    <div class="fw-bold text-end text-dark" style="min-width: 60px;">₹${itemSubtotal}</div>
                    <button type="button" class="btn btn-outline-danger btn-sm rounded-pill px-2 py-1 ms-1 d-flex align-items-center gap-1 shadow-2xs fw-bold" style="font-size: 0.76rem;" onclick="removeItemFromCart(${item.menuItemId}, '${escapeHTML(item.name).replace(/'/g, "\\'")}')" title="Remove ${escapeHTML(item.name)} from cart">
                        <span>🗑️</span> Remove
                    </button>
                </div>
            </div>
            ${memberSelectHtml}
        `;
        listContainer.appendChild(row);
    });

    // Bill Details
    const deliveryFee = itemTotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee;
    const taxes = Math.round(itemTotal * 0.05); // 5% GST

    let discount = 0;
    if (appliedCoupon) {
        const minReq = Number(appliedCoupon.minOrderAmount) || 0;
        if (itemTotal < minReq) {
            showToast(`Coupon ${appliedCoupon.code} removed (Min order ₹${minReq} required)`, 'ℹ️');
            removeCoupon(false);
            discount = 0;
        } else {
            discount = Number(appliedCoupon.discountAmount) || 0;
        }
    }

    const discountRow = document.getElementById('cart-discount-row');
    const discountAmountEl = document.getElementById('cart-discount-amount');
    const appliedBadgeEl = document.getElementById('cart-applied-coupon-label');
    const appliedBanner = document.getElementById('cart-applied-coupon-banner');
    const appliedBannerText = document.getElementById('cart-applied-banner-text');
    const appliedBannerSub = document.getElementById('cart-applied-banner-sub');
    const savingsTip = document.getElementById('cart-savings-tip-text');

    if (appliedCoupon && discount > 0) {
        if (discountRow) discountRow.classList.remove('d-none');
        if (discountAmountEl) discountAmountEl.textContent = `-₹${discount}`;
        if (appliedBadgeEl) appliedBadgeEl.textContent = `Coupon Discount (${appliedCoupon.code})`;
        if (appliedBanner) appliedBanner.classList.remove('d-none');
        if (appliedBannerText) appliedBannerText.textContent = `🎉 Coupon ${appliedCoupon.code} applied!`;
        if (appliedBannerSub) appliedBannerSub.textContent = `You saved ₹${discount} on this meal!`;
        if (savingsTip) savingsTip.textContent = `🎉 Amazing! You saved ₹${discount} with coupon ${appliedCoupon.code}`;
    } else {
        if (discountRow) discountRow.classList.add('d-none');
        if (appliedBanner) appliedBanner.classList.add('d-none');
        if (savingsTip) savingsTip.textContent = 'Apply a coupon above to save on your order!';
    }

    const grandTotal = Math.max(0, itemTotal + deliveryFee + platformFee + taxes - discount);

    const itemTotalEl = document.getElementById('cart-item-total');
    if (itemTotalEl) itemTotalEl.textContent = `₹${itemTotal}`;

    const deliveryFeeEl = document.getElementById('cart-delivery-fee');
    if (deliveryFeeEl) {
        deliveryFeeEl.textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
        if (deliveryFee === 0) {
            deliveryFeeEl.classList.add('text-success', 'fw-bold');
        } else {
            deliveryFeeEl.classList.remove('text-success', 'fw-bold');
        }
    }

    const platformFeeEl = document.getElementById('cart-platform-fee');
    if (platformFeeEl) platformFeeEl.textContent = `₹${platformFee}`;

    const taxesEl = document.getElementById('cart-taxes');
    if (taxesEl) taxesEl.textContent = `₹${taxes}`;

    const grandTotalEl = document.getElementById('cart-grand-total');
    if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;

    // Free delivery meter
    const freeDelProgress = document.getElementById('free-del-progress');
    const freeDelText = document.getElementById('free-del-text');
    if (freeDelProgress && freeDelText) {
        if (itemTotal >= freeDeliveryThreshold) {
            freeDelProgress.style.width = '100%';
            freeDelProgress.className = 'progress-bar bg-success';
            freeDelText.innerHTML = '🎉 You have unlocked <strong>FREE Delivery!</strong>';
        } else {
            const pct = (itemTotal / freeDeliveryThreshold) * 100;
            const needed = freeDeliveryThreshold - itemTotal;
            freeDelProgress.style.width = `${pct}%`;
            freeDelProgress.className = 'progress-bar bg-warning';
            freeDelText.innerHTML = `Add ₹${needed} more to get <strong>FREE Delivery!</strong>`;
        }
    }

    renderCartCoupons(itemTotal);
}

// =========================================================
// Checkout & Order Placement
// =========================================================
async function initCheckoutPage() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    if (cart.length === 0) {
        window.location.href = 'menu.html';
        return;
    }

    try {
        const savedCoupon = localStorage.getItem('appliedCoupon');
        if (savedCoupon) {
            appliedCoupon = JSON.parse(savedCoupon);
        }
    } catch (e) {
        appliedCoupon = null;
    }

    renderCheckoutBillSummary();
    await fetchUserAddresses();
}

function renderCheckoutBillSummary() {
    const list = document.getElementById('checkout-items-summary');
    if (!list) return;
    list.innerHTML = '';

    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        list.innerHTML += `
            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <div class="d-flex align-items-center gap-3">
                    <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&q=80'}" alt="${escapeHTML(item.name)}" class="rounded-3 shadow-sm" style="width: 48px; height: 48px; object-fit: cover; flex-shrink: 0;" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&q=80'">
                    <div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="${item.isVeg ? 'veg-badge' : 'nonveg-badge'}" style="width: 12px; height: 12px;"></span>
                            <span class="fw-bold small text-dark">${escapeHTML(item.name)}</span>
                        </div>
                        <small class="text-muted">₹${item.price} × ${item.quantity}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold text-dark">₹${itemTotal}</span>
                    <button type="button" class="btn btn-sm btn-outline-danger border-0 rounded-circle p-1 ms-1" style="font-size: 0.85rem;" onclick="removeItemFromCart(${item.menuItemId}, '${escapeHTML(item.name).replace(/'/g, "\\'")}')" title="Remove ${escapeHTML(item.name)}">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    });

    const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee;
    const taxes = Math.round(subtotal * 0.05);

    let discount = 0;
    if (appliedCoupon) {
        const minReq = Number(appliedCoupon.minOrderAmount) || 0;
        if (subtotal < minReq) {
            showToast(`Coupon ${appliedCoupon.code} removed (Min order ₹${minReq} required)`, 'ℹ️');
            removeCoupon(false);
            discount = 0;
        } else {
            discount = Number(appliedCoupon.discountAmount) || 0;
        }
    }

    const discountRow = document.getElementById('checkout-discount-row');
    const discountAmountEl = document.getElementById('checkout-discount');
    const appliedBadgeEl = document.getElementById('applied-coupon-badge');
    const appliedBanner = document.getElementById('checkout-applied-coupon-banner');
    const appliedBannerText = document.getElementById('checkout-applied-banner-text');
    const appliedBannerSub = document.getElementById('checkout-applied-banner-sub');

    if (appliedCoupon && discount > 0) {
        if (discountRow) discountRow.classList.remove('d-none');
        if (discountAmountEl) discountAmountEl.textContent = `-₹${discount}`;
        if (appliedBadgeEl) appliedBadgeEl.textContent = `Coupon Discount (${appliedCoupon.code})`;
        if (appliedBanner) appliedBanner.classList.remove('d-none');
        if (appliedBannerText) appliedBannerText.textContent = `🎉 Coupon ${appliedCoupon.code} applied!`;
        if (appliedBannerSub) appliedBannerSub.textContent = `You saved ₹${discount} on this meal`;
    } else {
        if (discountRow) discountRow.classList.add('d-none');
        if (appliedBanner) appliedBanner.classList.add('d-none');
    }

    let finalAmount = Math.max(0, subtotal + deliveryFee + platformFee + taxes - discount);

    const taxesEl = document.getElementById('checkout-taxes');
    if (taxesEl) taxesEl.textContent = `₹${taxes}`;

    document.getElementById('checkout-item-total').textContent = `₹${subtotal}`;
    document.getElementById('checkout-delivery-fee').textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
    document.getElementById('checkout-final-total').textContent = `₹${finalAmount}`;

    // Update Checkout Group Split Card
    const groupSplitCard = document.getElementById('checkout-group-split-card');
    if (groupSplitCard) {
        if (groupOrder && groupOrder.active && groupOrder.members && groupOrder.members.length > 0) {
            groupSplitCard.classList.remove('d-none');
            const roomBadge = document.getElementById('checkout-group-room-code');
            const membersList = document.getElementById('checkout-group-members-list');
            if (roomBadge) roomBadge.textContent = `ROOM #${groupOrder.roomCode}`;
            if (membersList) {
                membersList.innerHTML = groupOrder.members.map(m => `
                    <span class="badge bg-light text-dark border rounded-pill px-2 py-1 small">
                        ${m.avatar} ${escapeHTML(m.name)}
                    </span>
                `).join(' ');
            }
        } else {
            groupSplitCard.classList.add('d-none');
        }
    }

    renderCheckoutQuickCoupons(subtotal);
}

let userAddressesCache = [];
let editingAddressId = null;

async function fetchUserAddresses() {
    const list = document.getElementById('address-cards-container');
    if (!list) return;

    if (!currentUser) {
        currentUser = { id: 1, name: 'Demo User', email: 'demo@food.com', phone: '9876543210', role: 'ROLE_USER' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    try {
        let addresses = [];
        const response = await fetchWithAuth(`${API_URL}/addresses/user/${currentUser.id}`);
        if (response.ok) {
            addresses = await response.json();
        }

        list.innerHTML = '';

        if (!addresses || addresses.length === 0) {
            addresses = [
                {
                    id: 1,
                    type: 'Home',
                    fullName: currentUser ? currentUser.name : 'Demo User',
                    phone: currentUser?.phone || '9876543210',
                    addressLine1: '#42, 4th Cross, Green Glen Layout',
                    addressLine2: 'Bellandur',
                    city: 'Bengaluru',
                    state: 'Karnataka',
                    pincode: '560103'
                },
                {
                    id: 2,
                    type: 'Work',
                    fullName: currentUser ? currentUser.name : 'Demo User',
                    phone: currentUser?.phone || '9876543210',
                    addressLine1: 'Prestige Tech Park, Tower 3, 4th Floor',
                    addressLine2: 'Outer Ring Road, Bellandur',
                    city: 'Bengaluru',
                    state: 'Karnataka',
                    pincode: '560103'
                }
            ];
        }

        userAddressesCache = addresses;

        // Restore previously selected address or default to first
        const savedAddrId = localStorage.getItem('selectedAddressId');
        if (savedAddrId && addresses.some(a => String(a.id) === String(savedAddrId))) {
            selectedAddressId = Number(savedAddrId);
        } else if (!selectedAddressId || !addresses.some(a => a.id === selectedAddressId)) {
            selectedAddressId = addresses[0].id;
            localStorage.setItem('selectedAddressId', selectedAddressId);
        }

        addresses.forEach((addr) => {
            const isSelected = addr.id === selectedAddressId;
            const icon = addr.type === 'Work' ? '💼' : (addr.type === 'Home' ? '🏠' : '📍');

            list.innerHTML += `
                <div class="card mb-3 address-select-card ${isSelected ? 'border-primary shadow-sm bg-white' : 'border'}" 
                     style="cursor: pointer; transition: all 0.2s; border-width: ${isSelected ? '2px' : '1px'} !important;" 
                     onclick="selectAddress(${addr.id}, this)">
                    <div class="card-body py-3">
                        <div class="form-check d-flex align-items-start gap-2">
                            <input class="form-check-input mt-1" type="radio" name="addressOption" id="addr-${addr.id}" value="${addr.id}" ${isSelected ? 'checked' : ''}>
                            <label class="form-check-label w-100" for="addr-${addr.id}" style="cursor: pointer;">
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <div class="d-flex align-items-center gap-2">
                                        <span class="fw-bold fs-6 text-dark">${icon} ${escapeHTML(addr.type || 'Home')}</span>
                                        ${isSelected ? '<span class="badge bg-primary rounded-pill px-2 py-1 small">✓ DELIVER HERE</span>' : ''}
                                    </div>
                                    <span class="badge bg-light text-dark border">${escapeHTML(addr.phone || '9876543210')}</span>
                                </div>
                                <div class="fw-semibold text-dark">${escapeHTML(addr.fullName || currentUser.name)}</div>
                                <small class="text-muted d-block mt-1">
                                    ${escapeHTML(addr.addressLine1)}${addr.addressLine2 ? ', ' + escapeHTML(addr.addressLine2) : ''}, ${escapeHTML(addr.city)}, ${escapeHTML(addr.state)} - <strong>${escapeHTML(addr.pincode)}</strong>
                                </small>
                            </label>
                        </div>
                        <div class="d-flex justify-content-end gap-2 mt-2 pt-2 border-top">
                            <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 small" 
                                    onclick="event.stopPropagation(); openEditAddressModal(${addr.id})">
                                ✏️ Change / Edit Address
                            </button>
                            ${addresses.length > 1 ? `
                            <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-2 py-1 small" 
                                    onclick="event.stopPropagation(); deleteAddress(${addr.id})">
                                🗑️ Delete
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        console.error('Error fetching addresses:', e);
    }
}

function selectAddress(id, cardEl) {
    selectedAddressId = id;
    localStorage.setItem('selectedAddressId', id);
    document.querySelectorAll('.address-select-card').forEach(c => {
        c.classList.remove('border-primary', 'shadow-sm');
        c.style.borderWidth = '1px';
    });
    if (cardEl) {
        cardEl.classList.add('border-primary', 'shadow-sm');
        cardEl.style.borderWidth = '2px';
        const radio = cardEl.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
    }
    showToast('Delivery address selected! 🏠');
}

function openEditAddressModal(addressId) {
    editingAddressId = addressId;
    const addr = userAddressesCache.find(a => a.id === addressId);
    if (!addr) {
        alert('Address details not found');
        return;
    }

    // Populate Edit Modal inputs
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };

    setVal('edit-addr-id', addr.id);
    setVal('edit-addr-name', addr.fullName || currentUser?.name || '');
    setVal('edit-addr-phone', addr.phone || currentUser?.phone || '');
    setVal('edit-addr-line1', addr.addressLine1 || '');
    setVal('edit-addr-line2', addr.addressLine2 || '');
    setVal('edit-addr-city', addr.city || 'Bengaluru');
    setVal('edit-addr-state', addr.state || 'Karnataka');
    setVal('edit-addr-pincode', addr.pincode || '');
    setVal('edit-addr-type', addr.type || 'Home');

    const modalEl = document.getElementById('editAddressModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}

async function saveEditedAddressModal() {
    if (!editingAddressId) return;

    const fullName = document.getElementById('edit-addr-name')?.value.trim();
    const phone = document.getElementById('edit-addr-phone')?.value.trim();
    const line1 = document.getElementById('edit-addr-line1')?.value.trim();
    const line2 = document.getElementById('edit-addr-line2')?.value.trim() || '';
    const city = document.getElementById('edit-addr-city')?.value.trim() || 'Bengaluru';
    const state = document.getElementById('edit-addr-state')?.value.trim() || 'Karnataka';
    const pincode = document.getElementById('edit-addr-pincode')?.value.trim();
    const type = document.getElementById('edit-addr-type')?.value || 'Home';

    if (!fullName || !phone || !line1 || !pincode) {
        alert('Please fill out all required address fields.');
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/addresses/${editingAddressId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, phone, addressLine1: line1, addressLine2: line2, city, state, pincode, type })
        });

        if (response.ok) {
            showToast('Delivery address updated successfully! ✏️🏠');
            const modalEl = document.getElementById('editAddressModal');
            if (modalEl) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                if (modal) modal.hide();
                document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                document.body.classList.remove('modal-open');
                document.body.style.removeProperty('padding-right');
                document.body.style.removeProperty('overflow');
            }

            selectedAddressId = editingAddressId;
            localStorage.setItem('selectedAddressId', selectedAddressId);

            if (document.getElementById('address-cards-container')) {
                await fetchUserAddresses();
            }
            if (document.getElementById('profile-address-list')) {
                await fetchProfileAddresses();
            }
        } else {
            alert('Failed to update address. Please check details.');
        }
    } catch (e) {
        alert('Network error updating address');
    }
}

async function deleteAddress(addressId) {
    if (!confirm('Are you sure you want to delete this delivery address?')) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/addresses/${addressId}`, {
            method: 'DELETE'
        });

        if (response.ok || response.status === 204) {
            showToast('Address removed successfully! 🗑️');
            if (selectedAddressId === addressId) {
                selectedAddressId = null;
                localStorage.removeItem('selectedAddressId');
            }
            if (document.getElementById('address-cards-container')) {
                await fetchUserAddresses();
            }
            if (document.getElementById('profile-address-list')) {
                await fetchProfileAddresses();
            }
        } else {
            showToast('Could not delete address', '⚠️');
        }
    } catch (e) {
        showToast('Network error deleting address', '⚠️');
    }
}

async function saveNewAddressModal() {
    const fullName = document.getElementById('new-addr-name')?.value.trim();
    const phone = document.getElementById('new-addr-phone')?.value.trim();
    const line1 = document.getElementById('new-addr-line1')?.value.trim();
    const line2 = document.getElementById('new-addr-line2')?.value.trim() || '';
    const city = document.getElementById('new-addr-city')?.value.trim() || 'Bengaluru';
    const state = document.getElementById('new-addr-state')?.value.trim() || 'Karnataka';
    const pincode = document.getElementById('new-addr-pincode')?.value.trim();
    const type = document.getElementById('new-addr-type')?.value || 'Home';

    if (!fullName || !phone || !line1 || !pincode) {
        alert('Please fill out all required address fields.');
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/addresses/user/${currentUser.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, phone, addressLine1: line1, addressLine2: line2, city, state, pincode, type })
        });

        if (response.ok) {
            const created = await response.json();
            showToast('Delivery address added successfully! 🏠');
            const modalEl = document.getElementById('addAddressModal');
            if (modalEl) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                if (modal) modal.hide();
                document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                document.body.classList.remove('modal-open');
                document.body.style.removeProperty('padding-right');
                document.body.style.removeProperty('overflow');
            }

            if (created && created.id) {
                selectedAddressId = created.id;
                localStorage.setItem('selectedAddressId', selectedAddressId);
            }

            if (document.getElementById('address-cards-container')) {
                await fetchUserAddresses();
            }
            if (document.getElementById('profile-address-list')) {
                await fetchProfileAddresses();
            }
        } else {
            alert('Failed to save address');
        }
    } catch (e) {
        alert('Network error saving address');
    }
}


const DEFAULT_COUPONS = [
    { id: 1, code: 'SWIGGY50', discountAmount: 100, minOrderAmount: 199, description: '50% OFF up to ₹100' },
    { id: 2, code: 'ZOMATO100', discountAmount: 100, minOrderAmount: 399, description: 'Flat ₹100 OFF' },
    { id: 3, code: 'WELCOME50', discountAmount: 50, minOrderAmount: 149, description: 'Flat ₹50 OFF on BiteBliss' },
    { id: 4, code: 'FEAST20', discountAmount: 150, minOrderAmount: 299, description: 'Save ₹150 on Mega Feast' },
    { id: 5, code: 'FREEDEL', discountAmount: 40, minOrderAmount: 199, description: 'Free Delivery Discount' }
];

let availableCouponsCache = null;

async function getAvailableCoupons() {
    if (availableCouponsCache && availableCouponsCache.length > 0) {
        return availableCouponsCache;
    }
    try {
        const res = await fetch(`${API_URL}/coupons`);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                availableCouponsCache = data.filter(c => c.active !== false);
                return availableCouponsCache;
            }
        }
    } catch (e) {
        console.warn('Could not fetch coupons, using fallback:', e);
    }
    return DEFAULT_COUPONS;
}

async function renderCartCoupons(itemTotal) {
    const container = document.getElementById('cart-coupons-list');
    if (!container) return;

    const coupons = await getAvailableCoupons();
    container.innerHTML = coupons.map(c => {
        const isApplied = appliedCoupon && appliedCoupon.code.toUpperCase() === c.code.toUpperCase();
        const minReq = Number(c.minOrderAmount) || 0;
        const discountAmt = Number(c.discountAmount) || 0;
        const isEligible = itemTotal >= minReq;
        const needed = minReq - itemTotal;

        return `
            <div class="col-sm-6">
                <div class="offer-card ${isApplied ? 'applied border-success shadow-sm' : ''}" style="cursor: pointer; transition: all 0.2s;" onclick="${isApplied ? 'removeCoupon()' : (isEligible ? `quickApplyCoupon('${c.code}')` : `showToast('Add ₹${needed} more to apply ${c.code}', 'ℹ️')`)}">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <span class="offer-code-tag ${isApplied ? 'bg-success text-white' : ''}">${escapeHTML(c.code)}</span>
                        ${isApplied ? '<span class="badge bg-success rounded-pill px-2 py-1">APPLIED ✓</span>' : (isEligible ? '<span class="badge bg-light text-primary border rounded-pill px-2 py-1">APPLY ➔</span>' : `<span class="badge bg-light text-muted border rounded-pill px-2 py-1">Min ₹${minReq}</span>`)}
                    </div>
                    <h6 class="fw-bold mb-1 text-dark">${c.description || `Save ₹${discountAmt}`}</h6>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="${isEligible ? 'text-muted' : 'text-danger fw-semibold'}">
                            ${isEligible ? `Min order ₹${minReq}` : `Add ₹${needed} more to unlock`}
                        </small>
                        ${isApplied ? '<button class="btn btn-xs btn-outline-danger py-0 px-2 rounded-pill small" onclick="event.stopPropagation(); removeCoupon()">Remove</button>' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function renderCheckoutQuickCoupons(subtotal) {
    const container = document.getElementById('checkout-quick-coupons');
    if (!container) return;

    const coupons = await getAvailableCoupons();
    container.innerHTML = coupons.map(c => {
        const isApplied = appliedCoupon && appliedCoupon.code.toUpperCase() === c.code.toUpperCase();
        const minReq = Number(c.minOrderAmount) || 0;
        const discountAmt = Number(c.discountAmount) || 0;
        const isEligible = subtotal >= minReq;

        if (isApplied) {
            return `
                <button type="button" class="btn btn-sm btn-success fw-bold rounded-pill px-3 shadow-sm" onclick="removeCoupon()">
                    ✓ ${escapeHTML(c.code)} Applied (₹${discountAmt} OFF) • Remove
                </button>
            `;
        }

        return `
            <button type="button" class="btn btn-sm ${isEligible ? 'btn-light border text-primary fw-bold' : 'btn-light border text-muted opacity-75'} rounded-pill" onclick="quickApplyCoupon('${c.code}')" ${isEligible ? '' : `title="Requires min order ₹${minReq}"`}>
                🏷️ ${escapeHTML(c.code)} (${c.description || `₹${discountAmt} OFF`})
            </button>
        `;
    }).join('');
}

function applyCouponFromInput(inputId) {
    const el = document.getElementById(inputId);
    const code = el ? el.value.trim().toUpperCase() : '';
    applyCouponCode(code);
}

async function quickApplyCoupon(code) {
    const input1 = document.getElementById('coupon-code-input');
    if (input1) input1.value = code;
    const input2 = document.getElementById('cart-coupon-input');
    if (input2) input2.value = code;
    await applyCouponCode(code);
}

async function applyCouponCode(codeToApply) {
    let code = codeToApply;
    if (!code) {
        const input = document.getElementById('coupon-code-input') || document.getElementById('cart-coupon-input');
        code = input ? input.value.trim().toUpperCase() : '';
    }

    const feedbackCheckout = document.getElementById('coupon-feedback');
    const feedbackCart = document.getElementById('cart-coupon-feedback');

    const setFeedback = (html) => {
        if (feedbackCheckout) feedbackCheckout.innerHTML = html;
        if (feedbackCart) feedbackCart.innerHTML = html;
    };

    if (!code) {
        setFeedback('<span class="text-danger fw-bold">Please enter a coupon code</span>');
        return;
    }

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    if (subtotal === 0) {
        setFeedback('<span class="text-danger">Your cart is empty. Add items first!</span>');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/coupons/validate?code=${encodeURIComponent(code)}&total=${subtotal}`);
        if (response.ok) {
            appliedCoupon = await response.json();
            localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));

            const msg = `🎉 Coupon ${appliedCoupon.code} applied! You saved ₹${appliedCoupon.discountAmount}`;
            setFeedback(`<span class="text-success fw-bold">${msg}</span>`);
            showToast(`Applied coupon ${appliedCoupon.code}! Saved ₹${appliedCoupon.discountAmount}`, '🏷️');

            const input1 = document.getElementById('coupon-code-input');
            if (input1) input1.value = appliedCoupon.code;
            const input2 = document.getElementById('cart-coupon-input');
            if (input2) input2.value = appliedCoupon.code;

            if (document.getElementById('cart-items-list')) {
                renderCartPage();
            }
            if (document.getElementById('checkout-items-summary')) {
                renderCheckoutBillSummary();
            }
        } else {
            const err = await response.text();
            setFeedback(`<span class="text-danger fw-bold">${err || 'Invalid coupon code'}</span>`);
            showToast(err || 'Failed to apply coupon', '⚠️');
        }
    } catch (e) {
        console.error('Coupon validation error:', e);
        setFeedback('<span class="text-danger">Network error validating coupon</span>');
    }
}

function removeCoupon(showFeedback = true) {
    const code = appliedCoupon ? appliedCoupon.code : '';
    appliedCoupon = null;
    localStorage.removeItem('appliedCoupon');

    const feedbackCheckout = document.getElementById('coupon-feedback');
    if (feedbackCheckout) feedbackCheckout.innerHTML = '';
    const feedbackCart = document.getElementById('cart-coupon-feedback');
    if (feedbackCart) feedbackCart.innerHTML = '';

    const input1 = document.getElementById('coupon-code-input');
    if (input1) input1.value = '';
    const input2 = document.getElementById('cart-coupon-input');
    if (input2) input2.value = '';

    if (showFeedback && code) {
        showToast(`Coupon ${code} removed`, '🏷️');
    }

    if (document.getElementById('cart-items-list')) {
        renderCartPage();
    }
    if (document.getElementById('checkout-items-summary')) {
        renderCheckoutBillSummary();
    }
}

// Order Placement & Payment Simulator
async function processOrderPayment() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    if (!selectedAddressId) {
        alert('Please select or add a delivery address');
        return;
    }

    const paymentType = document.querySelector('input[name="paymentType"]:checked')?.value || 'CASH_ON_DELIVERY';

    // Show Payment Processing Simulation Modal
    const modalEl = document.getElementById('paymentProcessingModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
        modal.show();
    }

    const items = cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity }));
    const requestBody = {
        userId: currentUser.id,
        items: items,
        addressId: selectedAddressId,
        paymentType: paymentType,
        couponCode: appliedCoupon ? appliedCoupon.code : null
    };

    setTimeout(async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const order = await response.json();
                cart = [];
                localStorage.removeItem('cart');
                appliedCoupon = null;
                localStorage.removeItem('appliedCoupon');

                // Switch modal content to success check
                const statusTitle = document.getElementById('payment-modal-title');
                const statusIcon = document.getElementById('payment-modal-icon');
                if (statusTitle) statusTitle.textContent = 'Payment Confirmed & Order Placed!';
                if (statusIcon) statusIcon.innerHTML = '🎉';

                setTimeout(() => {
                    window.location.href = `bill.html?orderId=${order.id}`;
                }, 1200);
            } else {
                const err = await response.json();
                alert(`Order creation failed: ${err.message || 'Error'}`);
                if (modalEl) {
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                }
            }
        } catch (error) {
            alert('Network error communicating with order server');
            if (modalEl) {
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
        }
    }, 1500);
}

// =========================================================
// Live Order Tracking & Bill Page
// =========================================================
let currentTrackedOrder = null;

async function initBillPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    if (!orderId) {
        window.location.href = 'orders.html';
        return;
    }

    await loadAndRenderOrderBill(orderId);

    // Real-time automatic polling every 3 seconds
    if (window.__billPollingInterval) clearInterval(window.__billPollingInterval);
    window.__billPollingInterval = setInterval(async () => {
        await pollOrderLiveStatus(orderId);
    }, 3000);
}

async function loadAndRenderOrderBill(orderId) {
    try {
        const response = await fetchWithAuth(`${API_URL}/orders/${orderId}`);
        if (response.ok) {
            const order = await response.json();
            currentTrackedOrder = order;
            renderBillDetails(order);
            await fetchOrderStatusHistory(orderId);
        } else {
            console.error('Order not found or unauthorized');
        }
    } catch (e) {
        console.error('Error loading bill:', e);
    }
}

async function pollOrderLiveStatus(orderId) {
    try {
        const response = await fetchWithAuth(`${API_URL}/orders/${orderId}`);
        if (response.ok) {
            const order = await response.json();
            if (!currentTrackedOrder || currentTrackedOrder.status !== order.status) {
                const oldStatus = currentTrackedOrder ? currentTrackedOrder.status : null;
                currentTrackedOrder = order;
                renderBillDetails(order);
                await fetchOrderStatusHistory(orderId);
                if (oldStatus) {
                    showToast(`Order status updated to: ${order.status}!`, '🚀');
                }
            }
        }
    } catch (e) {
        console.error('Live polling error:', e);
    }
}

async function fetchOrderStatusHistory(orderId) {
    const listEl = document.getElementById('order-status-history-list');
    if (!listEl) return;

    try {
        const res = await fetchWithAuth(`${API_URL}/orders/${orderId}/history`);
        if (res.ok) {
            const history = await res.json();
            if (history && history.length > 0) {
                listEl.innerHTML = history.map(h => {
                    const timeStr = h.changedAt ? new Date(h.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    let badgeBg = 'bg-warning text-dark';
                    if (h.status === 'ACCEPTED') badgeBg = 'bg-info text-dark';
                    else if (h.status === 'PREPARING') badgeBg = 'bg-primary text-white';
                    else if (h.status === 'READY') badgeBg = 'text-white" style="background-color: #6f42c1;';
                    else if (h.status === 'OUT_FOR_DELIVERY') badgeBg = 'bg-info text-white';
                    else if (h.status === 'DELIVERED') badgeBg = 'bg-success text-white';
                    else if (h.status === 'CANCELLED' || h.status === 'REJECTED') badgeBg = 'bg-danger text-white';

                    return `
                        <div class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-white border mb-1">
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge ${badgeBg} px-2 py-1">${escapeHTML(h.status)}</span>
                                <span class="text-dark fw-semibold small">${escapeHTML(h.comment || '')}</span>
                            </div>
                            <div class="text-end">
                                <span class="badge bg-light text-secondary border me-1">${escapeHTML(h.changedBy || 'Admin')}</span>
                                <span class="text-muted small">${timeStr}</span>
                            </div>
                        </div>
                    `;
                }).join('');
                return;
            }
        }
        listEl.innerHTML = '<div class="text-muted small">No status changes recorded yet.</div>';
    } catch (e) {
        listEl.innerHTML = '<div class="text-muted small">Order Placed • Status: PENDING</div>';
    }
}

function renderBillDetails(order) {
    const successOrderId = document.getElementById('success-order-id');
    if (successOrderId) successOrderId.textContent = `#${order.id}`;

    const successStatusPill = document.getElementById('success-status-pill');
    if (successStatusPill) {
        successStatusPill.textContent = order.status;
        let pillClass = 'bg-warning text-dark';
        if (order.status === 'ACCEPTED') pillClass = 'bg-info text-dark';
        else if (order.status === 'PREPARING') pillClass = 'bg-primary text-white';
        else if (order.status === 'READY') pillClass = 'text-white" style="background-color: #6f42c1;';
        else if (order.status === 'OUT_FOR_DELIVERY') pillClass = 'bg-info text-white';
        else if (order.status === 'DELIVERED') pillClass = 'bg-success text-white';
        else if (order.status === 'CANCELLED' || order.status === 'REJECTED') pillClass = 'bg-danger text-white';
        successStatusPill.className = `badge ${pillClass} rounded-pill px-3 py-1`;
    }

    const successEta = document.getElementById('success-eta-time');
    if (successEta) {
        switch (order.status) {
            case 'PENDING':
                successEta.textContent = '⏳ Waiting for Restaurant Acceptance';
                break;
            case 'ACCEPTED':
                successEta.textContent = '⚡ 30-35 Mins (Accepted)';
                break;
            case 'PREPARING':
                successEta.textContent = '🍳 25-30 Mins (Cooking)';
                break;
            case 'READY':
                successEta.textContent = '📦 15-20 Mins (Packed & Ready)';
                break;
            case 'OUT_FOR_DELIVERY':
                successEta.textContent = '🛵 10-15 Mins (On the Way)';
                break;
            case 'DELIVERED':
                successEta.textContent = '✓ Delivered';
                break;
            default:
                successEta.textContent = order.status;
        }
    }

    const billOrderId = document.getElementById('bill-order-id');
    if (billOrderId) billOrderId.textContent = `#${order.id}`;

    const billDate = document.getElementById('bill-date');
    if (billDate) billDate.textContent = new Date(order.orderDate).toLocaleString();

    const billStatus = document.getElementById('bill-status-badge');
    if (billStatus) billStatus.textContent = order.status;

    const billPay = document.getElementById('bill-payment-mode');
    if (billPay) billPay.textContent = order.paymentType || 'ONLINE (UPI)';

    let itemSubtotal = 0;
    const itemsTable = document.getElementById('bill-items-table');
    if (itemsTable && order.items) {
        itemsTable.innerHTML = '';
        order.items.forEach(item => {
            const rowSubtotal = item.subtotal != null ? Number(item.subtotal) : (item.price * item.quantity);
            itemSubtotal += rowSubtotal;
            itemsTable.innerHTML += `
                <tr>
                    <td class="fw-semibold text-dark">${escapeHTML(item.menuItemName)}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-end">₹${item.price}</td>
                    <td class="text-end fw-bold text-dark">₹${rowSubtotal}</td>
                </tr>
            `;
        });
    }

    const billSub = document.getElementById('bill-subtotal');
    if (billSub) billSub.textContent = `₹${itemSubtotal}`;

    const billDelivery = document.getElementById('bill-delivery-fee');
    if (billDelivery) {
        const dFee = order.deliveryFee != null ? Number(order.deliveryFee) : 40;
        billDelivery.textContent = dFee === 0 ? 'FREE' : `₹${dFee}`;
    }

    const billTaxes = document.getElementById('bill-taxes');
    if (billTaxes) {
        billTaxes.textContent = `₹${Math.round(itemSubtotal * 0.05)}`;
    }

    const discountRow = document.getElementById('bill-discount-row');
    const discountEl = document.getElementById('bill-discount');
    const disc = order.discount != null ? Number(order.discount) : 0;
    if (disc > 0) {
        if (discountRow) discountRow.classList.remove('d-none');
        if (discountEl) discountEl.textContent = `-₹${disc}`;
    } else {
        if (discountRow) discountRow.classList.add('d-none');
    }

    const billGrand = document.getElementById('bill-grand-total');
    if (billGrand) billGrand.textContent = `₹${order.totalAmount}`;

    // Update Friend-by-Friend Split on Invoice
    const billSplitSec = document.getElementById('bill-group-split-section');
    const billSplitTable = document.getElementById('bill-split-summary-table');
    const billSplitRoom = document.getElementById('bill-split-room-code');
    if (billSplitSec && groupOrder && groupOrder.active && groupOrder.members && groupOrder.members.length > 0) {
        billSplitSec.classList.remove('d-none');
        if (billSplitRoom) billSplitRoom.textContent = `ROOM #${groupOrder.roomCode}`;
        if (billSplitTable) {
            const splitResult = calculateBillSplit(order);
            billSplitTable.innerHTML = splitResult.breakdown.map(b => `
                <tr class="border-bottom">
                    <td class="py-2">
                        <div class="d-flex align-items-center gap-2">
                            <span class="fs-5">${b.member.avatar}</span>
                            <div>
                                <strong class="text-dark small">${escapeHTML(b.member.name)}</strong>
                                <small class="text-muted d-block" style="font-size:0.75rem;">${b.itemSummary}</small>
                            </div>
                        </div>
                    </td>
                    <td class="text-end py-2">
                        <span class="fw-bold text-primary fs-6">₹${b.finalShare}</span>
                        <button class="btn btn-sm btn-outline-primary rounded-pill px-2 py-0 ms-2" style="font-size:0.72rem;" onclick="openFriendUpiQrModal('${b.member.id}')">📱 QR</button>
                    </td>
                </tr>
            `).join('');
        }
    } else if (billSplitSec) {
        billSplitSec.classList.add('d-none');
    }

    updateProgressStepper(order.status);
}

function updateProgressStepper(status) {
    const stepper = document.getElementById('order-stepper-container');
    const banner = document.getElementById('order-terminal-banner');
    if (!stepper) return;

    if (status === 'CANCELLED' || status === 'REJECTED') {
        stepper.classList.add('d-none');
        if (banner) {
            banner.className = `alert alert-${status === 'CANCELLED' ? 'secondary' : 'danger'} mb-4 mx-auto text-center rounded-4 p-3 d-block`;
            banner.innerHTML = `<strong>Order ${status}</strong>: ${status === 'CANCELLED' ? 'This order was cancelled.' : 'Sorry, the restaurant could not accept this order.'}`;
        }
        return;
    }

    if (banner) banner.className = 'alert d-none';
    stepper.classList.remove('d-none');

    const steps = [
        { key: 'PENDING', node: document.getElementById('step-placed'), circle: document.getElementById('circle-placed'), line: document.getElementById('line-1'), label: 'Order Placed' },
        { key: 'ACCEPTED', node: document.getElementById('step-accepted'), circle: document.getElementById('circle-accepted'), line: document.getElementById('line-2'), label: 'Order Accepted' },
        { key: 'PREPARING', node: document.getElementById('step-preparing'), circle: document.getElementById('circle-preparing'), line: document.getElementById('line-3'), label: 'Preparing' },
        { key: 'READY', node: document.getElementById('step-ready'), circle: document.getElementById('circle-ready'), line: document.getElementById('line-4'), label: 'Ready' },
        { key: 'OUT_FOR_DELIVERY', node: document.getElementById('step-out'), circle: document.getElementById('circle-out'), line: document.getElementById('line-5'), label: 'Out for Delivery' },
        { key: 'DELIVERED', node: document.getElementById('step-delivered'), circle: document.getElementById('circle-delivered'), line: null, label: 'Delivered' }
    ];

    const statusOrder = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    let currentIdx = statusOrder.indexOf((status || '').toUpperCase());
    if (currentIdx === -1) currentIdx = 0;

    steps.forEach((st, idx) => {
        if (!st.node) return;
        st.node.className = 'order-step-node';
        if (st.line) st.line.className = 'step-connector';

        if (idx < currentIdx) {
            // Completed
            st.node.classList.add('completed');
            if (st.circle) st.circle.textContent = '✓';
            if (st.line) st.line.classList.add('completed');
        } else if (idx === currentIdx) {
            if (currentIdx === statusOrder.length - 1) {
                // Delivered is completed
                st.node.classList.add('completed');
                if (st.circle) st.circle.textContent = '✓';
            } else {
                // Currently Active
                st.node.classList.add('active');
                if (st.circle) st.circle.textContent = '●';
            }
        } else {
            // Future / inactive
            if (st.circle) st.circle.textContent = '○';
        }
    });
}

// =========================================================
// My Orders Page
// =========================================================
async function fetchOrders() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const container = document.getElementById('orders-list-container');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

    try {
        const response = await fetchWithAuth(`${API_URL}/orders/user/${currentUser.id}`);
        if (response.ok) {
            const orders = await response.json();
            renderOrdersList(orders);
        } else {
            container.innerHTML = '<p class="text-center text-muted">Failed to load orders.</p>';
        }
    } catch (e) {
        container.innerHTML = '<p class="text-center text-danger">Network error loading orders.</p>';
    }
}

function renderOrdersList(orders) {
    const container = document.getElementById('orders-list-container');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div style="font-size: 3.5rem;">📦</div>
                <h4 class="fw-bold mt-2">No orders placed yet</h4>
                <p class="text-muted">Explore our delicious menu with 100+ dishes!</p>
                <a href="menu.html" class="btn btn-primary-gradient px-4 py-2 mt-2">Explore Menu</a>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    orders.reverse().forEach(order => {
        let badgeColor = 'bg-warning text-dark';
        if (order.status === 'ACCEPTED') badgeColor = 'bg-info text-dark';
        else if (order.status === 'PREPARING') badgeColor = 'bg-primary text-white';
        else if (order.status === 'READY') badgeColor = 'text-white" style="background-color: #6f42c1;';
        else if (order.status === 'OUT_FOR_DELIVERY') badgeColor = 'bg-info text-white';
        else if (order.status === 'DELIVERED') badgeColor = 'bg-success text-white';
        else if (order.status === 'REJECTED') badgeColor = 'bg-danger text-white';
        else if (order.status === 'CANCELLED') badgeColor = 'bg-secondary text-white';

        const itemsSummary = order.items.map(i => `<span class="badge bg-light text-dark me-1 mb-1">${escapeHTML(i.menuItemName)} x ${i.quantity}</span>`).join(' ');

        const card = document.createElement('div');
        card.className = 'card mb-4 border-0 shadow-sm rounded-4 overflow-hidden';
        card.innerHTML = `
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                <div>
                    <span class="fw-bold fs-6">Order #${order.id}</span>
                    <span class="text-muted small ms-2">• ${new Date(order.orderDate).toLocaleDateString()} at ${new Date(order.orderDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <span class="badge ${badgeColor} px-3 py-2 rounded-pill">${order.status}</span>
            </div>
            <div class="card-body p-4">
                <div class="mb-3">${itemsSummary}</div>
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <span class="text-muted small">Total Paid:</span>
                        <h5 class="fw-bold mb-0 text-primary">₹${order.totalAmount}</h5>
                    </div>
                    <div class="d-flex gap-2">
                        <a href="bill.html?orderId=${order.id}" class="btn btn-outline-custom btn-sm">
                            📍 Live Tracking & Bill
                        </a>
                        <button class="btn btn-primary-gradient btn-sm" onclick="reorderItems(${JSON.stringify(order.items).replace(/"/g, '&quot;')})">
                            🔁 Order Again
                        </button>
                        ${order.status === 'PENDING' ? `
                            <button class="btn btn-outline-danger btn-sm" onclick="cancelOrder(${order.id})">Cancel Order</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/orders/${orderId}`, { method: 'DELETE' });
        if (response.ok) {
            showToast('Order cancelled successfully', '🗑️');
            fetchOrders();
        } else {
            alert('Failed to cancel order');
        }
    } catch (e) {
        alert('Network error cancelling order');
    }
}

function reorderItems(items) {
    items.forEach(item => {
        const existing = cart.find(ci => ci.menuItemId === item.menuItemId);
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            cart.push({
                menuItemId: item.menuItemId,
                name: item.menuItemName,
                price: item.price,
                quantity: item.quantity,
                imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
                isVeg: true
            });
        }
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    updateNavbar();
    showToast('Items added to cart! Redirecting...', '🛒');
    setTimeout(() => { window.location.href = 'cart.html'; }, 800);
}

// =========================================================
// Profile Page
// =========================================================
async function initProfilePage() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-phone').textContent = currentUser.phone || 'Not provided';
    document.getElementById('profile-role').textContent = currentUser.role;

    await fetchProfileAddresses();
}

async function fetchProfileAddresses() {
    const list = document.getElementById('profile-address-list');
    if (!list) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/addresses/user/${currentUser.id}`);
        if (response.ok) {
            const addresses = await response.json();
            list.innerHTML = '';
            if (addresses.length === 0) {
                list.innerHTML = '<p class="text-muted">No saved addresses yet.</p>';
                return;
            }

            addresses.forEach(addr => {
                list.innerHTML += `
                    <div class="card mb-3 border shadow-sm rounded-3">
                        <div class="card-body p-3 d-flex justify-content-between align-items-center">
                            <div>
                                <span class="badge bg-primary me-2">${escapeHTML(addr.type || 'Home')}</span>
                                <strong>${escapeHTML(addr.fullName || currentUser.name)}</strong> (${escapeHTML(addr.phone || '9876543210')})<br>
                                <small class="text-muted">${escapeHTML(addr.addressLine1)}${addr.addressLine2 ? ', ' + escapeHTML(addr.addressLine2) : ''}, ${escapeHTML(addr.city)}, ${escapeHTML(addr.state || '')} - <strong>${escapeHTML(addr.pincode)}</strong></small>
                            </div>
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="openEditAddressModal(${addr.id})">
                                    ✏️ Edit
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-2" onclick="deleteAddress(${addr.id})">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            userAddressesCache = addresses;
        }
    } catch (e) {}
}

// =========================================================
// Home Page Popular Dishes
// =========================================================
async function fetchHomePopularDishes() {
    const container = document.getElementById('home-popular-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/menu?page=0&size=8`);
        if (response.ok) {
            const data = await response.json();
            container.innerHTML = '';
            (data.content || []).forEach(item => {
                const cartItem = cart.find(ci => ci.menuItemId === item.id);
                const qty = cartItem ? cartItem.quantity : 0;
                const card = document.createElement('div');
                card.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
                card.innerHTML = `
                    <div class="food-card-modern">
                        <div class="food-card-img-wrapper">
                            <img src="${escapeHTML(item.imageUrl)}" alt="${escapeHTML(item.name)}" loading="lazy">
                            <div class="discount-ribbon">⭐ TOP RATED</div>
                        </div>
                        <div class="food-card-body">
                            <div class="d-flex align-items-center justify-content-between">
                                <span class="${item.isVeg ? 'veg-badge' : 'nonveg-badge'}"></span>
                                <span class="restaurant-title">${escapeHTML(item.restaurantName || 'BiteBliss')}</span>
                            </div>
                            <h5 class="dish-name mt-1">${escapeHTML(item.name)}</h5>
                            <div class="meta-badges">
                                <span class="rating-badge">★ ${(item.rating || 4.5).toFixed(1)}</span>
                                <span class="text-muted">•</span>
                                <span class="prep-time">⏱️ ${item.prepTimeMinutes || 25} mins</span>
                            </div>
                            <div class="card-bottom-action">
                                <span class="dish-price">₹${item.price}</span>
                                <div class="swiggy-btn-container" id="btn-container-${item.id}">
                                    ${renderStepperOrAddButton(item.id, qty, item.name, item.price, item.imageUrl, item.isVeg)}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (e) {}
}

// =========================================================
// Admin Dashboard
// =========================================================
async function initAdminPage() {
    if (!currentUser || currentUser.role !== 'ROLE_ADMIN') {
        document.body.innerHTML = '<div class="container text-center py-5"><h1 class="text-danger">Access Denied: Admin Only</h1><a href="index.html" class="btn btn-primary mt-3">Back to Home</a></div>';
        return;
    }
    fetchAdminStats();
    fetchAdminMenu();
    fetchAdminOrders();
    fetchAdminCoupons();
}

async function fetchAdminStats() {
    try {
        const response = await fetchWithAuth(`${API_URL}/admin/stats`);
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('stat-users').textContent = stats.totalUsers || 0;
            document.getElementById('stat-orders').textContent = stats.totalOrders || 0;
            document.getElementById('stat-today').textContent = stats.todayOrders || 0;
            document.getElementById('stat-revenue').textContent = `₹${stats.revenue || 0}`;
        }
    } catch (e) {}
}

async function fetchAdminMenu() {
    const tbody = document.getElementById('admin-menu-body');
    if (!tbody) return;

    try {
        const response = await fetch(`${API_URL}/menu?page=0&size=150`);
        if (response.ok) {
            const data = await response.json();
            tbody.innerHTML = '';
            (data.content || []).forEach(item => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${item.id}</td>
                        <td>
                            <img src="${escapeHTML(item.imageUrl)}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;" class="me-2">
                            <strong>${escapeHTML(item.name)}</strong>
                        </td>
                        <td>₹${item.price}</td>
                        <td><span class="badge bg-secondary">${escapeHTML(item.category)}</span></td>
                        <td>
                            <span class="badge ${item.available ? 'bg-success' : 'bg-danger'}">${item.available ? 'In Stock' : 'Out of Stock'}</span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteMenuItem(${item.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (e) {}
}

async function addMenuItemAdmin(e) {
    e.preventDefault();
    const name = document.getElementById('add-name').value.trim();
    const price = parseFloat(document.getElementById('add-price').value);
    const category = document.getElementById('add-category').value.trim();
    const imageUrl = document.getElementById('add-image').value.trim();
    const isVeg = document.getElementById('add-isveg')?.checked || true;

    try {
        const response = await fetchWithAuth(`${API_URL}/menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, category, imageUrl, available: true, isVeg, rating: 4.5, restaurantName: 'BiteBliss Kitchen', prepTimeMinutes: 20 })
        });

        if (response.ok) {
            showToast('Dish added successfully to menu!', '🍽️');
            document.getElementById('add-item-form').reset();
            fetchAdminMenu();
        } else {
            alert('Failed to add menu item');
        }
    } catch (e) {
        alert('Network error');
    }
}

async function deleteMenuItem(id) {
    if (!confirm('Are you sure you want to delete this dish from menu?')) return;
    try {
        const response = await fetchWithAuth(`${API_URL}/menu/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showToast('Item deleted', '🗑️');
            fetchAdminMenu();
        }
    } catch (e) {}
}

async function fetchAdminOrders() {
    const tbody = document.getElementById('admin-orders-body');
    if (!tbody) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/orders`);
        if (response.ok) {
            const orders = await response.json();
            tbody.innerHTML = '';
            orders.reverse().forEach(order => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${order.id}</td>
                        <td>User #${order.userId}</td>
                        <td class="fw-bold">₹${order.totalAmount}</td>
                        <td><span class="badge bg-primary">${order.status}</span></td>
                        <td>
                            <select class="form-select form-select-sm" onchange="updateOrderStatusAdmin(${order.id}, this.value)">
                                <option value="CONFIRMED" ${order.status === 'CONFIRMED' ? 'selected' : ''}>CONFIRMED</option>
                                <option value="PREPARING" ${order.status === 'PREPARING' ? 'selected' : ''}>PREPARING</option>
                                <option value="OUT_FOR_DELIVERY" ${order.status === 'OUT_FOR_DELIVERY' ? 'selected' : ''}>OUT_FOR_DELIVERY</option>
                                <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>DELIVERED</option>
                                <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
                            </select>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (e) {}
}

async function updateOrderStatusAdmin(orderId, newStatus) {
    try {
        const response = await fetchWithAuth(`${API_URL}/orders/${orderId}/status?status=${encodeURIComponent(newStatus)}`, {
            method: 'PUT'
        });
        if (response.ok) {
            showToast(`Order #${orderId} marked as ${newStatus}`, '✅');
            fetchAdminOrders();
            fetchAdminStats();
        }
    } catch (e) {}
}

async function fetchAdminCoupons() {
    const tbody = document.getElementById('admin-coupons-body');
    if (!tbody) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/coupons`);
        if (response.ok) {
            const coupons = await response.json();
            tbody.innerHTML = '';
            coupons.forEach(c => {
                tbody.innerHTML += `
                    <tr>
                        <td class="fw-bold">${escapeHTML(c.code)}</td>
                        <td>₹${c.discountAmount}</td>
                        <td>₹${c.minOrderAmount}</td>
                        <td><span class="badge ${c.active ? 'bg-success' : 'bg-secondary'}">${c.active ? 'Active' : 'Inactive'}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="toggleCouponAdmin(${c.id})">${c.active ? 'Deactivate' : 'Activate'}</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (e) {}
}

async function addCouponAdmin(e) {
    e.preventDefault();
    const code = document.getElementById('coupon-code-add').value.trim().toUpperCase();
    const discountAmount = parseFloat(document.getElementById('coupon-disc').value);
    const minOrderAmount = parseFloat(document.getElementById('coupon-min').value);

    try {
        const response = await fetchWithAuth(`${API_URL}/coupons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, discountAmount, minOrderAmount, active: true })
        });
        if (response.ok) {
            showToast(`Coupon ${code} created!`, '🏷️');
            fetchAdminCoupons();
        }
    } catch (e) {}
}

async function toggleCouponAdmin(id) {
    try {
        const response = await fetchWithAuth(`${API_URL}/coupons/${id}/toggle`, { method: 'PUT' });
        if (response.ok) {
            fetchAdminCoupons();
        }
    } catch (e) {}
}

// =========================================================
// BiteBliss AI Smart Assistant
// =========================================================
let foodieAIModalInstance = null;

function toggleFoodieAIModal() {
    const modalEl = document.getElementById('foodieAIModal');
    if (!modalEl) return;
    if (!foodieAIModalInstance) {
        foodieAIModalInstance = new bootstrap.Modal(modalEl);
    }
    foodieAIModalInstance.show();
}

function askFoodieAI(promptText) {
    const input = document.getElementById('ai-user-prompt');
    if (input) input.value = promptText;
    sendUserAIMessage();
}

function sendUserAIMessage() {
    const input = document.getElementById('ai-user-prompt');
    const chat = document.getElementById('ai-chat-messages');
    if (!input || !chat) return;

    const query = input.value.trim();
    if (!query) return;

    // Append user message bubble
    const userDiv = document.createElement('div');
    userDiv.className = 'user-bubble';
    userDiv.textContent = query;
    chat.appendChild(userDiv);
    input.value = '';

    // Scroll chat to bottom
    chat.scrollTop = chat.scrollHeight;

    // Generate intelligent AI response
    setTimeout(() => {
        const aiDiv = document.createElement('div');
        aiDiv.className = 'ai-bubble mb-3';

        const qLower = query.toLowerCase();
        if (qLower.includes('biryani')) {
            aiDiv.innerHTML = `
                ✨ <strong>Recommendation: Hyderabadi Chicken Dum Biryani</strong><br>
                Aromatic long-grain basmati rice layered with succulent chicken, saffron, mint and fried crisp onions.<br>
                <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                    <span class="fw-bold text-dark">₹280 • ★ 4.8</span>
                    <button class="btn btn-sm btn-foodie-explore py-1 px-3" onclick="updateItemQty(1, 1, 'Hyderabadi Chicken Dum Biryani', 280, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80', false); foodieAIModalInstance?.hide();">
                        + Add to Cart
                    </button>
                </div>
            `;
        } else if (qLower.includes('pizza')) {
            aiDiv.innerHTML = `
                ✨ <strong>Recommendation: Classic Margherita Pizza</strong><br>
                Stone-baked artisan crust topped with rich San Marzano tomato sauce, mozzarella & fragrant basil.<br>
                <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                    <span class="fw-bold text-dark">₹260 • ★ 4.7</span>
                    <button class="btn btn-sm btn-foodie-explore py-1 px-3" onclick="updateItemQty(11, 1, 'Classic Margherita Pizza', 260, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80', true); foodieAIModalInstance?.hide();">
                        + Add to Cart
                    </button>
                </div>
            `;
        } else if (qLower.includes('dosa') || qLower.includes('south')) {
            aiDiv.innerHTML = `
                ✨ <strong>Recommendation: Crispy Masala Dosa</strong><br>
                Golden crisp crepe stuffed with tempered spiced potato mash, served with fresh coconut chutney & sambar.<br>
                <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                    <span class="fw-bold text-dark">₹130 • ★ 4.8</span>
                    <button class="btn btn-sm btn-foodie-explore py-1 px-3" onclick="updateItemQty(41, 1, 'Crispy Masala Dosa', 130, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80', true); foodieAIModalInstance?.hide();">
                        + Add to Cart
                    </button>
                </div>
            `;
        } else if (qLower.includes('dessert') || qLower.includes('cake') || qLower.includes('sweet')) {
            aiDiv.innerHTML = `
                ✨ <strong>Recommendation: Dutch Truffle Dark Chocolate Cake</strong><br>
                Velvety smooth Belgian chocolate ganache layered with moist rich cocoa sponge.<br>
                <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                    <span class="fw-bold text-dark">₹210 • ★ 4.8</span>
                    <button class="btn btn-sm btn-foodie-explore py-1 px-3" onclick="updateItemQty(91, 1, 'Dutch Truffle Cake Slice', 210, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', true); foodieAIModalInstance?.hide();">
                        + Add to Cart
                    </button>
                </div>
            `;
        } else if (qLower.includes('burger')) {
            aiDiv.innerHTML = `
                ✨ <strong>Recommendation: Crispy Chicken Burger</strong><br>
                Golden battered crunchy chicken patty topped with tangy slaw, jalapeños & melted cheddar on a toasted brioche bun.<br>
                <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                    <span class="fw-bold text-dark">₹220 • ★ 4.6</span>
                    <button class="btn btn-sm btn-foodie-explore py-1 px-3" onclick="updateItemQty(21, 1, 'Crispy Chicken Burger', 220, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', false); foodieAIModalInstance?.hide();">
                        + Add to Cart
                    </button>
                </div>
            `;
        } else if (qLower.includes('rider') || qLower.includes('contact') || qLower.includes('delivery')) {
            aiDiv.innerHTML = `
                🛵 <strong>Delivery Partner Update</strong><br>
                Your delivery hero Rahul Sharma is on the way! You can reach him at <strong>+91 9876543210</strong> or track live GPS on the map.
            `;
        } else {
            aiDiv.innerHTML = `
                ✨ <strong>Great choice!</strong> You can discover mouthwatering dishes matching "<em>${escapeHTML(query)}</em>" in our 100+ curated menu.<br>
                <a href="menu.html?search=${encodeURIComponent(query)}" class="btn btn-sm btn-foodie-explore mt-2" onclick="foodieAIModalInstance?.hide();">
                    🔍 View Dishes for "${escapeHTML(query)}" ➔
                </a>
            `;
        }

        chat.appendChild(aiDiv);
        chat.scrollTop = chat.scrollHeight;
    }, 400);
}

// =========================================================
// STANDOUT FEATURE: Group Order & Smart Bill Splitter Engine
// =========================================================

const AVATAR_POOL = ['👑', '🚴', '🌸', '⚡', '🍕', '🎸', '⚽', '🚀', '🎨', '🦁', '🌟', '🎧'];

function saveGroupOrder(go) {
    groupOrder = go;
    localStorage.setItem('groupOrder', JSON.stringify(groupOrder));
}

function copyGroupRoomCode() {
    if (!groupOrder) return;
    navigator.clipboard.writeText(groupOrder.roomCode).then(() => {
        showToast(`Room Code ${groupOrder.roomCode} copied to clipboard!`, '📋');
    }).catch(() => {
        showToast(`Room Code: ${groupOrder.roomCode}`, '📋');
    });
}

function copyUpiId() {
    const upiInput = document.getElementById('qr-modal-upi-id');
    const upiVal = upiInput ? upiInput.value : 'biteblisspay@okhdfcbank';
    navigator.clipboard.writeText(upiVal).then(() => {
        showToast(`UPI ID ${upiVal} copied!`, '💳');
    }).catch(() => {
        showToast(`UPI ID: ${upiVal}`, '💳');
    });
}

function openGroupOrderModal() {
    if (!groupOrder) {
        groupOrder = {
            active: false,
            roomCode: 'FOOD-' + Math.floor(1000 + Math.random() * 9000),
            splitMode: 'itemized',
            members: [
                { id: 'm_host', name: 'You (Host)', avatar: '👑', isHost: true },
                { id: 'm_1', name: 'Rahul', avatar: '🚴', isHost: false },
                { id: 'm_2', name: 'Priya', avatar: '🌸', isHost: false }
            ]
        };
        saveGroupOrder(groupOrder);
    }

    const roomDisplay = document.getElementById('group-room-code-display');
    if (roomDisplay) roomDisplay.textContent = groupOrder.roomCode;

    renderGroupMembersList();

    const modalEl = document.getElementById('groupOrderModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}

function renderGroupMembersList() {
    const container = document.getElementById('group-members-list-container');
    if (!container || !groupOrder || !groupOrder.members) return;

    container.innerHTML = groupOrder.members.map(m => `
        <div class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-white border shadow-xs">
            <div class="d-flex align-items-center gap-2">
                <span class="fs-4">${m.avatar}</span>
                <div>
                    <strong class="text-dark small">${escapeHTML(m.name)}</strong>
                    ${m.isHost ? '<span class="badge bg-primary-subtle text-primary ms-1" style="font-size:0.7rem;">Host</span>' : ''}
                </div>
            </div>
            ${!m.isHost && groupOrder.members.length > 1 ? `
                <button type="button" class="btn btn-outline-danger btn-sm py-0 px-2 rounded-pill" onclick="removeGroupMember('${m.id}')" title="Remove friend">
                    ✕
                </button>
            ` : ''}
        </div>
    `).join('');
}

function addGroupMemberFromInput() {
    const input = document.getElementById('new-member-name-input');
    if (!input) return;
    const name = input.value.trim();
    if (!name) {
        showToast('Please enter a friend\'s name', '⚠️');
        return;
    }

    const usedAvatars = groupOrder.members.map(m => m.avatar);
    const availableAvatars = AVATAR_POOL.filter(a => !usedAvatars.includes(a));
    const avatar = availableAvatars.length > 0 ? availableAvatars[0] : '👤';

    const newId = 'm_' + Date.now();
    groupOrder.members.push({
        id: newId,
        name: name,
        avatar: avatar,
        isHost: false
    });

    saveGroupOrder(groupOrder);
    input.value = '';
    renderGroupMembersList();
    showToast(`Added ${name} to group order!`, '🎉');
}

function removeGroupMember(id) {
    if (!groupOrder || !groupOrder.members) return;
    const target = groupOrder.members.find(m => m.id === id);
    if (!target || target.isHost) return;

    groupOrder.members = groupOrder.members.filter(m => m.id !== id);

    // Reset any cart items assigned to this member back to 'shared'
    let remapped = false;
    cart.forEach(item => {
        if (item.assignedTo === id) {
            item.assignedTo = 'shared';
            remapped = true;
        }
    });
    if (remapped) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    saveGroupOrder(groupOrder);
    renderGroupMembersList();
    showToast(`Removed ${target.name}`, '🗑️');

    if (document.getElementById('cart-items-list')) {
        renderCartPage();
    }
}

function startOrUpdateGroupOrder() {
    if (!groupOrder) return;
    groupOrder.active = true;
    saveGroupOrder(groupOrder);

    const modalEl = document.getElementById('groupOrderModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }

    showToast(`🎉 Group Order Active! Room #${groupOrder.roomCode}`, '👥');

    if (document.getElementById('cart-items-list')) {
        renderCartPage();
    }
    if (document.getElementById('checkout-items-summary')) {
        renderCheckoutBillSummary();
    }
}

function leaveGroupOrder() {
    if (!groupOrder) return;
    groupOrder.active = false;
    // Reset all item assignments back to 'shared'
    cart.forEach(i => { delete i.assignedTo; });
    localStorage.setItem('cart', JSON.stringify(cart));
    saveGroupOrder(groupOrder);

    showToast('Left Group Order mode', '👋');

    if (document.getElementById('cart-items-list')) {
        renderCartPage();
    }
    if (document.getElementById('checkout-items-summary')) {
        renderCheckoutBillSummary();
    }
}

function assignCartItemMember(menuItemId, memberId) {
    const item = cart.find(i => i.menuItemId === menuItemId);
    if (!item) return;

    item.assignedTo = memberId;
    localStorage.setItem('cart', JSON.stringify(cart));

    const assignedName = memberId === 'shared' ? 'Shared by All' : (groupOrder.members.find(m => m.id === memberId)?.name || 'Friend');
    showToast(`"${item.name}" assigned to ${assignedName}`, '🎯');

    renderCartPage();
}

// --- Selectable Friends & Quick Add Logic in Bill Splitter ---

function renderSplitParticipantsChips() {
    const container = document.getElementById('split-participants-chips');
    if (!container || !groupOrder || !groupOrder.members) return;

    container.innerHTML = groupOrder.members.map(m => {
        const isIncluded = m.includedInSplit !== false;
        return `
            <label class="participant-chip ${isIncluded ? 'active' : ''}" id="chip-member-${m.id}" title="${isIncluded ? 'Included in split (Click to exclude)' : 'Excluded from split (Click to include)'}">
                <input type="checkbox" ${isIncluded ? 'checked' : ''} onchange="toggleMemberSplitInclusion('${m.id}', this.checked)">
                <span>${m.avatar} ${escapeHTML(m.name)}</span>
                ${m.isHost ? '<span class="badge bg-primary-subtle text-primary py-0 px-1" style="font-size:0.65rem;">Host</span>' : ''}
            </label>
        `;
    }).join('');
}

function toggleMemberSplitInclusion(memberId, isChecked) {
    if (!groupOrder || !groupOrder.members) return;
    const member = groupOrder.members.find(m => m.id === memberId);
    if (!member) return;

    // Check how many would be active if we toggle this
    const currentlyActive = groupOrder.members.filter(m => m.includedInSplit !== false);
    if (!isChecked && currentlyActive.length <= 1 && currentlyActive[0].id === memberId) {
        showToast('At least one friend must be included in the split!', '⚠️');
        renderSplitParticipantsChips();
        return;
    }

    member.includedInSplit = isChecked;
    saveGroupOrder(groupOrder);

    renderSplitParticipantsChips();
    const splitResult = calculateBillSplit();
    renderFriendSplitCards(splitResult);

    const statusMsg = isChecked ? `Included ${member.name} in split` : `Excluded ${member.name} from split`;
    showToast(statusMsg, isChecked ? '✅' : '➖');
}

function toggleSplitQuickAddFriend() {
    const form = document.getElementById('split-quick-add-form');
    const input = document.getElementById('split-quick-add-input');
    if (!form) return;
    form.classList.toggle('d-none');
    if (!form.classList.contains('d-none') && input) {
        input.focus();
    }
}

function addSplitFriendQuick() {
    const input = document.getElementById('split-quick-add-input');
    if (!input) return;
    const name = input.value.trim();
    if (!name) {
        showToast('Please enter a friend\'s name', '⚠️');
        return;
    }

    const usedAvatars = groupOrder.members.map(m => m.avatar);
    const availableAvatars = AVATAR_POOL.filter(a => !usedAvatars.includes(a));
    const avatar = availableAvatars.length > 0 ? availableAvatars[0] : '👤';

    const newId = 'm_' + Date.now();
    groupOrder.members.push({
        id: newId,
        name: name,
        avatar: avatar,
        isHost: false,
        includedInSplit: true
    });

    saveGroupOrder(groupOrder);
    input.value = '';
    
    // Hide inline form
    const form = document.getElementById('split-quick-add-form');
    if (form) form.classList.add('d-none');

    renderSplitParticipantsChips();
    const splitResult = calculateBillSplit();
    renderFriendSplitCards(splitResult);

    // Also update cart page dish dropdowns so the new friend is selectable for dishes!
    if (document.getElementById('cart-items-list')) {
        renderCartPage();
    }

    showToast(`Added ${name} to bill split!`, '🎉');
}

function calculateBillSplit(orderContext = null) {
    if (!groupOrder || !groupOrder.members || groupOrder.members.length === 0) {
        return { grandTotal: 0, breakdown: [], excludedMembers: [], subtotal: 0, deliveryFee: 0, platformFee: 5, taxes: 0, discount: 0, splitMode: 'itemized' };
    }

    // Filter only members who are participating in this split
    const allMembers = groupOrder.members;
    let activeMembers = allMembers.filter(m => m.includedInSplit !== false);
    if (activeMembers.length === 0) {
        activeMembers = [allMembers[0]];
    }
    const excludedMembers = allMembers.filter(m => !activeMembers.some(am => am.id === m.id));

    const mode = groupOrder.splitMode || 'itemized';

    let items = [];
    let grandTotal = 0;
    let subtotal = 0;
    let deliveryFee = 0;
    const currentPlatformFee = 5;
    let taxes = 0;
    let discount = 0;

    if (orderContext && orderContext.items) {
        items = orderContext.items.map(it => ({
            name: it.menuItemName,
            price: Number(it.price),
            quantity: Number(it.quantity),
            menuItemId: it.menuItemId || it.id,
            assignedTo: it.assignedTo || 'shared'
        }));
        subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
        deliveryFee = orderContext.deliveryFee != null ? Number(orderContext.deliveryFee) : (subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee);
        taxes = Math.round(subtotal * 0.05);
        discount = orderContext.discount != null ? Number(orderContext.discount) : 0;
        grandTotal = orderContext.totalAmount != null ? Number(orderContext.totalAmount) : Math.max(0, subtotal + deliveryFee + currentPlatformFee + taxes - discount);
    } else {
        items = cart;
        subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
        deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee;
        taxes = Math.round(subtotal * 0.05);
        discount = (appliedCoupon && subtotal >= (Number(appliedCoupon.minOrderAmount) || 0)) ? (Number(appliedCoupon.discountAmount) || 0) : 0;
        grandTotal = Math.max(0, subtotal + deliveryFee + currentPlatformFee + taxes - discount);
    }

    const otherCosts = deliveryFee + currentPlatformFee + taxes;
    const N = activeMembers.length;

    let breakdown = [];

    if (mode === 'equal' || subtotal === 0) {
        const baseShare = Math.floor(grandTotal / N);
        const remainder = grandTotal - (baseShare * N);

        breakdown = activeMembers.map((m, idx) => {
            const extra = (m.isHost || idx === 0) ? remainder : 0;
            const finalShare = baseShare + extra;
            return {
                member: m,
                dishSubtotal: Math.round(subtotal / N),
                feeShare: Math.round(otherCosts / N),
                discountShare: Math.round(discount / N),
                finalShare,
                itemSummary: `Equal share (1/${N}) of ₹${grandTotal} bill`,
                itemsList: []
            };
        });
    } else {
        // Itemized mode
        let memberDishTotals = {};
        let memberItems = {};
        let sharedTotal = 0;

        activeMembers.forEach(m => {
            memberDishTotals[m.id] = 0;
            memberItems[m.id] = [];
        });

        items.forEach(it => {
            const cost = it.price * it.quantity;
            // If item assigned to an active participating member, they pay
            if (it.assignedTo && memberDishTotals[it.assignedTo] !== undefined) {
                memberDishTotals[it.assignedTo] += cost;
                memberItems[it.assignedTo].push(`${it.quantity}x ${it.name}`);
            } else {
                // Either 'shared' or assigned to an excluded friend -> shared among participating members
                sharedTotal += cost;
            }
        });

        const perPersonShared = Math.round(sharedTotal / N);

        let runningSum = 0;
        breakdown = activeMembers.map(m => {
            const ownCost = memberDishTotals[m.id] || 0;
            const effectiveFood = ownCost + perPersonShared;
            const ratio = subtotal > 0 ? (effectiveFood / subtotal) : (1 / N);

            const feeShare = Math.round(ratio * otherCosts);
            const discShare = Math.round(ratio * discount);
            let finalShare = Math.max(0, Math.round(effectiveFood + feeShare - discShare));

            runningSum += finalShare;

            let summaryParts = [];
            if (memberItems[m.id] && memberItems[m.id].length > 0) {
                summaryParts.push(memberItems[m.id].join(', '));
            }
            if (sharedTotal > 0) {
                summaryParts.push(`Shared items share (₹${perPersonShared})`);
            }
            if (summaryParts.length === 0) {
                summaryParts.push('Shared fees & delivery only');
            }

            return {
                member: m,
                dishSubtotal: effectiveFood,
                feeShare,
                discountShare: discShare,
                finalShare,
                itemSummary: summaryParts.join(' • '),
                itemsList: memberItems[m.id] || []
            };
        });

        // Exact Rupee Reconciliation: Adjust host share for any rounding diff
        const diff = grandTotal - runningSum;
        if (breakdown.length > 0) {
            const hostItem = breakdown.find(b => b.member.isHost) || breakdown[0];
            hostItem.finalShare += diff;
        }
    }

    return {
        grandTotal,
        subtotal,
        deliveryFee,
        platformFee: currentPlatformFee,
        taxes,
        discount,
        breakdown,
        excludedMembers,
        splitMode: mode
    };
}

function openBillSplitModal() {
    if (!groupOrder) {
        openGroupOrderModal();
        return;
    }

    renderSplitParticipantsChips();

    const splitResult = calculateBillSplit();

    const roomBadge = document.getElementById('split-modal-room-badge');
    if (roomBadge) roomBadge.textContent = `ROOM #${groupOrder.roomCode}`;

    const totalEl = document.getElementById('split-reconciled-total');
    if (totalEl) totalEl.textContent = `Total Bill: ₹${splitResult.grandTotal}`;

    // Update active tab button style
    const tabItemized = document.getElementById('tab-split-itemized');
    const tabEqual = document.getElementById('tab-split-equal');
    if (tabItemized && tabEqual) {
        if (groupOrder.splitMode === 'equal') {
            tabItemized.classList.remove('active');
            tabEqual.classList.add('active');
        } else {
            tabItemized.classList.add('active');
            tabEqual.classList.remove('active');
        }
    }

    renderFriendSplitCards(splitResult);

    const modalEl = document.getElementById('billSplitModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}

function switchSplitMode(mode) {
    if (!groupOrder) return;
    groupOrder.splitMode = mode;
    saveGroupOrder(groupOrder);

    const tabItemized = document.getElementById('tab-split-itemized');
    const tabEqual = document.getElementById('tab-split-equal');
    if (tabItemized && tabEqual) {
        if (mode === 'equal') {
            tabItemized.classList.remove('active');
            tabEqual.classList.add('active');
        } else {
            tabItemized.classList.add('active');
            tabEqual.classList.remove('active');
        }
    }

    const splitResult = calculateBillSplit();
    renderFriendSplitCards(splitResult);
}

function renderFriendSplitCards(splitResult) {
    const container = document.getElementById('friend-split-cards-container');
    if (!container) return;

    if (!splitResult || !splitResult.breakdown || splitResult.breakdown.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-4">No participating members in this split.</div>';
        return;
    }

    let cardsHtml = splitResult.breakdown.map(b => `
        <div class="col-md-6">
            <div class="friend-split-card p-3 rounded-4 border h-100 d-flex flex-column justify-content-between shadow-xs bg-white">
                <div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="d-flex align-items-center gap-2">
                            <span class="fs-3">${b.member.avatar}</span>
                            <div>
                                <h6 class="fw-bold mb-0 text-dark">${escapeHTML(b.member.name)}</h6>
                                <small class="text-muted" style="font-size:0.75rem;">${b.member.isHost ? '👑 Order Host' : 'Friend'}</small>
                            </div>
                        </div>
                        <span class="fs-4 fw-bolder text-primary">₹${b.finalShare}</span>
                    </div>

                    <div class="bg-light p-2 rounded-3 small mb-3" style="font-size: 0.8rem;">
                        <div class="text-muted mb-1"><strong>Breakdown:</strong> ${escapeHTML(b.itemSummary)}</div>
                        <div class="d-flex justify-content-between text-secondary pt-1 border-top" style="font-size:0.75rem;">
                            <span>Dish Cost: ₹${b.dishSubtotal}</span>
                            <span>Fees/GST: +₹${b.feeShare}</span>
                            ${b.discountShare > 0 ? `<span class="text-success fw-bold">Saved: -₹${b.discountShare}</span>` : ''}
                        </div>
                    </div>
                </div>

                <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary btn-sm rounded-pill w-100 fw-bold d-flex align-items-center justify-content-center gap-1" onclick="openFriendUpiQrModal('${b.member.id}')">
                        <span>📱</span> UPI QR
                    </button>
                    <button class="btn btn-outline-success btn-sm rounded-pill px-3 fw-bold" onclick="shareIndividualWhatsApp('${b.member.id}')" title="Send WhatsApp reminder">
                        📲
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // If there are excluded members, show an informative banner
    if (splitResult.excludedMembers && splitResult.excludedMembers.length > 0) {
        const excludedNames = splitResult.excludedMembers.map(m => `${m.avatar} ${escapeHTML(m.name)}`).join(', ');
        cardsHtml += `
            <div class="col-12 mt-2">
                <div class="p-2 px-3 bg-light rounded-3 border d-flex justify-content-between align-items-center small text-muted">
                    <span>⏸️ <strong>Excluded from this bill:</strong> ${excludedNames} (₹0 owed)</span>
                    <span class="text-primary fw-semibold" style="cursor: pointer;" onclick="document.getElementById('split-participants-chips')?.scrollIntoView({behavior:'smooth'})">Select chip above to include</span>
                </div>
            </div>
        `;
    }

    container.innerHTML = cardsHtml;
}

function openFriendUpiQrModal(memberId) {
    if (!groupOrder || !groupOrder.members) return;
    const member = groupOrder.members.find(m => m.id === memberId);
    if (!member) return;

    const splitResult = calculateBillSplit();
    const memberBreakdown = splitResult.breakdown.find(b => b.member.id === memberId);
    const amount = memberBreakdown ? memberBreakdown.finalShare : 0;

    const nameEl = document.getElementById('qr-modal-friend-name');
    const avatarEl = document.getElementById('qr-modal-avatar');
    const amountEl = document.getElementById('qr-modal-amount');
    const imgEl = document.getElementById('qr-modal-image');

    if (nameEl) nameEl.textContent = `${member.name}'s Share`;
    if (avatarEl) avatarEl.textContent = member.avatar;
    if (amountEl) amountEl.textContent = `₹${amount}`;

    // Generate UPI Intent String & Dynamic QR Code
    const upiIntent = `upi://pay?pa=biteblisspay@okhdfcbank&pn=BiteBliss&am=${amount}&cu=INR&tn=BiteBliss Split - ${encodeURIComponent(member.name)} (${groupOrder.roomCode})`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiIntent)}`;

    if (imgEl) {
        imgEl.src = qrUrl;
        imgEl.alt = `UPI QR for ₹${amount}`;
    }

    const modalEl = document.getElementById('friendUpiQrModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}

function shareSplitWhatsApp() {
    if (!groupOrder) return;
    const splitResult = calculateBillSplit();

    let text = `🍕 *BiteBliss Bill Split - Room #${groupOrder.roomCode}*\n`;
    text += `💰 *Grand Total:* ₹${splitResult.grandTotal}\n`;
    text += `⚖️ *Split Mode:* ${groupOrder.splitMode.toUpperCase()}\n`;
    text += `--------------------------------\n`;

    splitResult.breakdown.forEach(b => {
        text += `${b.member.avatar} *${b.member.name}*: ₹${b.finalShare}\n`;
        text += `   ↳ _${b.itemSummary}_\n`;
    });

    if (splitResult.excludedMembers && splitResult.excludedMembers.length > 0) {
        text += `--------------------------------\n`;
        text += `⏸️ _Excluded:_ ${splitResult.excludedMembers.map(m => m.name).join(', ')} (₹0)\n`;
    }

    text += `--------------------------------\n`;
    text += `💳 *UPI ID:* biteblisspay@okhdfcbank\n`;
    text += `⚡ _Calculated with BiteBliss Smart Splitter_\n`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
}

function shareIndividualWhatsApp(memberId) {
    if (!groupOrder || !groupOrder.members) return;
    const member = groupOrder.members.find(m => m.id === memberId);
    if (!member) return;

    const splitResult = calculateBillSplit();
    const b = splitResult.breakdown.find(x => x.member.id === memberId);
    if (!b) return;

    let text = `Hey ${member.name}! 👋\n`;
    text += `Your share for the BiteBliss order (*Room #${groupOrder.roomCode}*) is *₹${b.finalShare}*.\n`;
    text += `🍽️ Items: ${b.itemSummary}\n\n`;
    text += `Pay via UPI to: *biteblisspay@okhdfcbank*\n`;
    text += `Thanks! 🍕`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
}



