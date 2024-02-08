const express = require('express');
const db = require('../init/index');
// eslint-disable-next-line new-cap
const router = express.Router();

const commonHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

const rejectPayload = (req, res, next) => {
  if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) {
    res.status(400).header(commonHeaders).send();
  } else {
    next();
  }
};

const checkDatabaseConnection = async () => {
  try {
    await db.sequelize.authenticate();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const checkDBConnection = async (req, res, next) => {
  try {
    await checkDatabaseConnection();
    next();
  } catch (error) {
    res.status(503).header(commonHeaders).send();
  }
};

router.get('/', rejectPayload, checkDBConnection, (req, res) => {
  res.status(200).header(commonHeaders).send();
});

router.use('/', rejectPayload, (req, res) => {
  res.status(405).header(commonHeaders).send();
});

module.exports = router;
