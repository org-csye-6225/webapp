const express = require('express');
// eslint-disable-next-line
const router = express.Router();
const userService = require('../services/userService');
const authenticateBasic = require('../middleware/auth');

router.get('/self', authenticateBasic, userService.getUser);
router.put('/self', authenticateBasic, userService.updateUser);
router.post('/', userService.createUser);

module.exports = router;
