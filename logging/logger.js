const { createLogger, transports, format } = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');

const loggingWinston = new LoggingWinston();

const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '../../../../../var/log/webapp/');

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const customFormat = format.printf(({ level, message, timestamp, stack }) => {
  const logObject = {
    timestamp,
    severity: level,
    message,
    ...(stack ? { stack } : {})
  };
  return JSON.stringify(logObject);
});

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    customFormat
  ),

  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logDirectory, 'combined.log') }),
    loggingWinston
  ]
});

module.exports = logger;