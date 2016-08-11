var config = require('../config');
var axios = require('axios');

var storeCount = 0;
function storeActor(film) {
  axios.put(config.elasticsearch.url + "/" + config.elasticsearch.index + "/actor/" + film.model.id, film.model).catch(function(error){
    console.error(error);
  }).then(function() {
    storeCount++;
  });
}

module.exports = {
  storeActor: storeActor,
  report: function() {
    return storeCount;
  }
};
