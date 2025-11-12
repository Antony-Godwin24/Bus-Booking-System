let selectedBus = null;

// Load all buses on home page
async function loadAllBuses() {
    try {
        const response = await fetch('http://localhost:3000/api/buses/all');
        const buses = await response.json();
        displayAllBuses(buses);
    } catch (error) {
        console.log('Using sample data');
        displayAllBuses(tamilNaduBuses);
    }
}

function displayAllBuses(buses) {
    const allBusesList = document.getElementById('allBusesList');
    
    if (buses.length === 0) {
        allBusesList.innerHTML = '<p>No buses available at the moment.</p>';
        return;
    }

    allBusesList.innerHTML = buses.map(bus => {
        // Safely calculate available seats
        const availableSeats = bus.seats ? bus.seats.filter(seat => seat.isAvailable).length : bus.totalSeats;
        
        return `
        <div class="bus-card">
            <div class="bus-info">
                <h3>${bus.busName} (${bus.busNumber})</h3>
                <p><strong>Route:</strong> ${bus.source} → ${bus.destination}</p>
                <p><strong>Departure:</strong> ${new Date(bus.departureTime).toLocaleString()}</p>
                <p><strong>Arrival:</strong> ${new Date(bus.arrivalTime).toLocaleString()}</p>
                <p><strong>Available Seats:</strong> ${availableSeats}</p>
            </div>
            <div class="bus-price">
                ₹${bus.price}
            </div>
            <button class="book-btn" onclick="quickBook('${bus._id}')" ${availableSeats === 0 ? 'disabled' : ''}>
                ${availableSeats === 0 ? 'Sold Out' : 'Buy Ticket'}
            </button>
        </div>
        `;
    }).join('');
}

// Quick book function - directly book without seat selection
async function quickBook(busId) {
    if (!currentUser) {
        alert('Please login to book tickets');
        showPage('loginPage');
        return;
    }

    try {
        // Get bus details
        const response = await fetch(`http://localhost:3000/api/buses/${busId}`);
        const bus = await response.json();
        
        // Find first available seat
        const availableSeats = bus.seats ? bus.seats.filter(seat => seat.isAvailable) : [];
        
        if (availableSeats.length === 0) {
            alert('Sorry, no seats available on this bus.');
            return;
        }

        // Take the first available seat
        const selectedSeat = availableSeats[0];
        
        // Get travel date from search form or use tomorrow
        const travelDate = document.getElementById('travelDate').value || 
                          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Create booking
        const bookingData = {
            busId: bus._id,
            seats: [{
                seatNumber: selectedSeat.seatNumber,
                seatType: selectedSeat.seatType
            }],
            travelDate: travelDate
        };

        const bookingResult = await apiCall('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });

        alert(`🎉 Booking confirmed!\n\nBus: ${bus.busName}\nSeat: ${selectedSeat.seatNumber}\nAmount: ₹${bookingResult.booking.totalAmount}\nTransaction ID: ${bookingResult.payment.transactionId}`);
        
        // Refresh buses list to update available seats
        loadAllBuses();
        
    } catch (error) {
        alert('❌ Booking failed: ' + error.message);
    }
}

// Simple search function
async function searchBuses() {
    const source = document.getElementById('source').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const travelDate = document.getElementById('travelDate').value;

    if (!source || !destination) {
        alert('Please enter source and destination');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/buses/all`);
        const allBuses = await response.json();
        
        const filteredBuses = allBuses.filter(bus => 
            bus.source.toLowerCase().includes(source.toLowerCase()) &&
            bus.destination.toLowerCase().includes(destination.toLowerCase())
        );
        
        displaySearchResults(filteredBuses);
    } catch (error) {
        console.log('Using sample data for search');
        const filteredBuses = tamilNaduBuses.filter(bus => 
            bus.source.toLowerCase().includes(source.toLowerCase()) &&
            bus.destination.toLowerCase().includes(destination.toLowerCase())
        );
        displaySearchResults(filteredBuses);
    }
}

function displaySearchResults(buses) {
    const searchResults = document.getElementById('searchResults');
    const busesList = document.getElementById('busesList');
    const allBusesSection = document.querySelector('.all-buses-section');

    if (buses.length === 0) {
        busesList.innerHTML = '<p>No buses found for your search criteria.</p>';
        searchResults.style.display = 'block';
        if (allBusesSection) allBusesSection.style.display = 'none';
        return;
    }

    busesList.innerHTML = buses.map(bus => {
        const availableSeats = bus.seats ? bus.seats.filter(seat => seat.isAvailable).length : bus.totalSeats;
        
        return `
        <div class="bus-card">
            <div class="bus-info">
                <h3>${bus.busName} (${bus.busNumber})</h3>
                <p><strong>Route:</strong> ${bus.source} → ${bus.destination}</p>
                <p><strong>Departure:</strong> ${new Date(bus.departureTime).toLocaleString()}</p>
                <p><strong>Arrival:</strong> ${new Date(bus.arrivalTime).toLocaleString()}</p>
                <p><strong>Available Seats:</strong> ${availableSeats}</p>
            </div>
            <div class="bus-price">
                ₹${bus.price}
            </div>
            <button class="book-btn" onclick="quickBook('${bus._id}')" ${availableSeats === 0 ? 'disabled' : ''}>
                ${availableSeats === 0 ? 'Sold Out' : 'Buy Ticket'}
            </button>
        </div>
        `;
    }).join('');

    searchResults.style.display = 'block';
    if (allBusesSection) allBusesSection.style.display = 'none';
}

// Sample Tamil Nadu bus data (fallback with proper seats)
const createSampleSeats = (totalSeats = 40) => {
    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
        seats.push({
            seatNumber: `S${i}`,
            isAvailable: true,
            seatType: i % 2 === 0 ? 'aisle' : 'window'
        });
    }
    return seats;
};

const tamilNaduBuses = [
    {
        _id: 'bus001',
        busNumber: 'TN01AB1234',
        busName: 'KPN Travels AC Sleeper',
        source: 'Chennai',
        destination: 'Coimbatore',
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(),
        price: 850,
        totalSeats: 40,
        seats: createSampleSeats(40)
    },
    {
        _id: 'bus002',
        busNumber: 'TN01CD5678',
        busName: 'Parveen Travels AC Semi-Sleeper',
        source: 'Chennai',
        destination: 'Madurai',
        departureTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() + 31 * 60 * 60 * 1000).toISOString(),
        price: 750,
        totalSeats: 40,
        seats: createSampleSeats(40)
    },
    {
        _id: 'bus003',
        busNumber: 'TN02EF9012',
        busName: 'Orange Tours AC Multi-Axle',
        source: 'Coimbatore',
        destination: 'Chennai',
        departureTime: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        price: 800,
        totalSeats: 40,
        seats: createSampleSeats(40)
    },
    {
        _id: 'bus004',
        busNumber: 'TN03GH3456',
        busName: 'SRM Travels Non-AC Sleeper',
        source: 'Madurai',
        destination: 'Trichy',
        departureTime: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        price: 350,
        totalSeats: 40,
        seats: createSampleSeats(40)
    },
    {
        _id: 'bus005',
        busNumber: 'TN04IJ7890',
        busName: 'Kallada Travels AC Seater',
        source: 'Salem',
        destination: 'Bangalore',
        departureTime: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
        price: 600,
        totalSeats: 40,
        seats: createSampleSeats(40)
    }
];

// Load all buses when home page is shown
document.addEventListener('DOMContentLoaded', function() {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('travelDate').value = tomorrow.toISOString().split('T')[0];
    
    // Load all buses
    loadAllBuses();
    
    // Reload buses when home page is shown
    const homeLink = document.getElementById('homeLink');
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('homePage');
        loadAllBuses();
        
        // Show all buses section and hide search results
        const allBusesSection = document.querySelector('.all-buses-section');
        const searchResults = document.getElementById('searchResults');
        if (allBusesSection) allBusesSection.style.display = 'block';
        if (searchResults) searchResults.style.display = 'none';
    });
});