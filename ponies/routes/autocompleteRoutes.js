import express from 'express';
import 'dotenv/config';
import { Geocodio } from 'geocodio-library-node';

const router = express.Router();

  /*
const geocoder = new Geocodio(process.env.GEOCODIO_API_KEY);

geocoder.geocode(query)
  .then(response => {
    console.log(response);
  })
  .catch(err => {
    console.error(err);
  }
);  
*/

/*
router.get('/api/autocomplete', async (req, res) => {
  const query = req.query.q;
  const apiKey = process.env.GEOCODIO_API_KEY;
  
  const geocodioUrl = `https://api.geocod.io/v2?{encodeURIComponent(query)}&api_key=${apiKey}`;


  try {
    const response = await fetch(geocodioUrl);
    const data = await response.json();
    res.json(data); // Feed the results right back to your front-end
  } catch (error) {
    res.status(500).json({ error: "Failed fetching autocomplete data" });
  }


});
*/

router.get('/api/autocomplete', async (req, res) => {
  const query = req.query.q;
  const apiKey = process.env.GEOCODIO_API_KEY;


    const geocoder = new Geocodio(process.env.GEOCODIO_API_KEY);

    geocoder.geocode(query)
    .then(response => {
        //const data = JSON.parse(response.results);

        for (let i = 0; i < response.results.length-1; i++ ) {
            const cityData = response.results[i];
            console.log(`address component  ${cityData}`);
        }

        res.json(response.results); 
    })
    .catch(err => {
        console.error(err);
    }
    );  

});


/*
  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  const geocodioUrl = `https://geocod.io{encodeURIComponent(query)}&api_key=${apiKey}`;

  try {
    const response = await fetch(geocodioUrl);

    // 1. CHECK THE HTTP STATUS FIRST BEFORE PARSING AS JSON
    if (!response.ok) {
      // Safely read the error text instead of guessing if it is JSON
      const errorText = await response.text();
      console.error(`Geocodio API Error (${response.status}):`, errorText);
      return res.status(response.status).json({ 
        error: "Geocodio API rejected the request", 
        details: errorText 
      });
    }

    // 2. Safe to parse now that we know we have an HTTP 200 OK status
    const data = await response.json();
    res.json(data); 

  } catch (error) {
    // 3. Log the ACTUAL error to your terminal so you can fix it instantly!
    console.error("Internal Router Crash Details:", error);

    res.status(500).json({ 
      error: "Failed fetching autocomplete data",
      message: error.message 
    });
  }
});

*/
export default router;