const basicAuth = require('basic-auth');
const compare = require('tsscmp');
const auth = require('../config/AuthConfig');

const authenticateBasic = (req, res, next) => {
  const user = basicAuth(req);

  if (!user ||
    !compare(user.name, auth.AUTH_USER) ||
    !compare(user.pass, auth.AUTH_PSWD)) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  }

  req.authenticatedUser = {
    email: user.name,
  };

  next();
};

module.exports = authenticateBasic;
