var fs = require('fs');
var axios = require('axios');
var execSync = require('child_process').execSync;

var query = 'actor-images-query.rq';

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

      response.data.results.bindings.forEach(function(binding) {
        var actor = binding.actor.value.replace(/.*\//, '');
        var image = binding.image.value;
        var suffix = image.replace(/.*\./, '');

        fs.mkdir("../media/actor/" + actor, function() {
          console.log("../media/actor/" + actor + "/image." + suffix)
          execSync("wget " + image + " --output-document=../media/actor/" + actor + "/tmp." + suffix);
          execSync("convert ../media/actor/" + actor + "/tmp." + suffix + " -resize 300 ../media/actor/" + actor + "/image.png");
          execSync("rm ../media/actor/" + actor + "/tmp." + suffix);
        });
      });
    });
    offset += pageSize;
  }
});
