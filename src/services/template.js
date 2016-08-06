var fs = require('fs');
var config = require('../../config.js');

var cache = {};

module.exports = {
  get: function(name) {
    return new Promise(function(resolve, reject) {
      if (cache[name]) {
        resolve(cache[name]);
      } else {
        console.log("reading template " + name);
        fs.readFile(__dirname + "/../../views/" + name + ".mustache", function(error, data) {
          var template = data.toString();
          resolve(template);
          if (config.cache.templates.enabled) {
            cache[name] = template;
          }
          console.log("finished reading template");
        });
      }
    });
  }
};
