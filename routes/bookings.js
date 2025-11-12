const express = require('express');
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
    try {
        const { busId, seats, travelDate } = req.body;

        const bus = await Bus.findById(busId);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }

        // Check seat availability
        for (const seat of seats) {
            const busSeat = bus.seats.find(s => s.seatNumber === seat.seatNumber);
            if (!busSeat || !busSeat.isAvailable) {
                return res.status(400).json({ message: `Seat ${seat.seatNumber} is not available` });
            }
        }

        // Calculate total amount
        const totalAmount = seats.length * bus.price;

        // Create booking
        const booking = new Booking({
            user: req.user._id,
            bus: busId,
            seats,
            totalAmount,
            travelDate
        });

        await booking.save();

        // Update seat availability
        for (const seat of seats) {
            const busSeat = bus.seats.find(s => s.seatNumber === seat.seatNumber);
            busSeat.isAvailable = false;
        }
        await bus.save();

        // Create payment record
        const payment = new Payment({
            booking: booking._id,
            user: req.user._id,
            amount: totalAmount,
            transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`
        });

        await payment.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('bus', 'busNumber busName source destination departureTime')
            .populate('user', 'name email');

        res.status(201).json({
            booking: populatedBooking,
            payment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/my-bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('bus', 'busNumber busName source destination departureTime')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('bus')
            .populate('user', 'name email phone');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user owns the booking or is admin
        if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;