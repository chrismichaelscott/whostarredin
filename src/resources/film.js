var Mustache = require('mustache');
var entityService = require('../services/entity');
var inliningService = require('../services/inlining');
var templateService = require('../services/template')

module.exports = {

  renderFilmPage: function(id) {
    var templatePromise = templateService.get("film");
    var partialsPromise = templateService.getPartials(["header", "footer"]);
    var entityPromise = entityService.getEntity("film", id);
    var inliningPromise = inliningService.get();

    return new Promise(function(resolve, reject) {
      Promise.all([
        templatePromise,
        partialsPromise,
        entityPromise,
        inliningPromise
      ]).then(function(results) {
        console.log("Successfully built page model for film '" + id + "'");

        var template = results[0];
        var headerPartial = results[1][0];
        var footerPartial = results[1][1];
        var model = results[2];
        var css = results[3];

        try {
          resolve(
            Mustache.render(
              template,
              {
                inlineCss: css,
                film: model
              },
              {
                header: headerPartial,
                footer: footerPartial
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
