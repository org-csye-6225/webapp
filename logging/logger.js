const { createLogger, transports, format } = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');

const loggingWinston = new LoggingWinston();
const path = require('path');

const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

let logDirectory;
const pathVal = '../../../../../var/log/webapp/'
if (isGitHubActions) {
  logDirectory = '/logs';
} else {
  logDirectory = path.join(__dirname, pathVal);
}

const customFormat = format.printf(({ level, message, timestamp, stack }) => {
  let severityLevel;
  switch (level) {
    case 'debug':
      severityLevel = 'DEBUG';
      break;
    case 'info':
      severityLevel = 'INFO';
      break;
    case 'warn':
      severityLevel = 'WARNING';
      break;
    case 'error':
      severityLevel = 'ERROR';
      break;
    default:
      severityLevel = level.toUpperCase();
  }
  const logObject = {
    timestamp,
    severity: severityLevel,
    message,
    ...(stack ? { stack } : {})
  };
  if (level === 'error' && stack) {
    const errorObject = stack.split('\n')[0];
    const fileLineRegex = /\((.+?):(\d+):(\d+)\)/;
    const match = errorObject.match(fileLineRegex);

    if (match) {
      logObject.file = match[1];
      logObject.line = match[2];
      logObject.col = match[3];
    }
  }
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