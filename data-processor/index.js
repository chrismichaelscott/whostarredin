var fs = require('fs');
var axios = require('axios');

var mappings = {
  literals: {
    "http://www.w3.org/2000/01/rdf-schema#label": {
      key: "label",
      list: false
    }
  },
  links: {
    "http://www.wikidata.org/prop/direct/P161": {
      key: "cast",
      list: true
    }
  }
};

fs.readFile('query.sparql', function(error, queryfile) {
  var sparql = queryfile.toString() + " LIMIT 100";

  axios.get("https://query.wikidata.org/sparql?query=" + encodeURIComponent(sparql)).then(function(response) {
    var films = {};

    response.data.results.bindings.forEach(function(statement) {
      var filmUri = statement.subject.value;
      var id = decodeURI(filmUri.replace(/.*\//, '')).toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');

      if (! films[id]) {
        films[id] = {
          id: id
        }
      }

      if (mappings.literals[statement.predicate.value]) {
        if (mappings.literals[statement.predicate.value].list) {
          if (! films[id][mappings.literals[statement.predicate.value].key]) films[id][mappings.literals[statement.predicate.value].key] = [];
          films[id][mappings.literals[statement.predicate.value].key].push(statement.object.value);
        } else {
          films[id][mappings.literals[statement.predicate.value].key] = statement.object.value;
        }
      }

      if (mappings.links[statement.predicate.value]) {
        if (mappings.links[statement.predicate.value].list) {
          if (! films[id][mappings.links[statement.predicate.value].key]) films[id][mappings.links[statement.predicate.value].key] = [];
          films[id][mappings.links[statement.predicate.value].key].push({
            url: statement.object.value
          });
        } else {
          films[id][mappings.links[statement.predicate.value].key] = {
            url: statement.object.value
          };
        }
      }
    });

    for (var id in films) {
      var filmUrl = "https://search-who-starred-in-xggtxxutyts6aujbbedqdvjtge.eu-west-1.es.amazonaws.com/whostarredin/film/" + id;
      axios.put(filmUrl, films[id]);
    }
  });
});
