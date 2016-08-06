var fs = require('fs');
var axios = require('axios');

var type = 'film';
var query = 'film-descriptions-query.rq';

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

    axios.get("http://dbpedia.org/sparql/?query=" + encodeURIComponent(sparql).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\./g, "%2E").replace(/\*/g, "%2A"), {headers: {Accept: "application/sparql-results+json"}
    }).catch(function(error) {
      console.log("ERROR from DBPedia: " + error);
    }).then(function(response) {

      var films = {};

      response.data.results.bindings.forEach(function(binding) {
        var film = uriToID(binding.uri.value.replace(/.*\//, ''));
        var blurb = binding.abstract.value;

        if (! films[film]) films[film] = {};

        films[film].blurb = blurb;
      });

      for (var film in films) {

        var entityUrl = "https://search-who-starred-in-xggtxxutyts6aujbbedqdvjtge.eu-west-1.es.amazonaws.com/whostarredin/film/" + film + "_update";

        console.log(film);

        axios.post(entityUrl, {
          doc: films[film]
        }).catch(function(error) {
          console.log("ERROR from ES: ", error);
        });
      }
    });
    offset += pageSize;
  }
});
