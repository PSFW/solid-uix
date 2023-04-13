module.exports = function(config) {
  return import("./karma.conf.mjs").then(mod => mod.default(config));
}