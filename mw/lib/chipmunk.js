// Chipmunk Library
// Provide method for write and read
// This will be part of the middleware

var debug = require('debug')('poc');

function Chipmunk(host, timeout) {
  this.redis = require('redis').createClient(6379, host);
  if (timeout) {
    this.timeout = timeout;
  } else {
    this.timeout = 0;
  }

  this.write = function (queueName, message, callback) {
    this.redis.rpush(queueName, message, function (err) {
      callback(err);
    });
  };

  this.read = function (queueName, timeout, callback) {
    this.redis.blpop(queueName, timeout, function (err, response) {
      callback(err, response);
    });
  };
}

Chipmunk.prototype.generateQueueName = function (method, resource, key) {
  var queueName = 'poc-' + key + '-' + method + '-' + resource + '-' + Date.now();

  return queueName;
};

Chipmunk.prototype.generateCommand = function (method, resource, data, queueToListen) {
  var command = JSON.stringify({
    method: method,
    resource: resource,
    data: data,
    response: queueToListen
  });

  return command;
};

Chipmunk.prototype.process = function (command, queueToSend, queueToListen, callback) {
  var self = this;

  self.write(queueToSend, command, function (err) {
    if (err) {
      console.error(err);
      callback(500);
    } else {
      debug('sent ' + command + ' to ' + queueToSend);
      self.read(queueToListen, self.timeout, function (err, message) {
        if (err) {
          console.error(err);
          callback(500);
        } else if (message === null) {
          debug('timout from ' + queueToListen);
          callback(500, 'timeout');
        } else {
          debug('receive ' + message + ' from ' + queueToListen);
          callback(null, message[1]);
        }
      });
    }
  });
};

module.exports = Chipmunk;
