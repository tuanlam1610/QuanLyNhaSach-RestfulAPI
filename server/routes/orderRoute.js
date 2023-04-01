const orderController = require('../controllers/orderController');

const router = require('express').Router();

router.post('/add', orderController.addOrder);

router.get('/search', orderController.searchOrder)

// router.delete('/delete/:id', orderController);

// router.put('update/:id', orderController);

module.exports = router;