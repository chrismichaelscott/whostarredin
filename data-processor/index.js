var fs = require('fs');
var axios = require('axios');

var index = 'actor';
var linksIndex = 'film';
var query = 'actors-query.rq';


// Usage node index.js PAGESIZE OFFSET LIMIT
// i.e.
// node index.js 5 90 100
// ... will run two requests for 90-94 and 95-99
var limit = process.argv[3];
var pageSize = process.argv[1];
var offset = process.argv[2];

var mappings = {
  literals: {
    "http://www.w3.org/2000/01/rdf-schema#label": {
      key: "label",
      list: false
    },
    "http://schema.org/about": {
      key: "urlEncodedWikipediaLink",
      list: false
    }
  },
  links: {
    "http://www.wikidata.org/prop/direct/P161": {
      key: "cast",
      list: true
    },
    "http://whostarredin.com/data/movie": {
      key: "movies",
      list: true
    }
  }
};

// var genreQuery = 'genre-query.rq';
// fs.readFile(genreQuery, function (error, queryfile) {
//
//   var sparql = queryfile.toString();
//
//   var genreList = [];
//   axios.get("https://query.wikidata.org/sparql?query=" + encodeURIComponent()).then(function (response) {
//
//     response.data.bindings.forEach(function (genre) {
//       genreList.push(genre.value);
//     })
//   }).then(console.log(genreList));
// });


fs.readFile(query, function(error, queryfile) {
  while (offset < limit) {
    var sparql = queryfile.toString() + "LIMIT " + pageSize +'\nOFFSET ' + offset;
    console.log("https://query.wikidata.org/sparql?query=" + encodeURIComponent(sparql).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\./g, "%2E").replace(/\*/g, "%2A"));

    axios.get("https://query.wikidata.org/sparql?query=" + encodeURIComponent(sparql).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\./g, "%2E").replace(/\*/g, "%2A"), {headers: {Accept: "application/sparql-results+json"}
    }).catch(function(error) {
      console.log("ERROR: " + error);
    }).then(function(response) {

      var entities = {};

      response.data.results.bindings.forEach(function(statement) {
        var entityUri = statement.subject.value;
        var id = decodeURI(entityUri.replace(/.*\//, '')).toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/-$/, "");

        if (! entities[id]) {
          entities[id] = {
            id: id
          }
        }

        if (mappings.literals[statement.predicate.value]) {
          if (mappings.literals[statement.predicate.value].list) {
            if (! entities[id][mappings.literals[statement.predicate.value].key]) entities[id][mappings.literals[statement.predicate.value].key] = [];
            entities[id][mappings.literals[statement.predicate.value].key].push(statement.object.value);
          } else {
            entities[id][mappings.literals[statement.predicate.value].key] = statement.object.value;
          }
        }

        if (mappings.links[statement.predicate.value]) {
          if (mappings.links[statement.predicate.value].list) {
            if (! entities[id][mappings.links[statement.predicate.value].key]) entities[id][mappings.links[statement.predicate.value].key] = [];
            entities[id][mappings.links[statement.predicate.value].key].push({
              url: statement.object.value.toLowerCase().replace(/.*\//, '/' + linksIndex + '/')
            });
          } else {
            entities[id][mappings.links[statement.predicate.value].key] = {
              url: statement.object.value.toLowerCase().replace(/.*\//, '/' + linksIndex + '/')
            };
          }
        }
      });

      for (var wikiDataId in entities) {
        var id = decodeURIComponent(entities[wikiDataId].urlEncodedWikipediaLink.replace(/.*\//, '')).toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/-$/, "");
        entities[wikiDataId].id = id;
        var entityUrl = "https://search-who-starred-in-xggtxxutyts6aujbbedqdvjtge.eu-west-1.es.amazonaws.com/whostarredin/" + index + "/" + id;

        axios.put(entityUrl, entities[wikiDataId]).catch(function(error) {
          //console.log("ERROR: ", error);
        });
      }
    });
    offset += pageSize;
  }
});
