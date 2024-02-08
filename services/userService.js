const User = require('../models/User');


User.prototype.toJSON = function() {
  const user = {...this.get()};
  delete user.password;
  return user;
};

const userService = {
  createUser: async (req, res) => {
    try {
      const {email, password, firstName, lastName} = req.body;

      const existingUser = await User.findOne({where: {email}});
      if (existingUser) {
        return res.status(400).send('User with this email already exists');
      }

      const newUser = await User.create({
        email,
        password,
        firstName,
        lastName,
      });

      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },

  updateUser: async (req, res) => {
    try {
      const userEmail = req.authenticatedUser.email;
      const updatedUserData = req.body;

      const disallowedFields = Object.keys(updatedUserData)
          .filter((field) => !['firstName', 'lastName', 'password']
              .includes(field));

      if (disallowedFields.length > 0) {
        return res.status(400).send('Cannot update Data');
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
      return res.status(200).send('User information updated successfully');
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },

  getUser: async (req, res) => {
    try {
      const userEmail = req.authenticatedUser.email;
      const user = await User.findOne({where: {email: userEmail}});

      if (!user) {
        return res.status(404).send('User not found');
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },
};

module.exports = userService;
