var axios = require('axios');

var elasticSearchUrl = 'https://search-who-starred-in-xggtxxutyts6aujbbedqdvjtge.eu-west-1.es.amazonaws.com';
var index = 'whostarredin';
var overlay = 'overlay';

module.exports = {
  getEntity: function(type, id) {

    var esFilmUri = elasticSearchUrl + '/' + index + '/' + type + '/' + id;
    var esOverlayUri = elasticSearchUrl + '/' + index + '/' + type + '_' + overlay + '/' + id;

    var getMovie = axios.get(esFilmUri);
    var getOverlay = axios.get(esOverlayUri);

    return new Promise(function(resolve, reject) {
      Promise.all([getMovie, getOverlay]).then(function(result) {

        var publicationData = result[0].data._source;

        var overlay = result[1].data._source;
        for (key in overlay) {
          if (overlay.hasOwnProperty(key)) {
            publicationData[key] = overlay[key];
          }
        }
        resolve(publicationData);
      });
    });
  }
};
