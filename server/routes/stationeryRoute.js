const stationeryController = require('../controllers/stationeryController');

const router = require('express').Router();

router.post('/add', stationeryController.addStationery);

router.get('/search', stationeryController.searchStationery);

router.get('/detail/:id', stationeryController.getAStationery)

router.delete('/delete/:id', stationeryController.deleteStationery);

router.put('/update/:id', stationeryController.updateStationery);

module.exports = router;