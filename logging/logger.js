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
} else {
  // Export a dummy logger for GitHub Actions
  module.exports = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {}
  };
}
