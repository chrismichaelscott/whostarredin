var fs = require('fs');
var axios = require('axios');

var type = 'film';
var query = 'film-base-query.rq';
var castQuery = 'film-cast-query.rq';

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

function processFilm(wikidataUri, film) {
  fs.readFile(castQuery, function(error, castQueryfile) {
    if (error) {
      console.error(error);
    }

    var castSparql = castQueryfile.toString().replace(/__URI__/, wikidataUri);
    var castQueryUrl = "https://query.wikidata.org/sparql?query=" + encodeURIComponent(castSparql).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\./g, "%2E").replace(/\*/g, "%2A");

    axios.get(castQueryUrl, {headers: {Accept: "application/sparql-results+json"}
    }).catch(function(error) {
      console.log("ERROR from Wikidata: " + error);
    }).then(function(response) {
      var duplicateUrls = [];
      response.data.results.bindings.forEach(function(binding) {
        var actor = uriToID(decodeURIComponent(binding.wikipediaActorUrl.value.replace(/.*\//, '')));

        if (duplicateUrls.indexOf(actor) == -1) {
          duplicateUrls.push(actor);
          var actorName = binding.actorName.value;

          var role = {
            id: actor,
            url: "/actor/" + actor,
            label: actorName,
            character: characterName
          };

          if (binding.characterName) {
            var characterName = binding.characterName.value;
            role.character = characterName;
          }

          film.cast.push(role);
        }
      });

      var entityUrl = "https://search-who-starred-in-xggtxxutyts6aujbbedqdvjtge.eu-west-1.es.amazonaws.com/whostarredin/film/" + film.id;
      axios.put(entityUrl, film).catch(function(error) {
        console.error(error);
      });
    });
  });
}

fs.readFile(query, function(error, queryfile) {
  if (error) {
    console.error(error);
  }

  while (offset < limit) {
    var sparql = queryfile.toString() + " LIMIT " + pageSize +'\nOFFSET ' + offset;

    axios.get("https://query.wikidata.org/sparql?query=" + encodeURIComponent(sparql).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\./g, "%2E").replace(/\*/g, "%2A"), {headers: {Accept: "application/sparql-results+json"}
    }).catch(function(error) {
      console.log("ERROR from Wikidata: " + error);
    }).then(function(response) {

      var films = {};

      response.data.results.bindings.forEach(function(binding) {
        var film = uriToID(decodeURIComponent(binding.wikipediaFilmUrl.value.replace(/.*\//, '')));
        var filmName = binding.filmName.value;

        if (! films[binding.film.value]) films[binding.film.value] = {};

        films[binding.film.value].id = film;
        films[binding.film.value].label = filmName;
        films[binding.film.value].cast = [];
      });

      for (var wikidataUri in films) {

        processFilm(wikidataUri, films[wikidataUri]);
      }
    });

    offset += pageSize;
  }
});
