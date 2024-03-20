const db = require('../init/index');
const logger = require('../logging/logger');
const commonHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

const rejectPayload = (req, res, next) => {
  if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) {
    logger.warn('Rejecting payload due to non-empty request body or query params');
    res.status(400).header(commonHeaders).send();
  } else {
    next();
  }
};

const checkDatabaseConnection = async () => {
  try {
    await db.sequelize.authenticate();
  } catch (error) {
    logger.error('Database connection check failed:', error); 
    throw error;
  }
};

const checkDBConnection = async (req, res, next) => {
  try {
    await checkDatabaseConnection();
    next();
  } catch (error) {
    logger.error('Database connection is unavailable', error);
    res.status(503).header(commonHeaders).send();
  }
};

module.exports = {commonHeaders, rejectPayload, checkDBConnection};
