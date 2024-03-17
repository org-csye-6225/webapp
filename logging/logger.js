const winston = require('winston');
const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '../../../../../var/log/webapp/');

// Create the log directory if it does not exist
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  // Define different transports for logging
  transports: [
    // Console transport for logging to the console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transport for logging to a file
    new winston.transports.File({ filename: path.join(logDirectory, 'combined.log') })
  ],
  // Handle exceptions separately if you like
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDirectory, 'exceptions.log') })
  ]
});

module.exports = logger;
