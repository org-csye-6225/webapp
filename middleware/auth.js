const basicAuth = require('basic-auth');
const bcrypt = require('bcrypt');
const logger = require('../logging/logger');
const User = require('../models/User');

const authenticateBasic = async (req, res, next) => {
  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    logger.error('Authentication failed: Missing credentials');
    return res.sendStatus(401);
  }

  try {
    const authenticatedUser = await User.findOne({ where: { email: user.name } });

    if (!authenticatedUser) {
      logger.error(`User ${user.name} not found`);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isPasswordValid = await bcrypt.compare(user.pass, authenticatedUser.password);
    if (!isPasswordValid) {
      logger.error(`Invalid password for user ${user.name}`);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!authenticatedUser.isVerified) {
      logger.error(`User ${user.name} is not verified`);
      return res.status(403).json({ error: 'User is not verified' });
    }

    req.authenticatedUser = {
      email: user.name,
    };
    logger.info(`User ${user.name} authenticated successfully`);
    next();
  } catch (error) {
    logger.error(`Error authenticating user: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = authenticateBasic;
