var Mustache = require('mustache');
var entityService = require('../services/entity');

module.exports = {

  renderFilmPage: function(id) {
    return Mustache.render("<em>{{label}}</em> yurp!", entityService.getEntity("film", id));
  }

};
