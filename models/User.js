const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const db = require('../init/index');

const User = db.sequelize.define('user', {
  email: {type: Sequelize.STRING, unique: true, allowNull: false},
  password: {type: Sequelize.STRING, allowNull: false},
  firstName: {type: Sequelize.STRING, allowNull: false},
  lastName: {type: Sequelize.STRING, allowNull: false},
  account_created: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
  account_updated: {type: Sequelize.DATE, allowNull: true},
});

// encrypt the password, before user is created
User.beforeCreate(async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
});

module.exports = User;
