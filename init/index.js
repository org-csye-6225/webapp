require('dotenv').config();

const {Sequelize} = require('sequelize');
const dbConfig = require('../config/dbConfig');

const sequelize = new Sequelize(
    dbConfig.DATABASE,
    dbConfig.SQL_USER,
    dbConfig.SQL_PSWD,
    {
      host: dbConfig.HOST,
      dialect: dbConfig.DIALECT,
    },
);

const createDatabaseIfNotExist = async () => {
  try {
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.DATABASE}`);
    console.log('Database created or already exists');
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
};

const bootstrapDatabase = async () => {
  try {
    await sequelize.sync({alter:true});
    console.log('Database bootstrapped successfully');
  } catch (error) {
    console.error('Error bootstrapping database:', error);
    process.exit(1);
  }
};

const initDatabase = async () => {
  try {
    await createDatabaseIfNotExist();
    await bootstrapDatabase();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

const db = {};
db.initDatabase = initDatabase;
db.sequelize = sequelize;

module.exports = db;
