const express = require('express');;
// eslint-disable-next-line new-cap
const router = express.Router();
const logger = require('./logging/logger');
const {commonHeaders, rejectPayload, checkDBConnection} = require('../middleware/routes');

router.get('/', rejectPayload, checkDBConnection, (req, res) => {
  res.status(200).header(commonHeaders).send();
  logger.info('get request healthz');
});

router.use('/', rejectPayload, (req, res) => {
  res.status(405).header(commonHeaders).send();
  logger.info('other requests healthz');
});

module.exports = router;
