var axios = require('axios');

var elasticsearchUrl = 'https://search-who-starred-in-xggtxxutyts6aujbbedqdvjtge.eu-west-1.es.amazonaws.com';
var index = 'whostarredin';
var overlay = 'overlay';

module.exports = {
  getEntity: function(type, id) {

    var esFilmUri = elasticsearchUrl + '/' + index + '/' + type + '/' + id;
    var esOverlayUri = elasticsearchUrl + '/' + index + '/' + type + '_' + overlay + '/' + id;

    var getMovie = axios.get(esFilmUri);
    var getOverlay = axios.get(esOverlayUri).catch(function() {});

    return new Promise(function(resolve) {
      Promise.all([getMovie, getOverlay]).then(function(result) {

        console.log("Retrieved movie data and manual override");
        var publicationData = result[0].data._source;

        if (result[1]) {
          var overlay = result[1].data._source;
          for (var key in overlay) {
            if (overlay.hasOwnProperty(key)) {
              publicationData[key] = overlay[key];
            }
          }
        }

        var actors = publicationData.cast;
        var actorLookups = [];

        actors.forEach(function (actor) {
          var actorUrl = actor.url;
          var lookupUri = elasticsearchUrl + '/' + index + '/' + actorUrl;

          var getActor = axios.get(lookupUri).catch(function() {});
          actorLookups.push(getActor);
        });

        Promise.all(actorLookups).then(function (results) {
          actors.forEach(function(actor, index) {
            if (results[index]) {
              actor.label = results[index].data._source.label;
              actor.image = results[index].data._source.image;
            }
          });
          resolve(publicationData);
        });
      });
    });
  },
  getFeaturedEntities: function(type, limit) {
    return new Promise(function(resolve, reject) {
      var elasticsearchQueryUrl = elasticsearchUrl + '/' + index + '/' + type + '_' + overlay + '/_search?';//q=featured:true';

      var getMovie = axios.get(elasticsearchQueryUrl).then(function(result) {
        var lookupPromises = [];

        result.data.hits.hits.forEach(function(hit) {
          lookupPromises.push(axios.get(elasticsearchUrl + '/' + index + '/' + type + "/" + hit._id));
        });

        Promise.all(lookupPromises).then(function(results) {
          var featuredEntities = [];

          results.sort(function() {
            return .5 - Math.random();
          });
          results.forEach(function(result) {
            featuredEntities.push(result.data._source);
          });

          resolve(featuredEntities);
        });
      });
    });
  }
};
