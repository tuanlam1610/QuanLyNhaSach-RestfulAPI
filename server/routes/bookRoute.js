const bookController = require('../controllers/bookController');

const router = require('express').Router();

router.post('/add', bookController.addBook);

router.get('/search', bookController.searchBook)

// router.delete('/delete/:id', bookController);

// router.put('update/:id', bookController);

module.exports = router;