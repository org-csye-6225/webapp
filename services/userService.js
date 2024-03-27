const User = require('../models/User');
const {commonHeaders} = require('../middleware/routes');
const logger = require('../logging/logger');  
const Authentication = require('../models/Authentication');
const crypto = require('crypto');
const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub({
  projectId: 'tf-csye-6225-project'
});

User.prototype.toJSON = function() {
  const user = {...this.get()};
  delete user.password;
  return user;
};

const generateToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

const publishUserCreatedEvent = async (email, token) => {
  const topicName = 'sendEmail';
  const data = Buffer.from(JSON.stringify({ email, token }));
  const databuffer = Buffer.from(data);
  try{
  const messageId = await pubsub.topic(topicName).publish(databuffer);
  logger.info(`Published ${topicName} event to Pub/Sub with ID: ${messageId}`);
  }catch(error){
    logger.error(`error pubsub`, error);
  }
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
        lastName
      });

      const token = generateToken();

      await Authentication.create({
        token,
        TTL: new Date(Date.now() + 2 * 60 * 1000),
        userId: newUser.id,
      });

      await publishUserCreatedEvent(newUser.email, token);

      return res.status(201)
          .header(commonHeaders)
          .json({ user: newUser});
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
  verifyUser: async (req, res) => {
    try {
      const { token } = req.params;
      const authenticationRecord = await Authentication.findOne({ where: { token } });

      if (!authenticationRecord) {
        logger.warn(`Invalid token: ${token}`);
        return res.status(404).json({ error: 'Invalid token' });
      }
      const currentTime = new Date();
      if (currentTime > authenticationRecord.TTL) {
        logger.warn(`Token expired: ${token}`);
        return res.status(400).json({ error: 'Token has expired' });
      }
      await User.update({ isVerified: true }, { where: { id: authenticationRecord.userId } });

      logger.info(`User verified successfully: ${authenticationRecord.userId}`);
      return res.status(200).json({ message: 'User verified successfully' });
    } catch (error) {
      logger.error(`Error verifying user: ${error.message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = userService;
