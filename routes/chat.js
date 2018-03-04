const express = require('express');
const router = express.Router();

/*Place Required controller modules here*/
var chatController = require('../controllers/chat');

/*Home page routes*/
router.get('/', chatController.index_get);

module.exports = router;
