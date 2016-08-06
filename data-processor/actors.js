var fs = require('fs');
var axios = require('axios');

var type = 'film';
var query = 'actors-query.rq';

// Usage node index.js PAGESIZE OFFSET LIMIT
// i.e.
// node index.js 5 90 100
// ... will run two requests for 90-94 and 95-99
var pageSize = parseInt(process.argv[2]);
var offset = parseInt(process.argv[3]);
var limit = parseInt(process.argv[4]);

function uriToID(uri) {
  return uri.toLowerCase().replace(/'/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/-$/, "");
}

fs.readFile(query, function(error, queryfile) {
  if (error) {
    console.error(error);
  }

  while (offset < limit) {
    var sparql = queryfile.toString() + "LIMIT " + pageSize +'\nOFFSET ' + offset;

    axios.get("https://query.wikidata.org/sparql?query=" + encodeURIComponent(sparql).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\./g, "%2E").replace(/\*/g, "%2A"), {headers: {Accept: "application/sparql-results+json"}
    }).catch(function(error) {
      console.log("ERROR from Wikidata: " + error);
    }).then(function(response) {

      var actors = {};

      response.data.results.bindings.forEach(function(binding) {
        var actor = uriToID(decodeURIComponent(binding.wikipediaUrl.value.replace(/.*\//, '')));
        var actorName = binding.label.value;

        if (! actors[actor]) actors[actor] = {};

        actors[actor].id = actor;
        actors[actor].label = actorName;
      });

      for (var actor in actors) {

        var entityUrl = "https://search-who-starred-in-xggtxxutyts6aujbbedqdvjtge.eu-west-1.es.amazonaws.com/whostarredin/actor/" + actor;

        console.log(actors[actor]);

        axios.put(entityUrl, actors[actor]).catch(function(error) {
          console.log("ERROR from ES: ", error);
        });
      }
    });
    offset += pageSize;
  }
});
