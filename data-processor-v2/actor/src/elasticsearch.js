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

module.exports = {
  storeFilm: storeFilm,
  report: function() {
    return storeCount;
  }
};
