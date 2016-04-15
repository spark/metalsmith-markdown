
var basename = require('path').basename;
var debug = require('debug')('metalsmith-markdown');
var dirname = require('path').dirname;
var extname = require('path').extname;
var marked = require('marked');
var crypto = require('crypto');
var renderer = new marked.Renderer();

function makeid(str)
{
  return crypto.createHash('md5').update(str).digest('base64').substr(0, 4).replace(/[+/=]/g, '-');
}


renderer.heading = function (text, level) {
  var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
  var escapedPlusRandom = escapedText + '-' + makeid(escapedText);

  var header = '<h' + level + ' id="'+ escapedText +'" data-href="'+escapedPlusRandom+'">'+ text +'<a href="#'+escapedText+'" class="header-permalinks" data-menu-href="'+escapedPlusRandom+'"><i class="ion-link"></i></a></h' + level + '>';

  return header;
}



/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Metalsmith plugin to convert markdown files.
 *
 * @param {Object} options (optional)
 *   @property {Array} keys
 * @return {Function}
 */

function plugin(options){
  options = options || {};
  var keys = options.keys || [];
  options.renderer = renderer;


  return function(files, metalsmith, done){
    setImmediate(done);
    Object.keys(files).forEach(function(file){
      debug('checking file: %s', file);
      if (!markdown(file)) return;
      var data = files[file];
      var dir = dirname(file);
      var html = basename(file, extname(file)) + '.html';
      if ('.' != dir) html = dir + '/' + html;

      debug('converting file: %s', file);
      var str = marked(data.contents.toString(), options);
      data.contents = new Buffer(str);
      keys.forEach(function(key) {
        data[key] = marked(data[key], options);
      });

      delete files[file];
      files[html] = data;
    });
  };
}

/**
 * Check if a `file` is markdown.
 *
 * @param {String} file
 * @return {Boolean}
 */

function markdown(file){
  return /\.md|\.markdown/.test(extname(file));
}
