var config = require('./config');
var wikidata = require('./src/sparql')(config.sparqlEndpoints.wikidata);
var utils = require('./src/utils');
var elasticsearch = require('./src/elasticsearch');
var fs = require('fs');

var catalogueQuery = fs.readFileSync(config.queries.catalogueQueryFile).toString();
var dataProcessors = require('./src/data-processors');

function processBinding(binding) {
  var wikidataUri = binding.actor.value;
  var id = utils.urlToId(binding.actor.value);
  var actor = {
    model: {
      id: id,
      url: "/actor/" + id + "/" + utils.labelToId(binding.label.value),
      label: binding.label.value
    },
    wikidataUri: wikidataUri
  };

  return new Promise(function(resolve, reject) {
    elasticsearch.storeActor(actor).then(resolve);
  });
}

console.log("Retrieving all actor URIs... this may take a minute");
wikidata.query(catalogueQuery).then(function(results) {
  console.log("Processing " + results.results.bindings.length + " actors");

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
