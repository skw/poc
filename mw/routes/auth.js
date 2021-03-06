var express        = require('express');
var debug          = require('debug')('poc');
var config         = require('../config.json');
var Authentication = require('../lib/authentication');

var AUTH_OPTION = {
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/userinfo.email']
};

var app = express();

app.post('/', function(req, res) {
  var action = req.body.action;
  debug(req.body);

  if (action === 'login') {
    auth = new Authentication(config.clientId, config.clientSecret, config.redirectUrl);
    var redirectUrl = auth.getRedirectUrl(AUTH_OPTION);

    res.redirect(redirectUrl);
  } else if (action === 'logout') {
    req.session.user = undefined;

    res.redirect('/');
  } else {
    res.status(400).end();
  }
});

module.exports = app;
