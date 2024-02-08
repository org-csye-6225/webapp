const User = require('../models/User');
const {commonHeaders} = require('../middleware/routes');

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
        return res.status(400)
            .header(commonHeaders)
            .send('User with this email already exists');
      }

      const newUser = await User.create({
        email,
        password,
        firstName,
        lastName,
      });

      return res.status(201)
          .header(commonHeaders)
          .json(newUser);
    } catch (error) {
      return res.status(500)
          .header(commonHeaders)
          .send(error.message);
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
        return res.status(400)
            .header(commonHeaders)
            .send('Cannot update Data');
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
      return res.status(200)
          .header(commonHeaders)
          .send('User information updated successfully');
    } catch (error) {
      return res.status(500)
          .header(commonHeaders)
          .send(error.message);
    }
  },

  getUser: async (req, res) => {
    try {
      const userEmail = req.authenticatedUser.email;
      const user = await User.findOne({where: {email: userEmail}});

      if (!user) {
        return res.status(404)
            .header(commonHeaders)
            .send('User not found');
      }

      return res.status(200)
          .header(commonHeaders)
          .json(user);
    } catch (error) {
      return res.status(500)
          .header(commonHeaders)
          .send(error.message);
    }
  },
};

module.exports = userService;
