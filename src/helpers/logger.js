const ConciseLogger = require('concise-logging');
const logger = new ConciseLogger({ time_format: 24, unix: true });

module.exports = { logger }