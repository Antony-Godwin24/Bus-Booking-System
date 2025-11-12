const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    seatNumber: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    seatType: {
        type: String,
        enum: ['window', 'aisle'],
        default: 'window'
    }
});

const busSchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: true,
        unique: true
    },
    busName: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    departureTime: {
        type: Date,
        required: true
    },
    arrivalTime: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    totalSeats: {
        type: Number,
        default: 40
    },
    seats: [seatSchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Fix: Create seats when bus is created
busSchema.pre('save', function(next) {
    if (this.isNew && (!this.seats || this.seats.length === 0)) {
        this.seats = [];
        for (let i = 1; i <= this.totalSeats; i++) {
            this.seats.push({
                seatNumber: `S${i}`,
                isAvailable: true,
                seatType: i % 2 === 0 ? 'aisle' : 'window'
            });
        }
    }
    next();
});

module.exports = mongoose.model('Bus', busSchema);