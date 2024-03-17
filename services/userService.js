const User = require('../models/User');
const {commonHeaders} = require('../middleware/routes');
const logger = require('./logging/logger');
User.prototype.toJSON = function() {
  const user = {...this.get()};
  delete user.password;
  return user;
};

const userService = {
  createUser: async (req, res) => {
    try {
      const {email, password, firstName, lastName} = req.body;

      if (!email || !password || !firstName || !lastName) {
        logger.warn('Missing required fields for user creation');
        return res.status(400)
            .header(commonHeaders)
            .json({ error: 'All fields are required' });
      }

      const existingUser = await User.findOne({where: {email}});
      if (existingUser) {
        logger.warn(`Attempt to create user with existing email: ${email}`);
        return res.status(409)
            .header(commonHeaders)
            .json({ error: 'User with this email already exists' });
      }

      const newUser = await User.create({
        email,
        password,
        firstName,
        lastName,
      });
      logger.info(`Created new user: ${newUser.email}`);
      return res.status(201)
          .header(commonHeaders)
          .json(newUser);
    } catch (error) {
      logger.error(`Error creating user: ${error.message}`);
      return res.status(500)
          .header(commonHeaders)
          .json({ error: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const userEmail = req.authenticatedUser.email;
      const updatedUserData = req.body;

      if (Object.keys(updatedUserData).length === 0) {
        logger.warn('Empty request body for user update');
        return res.status(400)
          .header(commonHeaders)
          .json({ error: 'Bad Request' });
      }

      const disallowedFields = Object.keys(updatedUserData)
          .filter((field) => !['firstName', 'lastName', 'password']
              .includes(field));

      if (disallowedFields.length > 0) {
        logger.warn(`Attempt to update disallowed fields: ${disallowedFields.join(', ')}`);
        return res.status(400)
            .header(commonHeaders)
            .json({ error: 'Cannot update Data' });
      }

      if (
        ('firstName' in updatedUserData && updatedUserData.firstName.trim() === '') ||
        ('lastName' in updatedUserData && updatedUserData.lastName.trim() === '') ||
        ('password' in updatedUserData && updatedUserData.password.trim() === '')
      ) {
        logger.warn('Attempt to update user with empty fields'); 
          return res.status(400)
              .header(commonHeaders)
              .json({ error: 'firstName, lastName, or password cannot be empty' });
      }


      const allowedUserData = {};
      if (updatedUserData.firstName) {
        allowedUserData.firstName = updatedUserData.firstName;
      }
      if (updatedUserData.lastName) {
        allowedUserData.lastName = updatedUserData.lastName;
      }
      if (updatedUserData.password) {
        allowedUserData.password = updatedUserData.password;
      }

      allowedUserData.account_updated = new Date();

      await User.update(allowedUserData, {where: {email: userEmail}});
      logger.info(`Updated user: ${userEmail}`);
      return res.status(204)
          .header(commonHeaders)
          .json({ message: 'User information updated successfully' });
    } catch (error) {
      logger.error(`Error updating user: ${error.message}`)
      return res.status(500)
          .header(commonHeaders)
          .json({ error: error.message });
    }
  },

  getUser: async (req, res) => {
    try {
      const userEmail = req.authenticatedUser.email;
      const user = await User.findOne({where: {email: userEmail}});

      if (!user) {
        logger.warn(`User not found: ${userEmail}`); 
        return res.status(404)
            .header(commonHeaders)
            .json({ error: 'User not found' });
      }
      logger.info(`Retrieved user: ${userEmail}`);
      return res.status(200)
          .header(commonHeaders)
          .json(user);
    } catch (error) {
      logger.error(`Error retrieving user: ${error.message}`);
      return res.status(500)
          .header(commonHeaders)
          .json({ error: error.message });
    }
  },
};

module.exports = userService;
