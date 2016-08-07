var fs = require('fs');
var axios = require('axios');

var type = 'film';
var query = 'film-base-query.rq';

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

      var films = {};
      var roles = {};

      response.data.results.bindings.forEach(function(binding) {
        var film = uriToID(decodeURIComponent(binding.wikipediaFilmUrl.value.replace(/.*\//, '')));
        var actor = uriToID(decodeURIComponent(binding.wikipediaActorUrl.value.replace(/.*\//, '')));
        var character = binding.character.value;
        var actorName = binding.actorName.value;
        var filmName = binding.filmName.value;

        if (! roles[film]) roles[film] = [];
        if (! films[film]) films[film] = {};

        roles[film].push({
          id: actor,
          url: "/actor/" + actor,
          character: character,
          label: actorName
        })
        films[film].id = film;
        films[film].label = filmName;
      });

      for (var film in films) {

        var entityUrl = "https://search-who-starred-in-xggtxxutyts6aujbbedqdvjtge.eu-west-1.es.amazonaws.com/whostarredin/film/" + film;

        var duplicateUrls = [];
        films[film].cast = roles[film].filter(function(role) {
          if (duplicateUrls.indexOf(role.url) == -1) {
            duplicateUrls.push(role.url);
            return true;
          } else {
            return false;
          }
        });

        console.log(films[film]);

        axios.put(entityUrl, films[film]).catch(function(error) {
          console.log("ERROR from ES: ", error);
        });
      }
    });
    offset += pageSize;
  }
});
