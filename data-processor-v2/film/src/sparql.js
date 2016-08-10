var axios = require('axios');

module.exports = function(sparqlEndpoint) {
  return {
    query: function(query) {
      var url = sparqlEndpoint + "?query=" + encodeURIComponent(query).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\./g, "%2E").replace(/\*/g, "%2A");

      return new Promise(function(resolve, reject) {
        axios.get(url).catch(function(error) {
          console.log("ERROR GETTING " + url);
          reject();
        }).then(function(response) {
          resolve(response.data);
        });
      });
    }
  };
};
