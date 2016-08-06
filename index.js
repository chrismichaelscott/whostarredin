var express = require('express');
var config = require('./config');

var filmResource = require('./src/resources/film');

var app = express();

app.get('/film/:id', function (request, response) {
  filmResource.renderFilmPage(request.params.id).then(function(responseBody) {
    response.send(responseBody);
  });
});

app.listen(config.http.port, function () {
  console.log('WhoStarredIn has started and is listening on ' + config.http.port);
});
