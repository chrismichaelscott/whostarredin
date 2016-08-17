var express = require('express');
var config = require('./config');

var pageResource = require('./src/resources/page');

var app = express();

function handleEntityRequest(type, request, response) {
  pageResource.renderPage(type, request.params.id).then(function(responseBody) {
    response.send(responseBody);
  }).catch(function (reason) {
    response.status(reason).send();
  });
}

function handleIndexRequest(type, request, response) {
  pageResource.renderIndex(type, request.params.prefix).then(function(responseBody) {
    response.send(responseBody);
  }).catch(function (reason) {
    response.status(reason).send();
  });
}

function handleMasterIndexRequest(type, request, response) {
  pageResource.renderMasterIndex(type).then(function(responseBody) {
    response.send(responseBody);
  }).catch(function (reason) {
    response.status(reason).send();
  });
}

app.use('/media', express.static('media'));
app.use('/sitemap', express.static('sitemap'));

app.get('/', function(request, response) {
  pageResource.renderHomepage().then(function(responseBody) {
    response.send(responseBody);
  });
});

app.get('/film/index', function(request, response) {
  handleMasterIndexRequest("film", request, response);
});

app.get('/film/index/:prefix', function(request, response) {
  handleIndexRequest("film", request, response);
});

app.get('/film/:id/:vanity', function(request, response) {
  handleEntityRequest("film", request, response);
});

app.get('/film/:id', function(request, response) {
  handleEntityRequest("film", request, response);
});

app.get('/actor/index', function(request, response) {
  handleMasterIndexRequest("actor", request, response);
});

app.get('/actor/index/:prefix', function(request, response) {
  handleIndexRequest("actor", request, response);
});

app.get('/actor/:id/:vanity', function(request, response) {
  handleEntityRequest("actor", request, response);
});

app.get('/actor/:id', function(request, response) {
  handleEntityRequest("actor", request, response);
});

app.listen(config.http.port, function () {
  console.log('WhoStarredIn has started and is listening on ' + config.http.port);
});
