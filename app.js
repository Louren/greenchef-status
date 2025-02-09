const express = require('express');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const app = express();

app.get('/status', async (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).send('Token is required');
    }
    const url = `https://europe-west1-hellofresh-prod.cloudfunctions.net/c_hf_getTraceyData?token=${token}`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        }
    });
    if (!response.ok) {
        return res.status(500).send('Error fetching delivery data');
    }
    const deliveryData = await response.json();
    if (!deliveryData) {
        return res.status(404).send('Delivery data not found');
    }

    const plannedTimeFormatted = moment
        .tz(deliveryData.plannedTimeOfArrival, 'Europe/Amsterdam')
        .format('DD MMM YYYY HH:mm')
        .toLowerCase();
    const estimatedTimeFormatted = moment
        .tz(deliveryData.estimatedTimeOfArrival, 'Europe/Amsterdam')
        .format('DD MMM YYYY HH:mm')
        .toLowerCase();
    const deliveryTimeFormatted = moment
        .tz(deliveryData.deliveryTime, 'Europe/Amsterdam')
        .format('DD MMM YYYY HH:mm')
        .toLowerCase();

    const parsedInfo = {
        customerFirstName: deliveryData.customerFirstName,
        country: deliveryData.country,
        traceyPhase: deliveryData.traceyPhase,
        arrival: estimatedTimeFormatted,
        plannedTimeOfArrival: plannedTimeFormatted,
        estimatedTimeOfArrival: estimatedTimeFormatted,
        deliveryTime: deliveryTimeFormatted,
        staticMapsUrl: deliveryData.staticMapsUrl,
        amountOfStopsBefore: deliveryData.amountOfStopsBefore,
    };

    res.send(`
    <h1>Delivery Info</h1>
    <p>Name: ${parsedInfo.customerFirstName}</p>
    <p>Planned Arrival: ${parsedInfo.plannedTimeOfArrival}</p>
    <p>Estimated Arrival: ${parsedInfo.estimatedTimeOfArrival}</p>
    <p>Delivery Time: ${parsedInfo.deliveryTime}</p>
    <p>Tracey Phase: ${parsedInfo.traceyPhase}</p>
    <p>Estimated Arrival: ${parsedInfo.arrival}</p>
    <img src="${parsedInfo.staticMapsUrl}" />
    <h2>Full JSON</h2>
    <pre>${JSON.stringify(deliveryData, null, 2)}</pre>
`);
});

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
        <h1>Enter Tracking Code or URL</h1>
        <form action="/" method="POST">
            <input type="text" name="value" placeholder="Enter token or URL" required>
            <button type="submit">Submit</button>
        </form>
    `);
});

app.post('/', (req, res) => {
    const input = req.body.value.trim();
    let token;

    try {
        const inputUrl = new URL(input);
        token = inputUrl.searchParams.get('token') || inputUrl.pathname.replace('/', '');
    } catch {
        token = input;
    }

    res.redirect(`/status?token=${encodeURIComponent(token)}`);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});