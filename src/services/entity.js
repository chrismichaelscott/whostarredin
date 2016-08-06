var axios = require('axios');

var elasticSearchUrl = 'https://search-who-starred-in-xggtxxutyts6aujbbedqdvjtge.eu-west-1.es.amazonaws.com';
var index = 'whostarredin';
var overlay = 'overlay';

module.exports = {
  getEntity: function(type, id) {

    var esFilmUri = elasticSearchUrl + '/' + index + '/' + type + '/' + id;
    var esOverlayUri = elasticSearchUrl + '/' + index + '/' + type + '_' + overlay + '/' + id;

    var getMovie = axios.get(esFilmUri);
    var getOverlay = axios.get(esOverlayUri).catch(function() {});

    return new Promise(function(resolve) {
      Promise.all([getMovie, getOverlay]).then(function(result) {
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
          var lookupUri = elasticSearchUrl + '/' + index + '/' + actorUrl;

          var getActor = axios.get(lookupUri);
          actorLookups.push(getActor);
        });

        Promise.all(actorLookups).then(function (results) {
          actors.forEach(function(actor, index) {
            actor.label = results[index].data._source.label;
            actor.image = results[index].data._source.image;
          });
          resolve(publicationData);
        });
      });
    });
  }
};
