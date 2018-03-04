const express = require('express');
const router = express.Router();

//Entry point for all site routes
router.use('/', require('./chat'));

module.exports = router;
