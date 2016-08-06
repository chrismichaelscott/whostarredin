var Mustache = require('mustache');
var entityService = require('../services/entity');
var inliningService = require('../services/inlining');
var templateService = require('../services/template')

module.exports = {

  renderFilmPage: function(id) {
    var templatePromise = templateService.get("film");
    var entityPromise = entityService.getEntity("film", id);
    var inliningPromise = inliningService.get();

    return new Promise(function(resolve, reject) {
      Promise.all([
        templatePromise,
        entityPromise,
        inliningPromise
      ]).then(function(results) {
        console.log("Successfully built page model for film '" + id + "'");

        try {
          resolve(
            Mustache.render(
              results[0],
              {
                inlineCss: results[2],
                film: results[1]
              }
            )
          );
        } catch (error) {
          console.error(error);
        }
      });
    });
  }

};
