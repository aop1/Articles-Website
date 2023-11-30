// article/routes/articles.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/event', async (req, res) => {
    try {
        const data = {
            ad_id: req.body.ad_id,
            ip: req.ip,
            userAgent: req.body.userAgent,
            eventType: req.body.eventType,
            user: req.body.user,
            article: req.body.article,
        }
        await axios.post('http://host.docker.internal:3002/ad/event', data);
    } catch (error) {
        console.error('Error recording ad event', error);
      }
});

module.exports = router;