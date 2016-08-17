var axios = require('axios');
var fs = require('fs');
var config = require('../../config.js');

var elasticsearchUrl = config.elasticsearch.url;
var index = config.elasticsearch.index;
var overlay = config.elasticsearch.overlaySuffix;

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

var fieldFormatters = [
  {
    field: "releaseDate",
    format: function(timestamp) {
      var year = timestamp.substr(0, 4);
      var month;

      switch(timestamp.substr(5, 2)) {
        case "01":
          month = "January";
          break;
        case "02":
          month = "February";
          break;
        case "03":
          month = "March";
          break;
        case "04":
          month = "April";
          break;
        case "05":
          month = "May";
          break;
        case "06":
          month = "June";
          break;
        case "07":
          month = "July";
          break;
        case "08":
          month = "August";
          break;
        case "09":
          month = "September";
          break;
        case "10":
          month = "October";
          break;
        case "11":
          month = "November";
          break;
        case "12":
          month = "December";
          break;
      }

      return month + " " + year;
    }
  }
]

function labelToId(label) {
  return label.toLowerCase().replace(/[\W_]+/g, '-').replace(/-$/, '')
}

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

function processFeaturedEntity(type, id, overlay, index) {
  return new Promise(function(resolve, reject) {
    axios.get(elasticsearchUrl + '/' + index + '/' + type + "/" + id).then(function(response) {
      var entity = response.data._source;

      if (overlay.label) {
        entity.label = overlay.label;
      };
      if (overlay.blurb) {
        entity.blurb = overlay.blurb;
      };

      if (index == 1 || index == 2) {
        setImageUrl(id, type, "hero-small", entity).then(function() {
          resolve(entity);
        });
      } else {
        setImageUrl(id, type, "image", entity).then(function() {
          resolve(entity);
        });
      }
    });
  });
}

module.exports = {
  getEntity: function(type, id) {

    return new Promise(function(resolve, reject) {

      var elasticsearchWikidataUrl = elasticsearchUrl + '/' + index + '/' + type + '/' + id;
      var elasticsearchOverlayUrl = elasticsearchUrl + '/' + index + '/' + type + '_' + overlay + '/' + id;

      var getEntityPromise = axios.get(elasticsearchWikidataUrl).catch(function () {
        reject(404);
      });
      var getOverlayPromise = axios.get(elasticsearchOverlayUrl).catch(function () {});

      Promise.all([getEntityPromise, getOverlayPromise]).then(function(result) {

        console.log("Retrieved " + type + " data and manual override");
        var publicationData = result[0].data._source;

        var imagePromises = [];

        imagePromises.push(setImageUrl(id, type, "hero", publicationData));
        imagePromises.push(setImageUrl(id, type, "hero-medium", publicationData));
        imagePromises.push(setImageUrl(id, type, "hero-small", publicationData));
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

        fieldFormatters.forEach(function(formatter) {
          if (publicationData[formatter.field]) {
            publicationData[formatter.field] = formatter.format(publicationData[formatter.field]);
          }
        });

        Promise.all(imagePromises).then(function() {
          resolve(publicationData);
        });
      });
    });
  },
  // TODO refactor functionality into elasticsearch service
  getFeaturedEntities: function(type, limit) {
    return new Promise(function(resolve, reject) {
      var elasticsearchQueryUrl = elasticsearchUrl + '/' + index + '/' + type + '_' + overlay + '/_search?q=featured:true';

      var getMovie = axios.get(elasticsearchQueryUrl).then(function(result) {
        var promises = [];

        result.data.hits.hits.forEach(function(hit, index) {
          promises.push(processFeaturedEntity(type, hit._id, hit._source, index));
        });

        Promise.all(promises).then(function(results) {
          resolve(results);
        });
      });
    });
  },
  // TODO refactor functionality into elasticsearch service
  getEntityList(type, prefix) {
    return new Promise(function(resolve, reject) {
      var elasticsearchQueryUrl = elasticsearchUrl + '/' + index + '/' + type + '/_search?q=label:' + prefix + '*&size=10000';

      axios.get(elasticsearchQueryUrl).then(function(result) {
        var promises = [];

        var results = result.data.hits.hits.filter(function(hit) {
          return hit._source.label.toLowerCase().startsWith(prefix.toLowerCase());
        }).map(function(hit) {
          return hit._source;
        });

        resolve({
          results: results,
          hero: "/media/homepage/hero.png",
          "hero-medium": "/media/homepage/hero-medium.png",
          "hero-small": "/media/homepage/hero-small.png"
        });

      });
    });
  },
  // TODO refactor functionality into elasticsearch service
  getRelatedEntities(type, id) {
    var fields;
    if (type == "film") {
      fields = ["blurb", "directors.0.id", "directors.1.id", "cast.0.id", "cast.1.id", "cast.2.id", "cast.3.id", "cast.4.id", "cast.5.id", "cast.6.id", "cast.7.id", "cast.8.id", "cast.9.id", "cast.10.id"];
    } else {
      fields = ["label"];
    }

    return new Promise(function(resolve, reject) {
      var query = {
        "query": {
          "more_like_this" : {
            "fields" : fields,
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
