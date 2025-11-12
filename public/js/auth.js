let currentUser = null;
let token = localStorage.getItem('token');

// Page navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    updateNavigation();
}

function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const adminLink = document.getElementById('adminLink');
    const profileLink = document.getElementById('profileLink');
    const logoutLink = document.getElementById('logoutLink');
    const homeLink = document.getElementById('homeLink');

    if (currentUser) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        dashboardLink.style.display = 'block';
        profileLink.style.display = 'block';
        logoutLink.style.display = 'block';
        
        if (currentUser.role === 'admin') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    } else {
        loginLink.style.display = 'block';
        registerLink.style.display = 'block';
        dashboardLink.style.display = 'none';
        adminLink.style.display = 'none';
        profileLink.style.display = 'none';
        logoutLink.style.display = 'none';
    }
}

// API calls
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const response = await fetch(`http://localhost:3000/api${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
    });

    if (response.status === 401) {
        logout();
        throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

// Authentication functions
async function login(email, password) {
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        token = data.token;
        currentUser = data.user;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        showPage('dashboardPage');
        updateNavigation();
        
        alert('Login successful!');
    } catch (error) {
        alert(error.message);
    }
}

async function register(userData) {
    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        token = data.token;
        currentUser = data.user;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        showPage('dashboardPage');
        updateNavigation();
        
        alert('Registration successful!');
    } catch (error) {
        alert(error.message);
    }
}

function logout() {
    currentUser = null;
    token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showPage('homePage');
    updateNavigation();
}

async function loadProfile() {
    try {
        const user = await apiCall('/auth/profile');
        document.getElementById('profileName').value = user.name;
        document.getElementById('profileEmail').value = user.email;
        document.getElementById('profilePhone').value = user.phone;
    } catch (error) {
        alert(error.message);
    }
}

async function updateProfile(profileData) {
    try {
        await apiCall('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        alert('Profile updated successfully!');
    } catch (error) {
        alert(error.message);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (token) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showPage('dashboardPage');
        }
    }
    
    updateNavigation();

    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        login(email, password);
    });

    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const userData = {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            phone: document.getElementById('registerPhone').value
        };
        register(userData);
    });

    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const profileData = {
            name: document.getElementById('profileName').value,
            phone: document.getElementById('profilePhone').value
        };
        updateProfile(profileData);
    });

    // Navigation links
    document.getElementById('homeLink').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('homePage');
    });

    document.getElementById('loginLink').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('loginPage');
    });

    document.getElementById('registerLink').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('registerPage');
    });

    document.getElementById('dashboardLink').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('dashboardPage');
    });

    document.getElementById('adminLink').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('adminPage');
        if (currentUser?.role === 'admin') {
            loadAdminStats();
        }
    });

    document.getElementById('profileLink').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('profilePage');
        loadProfile();
    });

    document.getElementById('logoutLink').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    const dashboardLink = document.getElementById('dashboardLink');
    dashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('dashboardPage');
        loadDashboardStats();
    });
});

// Add dashboard stats function
async function loadDashboardStats() {
    if (!currentUser) return;
    
    try {
        const bookings = await apiCall('/bookings/my-bookings');
        displayDashboardStats(bookings);
    } catch (error) {
        console.log('Could not load dashboard stats');
    }
}

function displayDashboardStats(bookings) {
    const bookingsList = document.getElementById('bookingsList');
    
    // Create stats section
    const statsHtml = `
        <div class="stats-grid" style="margin-bottom: 2rem;">
            <div class="stat-card">
                <h4>Total Bookings</h4>
                <div class="number">${bookings.length}</div>
            </div>
            <div class="stat-card">
                <h4>Confirmed</h4>
                <div class="number">${bookings.filter(b => b.status === 'confirmed').length}</div>
            </div>
            <div class="stat-card">
                <h4>Total Spent</h4>
                <div class="number">₹${bookings.reduce((sum, booking) => sum + booking.totalAmount, 0)}</div>
            </div>
        </div>
    `;
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = statsHtml + `
            <div style="text-align: center; padding: 3rem; background: white; border-radius: 15px;">
                <h3>No Bookings Yet</h3>
                <p>Start your journey by booking your first bus ticket!</p>
                <button onclick="showPage('homePage')" style="margin-top: 1rem; padding: 1rem 2rem; background: #3498db; color: white; border: none; border-radius: 10px; cursor: pointer;">
                    Book Now
                </button>
            </div>
        `;
        return;
    }

    const recentBookings = bookings.slice(0, 5);
    
    bookingsList.innerHTML = statsHtml + `
        <h3 style="color: #2c3e50; margin-bottom: 1rem;">Recent Bookings</h3>
        ${recentBookings.map(booking => `
            <div class="booking-card">
                <h3>${booking.bus.busName}</h3>
                <p><strong>Route:</strong> ${booking.bus.source} → ${booking.bus.destination}</p>
                <p><strong>Booking ID:</strong> #${booking._id.slice(-8)}</p>
                <p><strong>Seat:</strong> ${booking.seats.map(s => s.seatNumber).join(', ')}</p>
                <p><strong>Amount:</strong> ₹${booking.totalAmount}</p>
                <p><strong>Travel Date:</strong> ${new Date(booking.travelDate).toLocaleDateString()}</p>
                <p><strong>Departure:</strong> ${new Date(booking.bus.departureTime).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status-${booking.status}">${booking.status}</span></p>
            </div>
        `).join('')}
        
        ${bookings.length > 5 ? `
            <div style="text-align: center; margin-top: 2rem;">
                <button onclick="loadMyBookings()" style="padding: 1rem 2rem; background: #34495e; color: white; border: none; border-radius: 10px; cursor: pointer;">
                    View All Bookings (${bookings.length})
                </button>
            </div>
        ` : ''}
    `;
}