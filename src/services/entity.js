var axios = require('axios');
var fs = require('fs');
var config = require('../../config.js');

var elasticsearchUrl = config.elastisearch.url;
var index = config.elastisearch.index;
var overlay = config.elastisearch.overlaySuffix;

var propertiesToDereference = [
  {
    name: "cast",
    list: true,
    imageType: "actor"
  },
  {
    name: "movies",
    list: true,
    imageType: "film"
  }
];

function setImageUrl(id, type, imageType, publicationData) {
  return new Promise(function(resolve, reject) {
    console.log("Looking for " + imageType + " image");

    fs.access(__dirname + "/../../media/" + type + "/" + id + "/" + imageType + ".jpg", function(jpgError) {

      if (jpgError) {
        fs.access(__dirname + "/../../media/" + type + "/" + id + "/" + imageType + ".png", function(pngError) {
          if (pngError) {
            publicationData[imageType] = "/media/" + type + "/default/" + imageType + ".png";
          } else {
            publicationData[imageType] = "/media/" + type + "/" + id + "/" + imageType + ".png";
          }
          console.log("Found " + imageType + " image");
          resolve();
        });
      } else {
        publicationData[imageType] = "/media/" + type + "/" + id + "/" + imageType + ".jpg";
        console.log("Found " + imageType + " image");
        resolve();
      }
    });
  });
}

module.exports = {
  getEntity: function(type, id) {

    var elasticsearchWikidataUrl = elasticsearchUrl + '/' + index + '/' + type + '/' + id;
    var elasticsearchOverlayUrl = elasticsearchUrl + '/' + index + '/' + type + '_' + overlay + '/' + id;

    var getEntityPromise = axios.get(elasticsearchWikidataUrl);
    var getOverlayPromise = axios.get(elasticsearchOverlayUrl).catch(function() {});

    return new Promise(function(resolve) {
      Promise.all([getEntityPromise, getOverlayPromise]).then(function(result) {

        console.log("Retrieved " + type + " data and manual override");
        var publicationData = result[0].data._source;

        var imagePromises = [];

        imagePromises.push(setImageUrl(id, type, "hero", publicationData));
        imagePromises.push(setImageUrl(id, type, "image", publicationData));

        if (result[1]) {
          var overlay = result[1].data._source;
          for (var key in overlay) {
            if (overlay.hasOwnProperty(key)) {
              publicationData[key] = overlay[key];
            }
          }
        }

        propertiesToDereference.forEach(function(property) {
          if (publicationData[property.name]) {
            if (property.list) {
              publicationData[property.name].forEach(function(value) {
                imagePromises.push(setImageUrl(value.id, property.imageType, "image", value));
              });
            }
          }
        });

        Promise.all(imagePromises).then(function() {
          resolve(publicationData);
        });
      });
    });
  },
  getFeaturedEntities: function(type, limit) {
    return new Promise(function(resolve, reject) {
      var elasticsearchQueryUrl = elasticsearchUrl + '/' + index + '/' + type + '_' + overlay + '/_search?q=featured:true';

      var getMovie = axios.get(elasticsearchQueryUrl).then(function(result) {
        var featuredEntities = [];
        var lookupPromises = [];

        result.data.hits.hits.forEach(function(hit) {
          axios.get(elasticsearchUrl + '/' + index + '/' + type + "/" + hit._id).then(function(response) {
            var entity = response.data._source;
            lookupPromises.push(setImageUrl(id, "hero", entity));
            lookupPromises.push(setImageUrl(id, "image", entity));
            featuredEntities.push(entity);
          });
        });

        Promise.all(lookupPromises).then(function(results) {
          featuredEntities.sort(function() {
            return .5 - Math.random();
          });

          resolve(featuredEntities);
        });
      });
    });
  },
  getRelatedEntities(type, id) {
    return new Promise(function(resolve, reject) {
      var query = {
        "query": {
          "more_like_this" : {
            "like": {
              "_index" : index,
              "_type" : type,
              "_id" : id
            }
          }
        }
      }
      axios.post(elasticsearchUrl + "/" + index + "/" + type + "/_search?size=5", query).then(function(response) {
        var related = response.data.hits.hits.map(function(hit) {
          return hit._source;
        });
        resolve(related);
      });
    });
  }
};
