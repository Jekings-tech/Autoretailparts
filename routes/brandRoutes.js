const express = require('express');
const router = express.Router();
const {
    getAllBrands,
    createBrand,
    updateBrand,
    deleteBrand
} = require('../controllers/brandController');

router.route('/')
    .get(getAllBrands)
    .post(createBrand);

router.route('/:id')
    .put(updateBrand)
    .delete(deleteBrand);

module.exports = router;