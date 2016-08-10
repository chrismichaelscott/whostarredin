var config = require('../config');
var axios = require('axios');

var storeCount = 0;
function storeFilm(film) {
  axios.put(config.elasticsearch.url + "/" + config.elasticsearch.index + "/film/" + film.model.id, film.model).catch(function(error){
    console.error(error);
  }).then(function() {
    storeCount++;
  });
}

function setIndexUpdateInterval(interval) {
  var settings = {
    "index": {
      "refresh_interval" : interval
    }
  };
  axios.put(config.elasticsearch.url + "/" + config.elasticsearch.index + "/_settings", settings).catch(function(error){
    console.error(error);
  }).then(function(response) {
    console.log(response.body);
  });
}

function disableIndexing() {
  setIndexUpdateInterval("-1");
}

function enableIndexing() {
  setIndexUpdateInterval("10s");
}

module.exports = {
  storeFilm: storeFilm,
  report: function() {
    return storeCount;
  },
  disableIndexing: disableIndexing,
  enableIndexing: enableIndexing
};
