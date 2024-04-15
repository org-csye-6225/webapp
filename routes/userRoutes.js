const express = require('express');
// eslint-disable-next-line
const router = express.Router();

const {commonHeaders, rejectPayload, checkDBConnection} = require('../middleware/routes');

const userService = require('../services/userService');
const authenticateBasic = require('../middleware/auth');

router.get('/self', rejectPayload, authenticateBasic, checkDBConnection, userService.getUser);
router.put('/self', authenticateBasic, checkDBConnection, userService.updateUser);
router.post('/', checkDBConnection, userService.createUser);
//router.get('/verify/:token', userService.verifyUser);

module.exports = router;
