var config = require('../../config');
var Mustache = require('mustache');
var entityService = require('../services/entity');
var inliningService = require('../services/inlining');
var templateService = require('../services/template')

module.exports = {

  renderPage: function(type, id) {
    var templatePromise = templateService.get(type);
    var partialsPromise = templateService.getPartials(["header", "footer", "rich-link", "reviews", "related"]);
    var entityPromise = entityService.getEntity(type, id);
    var inliningPromise = inliningService.get();
    var relatedPromise = entityService.getRelatedEntities(type, id);

    return new Promise(function(resolve, reject) {
      Promise.all([
        templatePromise,
        partialsPromise,
        entityPromise,
        inliningPromise,
        relatedPromise
      ]).then(function(results) {
        console.log("Successfully built page model for " + type + " '" + id + "'");

        var template = results[0];
        var headerPartial = results[1][0];
        var footerPartial = results[1][1];
        var richLinksPartial = results[1][2];
        var reviewsPartial = results[1][3];
        var relatedPartial = results[1][4];
        var subject = results[2];
        var css = results[3];
        var relatedContent = results[4];

        var model = {
          inlineCss: css,
          subject: subject,
          related: relatedContent,
          gtmId: config.gtm.id,
          cseId: config.cse.id
        };
        model[type] = subject;

        var partials = {
          header: headerPartial,
          footer: footerPartial,
          "rich-link": richLinksPartial,
          reviews: reviewsPartial,
          related: relatedPartial
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
      }).catch(function(reason) {
        reject(reason);
      });
    });
  },

  renderHomepage: function() {
    var templatePromise = templateService.get("home");
    var partialsPromise = templateService.getPartials(["header", "footer"]);
    var featuredEntitiesPromise = entityService.getFeaturedEntities("film");
    var inliningPromise = inliningService.get();

    return new Promise(function(resolve, reject) {
      Promise.all([
        templatePromise,
        partialsPromise,
        featuredEntitiesPromise,
        inliningPromise
      ]).then(function(results) {
        console.log("Successfully built homepage model");

        var template = results[0];
        var headerPartial = results[1][0];
        var footerPartial = results[1][1];
        var featuredEntities = results[2];
        var css = results[3];

        var model = {
          inlineCss: css,
          featuredEntities: featuredEntities,
          subject: {
            hero: "media/homepage/hero.png"
          },
          gtmId: config.gtm.id,
          cseId: config.cse.id
        };

        var partials = {
          header: headerPartial,
          footer: footerPartial
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
