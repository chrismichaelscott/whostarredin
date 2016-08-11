var config = require('../config');
var fs = require('fs');
var utils = require('./utils');
var wikidata = require('./sparql')(config.sparqlEndpoints.wikidata);
var dbpedia = require('./sparql')(config.sparqlEndpoints.dbpedia);

var queries = {
  metadataQuery: fs.readFileSync(config.queries.filmMetadataQueryFile).toString(),
  castQuery: fs.readFileSync(config.queries.filmCastQueryFile).toString(),
  wikipediaUrlQuery: fs.readFileSync(config.queries.wikipediaUrlQueryFile).toString(),
  descriptionQuery: fs.readFileSync(config.queries.filmDescriptionQueryFile).toString()
};

function getCast(film) {
  return new Promise(function(resolve, reject) {
    wikidata.query(queries.castQuery.replace(/__URI__/, film.wikidataUri)).then(function(result) {
      film.model.cast = result.results.bindings.map(function(binding) {
        var id = utils.urlToId(binding.actor.value)
        return {
          id: id,
          url: "/actor/" + id + "/" + utils.labelToId(binding.label.value),
          label: binding.label.value,
          character: (binding.character) ? binding.character.value : undefined
        };
      });

      resolve(film);
    });
  });
}

function getMetadata(film) {
  return new Promise(function(resolve, reject) {
    wikidata.query(queries.metadataQuery.replace(/__URI__/g, film.wikidataUri)).then(function(result) {
      film.model.directors = [];
      film.model.awards = [];

      var uniqueDirectors = [];
      var uniqueAwards = [];

      result.results.bindings.forEach(function(binding) {
        if (binding.releaseDate && ! film.model.releaseDate) film.model.releaseDate = binding.releaseDate.value;
        if (binding.rating && ! film.model.rating) film.model.rating = binding.rating.value;

        if (binding.director && uniqueDirectors.indexOf(binding.director.value) == -1) {
          var directorId = utils.urlToId(binding.directorUri.value);
          film.model.directors.push({
            id: directorId,
            url: "/director/" + directorId + "/" + utils.labelToId(binding.director.value),
            label: binding.director.value
          });
          uniqueDirectors.push(binding.director.value);
        }
        if (binding.award && uniqueAwards.indexOf(binding.award.value) == -1) {
          film.model.awards.push({
            label: binding.award.value,
            recipients: []
          });
          uniqueAwards.push(binding.award.value);
        }
      });


      resolve(film);
    });
  });
}

function getWikipediaUrl(film) {
  return new Promise(function(resolve, reject) {
    wikidata.query(queries.wikipediaUrlQuery.replace(/__URI__/g, film.wikidataUri)).then(function(result) {
      if (result.results.bindings[0]) {
        film.dbPediaUri = "http://dbpedia.org/resource/" + decodeURI(result.results.bindings[0].wikipediaUrl.value).replace(/.*\//, '').replace(/ /g, '_').replace(/\."'/, '');

        resolve(film);
      } else {
        reject();
      }
    });
  });
}

function getDescription(film) {
  return new Promise(function(resolve, reject) {
    dbpedia.query(queries.descriptionQuery.replace(/__DBPEDIA_URI__/g, film.dbPediaUri)).then(function(result) {
      if (result.results.bindings[0]) {
        film.model.blurb = result.results.bindings[0].description.value;
      }
      resolve(film);
    });
  });
}

function postProcess(film) {
  return new Promise(function(resolve, reject) {
    if (film.model.year && film.model.mainStar) {
      film.model.useNlg = true;
    }

    resolve(film);
  });
}

module.exports = {
  getCast: getCast,
  getMetadata: getMetadata,
  getWikipediaUrl: getWikipediaUrl,
  getDescription: getDescription,
  postProcess: postProcess
};
