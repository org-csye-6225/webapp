const Sequelize = require('sequelize');
const db = require('../init/index');
const User = require('./User');

const TWO_MINUTES_IN_MS = 2 * 60 * 1000;

const Authentication = db.sequelize.define('authentication', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  token: { type: Sequelize.STRING, allowNull: false },
  createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
});

Authentication.belongsTo(User, { foreignKey: 'userId' });

module.exports = Authentication;
