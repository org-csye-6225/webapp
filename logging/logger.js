const jsonLogger = require('node-json-logger');
const fs = require('fs');

const logDirectory = './logs';

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logger = jsonLogger({
  name: 'webapp',
  streams: [
    { stream: fs.createWriteStream(`${logDirectory}/combined.log`) }, 
  ],
});

module.exports = logger;