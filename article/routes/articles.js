// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const { Article } = require('./models'); // Assuming your models are in the 'models' folder

// const app = express();
// const PORT = 3000; // Choose the port you want to use

// app.use(bodyParser.json());

// // Connect to MongoDB (replace 'your_database_url' with your actual MongoDB connection string)
// mongoose.connect('your_database_url', { useNewUrlParser: true, useUnifiedTopology: true });

// // Middleware to handle user authentication (replace with your actual authentication logic)
// app.use((req, res, next) => {
//   // Check user authentication, set req.user if authenticated
//   // ...

//   next();
// });

// article/routes/articles.js
const express = require('express');
const router = express.Router();
const { Article, Comment } = require('../models/article');

// Render create page
router.get('/articles/create', async (req, res) => {
  try {
    const username = req.user.username;
    res.render('create', {username});
} catch (error) {
    console.error('Error accessing reader:\n', error);
    res.status(500).send('Internal Server Error');
}
});

// Create an article
router.post('/articles/create', async (req, res) => {
  try {
    const { title, teaser, body, categories } = req.body;
    // console.log(req.user);
    // console.log(req.user_id);
    const newArticle = new Article({
      title,
      teaser,
      body,
      categories,
      user: req.user.id
    });

    const savedArticle = await newArticle.save();
    // res.json(savedArticle);
    res.redirect('/author');
  } catch (error) {
    console.error('Error creating article:\n', error);
    res.status(500).send('Internal Server Error');
    // res.status(500).json({ error: error.message });
  }
});

// Update an article
router.post('/articles/author/:id', async (req, res) => {
  try {
    // Check if the user making the request is the author of the article
    const articleToUpdate = await Article.findById(req.params.id);
    if (req.user.id !== articleToUpdate.user.toString()) {
      return res.status(403).send('Unauthorized: You are not the author of this article');
    }

    const { title, teaser, body, categories } = req.body;
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      { title, teaser, body, categories },
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).send('Article not found');
    }

    res.redirect(`/articles/author/${req.params.id}`);
  } catch (error) {
    console.error('Error updating article:\n', error);
    res.status(500).send('Internal Server Error');
  }
});

// Retrieve an author article
router.get('/articles/author/:id', async (req, res) => {
  try {
    const currentArticle = await Article.findById(req.params.id);

    if (!currentArticle) {
      return res.status(404).send('Article not found');
    }

    const previousArticle = await Article.findOne({
      'user': req.user.id,
      dateCreated: { $lt: currentArticle.dateCreated }
    }).sort({ dateCreated: -1 });

    const nextArticle = await Article.findOne({
      'user': req.user.id,
      dateCreated: { $gt: currentArticle.dateCreated }
    }).sort({ dateCreated: 1 });

    const username = req.user.username;
    res.render('author', {username, currentArticle, previousArticle, nextArticle});
  } catch (error) {
    console.error('Error retrieving article:\n', error);
    res.status(500).send('Internal Server Error');
  }
});

// Retrieve an article
router.get('/articles/:id', async (req, res) => {
  try {
    // // Use $lookup to fetch user information for each comment
    // const article = await Article.aggregate([
    //   { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
    //   {
    //       $lookup: {
    //           from: 'users', // The name of the User collection
    //           localField: 'comments.user',
    //           foreignField: '_id',
    //           as: 'commentsWithUsers'
    //       }
    //   }
    // ]);
    // const currentArticle = article[0];
    const currentArticle = await Article.findById(req.params.id);

    if (!currentArticle) {
      return res.status(404).send('Article not found');
    }

    const previousArticle = await Article.findOne({
      dateCreated: { $lt: currentArticle.dateCreated }
    }).sort({ dateCreated: -1 });

    const nextArticle = await Article.findOne({
      dateCreated: { $gt: currentArticle.dateCreated }
    }).sort({ dateCreated: 1 });

    const username = req.user.username;
    res.render('reader', {username, currentArticle, previousArticle, nextArticle});
  } catch (error) {
    console.error('Error retrieving article:\n', error);
    res.status(500).send('Internal Server Error');
  }
});

// Delete an article
router.post('/articles/author/delete/:id', async (req, res) => {
  try {
    const articleToDelete = await Article.findById(req.params.id);

    if (!articleToDelete) {
      return res.status(404).send('Article not found');
    }

    // Check if the user making the request is the author of the article
    if (req.user.id !== articleToDelete.user.toString()) {
      return res.status(403).send('Unauthorized: You are not the author of this article');
    }

    // Perform the deletion
    await Article.findByIdAndDelete(req.params.id);

    res.redirect('/author');
  } catch (error) {
    console.error('Error deleting article:\n', error);
    res.status(500).send('Internal Server Error');
  }
});

// Create comment
router.post('/articles/:id/comments/create', async (req, res) => {
  try {
      const { id } = req.params;
      const { comment } = req.body;

      // Find the article to add the comment to
      const article = await Article.findById(id);

      if (!article) {
          return res.status(404).send('Article not found');
      }

      // Create a new comment
      const newComment = new Comment({
          comment,
          username: req.user.username
      });

      // // Save the new comment
      // await newComment.save();

      // Add the comment to the article's comments array
      article.comments.push(newComment);

      // Save the changes to the article
      await article.save();

      // await Article.findByIdAndUpdate(
      //   id,
      //   { $push: { comments: newComment._id } },
      //   { new: true }
      // );

      // Redirect back to the article page
      res.redirect(`/articles/${id}`);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

// Delete Comment
router.post('/articles/:articleId/comments/:commentId/delete', async (req, res) => {
  try {
      const { articleId, commentId } = req.params;

      // Find the article to remove the comment from
      const article = await Article.findById(articleId);

      if (!article) {
          return res.status(404).send('Article not found');
      }

      // Find the index of the comment in the article's comments array
      const commentIndex = article.comments.findIndex(comment => comment._id.equals(commentId));

      if (commentIndex === -1) {
          // return res.status(404).send('Comment not found');
          res.redirect(`/articles/${articleId}`);
      }

      // Check if the current user is the author of the comment
      if (article.comments[commentIndex].username === req.user.username) {
          // Remove the comment from the array
          article.comments.splice(commentIndex, 1);

          await article.save();
      } else {
          return res.status(403).send('Permission denied');
      }

      res.redirect(`/articles/${articleId}`);
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

// Handle GET requests to /search
router.get('/search', async (req, res) => {
  try {
      const searchTerm = req.query.q;

      // Use a regex to perform a case-insensitive search on any attribute
      const articles = await Article.find({
          $or: [
              { title: { $regex: searchTerm, $options: 'i' } },
              { teaser: { $regex: searchTerm, $options: 'i' } },
              { body: { $regex: searchTerm, $options: 'i' } },
              { categories: { $regex: searchTerm, $options: 'i' } },
          ],
      }).sort({ dateCreated: -1 });

      res.render('searchResults', { articles });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

// Handle GET requests to /author/search
router.get('/author/search', async (req, res) => {
  try {
      const searchTerm = req.query.q;

      // Use a regex to perform a case-insensitive search on any attribute
      const articles = await Article.find({
        user: req.user.id,
        $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { teaser: { $regex: searchTerm, $options: 'i' } },
            { body: { $regex: searchTerm, $options: 'i' } },
            { categories: { $regex: searchTerm, $options: 'i' } },
        ],
      }).sort({ dateCreated: -1 });

      res.render('authorSearchResults', { articles });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

/*

// Retrieve the latest 10 articles
app.get('/articles/latest', async (req, res) => {
  try {
    const latestArticles = await Article.find()
      .sort({ dateCreated: -1 })
      .limit(10);

    res.json(latestArticles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve the article with the latest creation date
app.get('/articles/latestCreationDate', async (req, res) => {
  try {
    const latestArticle = await Article.findOne().sort({ dateCreated: -1 });

    res.json(latestArticle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve the last article written by req.user.username
app.get('/articles/lastByUser', async (req, res) => {
  try {
    const lastArticleByUser = await Article.findOne({ 'user.username': req.user.username })
      .sort({ dateCreated: -1 });

    res.json(lastArticleByUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search articles by whether they contain a string in any attribute
app.get('/articles/search/:query', async (req, res) => {
  try {
    const query = new RegExp(req.params.query, 'i'); // Case-insensitive search
    const searchResults = await Article.find({
      $or: [
        { title: query },
        { teaser: query },
        { body: query },
        { categories: { $in: [query] } }
      ]
    });

    res.json(searchResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

module.exports = router;

// Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });