
import express from 'express';
import CityAddress from '../models/city_address.js'; 

const router = express.Router();

router.get('/api/city-address', async (req, res) => {
    try {
        const { zipcode } = req.query;

        // 1. Validate input exists and is a primitive string
        if (!zipcode || typeof zipcode !== 'string') {
            return res.status(400).json({ error: 'A valid zipcode query parameter is required.' });
        }

        console.log(`************ GET /api/city-address: zipcode ${zipcode}`);

        // 2. Fetch data from database
       const cityAddress = await CityAddress.find({ zipcode: zipcode.trim() });
        
        console.log(`************ GET /api/city-address: zipcode ${zipcode} // city address found: ${JSON.stringify(cityAddress)}`);

        // 3. Send response using modern .json() method (automatically sets Content-Type)
        return res.status(200).json(cityAddress);

    } catch (error) {
        // 4. Catch and handle unexpected database or runtime errors
        console.error('************ GET /api/city-address ERROR:', error);
        return res.status(500).json({ error: 'Internal server error occurred.' });
    }
});

export default router;

