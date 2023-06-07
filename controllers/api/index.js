const express = require('express');
const path = require('path');
const router = express.Router();
const userRoutes = require('./userRoutes');

router.use('/users', userRoutes);


module.exports = router