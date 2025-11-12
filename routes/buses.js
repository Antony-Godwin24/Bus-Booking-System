const express = require('express');
const Bus = require('../models/Bus');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const { source, destination } = req.query;
        
        let query = { isActive: true };
        if (source) query.source = new RegExp(source, 'i');
        if (destination) query.destination = new RegExp(destination, 'i');

        const buses = await Bus.find(query);
        res.json(buses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all buses (without authentication for home page)
router.get('/all', async (req, res) => {
    try {
        const buses = await Bus.find({ isActive: true });
        res.json(buses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        res.json(bus);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;