const categoryController = require('../controllers/categoryController');

const router = require('express').Router();

router.post('/add', categoryController.addCategory);

router.get('/showBook/:id', categoryController.showBookByCategory)

// router.delete('/delete/:id', categoryController);

// router.put('update/:id', categoryController);

module.exports = router;