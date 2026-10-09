// =========================================================
// BiteBliss Admin Portal - Professional SaaS Engine
// =========================================================

const API_BASE = 'http://localhost:8081/api';

// Admin State
let currentRevenueTimeframe = '7d';
let activeView = 'dashboard';
let adminMenuData = [];
let adminOrdersData = [];
let adminCouponsData = [];

// =========================================================
// Currency Formatter (₹ INR)
// =========================================================
function formatINR(amount) {
    const num = Number(amount) || 0;
    return '₹' + num.toLocaleString('en-IN');
}

// =========================================================
// Initial Datasets & Mock Collections
// =========================================================
const DASHBOARD_KPIS = {
    totalOrders: 1248,
    ordersGrowth: '+12.5% from last month',
    todayRevenue: 248560,
    revenueGrowth: '+8.2%',
    totalCustomers: 8420,
    customersGrowth: '+15.4%',
    activeRestaurants: 126,
    restaurantsGrowth: '+6.8%',
    pendingOrders: 42,
    deliveredOrders: 1102
};

const TOP_SELLING_FOODS = [
    {
        name: 'Chicken Biryani',
        price: 280,
        orders: 1245,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80',
        alt: 'Fragrant spicy chicken biryani served in clay pot'
    },
    {
        name: 'Veg Biryani',
        price: 200,
        orders: 980,
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&auto=format&fit=crop&q=80',
        alt: 'Aromatic vegetable biryani with saffron and spices'
    },
    {
        name: 'Margherita Pizza',
        price: 250,
        orders: 875,
        image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=300&auto=format&fit=crop&q=80',
        alt: 'Classic thin crust margherita pizza with fresh basil'
    },
    {
        name: 'Classic Burger',
        price: 180,
        orders: 742,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80',
        alt: 'Juicy handcrafted cheeseburger with fresh lettuce'
    },
    {
        name: 'Paneer Tikka',
        price: 240,
        orders: 680,
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&auto=format&fit=crop&q=80',
        alt: 'Tandoori roasted spicy paneer tikka with capsicum'
    },
    {
        name: 'Hakka Noodles',
        price: 200,
        orders: 625,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop&q=80',
        alt: 'Wok tossed veg hakka noodles with crisp vegetables'
    }
];

const RECENT_ORDERS_LIST = [
    {
        id: 'FD10245',
        numericId: 10245,
        customer: 'Rahul Sharma',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        restaurant: 'Paradise Biryani',
        items: 'Chicken Biryani x2',
        amount: 560,
        payment: 'UPI',
        status: 'PREPARING',
        statusText: 'Preparing',
        date: 'Today, 01:24 PM',
        address: 'Flat 402, Lotus Residency, Indiranagar',
        phone: '+91 98451 23456'
    },
    {
        id: 'FD10244',
        numericId: 10244,
        customer: 'Priya Reddy',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        restaurant: 'Spice Hub',
        items: 'Pizza x1',
        amount: 420,
        payment: 'Card',
        status: 'DELIVERED',
        statusText: 'Delivered',
        date: 'Today, 12:58 PM',
        address: '#14, 5th Cross, Koramangala 4th Block',
        phone: '+91 97412 87654'
    },
    {
        id: 'FD10243',
        numericId: 10243,
        customer: 'Arjun Kumar',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        restaurant: 'Food Corner',
        items: 'Burger x2',
        amount: 360,
        payment: 'COD',
        status: 'OUT_FOR_DELIVERY',
        statusText: 'Out for Delivery',
        date: 'Today, 12:45 PM',
        address: 'B-Block 201, Green Glen Layout, Bellandur',
        phone: '+91 99801 45678'
    },
    {
        id: 'FD10242',
        numericId: 10242,
        customer: 'Ananya Roy',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        restaurant: 'Royal Indian',
        items: 'Paneer Tikka x1, Naan x2',
        amount: 340,
        payment: 'UPI',
        status: 'PENDING',
        statusText: 'Pending',
        date: 'Today, 12:30 PM',
        address: 'House 88, 17th Main, HSR Layout Sector 3',
        phone: '+91 98765 12340'
    },
    {
        id: 'FD10241',
        numericId: 10241,
        customer: 'Vikram Singh',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
        restaurant: 'Beijing Bites',
        items: 'Hakka Noodles x2',
        amount: 400,
        payment: 'Card',
        status: 'DELIVERED',
        statusText: 'Delivered',
        date: 'Today, 11:50 AM',
        address: 'Tower 4, Prestige Tech Park, Marathahalli',
        phone: '+91 91234 56789'
    },
    {
        id: 'FD10240',
        numericId: 10240,
        customer: 'Sneha Patel',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
        restaurant: 'Sweet Treats',
        items: 'Chocolate Waffle x1',
        amount: 180,
        payment: 'UPI',
        status: 'CANCELLED',
        statusText: 'Cancelled',
        date: 'Today, 11:15 AM',
        address: '#45, 2nd Stage, BTM Layout',
        phone: '+91 93456 78901'
    }
];

const RESTAURANTS_DATA = [
    {
        id: 1,
        name: 'Paradise Biryani',
        cuisine: 'Indian • Biryani',
        rating: 4.6,
        orders: 1245,
        revenue: '₹3.8L',
        status: 'Active',
        logo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=80&auto=format&fit=crop&q=80'
    },
    {
        id: 2,
        name: 'Spice Route',
        cuisine: 'Indian • Chinese',
        rating: 4.4,
        orders: 980,
        revenue: '₹2.9L',
        status: 'Active',
        logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&auto=format&fit=crop&q=80'
    },
    {
        id: 3,
        name: 'Food Corner',
        cuisine: 'Fast Food',
        rating: 4.3,
        orders: 745,
        revenue: '₹2.1L',
        status: 'Active',
        logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&auto=format&fit=crop&q=80'
    },
    {
        id: 4,
        name: 'The Pasta Bowl',
        cuisine: 'Italian • Pasta',
        rating: 4.5,
        orders: 610,
        revenue: '₹1.8L',
        status: 'Active',
        logo: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=80&auto=format&fit=crop&q=80'
    },
    {
        id: 5,
        name: 'Sweet Treats Bakery',
        cuisine: 'Desserts & Bakes',
        rating: 4.7,
        orders: 520,
        revenue: '₹1.2L',
        status: 'Active',
        logo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=80&auto=format&fit=crop&q=80'
    },
    {
        id: 6,
        name: 'Royal Indian Kitchen',
        cuisine: 'North Indian',
        rating: 4.8,
        orders: 890,
        revenue: '₹3.1L',
        status: 'Active',
        logo: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=80&auto=format&fit=crop&q=80'
    }
];

const CUSTOMERS_DATA = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul.s@example.com', phone: '+91 98451 23456', orders: 28, totalSpent: 14250, lastOrder: 'Today', status: 'Active' },
    { id: 2, name: 'Priya Reddy', email: 'priya.r@example.com', phone: '+91 97412 87654', orders: 19, totalSpent: 9800, lastOrder: 'Today', status: 'Active' },
    { id: 3, name: 'Arjun Kumar', email: 'arjun.k@example.com', phone: '+91 99801 45678', orders: 34, totalSpent: 18450, lastOrder: 'Today', status: 'Premium' },
    { id: 4, name: 'Ananya Roy', email: 'ananya.roy@example.com', phone: '+91 98765 12340', orders: 14, totalSpent: 6200, lastOrder: 'Yesterday', status: 'Active' },
    { id: 5, name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '+91 91234 56789', orders: 42, totalSpent: 22600, lastOrder: 'Yesterday', status: 'Premium' },
    { id: 6, name: 'Sneha Patel', email: 'sneha.p@example.com', phone: '+91 93456 78901', orders: 8, totalSpent: 3400, lastOrder: '3 days ago', status: 'Active' }
];

const DELIVERY_PARTNERS_DATA = [
    { id: 'DP-301', name: 'Ramesh Kumar', phone: '+91 98760 11223', ordersCompleted: 480, rating: '4.9 ★', todayDeliveries: 14, status: 'On Delivery', vehicle: 'Hero Splendor' },
    { id: 'DP-302', name: 'Suresh Babu', phone: '+91 98760 22334', ordersCompleted: 395, rating: '4.8 ★', todayDeliveries: 11, status: 'Available', vehicle: 'Honda Activa' },
    { id: 'DP-303', name: 'Karthik Rao', phone: '+91 98760 33445', ordersCompleted: 512, rating: '5.0 ★', todayDeliveries: 16, status: 'On Delivery', vehicle: 'Ather 450X' },
    { id: 'DP-304', name: 'Manish Verma', phone: '+91 98760 44556', ordersCompleted: 260, rating: '4.7 ★', todayDeliveries: 8, status: 'Offline', vehicle: 'Bajaj Pulsar' },
    { id: 'DP-305', name: 'Deepak Gowda', phone: '+91 98760 55667', ordersCompleted: 430, rating: '4.9 ★', todayDeliveries: 12, status: 'Available', vehicle: 'TVS Jupiter' }
];

const COUPONS_DATA = [
    { id: 1, code: 'SWIGGY50', discount: '50% OFF up to ₹100', minOrder: 199, usage: 1420, expiry: '31 Dec 2026', active: true },
    { id: 2, code: 'WELCOME50', discount: 'Flat ₹50 OFF', minOrder: 149, usage: 890, expiry: '30 Nov 2026', active: true },
    { id: 3, code: 'FREEDEL', discount: 'Free Delivery', minOrder: 199, usage: 2150, expiry: '31 Dec 2026', active: true },
    { id: 4, code: 'FEAST20', discount: 'Flat ₹150 OFF', minOrder: 399, usage: 640, expiry: '15 Oct 2026', active: true }
];

const TRANSACTIONS_DATA = [
    { id: 'TXN-99824', orderId: '#FD10245', customer: 'Rahul Sharma', method: 'UPI (GPay)', amount: 560, status: 'Success', date: 'Today, 01:24 PM' },
    { id: 'TXN-99823', orderId: '#FD10244', customer: 'Priya Reddy', method: 'Credit Card (HDFC)', amount: 420, status: 'Success', date: 'Today, 12:58 PM' },
    { id: 'TXN-99822', orderId: '#FD10243', customer: 'Arjun Kumar', method: 'Cash on Delivery', amount: 360, status: 'Pending', date: 'Today, 12:45 PM' },
    { id: 'TXN-99821', orderId: '#FD10242', customer: 'Ananya Roy', method: 'UPI (PhonePe)', amount: 340, status: 'Success', date: 'Today, 12:30 PM' },
    { id: 'TXN-99820', orderId: '#FD10241', customer: 'Vikram Singh', method: 'Debit Card (ICICI)', amount: 400, status: 'Success', date: 'Today, 11:50 AM' },
    { id: 'TXN-99819', orderId: '#FD10240', customer: 'Sneha Patel', method: 'UPI (Paytm)', amount: 180, status: 'Refunded', date: 'Today, 11:15 AM' }
];

const REVIEWS_DATA = [
    { customer: 'Rahul Sharma', restaurant: 'Paradise Biryani', rating: 5, review: 'Superb Hyderabadi biryani, hot and flavorful! Mirchi ka salan was exceptional.', date: '10 mins ago' },
    { customer: 'Priya Reddy', restaurant: 'Spice Hub', rating: 4, review: 'Great crust and ample cheese toppings. Quick doorstep delivery.', date: '45 mins ago' },
    { customer: 'Arjun Kumar', restaurant: 'Food Corner', rating: 5, review: 'Double patty burger was top notch. Crispy fries with mayo.', date: '2 hours ago' },
    { customer: 'Vikram Singh', restaurant: 'Beijing Bites', rating: 4, review: 'Good portion size of Hakka noodles. Fresh vegetables and authentic flavor.', date: '4 hours ago' }
];

// =========================================================
// Initialization
// =========================================================
document.addEventListener('DOMContentLoaded', async () => {
    await ensureAdminAuth();
    setupSidebarNavigation();
    setupSidebarToggle();
    renderAllViews();
    await fetchBackendData();
});

async function ensureAdminAuth() {
    let user = JSON.parse(localStorage.getItem('currentUser'));
    let token = localStorage.getItem('token');
    if (!token || !user || user.role !== 'ROLE_ADMIN') {
        try {
            const res = await fetch(`${API_BASE}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@food.com', password: 'admin123' })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.accessToken) {
                    localStorage.setItem('token', data.accessToken);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    user = data.user;
                }
            }
        } catch (e) {
            console.warn('Admin auto-auth notice:', e);
        }
    }
}

// =========================================================
// Sidebar Router & View Switcher
// =========================================================
function setupSidebarNavigation() {
    const navButtons = document.querySelectorAll('.fd-sidebar-nav .fd-nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetView = btn.getAttribute('data-view');
            if (targetView) {
                e.preventDefault();
                switchView(targetView);
            }
        });
    });
}

function switchView(viewId) {
    activeView = viewId;

    // Update active class on sidebar buttons
    document.querySelectorAll('.fd-sidebar-nav .fd-nav-btn').forEach(btn => {
        if (btn.getAttribute('data-view') === viewId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update view panes
    document.querySelectorAll('.fd-view-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    const targetPane = document.getElementById(`view-${viewId}`);
    if (targetPane) {
        targetPane.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Trigger tab-specific refresh if needed
    if (viewId === 'menu') renderMenuManagementTable();
    if (viewId === 'orders') renderOrdersPageTable();
    if (viewId === 'restaurants') renderRestaurantsTable();
    if (viewId === 'customers') renderCustomersTable();
    if (viewId === 'delivery') renderDeliveryPartnersTable();
    if (viewId === 'coupons') renderCouponsTable();
    if (viewId === 'payments') renderPaymentsTable();
    if (viewId === 'reviews') renderReviewsTable();
}

function setupSidebarToggle() {
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('foodieSidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

// =========================================================
// Master Render Functions
// =========================================================
function renderAllViews() {
    renderDashboardKPIs();
    renderRevenueChart();
    renderRecentOrdersTable();
    renderTopSellingFoods();
    renderRestaurantsTable();
    renderMenuManagementTable();
    renderOrdersPageTable();
    renderCustomersTable();
    renderDeliveryPartnersTable();
    renderCouponsTable();
    renderPaymentsTable();
    renderReviewsTable();
}

// 1. Dashboard 6 KPI Cards
function renderDashboardKPIs() {
    const elOrders = document.getElementById('kpi-total-orders');
    const elRevenue = document.getElementById('kpi-today-revenue');
    const elCustomers = document.getElementById('kpi-total-customers');
    const elRestaurants = document.getElementById('kpi-active-restaurants');
    const elPending = document.getElementById('kpi-pending-orders');
    const elDelivered = document.getElementById('kpi-delivered-orders');

    if (elOrders) elOrders.textContent = DASHBOARD_KPIS.totalOrders.toLocaleString('en-IN');
    if (elRevenue) elRevenue.textContent = formatINR(DASHBOARD_KPIS.todayRevenue);
    if (elCustomers) elCustomers.textContent = DASHBOARD_KPIS.totalCustomers.toLocaleString('en-IN');
    if (elRestaurants) elRestaurants.textContent = DASHBOARD_KPIS.activeRestaurants;
    if (elPending) elPending.textContent = DASHBOARD_KPIS.pendingOrders;
    if (elDelivered) elDelivered.textContent = DASHBOARD_KPIS.deliveredOrders.toLocaleString('en-IN');
}

// 2. Revenue Overview SVG Chart (7d / 30d / 12m)
function setRevenueTimeframe(tf, btn) {
    currentRevenueTimeframe = tf;
    document.querySelectorAll('.fd-time-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderRevenueChart();
}

function renderRevenueChart() {
    const container = document.getElementById('revenue-chart-svg-wrap');
    if (!container) return;

    let points = [];
    if (currentRevenueTimeframe === '7d') {
        points = [
            { label: 'Mon', val: 28500, x: 30, y: 150 },
            { label: 'Tue', val: 34200, x: 95, y: 125 },
            { label: 'Wed', val: 31000, x: 160, y: 140 },
            { label: 'Thu', val: 38400, x: 225, y: 105 },
            { label: 'Fri', val: 45800, x: 290, y: 75 },
            { label: 'Sat', val: 52100, x: 355, y: 48 },
            { label: 'Sun', val: 48560, x: 420, y: 62 }
        ];
    } else if (currentRevenueTimeframe === '30d') {
        points = [
            { label: 'Wk 1', val: 142000, x: 40, y: 140 },
            { label: 'Wk 2', val: 168000, x: 160, y: 110 },
            { label: 'Wk 3', val: 195000, x: 280, y: 80 },
            { label: 'Wk 4', val: 248560, x: 400, y: 45 }
        ];
    } else {
        // 12 Months
        points = [
            { label: 'Jan', val: 180000, x: 25, y: 150 },
            { label: 'Mar', val: 220000, x: 95, y: 130 },
            { label: 'May', val: 260000, x: 165, y: 110 },
            { label: 'Jul', val: 310000, x: 235, y: 85 },
            { label: 'Sep', val: 380000, x: 305, y: 65 },
            { label: 'Nov', val: 440000, x: 375, y: 45 },
            { label: 'Dec', val: 490000, x: 435, y: 35 }
        ];
    }

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const cur = points[i];
        const cp1x = prev.x + (cur.x - prev.x) / 2;
        const cp1y = prev.y;
        const cp2x = prev.x + (cur.x - prev.x) / 2;
        const cp2y = cur.y;
        pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${cur.x} ${cur.y}`;
    }

    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const areaD = `${pathD} L ${lastX} 185 L ${firstX} 185 Z`;

    const pointsSvg = points.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="#ff4757" stroke="#ffffff" stroke-width="2" class="fd-chart-point"
            onmouseover="showChartTip(event, '${p.label}', ${p.val})" onmouseout="hideChartTip()" />
    `).join('');

    const labelsSvg = points.map(p => `
        <text x="${p.x}" y="205" text-anchor="middle" font-size="11" fill="#64748b">${p.label}</text>
    `).join('');

    container.innerHTML = `
        <svg viewBox="0 0 460 220" class="fd-chart-svg">
            <defs>
                <linearGradient id="fdRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ff4757" stop-opacity="0.32"/>
                    <stop offset="100%" stop-color="#ff4757" stop-opacity="0.01"/>
                </linearGradient>
            </defs>

            <!-- Grid Lines -->
            <line x1="20" y1="35" x2="440" y2="35" stroke="#f1f5f9" stroke-dasharray="3 3"/>
            <line x1="20" y1="85" x2="440" y2="85" stroke="#f1f5f9" stroke-dasharray="3 3"/>
            <line x1="20" y1="135" x2="440" y2="135" stroke="#f1f5f9" stroke-dasharray="3 3"/>
            <line x1="20" y1="185" x2="440" y2="185" stroke="#cbd5e1" stroke-width="1"/>

            <!-- Gradient Area -->
            <path d="${areaD}" fill="url(#fdRevGrad)" />

            <!-- Smooth Stroke -->
            <path d="${pathD}" fill="none" stroke="#ff4757" stroke-width="2.5" stroke-linecap="round" />

            <!-- Interactive Dots & Labels -->
            ${pointsSvg}
            ${labelsSvg}
        </svg>
        <div id="fd-chart-tooltip" class="fd-toast" style="display:none; position:absolute; pointer-events:none; padding:5px 10px; font-size:11.5px;"></div>
    `;
}

function showChartTip(e, label, val) {
    const tip = document.getElementById('fd-chart-tooltip');
    if (!tip) return;
    tip.textContent = `${label}: ${formatINR(val)}`;
    tip.style.display = 'block';
    tip.style.left = `${(e.offsetX || e.layerX) + 10}px`;
    tip.style.top = `${(e.offsetY || e.layerY) - 25}px`;
}

function hideChartTip() {
    const tip = document.getElementById('fd-chart-tooltip');
    if (tip) tip.style.display = 'none';
}

// 3. Recent Orders Table (Dashboard View)
function renderRecentOrdersTable() {
    const tbody = document.getElementById('recent-orders-table-body');
    if (!tbody) return;

    let list = adminOrdersData.length > 0 ? adminOrdersData.slice(0, 10) : RECENT_ORDERS_LIST;

    tbody.innerHTML = list.map(o => {
        let badgeClass = 'badge bg-warning text-dark border';
        const s = (o.status || '').toUpperCase();
        if (s === 'PENDING') badgeClass = 'badge bg-warning text-dark border';
        else if (s === 'ACCEPTED') badgeClass = 'badge bg-info text-dark border';
        else if (s === 'PREPARING') badgeClass = 'badge bg-primary text-white border';
        else if (s === 'READY') badgeClass = 'badge text-white border" style="background-color: #6f42c1;';
        else if (s === 'OUT_FOR_DELIVERY') badgeClass = 'badge bg-info text-white border';
        else if (s === 'DELIVERED') badgeClass = 'badge bg-success text-white border';
        else if (s === 'CANCELLED' || s === 'REJECTED') badgeClass = 'badge bg-danger text-white border';

        return `
            <tr>
                <td class="fw-bold text-dark font-monospace">${o.id}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${o.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}" alt="${escapeHTML(o.customer)}" class="rounded-circle" style="width: 28px; height: 28px; object-fit: cover;">
                        <span class="fw-bold">${escapeHTML(o.customer)}</span>
                    </div>
                </td>
                <td><span class="text-secondary">${escapeHTML(o.restaurant || 'BiteBliss Kitchen')}</span></td>
                <td><span class="text-truncate d-inline-block" style="max-width: 220px;" title="${escapeHTML(o.items)}">${escapeHTML(o.items)}</span></td>
                <td class="fw-bold text-dark">${formatINR(o.amount)}</td>
                <td><span class="badge bg-light text-dark border">${o.payment || 'Online'}</span></td>
                <td><span class="${badgeClass}">${o.statusText || o.status}</span></td>
                <td class="text-muted small">${o.date}</td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="fd-btn fd-btn-outline fd-btn-sm" onclick="viewOrderReceipt('${o.id}')">View</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 4. Top Selling Food Section (Small square Unsplash photos)
function renderTopSellingFoods() {
    const grid = document.getElementById('top-selling-food-grid');
    if (!grid) return;

    grid.innerHTML = TOP_SELLING_FOODS.map(f => `
        <div class="fd-food-mini-card" onclick="quickFilterMenuDish('${escapeHTML(f.name)}')">
            <img src="${f.image}" alt="${escapeHTML(f.alt)}" class="fd-food-img-sq" loading="lazy">
            <div class="fd-food-title" title="${escapeHTML(f.name)}">${escapeHTML(f.name)}</div>
            <div class="fd-food-price">${formatINR(f.price)}</div>
            <div class="fd-food-order-count">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff4757" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                <span>${f.orders.toLocaleString('en-IN')} orders</span>
            </div>
        </div>
    `).join('');
}

// 5. Restaurant Management View
function renderRestaurantsTable() {
    const tbody = document.getElementById('restaurants-table-body');
    if (!tbody) return;

    tbody.innerHTML = RESTAURANTS_DATA.map(r => `
        <tr>
            <td>
                <div class="d-flex align-items-center gap-3">
                    <img src="${r.logo}" alt="${escapeHTML(r.name)}" class="rounded-3" style="width: 42px; height: 42px; object-fit: cover; border: 1px solid var(--fd-border);">
                    <div>
                        <div class="fw-bold text-dark">${escapeHTML(r.name)}</div>
                        <small class="text-muted">ID: #REST-0${r.id}</small>
                    </div>
                </div>
            </td>
            <td><span class="badge bg-light text-secondary border">${escapeHTML(r.cuisine)}</span></td>
            <td><span class="fw-bold text-warning">⭐ ${r.rating}</span></td>
            <td class="fw-bold">${r.orders.toLocaleString('en-IN')} Orders</td>
            <td class="fw-bold text-dark">${r.revenue}</td>
            <td><span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">${r.status}</span></td>
            <td>
                <div class="d-flex gap-2">
                    <button class="fd-btn fd-btn-outline fd-btn-sm" onclick="showToast('Editing ${escapeHTML(r.name)}...', '✏️')">Edit</button>
                    <button class="fd-btn fd-btn-outline fd-btn-sm text-danger" onclick="toggleRestaurantStatus(${r.id})">Deactivate</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function toggleRestaurantStatus(id) {
    const r = RESTAURANTS_DATA.find(item => item.id === id);
    if (r) {
        r.status = r.status === 'Active' ? 'Inactive' : 'Active';
        renderRestaurantsTable();
        showToast(`Restaurant status changed to ${r.status}`, '🏢');
    }
}

// 6. Menu Management View
let menuCategoryFilter = 'All';
let menuAvailabilityFilter = 'all';
let menuSearchQuery = '';

function renderMenuManagementTable() {
    const tbody = document.getElementById('menu-mgmt-table-body');
    if (!tbody) return;

    let list = adminMenuData.length > 0 ? adminMenuData : [
        { id: 1, name: 'Chicken Biryani', category: 'Biryani & Rice', price: 280, restaurantName: 'Paradise Biryani', available: true, rating: 4.8, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100&auto=format&fit=crop&q=80' },
        { id: 2, name: 'Veg Biryani', category: 'Biryani & Rice', price: 200, restaurantName: 'Paradise Biryani', available: true, rating: 4.6, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=100&auto=format&fit=crop&q=80' },
        { id: 3, name: 'Margherita Pizza', category: 'Pizzas', price: 250, restaurantName: 'Spice Hub', available: true, rating: 4.7, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=100&auto=format&fit=crop&q=80' },
        { id: 4, name: 'Classic Burger', category: 'Burgers & Wraps', price: 180, restaurantName: 'Food Corner', available: true, rating: 4.5, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=80' },
        { id: 5, name: 'Paneer Tikka', category: 'North Indian', price: 240, restaurantName: 'Royal Indian', available: true, rating: 4.8, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=100&auto=format&fit=crop&q=80' },
        { id: 6, name: 'Hakka Noodles', category: 'Chinese & Asian', price: 200, restaurantName: 'Beijing Bites', available: true, rating: 4.4, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&auto=format&fit=crop&q=80' },
        { id: 7, name: 'Masala Dosa', category: 'South Indian', price: 120, restaurantName: 'Udupi Upahar', available: true, rating: 4.9, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=100&auto=format&fit=crop&q=80' },
        { id: 8, name: 'Belgian Chocolate Waffle', category: 'Desserts', price: 180, restaurantName: 'Sweet Treats', available: false, rating: 4.7, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=100&auto=format&fit=crop&q=80' }
    ];

    if (menuCategoryFilter !== 'All') {
        list = list.filter(m => m.category === menuCategoryFilter);
    }
    if (menuAvailabilityFilter === 'available') {
        list = list.filter(m => m.available === true);
    } else if (menuAvailabilityFilter === 'unavailable') {
        list = list.filter(m => m.available === false);
    }
    if (menuSearchQuery) {
        const q = menuSearchQuery.toLowerCase();
        list = list.filter(m => m.name.toLowerCase().includes(q) || (m.restaurantName || '').toLowerCase().includes(q));
    }

    const counter = document.getElementById('menu-items-count-badge');
    if (counter) counter.textContent = `${list.length} dishes shown`;

    tbody.innerHTML = list.map(item => `
        <tr>
            <td>
                <img src="${escapeHTML(item.imageUrl)}" alt="${escapeHTML(item.name)}" class="rounded-3" style="width: 42px; height: 42px; object-fit: cover; border: 1px solid var(--fd-border);" loading="lazy">
            </td>
            <td>
                <div class="fw-bold text-dark">${escapeHTML(item.name)}</div>
                <small class="text-muted">${item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</small>
            </td>
            <td><span class="badge bg-light text-secondary border">${escapeHTML(item.category)}</span></td>
            <td class="fw-bold text-dark">${formatINR(item.price)}</td>
            <td><span class="text-secondary">${escapeHTML(item.restaurantName || 'BiteBliss Kitchen')}</span></td>
            <td>
                <label class="fd-switch">
                    <input type="checkbox" ${item.available ? 'checked' : ''} onchange="toggleDishAvailability(${item.id}, this.checked)">
                    <span class="fd-slider"></span>
                </label>
                <span class="ms-2 small text-muted">${item.available ? 'Available' : 'Disabled'}</span>
            </td>
            <td><span class="text-warning fw-bold">⭐ ${item.rating || 4.5}</span></td>
            <td>
                <div class="d-flex gap-2">
                    <button class="fd-btn fd-btn-outline fd-btn-sm" onclick="editDishModal(${item.id})">Edit</button>
                    <button class="fd-btn fd-btn-outline fd-btn-sm text-danger" onclick="deleteDishAdmin(${item.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterMenuByCategory(category, btn) {
    menuCategoryFilter = category;
    document.querySelectorAll('#menu-cat-pills .fd-pill-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderMenuManagementTable();
}

function filterMenuByAvailability(val) {
    menuAvailabilityFilter = val;
    renderMenuManagementTable();
}

function searchMenuAdmin(query) {
    menuSearchQuery = query.trim();
    renderMenuManagementTable();
}

function quickFilterMenuDish(name) {
    switchView('menu');
    const input = document.getElementById('menu-search-input');
    if (input) input.value = name;
    searchMenuAdmin(name);
}

function toggleDishAvailability(id, isAvailable) {
    const item = adminMenuData.find(m => m.id === id);
    if (item) item.available = isAvailable;
    showToast(`Food item #${id} is now ${isAvailable ? 'Enabled' : 'Disabled'}`, '📦');
}

async function deleteDishAdmin(id) {
    if (!confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        await fetch(`${API_BASE}/menu/${id}`, { method: 'DELETE', headers });
    } catch (e) {}

    adminMenuData = adminMenuData.filter(m => m.id !== id);
    renderMenuManagementTable();
    showToast('Dish removed from menu catalog', '🗑️');
}

function openAddFoodModal() {
    const modalEl = document.getElementById('addFoodModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

async function handleAddFoodSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('new-food-name').value.trim();
    const category = document.getElementById('new-food-category').value;
    const price = parseFloat(document.getElementById('new-food-price').value);
    const restaurant = document.getElementById('new-food-restaurant').value;
    const imageUrl = document.getElementById('new-food-image').value.trim();
    const isVeg = document.getElementById('new-food-isveg').checked;

    const newDish = {
        id: Date.now() % 10000,
        name,
        category,
        price,
        restaurantName: restaurant,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80',
        available: true,
        isVeg,
        rating: 4.8
    };

    try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        await fetch(`${API_BASE}/menu`, {
            method: 'POST',
            headers,
            body: JSON.stringify(newDish)
        });
    } catch (e) {}

    adminMenuData.unshift(newDish);
    renderMenuManagementTable();

    const modalEl = document.getElementById('addFoodModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    document.getElementById('addFoodForm').reset();
    showToast(`Added "${name}" to menu catalog!`, '🍽️');
}

// 7. Orders Management Page View
let currentOrdersPageFilter = 'ALL';
let currentOrdersSearchQuery = '';

function getActionButtonsForStatus(order) {
    const status = (order.status || '').toUpperCase();
    const id = order.numericId || order.id;

    switch (status) {
        case 'PENDING':
            return `
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-success fw-bold px-2 py-1 shadow-sm" onclick="handleAdminOrderAction(${id}, 'accept')" title="Accept Order">
                        ✓ Accept
                    </button>
                    <button class="btn btn-sm btn-outline-danger fw-bold px-2 py-1" onclick="handleAdminOrderAction(${id}, 'reject')" title="Reject Order">
                        ✗ Reject
                    </button>
                </div>
            `;
        case 'ACCEPTED':
            return `
                <button class="btn btn-sm btn-warning text-dark fw-bold px-3 py-1 shadow-sm" onclick="handleAdminOrderAction(${id}, 'preparing')" title="Start Preparing Food">
                    🍳 Start Preparing
                </button>
            `;
        case 'PREPARING':
            return `
                <button class="btn btn-sm text-white fw-bold px-3 py-1 shadow-sm" style="background-color: #6f42c1;" onclick="handleAdminOrderAction(${id}, 'ready')" title="Mark Order Ready">
                    📦 Mark Ready
                </button>
            `;
        case 'READY':
            return `
                <button class="btn btn-sm btn-primary fw-bold px-3 py-1 shadow-sm" onclick="handleAdminOrderAction(${id}, 'dispatch')" title="Dispatch with Partner">
                    🛵 Dispatch
                </button>
            `;
        case 'OUT_FOR_DELIVERY':
            return `
                <button class="btn btn-sm btn-success fw-bold px-3 py-1 shadow-sm" onclick="handleAdminOrderAction(${id}, 'deliver')" title="Mark Order Delivered">
                    🎁 Mark Delivered
                </button>
            `;
        case 'DELIVERED':
            return `<span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-bold">Delivered ✓</span>`;
        case 'REJECTED':
            return `<span class="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 fw-bold">Rejected ✗</span>`;
        case 'CANCELLED':
            return `<span class="badge bg-secondary-subtle text-secondary border px-3 py-2 fw-bold">Cancelled</span>`;
        default:
            return `<span class="badge bg-light text-muted border px-2 py-1">${order.status}</span>`;
    }
}

function renderOrdersPageTable() {
    const tbody = document.getElementById('orders-page-table-body');
    if (!tbody) return;

    let list = adminOrdersData.length > 0 ? adminOrdersData : RECENT_ORDERS_LIST;

    if (currentOrdersPageFilter !== 'ALL') {
        list = list.filter(o => {
            const s = (o.status || '').toUpperCase();
            if (currentOrdersPageFilter === 'OUT_FOR_DELIVERY') return s.includes('ROUTE') || s.includes('OUT');
            if (currentOrdersPageFilter === 'CANCELLED') return s === 'CANCELLED' || s === 'REJECTED';
            return s === currentOrdersPageFilter;
        });
    }

    if (currentOrdersSearchQuery) {
        const q = currentOrdersSearchQuery.toLowerCase();
        list = list.filter(o => String(o.id).toLowerCase().includes(q) || (o.customer || '').toLowerCase().includes(q) || (o.phone || '').includes(q));
    }

    tbody.innerHTML = list.map(o => {
        let badgeClass = 'badge bg-warning text-dark border';
        const s = (o.status || '').toUpperCase();
        if (s === 'PENDING') badgeClass = 'badge bg-warning text-dark border';
        else if (s === 'ACCEPTED') badgeClass = 'badge bg-info text-dark border';
        else if (s === 'PREPARING') badgeClass = 'badge bg-primary text-white border';
        else if (s === 'READY') badgeClass = 'badge text-white border" style="background-color: #6f42c1;';
        else if (s === 'OUT_FOR_DELIVERY') badgeClass = 'badge bg-info text-white border';
        else if (s === 'DELIVERED') badgeClass = 'badge bg-success text-white border';
        else if (s === 'CANCELLED' || s === 'REJECTED') badgeClass = 'badge bg-danger text-white border';

        return `
            <tr>
                <td class="fw-bold text-dark font-monospace">${o.id}</td>
                <td>
                    <div class="fw-bold text-dark">${escapeHTML(o.customer || `Customer #${o.userId}`)}</div>
                    <small class="text-muted"><i class="bi bi-telephone"></i> ${escapeHTML(o.phone || '+91 98765 43210')}</small>
                </td>
                <td><span class="text-secondary">${escapeHTML(o.restaurant || 'BiteBliss Kitchen')}</span></td>
                <td><span class="text-truncate d-inline-block" style="max-width: 220px;" title="${escapeHTML(o.items)}">${escapeHTML(o.items || 'Food pack')}</span></td>
                <td class="fw-bold text-dark">${formatINR(o.amount || o.totalAmount)}</td>
                <td><span class="badge bg-light text-dark border">${o.payment || 'UPI'}</span></td>
                <td><span class="${badgeClass} px-3 py-2 rounded-pill">${o.statusText || o.status}</span></td>
                <td>
                    ${getActionButtonsForStatus(o)}
                </td>
                <td>
                    <button class="fd-btn fd-btn-outline fd-btn-sm" onclick="viewOrderReceipt('${o.id}')">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterOrdersPage(status, btn) {
    currentOrdersPageFilter = status;
    document.querySelectorAll('#orders-filter-pills-row .fd-pill-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderOrdersPageTable();
}

function searchOrdersPage(query) {
    currentOrdersSearchQuery = query.trim();
    renderOrdersPageTable();
}

async function handleAdminOrderAction(orderId, action) {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        };
        const res = await fetch(`${API_BASE}/admin/orders/${orderId}/${action}`, {
            method: 'PUT',
            headers
        });

        if (res.ok) {
            const updated = await res.json();
            showToast(`Order #${orderId} is now ${updated.status}!`, '🚀');
            await fetchAdminOrders();
        } else {
            const err = await res.json().catch(() => ({}));
            alert(err.message || `Failed to update order status.`);
        }
    } catch (e) {
        console.error(e);
        alert('Error updating order status');
    }
}

// 8. Customers View
function renderCustomersTable() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    tbody.innerHTML = CUSTOMERS_DATA.map(c => `
        <tr>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="bg-light rounded-circle d-flex align-items-center justify-content-center fw-bold text-secondary border" style="width: 34px; height: 34px;">
                        ${c.name.charAt(0)}
                    </div>
                    <div>
                        <div class="fw-bold text-dark">${escapeHTML(c.name)}</div>
                        <small class="text-muted">ID: #CUST-${c.id}</small>
                    </div>
                </div>
            </td>
            <td>${escapeHTML(c.email)}</td>
            <td>${escapeHTML(c.phone)}</td>
            <td class="fw-bold">${c.orders}</td>
            <td class="fw-bold text-dark">${formatINR(c.totalSpent)}</td>
            <td class="text-muted small">${c.lastOrder}</td>
            <td><span class="badge ${c.status === 'Premium' ? 'bg-warning-subtle text-dark border border-warning' : 'bg-success-subtle text-success border border-success-subtle'}">${c.status}</span></td>
            <td>
                <button class="fd-btn fd-btn-outline fd-btn-sm" onclick="showToast('Customer history loaded', '👤')">Profile</button>
            </td>
        </tr>
    `).join('');
}

// 9. Delivery Partners View
function renderDeliveryPartnersTable() {
    const tbody = document.getElementById('delivery-partners-table-body');
    if (!tbody) return;

    tbody.innerHTML = DELIVERY_PARTNERS_DATA.map(dp => {
        let badge = 'bg-secondary';
        if (dp.status === 'Available') badge = 'bg-success';
        else if (dp.status === 'On Delivery') badge = 'bg-primary';

        return `
            <tr>
                <td>
                    <div class="fw-bold text-dark">${escapeHTML(dp.name)}</div>
                    <small class="text-muted">${dp.id} • ${dp.phone}</small>
                </td>
                <td class="fw-bold">${dp.ordersCompleted}</td>
                <td><span class="text-warning fw-bold">${dp.rating}</span></td>
                <td class="fw-bold text-primary">${dp.todayDeliveries} Orders</td>
                <td><span class="badge ${badge}">${dp.status}</span></td>
                <td><span class="text-secondary">${dp.vehicle}</span></td>
                <td>
                    <button class="fd-btn fd-btn-outline fd-btn-sm" onclick="showToast('Calling driver ${dp.name}...', '📞')">📞 Call</button>
                </td>
            </tr>
        `;
    }).join('');
}

// 10. Coupons & Offers View
function renderCouponsTable() {
    const tbody = document.getElementById('coupons-table-body');
    if (!tbody) return;

    const list = adminCouponsData.length > 0 ? adminCouponsData : COUPONS_DATA;

    tbody.innerHTML = list.map(c => `
        <tr>
            <td class="fw-bold text-primary font-monospace fs-6">${escapeHTML(c.code)}</td>
            <td class="fw-bold text-dark">${typeof c.discount === 'string' ? c.discount : formatINR(c.discountAmount)}</td>
            <td>${typeof c.minOrder === 'number' ? formatINR(c.minOrder) : formatINR(c.minOrderAmount || 199)}</td>
            <td><span class="badge bg-light text-dark border">${c.usage || 500} used</span></td>
            <td class="text-muted small">${c.expiry || '31 Dec 2026'}</td>
            <td><span class="badge ${c.active ? 'bg-success' : 'bg-secondary'}">${c.active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="fd-btn fd-btn-outline fd-btn-sm" onclick="toggleCouponStatus(${c.id})">${c.active ? 'Deactivate' : 'Activate'}</button>
            </td>
        </tr>
    `).join('');
}

function toggleCouponStatus(id) {
    const c = (adminCouponsData.length > 0 ? adminCouponsData : COUPONS_DATA).find(item => item.id === id);
    if (c) {
        c.active = !c.active;
        renderCouponsTable();
        showToast(`Coupon ${c.code} status updated`, '🏷️');
    }
}

function openCreateCouponModal() {
    const modalEl = document.getElementById('createCouponModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function handleCreateCouponSubmit(e) {
    e.preventDefault();
    const code = document.getElementById('new-coupon-code').value.trim().toUpperCase();
    const discount = document.getElementById('new-coupon-discount').value.trim();
    const minOrder = parseFloat(document.getElementById('new-coupon-minorder').value);

    const newCoupon = {
        id: Date.now(),
        code,
        discount,
        minOrder,
        usage: 0,
        expiry: '31 Dec 2026',
        active: true
    };

    COUPONS_DATA.unshift(newCoupon);
    renderCouponsTable();

    const modalEl = document.getElementById('createCouponModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    document.getElementById('createCouponForm').reset();
    showToast(`Created coupon "${code}"!`, '🏷️');
}

// 11. Payments View
function renderPaymentsTable() {
    const tbody = document.getElementById('payments-table-body');
    if (!tbody) return;

    tbody.innerHTML = TRANSACTIONS_DATA.map(t => `
        <tr>
            <td class="fw-bold font-monospace">${t.id}</td>
            <td class="text-secondary">${t.orderId}</td>
            <td class="fw-bold text-dark">${escapeHTML(t.customer)}</td>
            <td><span class="badge bg-light text-dark border">${t.method}</span></td>
            <td class="fw-bold text-dark">${formatINR(t.amount)}</td>
            <td><span class="badge ${t.status === 'Success' ? 'bg-success' : (t.status === 'Refunded' ? 'bg-danger' : 'bg-warning text-dark')}">${t.status}</span></td>
            <td class="text-muted small">${t.date}</td>
        </tr>
    `).join('');
}

// 12. Reviews & Ratings View
function renderReviewsTable() {
    const container = document.getElementById('reviews-list-container');
    if (!container) return;

    container.innerHTML = REVIEWS_DATA.map(r => `
        <div class="p-3 border rounded-3 mb-3 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <strong class="text-dark">${escapeHTML(r.customer)}</strong>
                    <span class="text-muted ms-2 small">reviewed <em>${escapeHTML(r.restaurant)}</em></span>
                </div>
                <div class="text-warning fw-bold">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            </div>
            <p class="mb-2 text-secondary" style="font-size: 13.5px;">"${escapeHTML(r.review)}"</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">${r.date}</small>
                <button class="fd-btn fd-btn-outline fd-btn-sm" onclick="promptReviewReply('${escapeHTML(r.customer)}')">Reply</button>
            </div>
        </div>
    `).join('');
}

function promptReviewReply(customer) {
    const reply = prompt(`Enter reply to ${customer}:`);
    if (reply) {
        showToast(`Reply sent to ${customer}!`, '💬');
    }
}

// =========================================================
// Backend Fetch Integration
// =========================================================
async function fetchBackendData() {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        const statsRes = await fetch(`${API_BASE}/admin/stats`, { headers });
        if (statsRes.ok) {
            const stats = await statsRes.json();
            if (stats.totalOrders !== undefined) DASHBOARD_KPIS.totalOrders = stats.totalOrders;
            if (stats.totalUsers !== undefined) DASHBOARD_KPIS.totalCustomers = stats.totalUsers;
            if (stats.todayOrders !== undefined) DASHBOARD_KPIS.todayOrders = stats.todayOrders;
            if (stats.revenue && Number(stats.revenue) >= 0) DASHBOARD_KPIS.todayRevenue = Number(stats.revenue);
            renderDashboardKPIs();
        }
    } catch (e) {}

    try {
        const menuRes = await fetch(`${API_BASE}/menu?page=0&size=150`);
        if (menuRes.ok) {
            const data = await menuRes.json();
            adminMenuData = data.content || [];
            renderMenuManagementTable();
        }
    } catch (e) {}

    await fetchAdminOrders();

    // Auto-poll admin orders every 4 seconds to catch new incoming orders in real time
    if (!window.__adminOrdersPollingInterval) {
        window.__adminOrdersPollingInterval = setInterval(fetchAdminOrders, 4000);
    }
}

async function fetchAdminOrders() {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        const ordersRes = await fetch(`${API_BASE}/admin/orders`, { headers });
        if (ordersRes.ok) {
            const orders = await ordersRes.json();
            if (orders && Array.isArray(orders)) {
                adminOrdersData = orders.slice().reverse().map(o => ({
                    id: `#ORD100${o.id}`,
                    numericId: o.id,
                    userId: o.userId,
                    customer: o.userName || `Customer #${o.userId}`,
                    phone: o.userPhone || '+91 98765 43210',
                    email: o.userEmail || '',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
                    restaurant: 'BiteBliss Kitchen',
                    items: o.items ? o.items.map(i => `${i.menuItemName} x ${i.quantity}`).join(', ') : 'Dishes',
                    amount: o.totalAmount,
                    payment: o.paymentType || 'Online (UPI)',
                    status: o.status,
                    statusText: o.status,
                    date: o.orderDate ? new Date(o.orderDate).toLocaleString() : 'Today',
                    address: o.deliveryAddressText || 'Customer Delivery Address'
                }));

                const pendingCount = adminOrdersData.filter(o => o.status === 'PENDING').length;
                const pillPending = document.getElementById('pill-pending-count');
                if (pillPending) pillPending.textContent = `Pending (${pendingCount})`;

                renderRecentOrdersTable();
                renderOrdersPageTable();
            }
        }
    } catch (e) {
        console.error('Failed to fetch admin orders:', e);
    }
}

// =========================================================
// Modal & Utility Helpers
// =========================================================
function viewOrderReceipt(orderId) {
    const o = (adminOrdersData.length > 0 ? adminOrdersData : RECENT_ORDERS_LIST).find(item => String(item.id) === String(orderId)) || RECENT_ORDERS_LIST[0];
    
    document.getElementById('receipt-order-id').textContent = o.id;
    document.getElementById('receipt-customer-name').textContent = o.customer;
    document.getElementById('receipt-restaurant-name').textContent = o.restaurant;
    document.getElementById('receipt-delivery-address').textContent = o.address || 'Flat 402, Lotus Residency, Indiranagar, Bengaluru';
    document.getElementById('receipt-items-text').textContent = o.items;
    document.getElementById('receipt-payment-method').textContent = o.payment;
    document.getElementById('receipt-total-amount').textContent = formatINR(o.amount || o.totalAmount);

    const modalEl = document.getElementById('orderReceiptModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function handleGlobalSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) return;
    if (q.includes('biryani') || q.includes('pizza') || q.includes('burger') || q.includes('paneer') || q.includes('noodle')) {
        switchView('menu');
        searchMenuAdmin(q);
    } else if (q.includes('order') || q.includes('fd')) {
        switchView('orders');
        searchOrdersPage(q);
    } else if (q.includes('rahul') || q.includes('priya') || q.includes('arjun') || q.includes('cust')) {
        switchView('customers');
    }
}

function exportReport(format) {
    showToast(`Generating ${format.toUpperCase()} summary statement...`, '📄');
    setTimeout(() => {
        showToast(`${format.toUpperCase()} report exported successfully!`, '📥');
    }, 1200);
}

function adminLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    showToast('Logged out of BiteBliss Admin Portal', '👋');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 800);
}

function showToast(message, icon = '✅') {
    const existing = document.querySelector('.fd-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'fd-toast';
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 250);
    }, 2800);
}

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
