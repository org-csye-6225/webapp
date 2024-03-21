if (!process.env.GITHUB_ACTIONS) {
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
      level,
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

  function formatTimestampAsRFC3339(dateString) {
    const parts = dateString.split(' ');
    const dateParts = parts[0].split('-');
    const timeParts = parts[1].split(':');
  
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    const second = parseInt(timeParts[2], 10);
  
    const date = new Date(year, month, day, hour, minute, second, 0);
    const timestamp = date.getTime() * 1000000; 
  
    const formattedTimestamp = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}T${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')}.${String(timestamp % 1000000000).padStart(9, '0')}Z`;
  
    return formattedTimestamp;
  }

  const logger = createLogger({
    level: 'debug',
    format: format.combine(
      format.timestamp({
        format: () => formatTimestampAsRFC3339('YYYY-MM-DD HH:mm:ss'),
      }),
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
} else {
  // Export a dummy logger for GitHub Actions
  module.exports = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {}
  };
}
