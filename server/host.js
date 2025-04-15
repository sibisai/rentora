const express = require('express');
const Property = require('./models/property');
const User = require('./models/User');

const router = express.Router();

router.post('/hosting', async (req, res) => {
    try {
        const { propertyId, hostId } = req.body;

        if (!propertyId || !hostId) {
            return res.status(400).json({ message: 'All hosting details are required.' });
        }

        const property = await propertyId.findById(propertyId);
        if (property) {
            return res.status(400).json({ message: 'Propery already exists.' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found. '});
        }

        const newHosting = new Hosting({
            property: propertyId,
            host: userId
        });

        await newHosting.save();
        res.status(201).json(newHosting);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/hostings', async (req, res) => {
    try {
        const hostings = await Hosting.find()
            .populate('property')
            .populate('host');
        res.json(hostings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;