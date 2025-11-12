const mongoose = require('mongoose');
const Bus = require('./models/Bus');
require('dotenv').config();

// Function to create seats array
const createSeats = (totalSeats = 40) => {
    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
        seats.push({
            seatNumber: `S${i}`,
            isAvailable: true, // All seats available initially
            seatType: i % 2 === 0 ? 'aisle' : 'window'
        });
    }
    return seats;
};

const tamilNaduBuses = [
    {
        busNumber: 'TN01AB1234',
        busName: 'KPN Travels AC Sleeper',
        source: 'Chennai',
        destination: 'Coimbatore',
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 28 * 60 * 60 * 1000),
        price: 850,
        totalSeats: 40,
        seats: createSeats(40)
    },
    {
        busNumber: 'TN01CD5678',
        busName: 'Parveen Travels AC Semi-Sleeper',
        source: 'Chennai',
        destination: 'Madurai',
        departureTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 31 * 60 * 60 * 1000),
        price: 750,
        totalSeats: 40,
        seats: createSeats(40)
    },
    {
        busNumber: 'TN02EF9012',
        busName: 'Orange Tours AC Multi-Axle',
        source: 'Coimbatore',
        destination: 'Chennai',
        departureTime: new Date(Date.now() + 20 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        price: 800,
        totalSeats: 40,
        seats: createSeats(40)
    },
    {
        busNumber: 'TN03GH3456',
        busName: 'SRM Travels Non-AC Sleeper',
        source: 'Madurai',
        destination: 'Trichy',
        departureTime: new Date(Date.now() + 22 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
        price: 350,
        totalSeats: 40,
        seats: createSeats(40)
    },
    {
        busNumber: 'TN04IJ7890',
        busName: 'Kallada Travels AC Seater',
        source: 'Salem',
        destination: 'Bangalore',
        departureTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 22 * 60 * 60 * 1000),
        price: 600,
        totalSeats: 40,
        seats: createSeats(40)
    },
    {
        busNumber: 'TN05KL1234',
        busName: 'SRS Travels Luxury AC',
        source: 'Trichy',
        destination: 'Coimbatore',
        departureTime: new Date(Date.now() + 28 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 32 * 60 * 60 * 1000),
        price: 700,
        totalSeats: 40,
        seats: createSeats(40)
    },
    {
        busNumber: 'TN06MN5678',
        busName: 'JBT Travels AC Sleeper',
        source: 'Chennai',
        destination: 'Tirunelveli',
        departureTime: new Date(Date.now() + 30 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 36 * 60 * 60 * 1000),
        price: 950,
        totalSeats: 40,
        seats: createSeats(40)
    },
    {
        busNumber: 'TN07OP9012',
        busName: 'Morning Star Travels Non-AC',
        source: 'Coimbatore',
        destination: 'Salem',
        departureTime: new Date(Date.now() + 19 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 22 * 60 * 60 * 1000),
        price: 280,
        totalSeats: 40,
        seats: createSeats(40)
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus_booking');
        console.log('Connected to database');

        // Clear existing buses
        await Bus.deleteMany({});
        console.log('Cleared existing buses');

        // Insert new buses with seats
        await Bus.insertMany(tamilNaduBuses);
        console.log('Tamil Nadu buses with seats added successfully');

        // Verify seats were created
        const buses = await Bus.find();
        console.log(`Created ${buses.length} buses`);
        buses.forEach(bus => {
            console.log(`Bus ${bus.busNumber} has ${bus.seats.length} seats, ${bus.seats.filter(s => s.isAvailable).length} available`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();