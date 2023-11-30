const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Ad, AdEvent } = require('./models/ad');
// const { Article } = require('../models/article.js');
// const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3002;

mongoose.connect('mongodb://host.docker.internal:27017/daily', { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware to parse JSON in the request body
app.use(bodyParser.json());

// Configure CORS to allow only requests from host.docker.internal:3000
const corsOptions = {
  origin: 'http://host.docker.internal:3000',
  optionsSuccessStatus: 200,
};
// Enable CORS for all routes
app.use(cors(corsOptions));

// Middleware to serve static files (including images)
app.use('/images', express.static('images'));

app.post('/ad', async(req, res) => {
  try {
    // Find the first ad in the database
    // const firstAd = await Ad.findOne();
    // Find a random ad in the database
    const randomAd = await Ad.aggregate([{ $sample: { size: 1 } }]);

    // Check if there is a random ad
    if (randomAd && randomAd.length > 0) {
      const host = req.get('host');
      randomAd[0].path = `http://${host}/${randomAd[0].path}`;
      res.json({ ad: randomAd[0] });
    } else {
      console.log('No ads found in the database.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
})

app.post('/ad/event', async(req, res) => {
  try {
    // console.log(req);
    // Create a new instance of the AdEvent model
    const newAdEvent = new AdEvent({
      ad_id: req.body.ad_id,
      userIp: req.body.ip,
      userAgent: req.body.userAgent,
      eventType: req.body.eventType,
      user: req.body.user,
      article: req.body.article,
    });

    // Save the new ad event to the database
    const savedAdEvent = await newAdEvent.save();

    console.log('Ad event created successfully:', savedAdEvent);
  } catch (error) {
    console.error('Error:', error.message);
  }
})

// Endpoint to get ads with impression and interaction counts
app.get('/ad/ads', async (req, res) => {
  try {
    const ads = await Ad.find();

    // Get ad event counts for each ad
    const adData = await Promise.all(
      ads.map(async (ad) => {
        const impressionCount = await AdEvent.countDocuments({ ad_id: ad._id, eventType: 'impression' });
        const interactionCount = await AdEvent.countDocuments({ ad_id: ad._id, eventType: 'interaction' });

        return {
          ad_id: ad._id,
          ad_path: ad.path,
          ad_url: ad.url,
          impressions: impressionCount,
          interactions: interactionCount,
        };
      })
    );

    res.json(adData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get raw data of all AdEvents
app.get('/ad/events', async (req, res) => {
  try {
    const adEvents = await AdEvent.find();
    res.json(adEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.post('/ad', async(req, res) => {
//   try {
//     // Find the first ad in the database
//     const firstAd = await Ad.findOne();

//     // Check if there is an ad
//     if (firstAd) {
//       res.json({ success: true, id: fisrtAd._id });
//     } else {
//       console.log('No ads found in the database.');
//     }
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// });

// // Endpoint to handle POST requests at /ad/image
// app.post('/ad/image', async (req, res) => {
//   // const imagePath = 'images/duckduckgo.jpg';
//   // const imagePath = 'images/image.jpg';

//   try {
//     // Find the first ad in the database
//     const firstAd = await Ad.findOne();

//     // Check if there is an ad
//     if (firstAd) {
//       // Access the 'path' property
//       const imagePath = firstAd.path;
//       // Read the image file
//       fs.readFile(imagePath, (err, data) => {
//         if (err) {
//           console.error(err);
//           res.status(500).send('Internal Server Error');
//         } else {
//           // Set content type to image/jpeg
//           res.contentType('image/jpeg');
//           // Encode the binary data to base64
//           const base64Data = data.toString('base64');
//           // Send the image data in the response
//           // res.send(data);
//           res.send(base64Data);
//           // <img src="data:image/jpeg;base64,<%= imageData %>" alt="Ad">
//         }
//       });
//     } else {
//       console.log('No ads found in the database.');
//     }
//   } catch (error) {
//     console.error('Error:', error.message);
//   }

  // // Read the image file
  // fs.readFile(imagePath, (err, data) => {
  //   if (err) {
  //     console.error(err);
  //     res.status(500).send('Internal Server Error');
  //   } else {
  //     // Set content type to image/jpeg
  //     res.contentType('image/jpeg');
  //     // Encode the binary data to base64
  //     const base64Data = data.toString('base64');
  //     // Send the image data in the response
  //     // res.send(data);
  //     res.send(base64Data);
  //   }
  // });
// });

// async function createAd(adPath) {
//   try {
//     // Create a new instance of the Ad model
//     const newAd = new Ad({
//       path: adPath,
//     });

//     // Save the new ad to the database
//     const savedAd = await newAd.save();

//     console.log('Ad created successfully:', savedAd);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }

// createAd('images/duckduckgo.jpg');

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});