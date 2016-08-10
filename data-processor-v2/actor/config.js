module.exports = {
  sparqlEndpoints: {
    wikidata: "https://query.wikidata.org/sparql",
    dbpedia: "http://dbpedia.org/sparql/"
  },
  queries: {
    catalogueQueryFile: './queries/actor-catalogue.rq',
    filmMetadataQueryFile: './queries/film-metadata.rq',
    filmCastQueryFile: './queries/film-cast.rq',
    wikipediaUrlQueryFile: './queries/wikipedia-url.rq',
    filmDescriptionQueryFile: './queries/film-description.rq'
  },
	elasticsearch: {
		url: "https://search-who-starred-in-xggtxxutyts6aujbbedqdvjtge.eu-west-1.es.amazonaws.com",
		index: "whostarredin"
	}
};
