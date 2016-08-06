var express = require('express');
var config = require('./config');

var pageResource = require('./src/resources/page');

var app = express();

app.get('/:type/:id', function (request, response) {
  pageResource.renderPage(request.params.type, request.params.id).then(function(responseBody) {
    response.send(responseBody);
  });
});

app.listen(config.http.port, function () {
  console.log('WhoStarredIn has started and is listening on ' + config.http.port);
});
