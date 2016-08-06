var config = require('../../config');
var Mustache = require('mustache');
var entityService = require('../services/entity');
var inliningService = require('../services/inlining');
var templateService = require('../services/template')

module.exports = {

  renderPage: function(type, id) {
    var templatePromise = templateService.get(type);
    var partialsPromise = templateService.getPartials(["header", "footer", "rich-link"]);
    var entityPromise = entityService.getEntity(type, id);
    var inliningPromise = inliningService.get();

    return new Promise(function(resolve, reject) {
      Promise.all([
        templatePromise,
        partialsPromise,
        entityPromise,
        inliningPromise
      ]).then(function(results) {
        console.log("Successfully built page model for " + type + " '" + id + "'");

        var template = results[0];
        var headerPartial = results[1][0];
        var footerPartial = results[1][1];
        var richLinksPartial = results[1][2];
        var entity = results[2];
        var css = results[3];

        var model = {
          inlineCss: css,
          gtmId: config.gtm.id
        };
        model[type] = entity;

        var partials = {
          header: headerPartial,
          footer: footerPartial,
          "rich-link": richLinksPartial
        };

        try {
          resolve(
            Mustache.render(
              template,
              model,
              partials
            )
          );
        } catch (error) {
          console.error(error);
        }
      });
    });
  }

};
