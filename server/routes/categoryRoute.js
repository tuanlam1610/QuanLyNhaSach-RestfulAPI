const categoryController = require('../controllers/categoryController');

const router = require('express').Router();

router.post('/add', categoryController.addCategory);

router.get('/showProduct/:id', categoryController.showProductByCategory)

router.delete('/delete/:id', categoryController.deleteCategory);

router.put('/update/:id', categoryController.updateCategory);

module.exports = router;