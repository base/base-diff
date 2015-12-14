'use strict';

// require('time-require');
var utils = require('./utils');

/**
 * Output to the console a visual representation of the difference between
 * two objects or strings.
 *
 * @param {Object|String} `a`
 * @param {Object|String} `b`
 * @param {String} `methodName` Optionally pass a [jsdiff][] method name to use. The default is `diffChars`
 * @api public
 */

module.exports = function() {
  return function plugin(app) {
    app.define('diff', diff);
    app.diff.file = diffFile;
    app.diff.view = diffView;
    return plugin;
  };
};

function diffView(method, orig) {
  if (typeof method === 'boolean') {
    orig = method;
    method = null;
  }

  return function(view, next) {
    var str = view.content;
    if (view._hasDiff) {
      view.diff();
      view._diffno++;
    } else {
      view._orig = str;
      view._diffno = 1;
    }

    view.diff = function(origStr) {
      console.log();
      console.log('diff <' + view.relative + '> #' + view._diffno);
      var contents = (orig || origStr) ? view._orig : str;
      diff(contents, view.content, method);
      console.log();
    };

    view._hasDiff = true;
    next(null, view);
  };
};

function diffFile(method, orig) {
  if (typeof method === 'boolean') {
    orig = method;
    method = null;
  }

  return utils.through.obj(function(file, enc, next) {
    if (file.isNull()) {
      next();
      return;
    }

    var str = file.contents.toString();
    if (!file._diff) file._diff = {};

    if (typeof file.diff === 'function') {
      file.diff();
      file._diff.count++;
    } else {
      file._diff.history = [str];
      file._diff.orig = str;
      file._diff.count = 1;
    }

    file.diff = function(origStr, options) {
      console.log('diff #' + file._diff.count);
      var before = (orig || origStr) ? file._diff.orig : str;
      var after = file.contents.toString();
      file._diff.history.push(after);
      diff(before, after, method, options);
    };

    file.diff.compare = function(a, b, options) {
      var hist = file._diff.history;
      diff(hist[a], hist[b], method);
    };

    next(null, file);
  });
};

function diff(a, b, method) {
  utils.diff[method || 'diffLines'](a, b).forEach(function(stat) {
    process.stderr.write(utils.colors[color(stat)](stat.value));
  });
  console.error();
}

function color(stat) {
  if (stat.removed) return 'red';
  if (stat.added) return 'green';
  return 'gray';
}

module.exports.view = diffView;
module.exports.file = diffFile;
