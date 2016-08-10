function labelToId(label) {
  return label.toLowerCase().replace(/[\W_]+/g, '-').replace(/-$/, '');
}

function urlToId(url) {
  return url.replace(/.*\//, '');
}

module.exports = {
  labelToId: labelToId,
  urlToId: urlToId
};
