const express = require('express');
const router = express.Router();

// temporary mock data: will be replaced with a database in the future
const properties = [
  {
    id: 1,
    title: "Modern Apartment in LA",
    location: "Los Angeles",
    price: 150,
    propertyType: "apartment",
    availableFrom: "2025-04-20",
    availableTo: "2025-04-30",
  },
  {
    id: 2,
    title: "Cozy Cabin in Tahoe",
    location: "Lake Tahoe",
    price: 200,
    propertyType: "cabin",
    availableFrom: "2025-04-15",
    availableTo: "2025-04-25",
  },
  // etc
];

router.get('/properties', (req, res) => {
  const { location, checkIn, checkOut, minPrice, maxPrice, propertyType } = req.query;

  const filtered = properties.filter((p) => {
    const matchesLocation = location ? p.location.toLowerCase().includes(location.toLowerCase()) : true;
    const matchesPrice = (!minPrice || p.price >= Number(minPrice)) &&
                         (!maxPrice || p.price <= Number(maxPrice));
    const matchesType = propertyType ? p.propertyType === propertyType : true;
    const matchesAvailability = (!checkIn || p.availableFrom <= checkIn) &&
                                (!checkOut || p.availableTo >= checkOut);

    return matchesLocation && matchesPrice && matchesType && matchesAvailability;
  });

  res.json(filtered);
});

module.exports = router;
