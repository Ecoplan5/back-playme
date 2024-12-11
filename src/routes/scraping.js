const express = require('express');
const router = express.Router();
const { saveProducts } = require('../controllers/scraping');

// Ruta para realizar scraping y guardar productos
router.get('/products', saveProducts);

module.exports = router;
