var express = require('express');
var config = require('./config');

var filmResource = require('./src/resources/film');

var app = express();

app.get('/', function (request, response) {
  response.send(filmResource.renderFilmPage(2));
});

app.listen(config.http.port, function () {
  console.log('WhoStarredIn has started and is listening on ' + config.http.port);
});
