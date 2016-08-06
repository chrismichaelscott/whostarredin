var express = require('express');
var config = require('./config');

var pageResource = require('./src/resources/page');

var app = express();

function handleEntityRequest(request, response) {
  pageResource.renderPage(request.params.type, request.params.id).then(function(responseBody) {
    response.send(responseBody);
  });
}

app.use('/media', express.static('media'));

app.get('/', function(request, response) {
  pageResource.renderHomepage().then(function(responseBody) {
    response.send(responseBody);
  });
});

app.get('/:type/:id/:vanity', function(request, response) {
  handleEntityRequest(request, response);
});

app.get('/:type/:id', function(request, response) {
  handleEntityRequest(request, response);
});

app.listen(config.http.port, function () {
  console.log('WhoStarredIn has started and is listening on ' + config.http.port);
});
