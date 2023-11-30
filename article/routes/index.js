// article/routes/articles.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Article } = require('../models/article.js');
const authenticateToken = require('../middleware/authenticate');

// Render the home page
// router.get('/', authenticateToken, async (req, res) => {
router.get('/', async (req, res) => {
  try {
    const token = req.session.token || 'default-token-value';
    // const token = req.session.token;
    response = await axios.post('http://host.docker.internal:3001/users/authenticateToken', {token: token});
    if (response.data.success) {
      res.redirect('/reader');
    } else {
      // Redirect or handle unauthenticated users
      // Retrieve the last 10 articles
      const articles = await Article.find().sort({ dateCreated: -1 }).limit(10);

      // Separate the first article from the rest
      const [firstArticle, ...remainingArticles] = articles;

      // Retrieve ad from ad microservice
      // const response = await axios.post('http://host.docker.internal:3002/ad/image');
      // console.log(response.data);
      // res.render('index', { firstArticle, remainingArticles, imageData: response.data });
      const response = await axios.post('http://host.docker.internal:3002/ad');
      // Render the home page with the article data
      res.render('index', { firstArticle, remainingArticles, ad: response.data.ad});
    }
  } catch (error) {
    console.error('Error accessing home page:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/reader', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const currentArticle = await Article.findOne().sort({ dateCreated: -1 });

    let previousArticle = '', nextArticle = '';
    if (currentArticle) {
      previousArticle = await Article.findOne({
        dateCreated: { $lt: currentArticle.dateCreated }
      }).sort({ dateCreated: -1 });
      nextArticle = await Article.findOne({
        dateCreated: { $gt: currentArticle.dateCreated }
      }).sort({ dateCreated: 1 });
    }

    const response = await axios.post('http://host.docker.internal:3002/ad');
    res.render('reader', {user, currentArticle, previousArticle, nextArticle, ad: response.data.ad});
  } catch (error) {
    console.error('Error accessing reader:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/author', authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const currentArticle = await Article.findOne({ 'user': req.user.id })
      .sort({ dateCreated: -1 });
    
    let previousArticle = '', nextArticle = '';
    if (currentArticle) {
      previousArticle = await Article.findOne({
        'user': req.user.id,
        dateCreated: { $lt: currentArticle.dateCreated }
      }).sort({ dateCreated: -1 });
      nextArticle = await Article.findOne({
        'user': req.user.id,
        dateCreated: { $gt: currentArticle.dateCreated }
      }).sort({ dateCreated: 1 });
    }

    res.render('author', {username, currentArticle, previousArticle, nextArticle});
  } catch (error) {
    console.error('Error accessing author:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;