const express = require('express');
const db = require('../init/index');
// eslint-disable-next-line new-cap
const router = express.Router();

const { commonHeaders, rejectPayload, checkDBConnection } = require('../middleware/routes');

router.get('/', rejectPayload, checkDBConnection, (req, res) => {
  res.status(200).header(commonHeaders).send();
});

router.use('/', rejectPayload, (req, res) => {
  res.status(405).header(commonHeaders).send();
});

module.exports = router;
