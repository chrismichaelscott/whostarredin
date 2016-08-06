var fs = require('fs');
var config = require('../../config.js');

var css;

module.exports = {
  get: function() {
    return new Promise(function(resolve, reject) {
      if (css) {
        resolve(css);
      } else {
        console.log("reading CSS for inlining");
        fs.readFile(__dirname + "/../../site/dist.css", function(error, data) {
          var cssData = data.toString();
          resolve(cssData);
          if (config.cache.cssInlining.enabled) {
            css = cssData;
          }
          console.log("finished reading CSS");
        });
      }
    });
  }
};
