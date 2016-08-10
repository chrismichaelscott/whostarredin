var config = require('./config');
var wikidata = require('./src/sparql')(config.sparqlEndpoints.wikidata);
var utils = require('./src/utils');
var elasticsearch = require('./src/elasticsearch');
var fs = require('fs');

var catalogueQuery = fs.readFileSync(config.queries.catalogueQueryFile).toString();
var dataProcessors = require('./src/data-processors');

function processBinding(binding) {

  var wikidataUri = binding.film.value;
  var id = utils.urlToId(binding.film.value);
  var film = {
    model: {
      id: id,
      url: "/film/" + id + "/" + utils.labelToId(binding.label.value),
      label: binding.label.value
    },
    wikidataUri: wikidataUri
  };

  // This should be added to the Promises.all but I can't get the dual catch to work as this is a warn. not fail, error
  dataProcessors.getWikipediaUrl(film).then(dataProcessors.getDescription);
  return new Promise(function(resolve, reject) {
    Promise.all([
      dataProcessors.getCast(film),
      dataProcessors.getMetadata(film)
    ]).then(function() {
      dataProcessors.postProcess(film).then(elasticsearch.storeFilm).then(resolve);
    });
  });
}

elasticsearch.disableIndexing();

console.log("Retrieving all film URIs... this may take a minute");
wikidata.query(catalogueQuery).then(function(results) {
  console.log("Processing " + results.results.bindings.length + " films");

  var index = 0;
  function nextBinding() {
    var binding = results.results.bindings[index];
    console.log("Processing " + binding.label.value + ", " + (index + 1) + " of " + results.results.bindings.length);

    processBinding(binding).then(function(storePromise) {
      index++;
      if (results.results.bindings.length > index) {
        nextBinding();
      } else {
        console.log("Completed processing");
        elasticsearch.enableIndexing();
        setTimeout(function() { // ES puts are ran async to allow sparql to continue... wait for the last one to complete
          console.log(elasticsearch.report() + " of " + results.results.bindings.length + " stored successfully");
        }, 300);
      }
    });
  }

  if (results.results.bindings.length > 0) {
    nextBinding();
  }
});
