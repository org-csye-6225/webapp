const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

router.get('/verify/:token', userService.verifyUser);

module.exports = router;