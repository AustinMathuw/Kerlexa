/*
 * File: logger.js
 * Description: Helper file for logging info to CloudWatch
 */

'use strict';

function getLevelValue(level) {
  switch (level) {
    case 'DEBUG':
      return 3;
    case 'WARN':
      return 1;
    case 'ERROR':
      return 0;
    default:
      return 2;
  }
}

const LOG_VALUE = getLevelValue(require('../config/settings.js').LOG_LEVEL);

function log(level, entry) {
  if (getLevelValue(level) <= LOG_VALUE) {
    console.log('# ' + level + ' # ' + entry);
  }
}

function info(entry){
  log('INFO', entry);
}

function debug(entry){
  log('DEBUG', entry);
}

function warn(entry){
  log('WARN', entry);
}

function error(entry){
  log('ERROR', entry);
}

module.exports.log = log;
module.exports.info = info;
module.exports.debug = debug;
module.exports.warn = warn;
module.exports.error = error;