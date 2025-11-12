let currentAdminSection = 'stats';

function showAdminSection(section) {
    currentAdminSection = section;
    
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`admin${section.charAt(0).toUpperCase() + section.slice(1)}`).style.display = 'block';
    
    // Load section data
    switch(section) {
        case 'stats':
            loadAdminStats();
            break;
        case 'buses':
            loadBusesManagement();
            break;
        case 'bookings':
            loadAllBookings();
            break;
        case 'users':
            loadAllUsers();
            break;
    }
}

async function loadAdminStats() {
    try {
        const stats = await apiCall('/admin/dashboard/stats');
        displayAdminStats(stats);
    } catch (error) {
        alert(error.message);
    }
}

function displayAdminStats(stats) {
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = `
        <div class="stat-card">
            <h4>Total Users</h4>
            <div class="number">${stats.totalUsers}</div>
        </div>
        <div class="stat-card">
            <h4>Active Buses</h4>
            <div class="number">${stats.totalBuses}</div>
        </div>
        <div class="stat-card">
            <h4>Total Bookings</h4>
            <div class="number">${stats.totalBookings}</div>
        </div>
        <div class="stat-card">
            <h4>Total Revenue</h4>
            <div class="number">$${stats.totalRevenue}</div>
        </div>
    `;
}

async function loadBusesManagement() {
    try {
        const buses = await apiCall('/admin/buses');
        displayBusesManagement(buses);
    } catch (error) {
        alert(error.message);
    }
}

function displayBusesManagement(buses) {
    const busesList = document.getElementById('busesManagementList');
    
    busesList.innerHTML = buses.map(bus => `
        <div class="bus-card">
            <div class="bus-info">
                <h3>${bus.busName} (${bus.busNumber})</h3>
                <p><strong>Route:</strong> ${bus.source} → ${bus.destination}</p>
                <p><strong>Departure:</strong> ${new Date(bus.departureTime).toLocaleString()}</p>
                <p><strong>Price:</strong> $${bus.price}</p>
                <p><strong>Status:</strong> ${bus.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
                <button onclick="editBus('${bus._id}')">Edit</button>
                <button onclick="toggleBusStatus('${bus._id}', ${bus.isActive})">
                    ${bus.isActive ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </div>
    `).join('');
}

async function loadAllBookings() {
    try {
        const bookings = await apiCall('/admin/bookings');
        displayAllBookings(bookings);
    } catch (error) {
        alert(error.message);
    }
}

function displayAllBookings(bookings) {
    const bookingsList = document.getElementById('allBookingsList');
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p>No bookings found.</p>';
        return;
    }

    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <h3>Booking #${booking._id.slice(-8)}</h3>
            <p><strong>User:</strong> ${booking.user.name} (${booking.user.email})</p>
            <p><strong>Bus:</strong> ${booking.bus.busName} (${booking.bus.busNumber})</p>
            <p><strong>Seats:</strong> ${booking.seats.map(s => s.seatNumber).join(', ')}</p>
            <p><strong>Amount:</strong> $${booking.totalAmount}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
            <p><strong>Date:</strong> ${new Date(booking.createdAt).toLocaleString()}</p>
        </div>
    `).join('');
}

async function loadAllUsers() {
    try {
        const users = await apiCall('/admin/users');
        displayAllUsers(users);
    } catch (error) {
        alert(error.message);
    }
}

function displayAllUsers(users) {
    const usersList = document.getElementById('usersList');
    
    usersList.innerHTML = users.map(user => `
        <div class="user-card" style="background: white; padding: 1rem; margin: 1rem 0; border-radius: 8px;">
            <h3>${user.name}</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone}</p>
            <p><strong>Role:</strong> ${user.role}</p>
            <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
    `).join('');
}

function showAddBusForm() {
    // Simple form implementation - in a real project, you'd create a proper modal
    const busData = {
        busNumber: prompt('Enter bus number:'),
        busName: prompt('Enter bus name:'),
        source: prompt('Enter source:'),
        destination: prompt('Enter destination:'),
        departureTime: prompt('Enter departure time (YYYY-MM-DDTHH:MM):'),
        arrivalTime: prompt('Enter arrival time (YYYY-MM-DDTHH:MM):'),
        price: parseFloat(prompt('Enter price per seat:'))
    };

    if (Object.values(busData).some(value => !value)) {
        alert('All fields are required');
        return;
    }

    addNewBus(busData);
}

async function addNewBus(busData) {
    try {
        await apiCall('/admin/buses', {
            method: 'POST',
            body: JSON.stringify(busData)
        });
        alert('Bus added successfully!');
        loadBusesManagement();
    } catch (error) {
        alert(error.message);
    }
}

async function toggleBusStatus(busId, isActive) {
    try {
        await apiCall(`/admin/buses/${busId}`, {
            method: 'DELETE'
        });
        alert(`Bus ${isActive ? 'deactivated' : 'activated'} successfully!`);
        loadBusesManagement();
    } catch (error) {
        alert(error.message);
    }
}