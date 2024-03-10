const basicAuth = require('basic-auth');
const compare = require('tsscmp');
const auth = require('../config/AuthConfig');

const authenticateBasic = (req, res, next) => {

  const user = basicAuth(req);
  // remove below code
  if (!user) {
    console.log('No user provided');
    // ... handle authentication failure
  }

  const isUserNameValid = compare(user.name, auth.AUTH_USER);
  const isPasswordValid = compare(user.pass, auth.AUTH_PSWD);
 
  console.log("User", user);

  console.log('Username valid:', isUserNameValid);
  console.log('Password valid:', isPasswordValid);
  console.log("user.name", auth.AUTH_USER);
  console.log('user.pass:', user.pass);
  console.log('auth.AUTH_PSWD:', auth.AUTH_PSWD);
  console.log('sqlUSER:', process.env.SQL_USER);
  console.log('sqlPSWD:', process.env.SQL_PSWD);

 


  //remove above code


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
