var fs = require('fs');
var config = require('../../config.js');

var cache = {};

function getTemplate(name) {
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

function getPartials(names) {
  var promises = [];
  names.forEach(function(name) {
    promises.push(getTemplate("partials/" + name));
  });

  return Promise.all(promises);
}

module.exports = {
  get: getTemplate,
  getPartials: getPartials
};
