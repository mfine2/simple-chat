;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function() {
  window.onload = function() {
    return require('./main.coffee');
  };

}).call(this);


},{"./main.coffee":2}],2:[function(require,module,exports){
(function() {
  var dom, monitor, name, new_time, q, stamp, ws;

  dom = require('./dom.coffee');

  q = dom.q;

  ws = require('./ws.coffee').ws;

  new_time = function() {
    return (new Date).getTime();
  };

  stamp = new_time();

  name = localStorage.getItem('name') || 'anonymous';

  monitor = function(event) {
    var data, text;

    text = q('#input').value.slice(0, 61);
    data = {
      text: text,
      stamp: stamp,
      name: name
    };
    if ((event != null) && (event.keyCode === 13)) {
      q('#input').value = '';
      stamp = new_time();
      data.finish = true;
    }
    return ws.emit('post', data);
  };

  q('#input').focus();

  q('#input').oninput = monitor;

  q('#input').onkeyup = monitor;

  if (name != null) {
    q('#name').value = name;
  }

  q('#name').onblur = function() {
    name = this.value;
    return localStorage.setItem('name', name);
  };

  ws.on('post', function(data) {
    return dom.update(data);
  });

}).call(this);


},{"./dom.coffee":3,"./ws.coffee":4}],4:[function(require,module,exports){
(function() {
  var io, ws;

  io = require('socket.io-client');

  ws = exports.ws = io.connect('http://192.168.1.46:3000');

}).call(this);


},{"socket.io-client":5}],5:[function(require,module,exports){
(function(){/*! Socket.IO.js build:0.9.11, development. Copyright(c) 2011 LearnBoost <dev@learnboost.com> MIT Licensed */

var io = ('undefined' === typeof module ? {} : module.exports);
(function() {

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, global) {

  /**
   * IO namespace.
   *
   * @namespace
   */

  var io = exports;

  /**
   * Socket.IO version
   *
   * @api public
   */

  io.version = '0.9.11';

  /**
   * Protocol implemented.
   *
   * @api public
   */

  io.protocol = 1;

  /**
   * Available transports, these will be populated with the available transports
   *
   * @api public
   */

  io.transports = [];

  /**
   * Keep track of jsonp callbacks.
   *
   * @api private
   */

  io.j = [];

  /**
   * Keep track of our io.Sockets
   *
   * @api private
   */
  io.sockets = {};


  /**
   * Manages connections to hosts.
   *
   * @param {String} uri
   * @Param {Boolean} force creation of new socket (defaults to false)
   * @api public
   */

  io.connect = function (host, details) {
    var uri = io.util.parseUri(host)
      , uuri
      , socket;

    if (global && global.location) {
      uri.protocol = uri.protocol || global.location.protocol.slice(0, -1);
      uri.host = uri.host || (global.document
        ? global.document.domain : global.location.hostname);
      uri.port = uri.port || global.location.port;
    }

    uuri = io.util.uniqueUri(uri);

    var options = {
        host: uri.host
      , secure: 'https' == uri.protocol
      , port: uri.port || ('https' == uri.protocol ? 443 : 80)
      , query: uri.query || ''
    };

    io.util.merge(options, details);

    if (options['force new connection'] || !io.sockets[uuri]) {
      socket = new io.Socket(options);
    }

    if (!options['force new connection'] && socket) {
      io.sockets[uuri] = socket;
    }

    socket = socket || io.sockets[uuri];

    // if path is different from '' or /
    return socket.of(uri.path.length > 1 ? uri.path : '');
  };

})('object' === typeof module ? module.exports : (this.io = {}), this);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, global) {

  /**
   * Utilities namespace.
   *
   * @namespace
   */

  var util = exports.util = {};

  /**
   * Parses an URI
   *
   * @author Steven Levithan <stevenlevithan.com> (MIT license)
   * @api public
   */

  var re = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

  var parts = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password',
               'host', 'port', 'relative', 'path', 'directory', 'file', 'query',
               'anchor'];

  util.parseUri = function (str) {
    var m = re.exec(str || '')
      , uri = {}
      , i = 14;

    while (i--) {
      uri[parts[i]] = m[i] || '';
    }

    return uri;
  };

  /**
   * Produces a unique url that identifies a Socket.IO connection.
   *
   * @param {Object} uri
   * @api public
   */

  util.uniqueUri = function (uri) {
    var protocol = uri.protocol
      , host = uri.host
      , port = uri.port;

    if ('document' in global) {
      host = host || document.domain;
      port = port || (protocol == 'https'
        && document.location.protocol !== 'https:' ? 443 : document.location.port);
    } else {
      host = host || 'localhost';

      if (!port && protocol == 'https') {
        port = 443;
      }
    }

    return (protocol || 'http') + '://' + host + ':' + (port || 80);
  };

  /**
   * Mergest 2 query strings in to once unique query string
   *
   * @param {String} base
   * @param {String} addition
   * @api public
   */

  util.query = function (base, addition) {
    var query = util.chunkQuery(base || '')
      , components = [];

    util.merge(query, util.chunkQuery(addition || ''));
    for (var part in query) {
      if (query.hasOwnProperty(part)) {
        components.push(part + '=' + query[part]);
      }
    }

    return components.length ? '?' + components.join('&') : '';
  };

  /**
   * Transforms a querystring in to an object
   *
   * @param {String} qs
   * @api public
   */

  util.chunkQuery = function (qs) {
    var query = {}
      , params = qs.split('&')
      , i = 0
      , l = params.length
      , kv;

    for (; i < l; ++i) {
      kv = params[i].split('=');
      if (kv[0]) {
        query[kv[0]] = kv[1];
      }
    }

    return query;
  };

  /**
   * Executes the given function when the page is loaded.
   *
   *     io.util.load(function () { console.log('page loaded'); });
   *
   * @param {Function} fn
   * @api public
   */

  var pageLoaded = false;

  util.load = function (fn) {
    if ('document' in global && document.readyState === 'complete' || pageLoaded) {
      return fn();
    }

    util.on(global, 'load', fn, false);
  };

  /**
   * Adds an event.
   *
   * @api private
   */

  util.on = function (element, event, fn, capture) {
    if (element.attachEvent) {
      element.attachEvent('on' + event, fn);
    } else if (element.addEventListener) {
      element.addEventListener(event, fn, capture);
    }
  };

  /**
   * Generates the correct `XMLHttpRequest` for regular and cross domain requests.
   *
   * @param {Boolean} [xdomain] Create a request that can be used cross domain.
   * @returns {XMLHttpRequest|false} If we can create a XMLHttpRequest.
   * @api private
   */

  util.request = function (xdomain) {

    if (xdomain && 'undefined' != typeof XDomainRequest && !util.ua.hasCORS) {
      return new XDomainRequest();
    }

    if ('undefined' != typeof XMLHttpRequest && (!xdomain || util.ua.hasCORS)) {
      return new XMLHttpRequest();
    }

    if (!xdomain) {
      try {
        return new window[(['Active'].concat('Object').join('X'))]('Microsoft.XMLHTTP');
      } catch(e) { }
    }

    return null;
  };

  /**
   * XHR based transport constructor.
   *
   * @constructor
   * @api public
   */

  /**
   * Change the internal pageLoaded value.
   */

  if ('undefined' != typeof window) {
    util.load(function () {
      pageLoaded = true;
    });
  }

  /**
   * Defers a function to ensure a spinner is not displayed by the browser
   *
   * @param {Function} fn
   * @api public
   */

  util.defer = function (fn) {
    if (!util.ua.webkit || 'undefined' != typeof importScripts) {
      return fn();
    }

    util.load(function () {
      setTimeout(fn, 100);
    });
  };

  /**
   * Merges two objects.
   *
   * @api public
   */

  util.merge = function merge (target, additional, deep, lastseen) {
    var seen = lastseen || []
      , depth = typeof deep == 'undefined' ? 2 : deep
      , prop;

    for (prop in additional) {
      if (additional.hasOwnProperty(prop) && util.indexOf(seen, prop) < 0) {
        if (typeof target[prop] !== 'object' || !depth) {
          target[prop] = additional[prop];
          seen.push(additional[prop]);
        } else {
          util.merge(target[prop], additional[prop], depth - 1, seen);
        }
      }
    }

    return target;
  };

  /**
   * Merges prototypes from objects
   *
   * @api public
   */

  util.mixin = function (ctor, ctor2) {
    util.merge(ctor.prototype, ctor2.prototype);
  };

  /**
   * Shortcut for prototypical and static inheritance.
   *
   * @api private
   */

  util.inherit = function (ctor, ctor2) {
    function f() {};
    f.prototype = ctor2.prototype;
    ctor.prototype = new f;
  };

  /**
   * Checks if the given object is an Array.
   *
   *     io.util.isArray([]); // true
   *     io.util.isArray({}); // false
   *
   * @param Object obj
   * @api public
   */

  util.isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  /**
   * Intersects values of two arrays into a third
   *
   * @api public
   */

  util.intersect = function (arr, arr2) {
    var ret = []
      , longest = arr.length > arr2.length ? arr : arr2
      , shortest = arr.length > arr2.length ? arr2 : arr;

    for (var i = 0, l = shortest.length; i < l; i++) {
      if (~util.indexOf(longest, shortest[i]))
        ret.push(shortest[i]);
    }

    return ret;
  };

  /**
   * Array indexOf compatibility.
   *
   * @see bit.ly/a5Dxa2
   * @api public
   */

  util.indexOf = function (arr, o, i) {

    for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0;
         i < j && arr[i] !== o; i++) {}

    return j <= i ? -1 : i;
  };

  /**
   * Converts enumerables to array.
   *
   * @api public
   */

  util.toArray = function (enu) {
    var arr = [];

    for (var i = 0, l = enu.length; i < l; i++)
      arr.push(enu[i]);

    return arr;
  };

  /**
   * UA / engines detection namespace.
   *
   * @namespace
   */

  util.ua = {};

  /**
   * Whether the UA supports CORS for XHR.
   *
   * @api public
   */

  util.ua.hasCORS = 'undefined' != typeof XMLHttpRequest && (function () {
    try {
      var a = new XMLHttpRequest();
    } catch (e) {
      return false;
    }

    return a.withCredentials != undefined;
  })();

  /**
   * Detect webkit.
   *
   * @api public
   */

  util.ua.webkit = 'undefined' != typeof navigator
    && /webkit/i.test(navigator.userAgent);

   /**
   * Detect iPad/iPhone/iPod.
   *
   * @api public
   */

  util.ua.iDevice = 'undefined' != typeof navigator
      && /iPad|iPhone|iPod/i.test(navigator.userAgent);

})('undefined' != typeof io ? io : module.exports, this);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.EventEmitter = EventEmitter;

  /**
   * Event emitter constructor.
   *
   * @api public.
   */

  function EventEmitter () {};

  /**
   * Adds a listener
   *
   * @api public
   */

  EventEmitter.prototype.on = function (name, fn) {
    if (!this.$events) {
      this.$events = {};
    }

    if (!this.$events[name]) {
      this.$events[name] = fn;
    } else if (io.util.isArray(this.$events[name])) {
      this.$events[name].push(fn);
    } else {
      this.$events[name] = [this.$events[name], fn];
    }

    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  /**
   * Adds a volatile listener.
   *
   * @api public
   */

  EventEmitter.prototype.once = function (name, fn) {
    var self = this;

    function on () {
      self.removeListener(name, on);
      fn.apply(this, arguments);
    };

    on.listener = fn;
    this.on(name, on);

    return this;
  };

  /**
   * Removes a listener.
   *
   * @api public
   */

  EventEmitter.prototype.removeListener = function (name, fn) {
    if (this.$events && this.$events[name]) {
      var list = this.$events[name];

      if (io.util.isArray(list)) {
        var pos = -1;

        for (var i = 0, l = list.length; i < l; i++) {
          if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
            pos = i;
            break;
          }
        }

        if (pos < 0) {
          return this;
        }

        list.splice(pos, 1);

        if (!list.length) {
          delete this.$events[name];
        }
      } else if (list === fn || (list.listener && list.listener === fn)) {
        delete this.$events[name];
      }
    }

    return this;
  };

  /**
   * Removes all listeners for an event.
   *
   * @api public
   */

  EventEmitter.prototype.removeAllListeners = function (name) {
    if (name === undefined) {
      this.$events = {};
      return this;
    }

    if (this.$events && this.$events[name]) {
      this.$events[name] = null;
    }

    return this;
  };

  /**
   * Gets all listeners for a certain event.
   *
   * @api publci
   */

  EventEmitter.prototype.listeners = function (name) {
    if (!this.$events) {
      this.$events = {};
    }

    if (!this.$events[name]) {
      this.$events[name] = [];
    }

    if (!io.util.isArray(this.$events[name])) {
      this.$events[name] = [this.$events[name]];
    }

    return this.$events[name];
  };

  /**
   * Emits an event.
   *
   * @api public
   */

  EventEmitter.prototype.emit = function (name) {
    if (!this.$events) {
      return false;
    }

    var handler = this.$events[name];

    if (!handler) {
      return false;
    }

    var args = Array.prototype.slice.call(arguments, 1);

    if ('function' == typeof handler) {
      handler.apply(this, args);
    } else if (io.util.isArray(handler)) {
      var listeners = handler.slice();

      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].apply(this, args);
      }
    } else {
      return false;
    }

    return true;
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Based on JSON2 (http://www.JSON.org/js.html).
 */

(function (exports, nativeJSON) {
  "use strict";

  // use native JSON if it's available
  if (nativeJSON && nativeJSON.parse){
    return exports.JSON = {
      parse: nativeJSON.parse
    , stringify: nativeJSON.stringify
    };
  }

  var JSON = exports.JSON = {};

  function f(n) {
      // Format integers to have at least two digits.
      return n < 10 ? '0' + n : n;
  }

  function date(d, key) {
    return isFinite(d.valueOf()) ?
        d.getUTCFullYear()     + '-' +
        f(d.getUTCMonth() + 1) + '-' +
        f(d.getUTCDate())      + 'T' +
        f(d.getUTCHours())     + ':' +
        f(d.getUTCMinutes())   + ':' +
        f(d.getUTCSeconds())   + 'Z' : null;
  };

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {    // table of character substitutions
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"' : '\\"',
          '\\': '\\\\'
      },
      rep;


  function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

      escapable.lastIndex = 0;
      return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
          var c = meta[a];
          return typeof c === 'string' ? c :
              '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' : '"' + string + '"';
  }


  function str(key, holder) {

// Produce a string from holder[key].

      var i,          // The loop counter.
          k,          // The member key.
          v,          // The member value.
          length,
          mind = gap,
          partial,
          value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

      if (value instanceof Date) {
          value = date(key);
      }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

      if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
      }

// What happens next depends on the value's type.

      switch (typeof value) {
      case 'string':
          return quote(value);

      case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

          return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

          return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

      case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

          if (!value) {
              return 'null';
          }

// Make an array to hold the partial results of stringifying this object value.

          gap += indent;
          partial = [];

// Is the value an array?

          if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

              length = value.length;
              for (i = 0; i < length; i += 1) {
                  partial[i] = str(i, value) || 'null';
              }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

              v = partial.length === 0 ? '[]' : gap ?
                  '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                  '[' + partial.join(',') + ']';
              gap = mind;
              return v;
          }

// If the replacer is an array, use it to select the members to be stringified.

          if (rep && typeof rep === 'object') {
              length = rep.length;
              for (i = 0; i < length; i += 1) {
                  if (typeof rep[i] === 'string') {
                      k = rep[i];
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          } else {

// Otherwise, iterate through all of the keys in the object.

              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

          v = partial.length === 0 ? '{}' : gap ?
              '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
              '{' + partial.join(',') + '}';
          gap = mind;
          return v;
      }
  }

// If the JSON object does not yet have a stringify method, give it one.

  JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

      var i;
      gap = '';
      indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

      if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
              indent += ' ';
          }

// If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
          indent = space;
      }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
              (typeof replacer !== 'object' ||
              typeof replacer.length !== 'number')) {
          throw new Error('JSON.stringify');
      }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

      return str('', {'': value});
  };

// If the JSON object does not yet have a parse method, give it one.

  JSON.parse = function (text, reviver) {
  // The parse method takes a text and an optional reviver function, and returns
  // a JavaScript value if the text is a valid JSON text.

      var j;

      function walk(holder, key) {

  // The walk method is used to recursively walk the resulting structure so
  // that modifications can be made.

          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = walk(value, k);
                      if (v !== undefined) {
                          value[k] = v;
                      } else {
                          delete value[k];
                      }
                  }
              }
          }
          return reviver.call(holder, key, value);
      }


  // Parsing happens in four stages. In the first stage, we replace certain
  // Unicode characters with escape sequences. JavaScript handles many characters
  // incorrectly, either silently deleting them, or treating them as line endings.

      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
          text = text.replace(cx, function (a) {
              return '\\u' +
                  ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          });
      }

  // In the second stage, we run the text against regular expressions that look
  // for non-JSON patterns. We are especially concerned with '()' and 'new'
  // because they can cause invocation, and '=' because it can cause mutation.
  // But just to be safe, we want to reject all unexpected forms.

  // We split the second stage into 4 regexp operations in order to work around
  // crippling inefficiencies in IE's and Safari's regexp engines. First we
  // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
  // replace all simple value tokens with ']' characters. Third, we delete all
  // open brackets that follow a colon or comma or that begin the text. Finally,
  // we look to see that the remaining characters are only whitespace or ']' or
  // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

      if (/^[\],:{}\s]*$/
              .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                  .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                  .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

  // In the third stage we use the eval function to compile the text into a
  // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
  // in JavaScript: it can begin a block or an object literal. We wrap the text
  // in parens to eliminate the ambiguity.

          j = eval('(' + text + ')');

  // In the optional fourth stage, we recursively walk the new structure, passing
  // each name/value pair to a reviver function for possible transformation.

          return typeof reviver === 'function' ?
              walk({'': j}, '') : j;
      }

  // If the text is not JSON parseable, then a SyntaxError is thrown.

      throw new SyntaxError('JSON.parse');
  };

})(
    'undefined' != typeof io ? io : module.exports
  , typeof JSON !== 'undefined' ? JSON : undefined
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Parser namespace.
   *
   * @namespace
   */

  var parser = exports.parser = {};

  /**
   * Packet types.
   */

  var packets = parser.packets = [
      'disconnect'
    , 'connect'
    , 'heartbeat'
    , 'message'
    , 'json'
    , 'event'
    , 'ack'
    , 'error'
    , 'noop'
  ];

  /**
   * Errors reasons.
   */

  var reasons = parser.reasons = [
      'transport not supported'
    , 'client not handshaken'
    , 'unauthorized'
  ];

  /**
   * Errors advice.
   */

  var advice = parser.advice = [
      'reconnect'
  ];

  /**
   * Shortcuts.
   */

  var JSON = io.JSON
    , indexOf = io.util.indexOf;

  /**
   * Encodes a packet.
   *
   * @api private
   */

  parser.encodePacket = function (packet) {
    var type = indexOf(packets, packet.type)
      , id = packet.id || ''
      , endpoint = packet.endpoint || ''
      , ack = packet.ack
      , data = null;

    switch (packet.type) {
      case 'error':
        var reason = packet.reason ? indexOf(reasons, packet.reason) : ''
          , adv = packet.advice ? indexOf(advice, packet.advice) : '';

        if (reason !== '' || adv !== '')
          data = reason + (adv !== '' ? ('+' + adv) : '');

        break;

      case 'message':
        if (packet.data !== '')
          data = packet.data;
        break;

      case 'event':
        var ev = { name: packet.name };

        if (packet.args && packet.args.length) {
          ev.args = packet.args;
        }

        data = JSON.stringify(ev);
        break;

      case 'json':
        data = JSON.stringify(packet.data);
        break;

      case 'connect':
        if (packet.qs)
          data = packet.qs;
        break;

      case 'ack':
        data = packet.ackId
          + (packet.args && packet.args.length
              ? '+' + JSON.stringify(packet.args) : '');
        break;
    }

    // construct packet with required fragments
    var encoded = [
        type
      , id + (ack == 'data' ? '+' : '')
      , endpoint
    ];

    // data fragment is optional
    if (data !== null && data !== undefined)
      encoded.push(data);

    return encoded.join(':');
  };

  /**
   * Encodes multiple messages (payload).
   *
   * @param {Array} messages
   * @api private
   */

  parser.encodePayload = function (packets) {
    var decoded = '';

    if (packets.length == 1)
      return packets[0];

    for (var i = 0, l = packets.length; i < l; i++) {
      var packet = packets[i];
      decoded += '\ufffd' + packet.length + '\ufffd' + packets[i];
    }

    return decoded;
  };

  /**
   * Decodes a packet
   *
   * @api private
   */

  var regexp = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;

  parser.decodePacket = function (data) {
    var pieces = data.match(regexp);

    if (!pieces) return {};

    var id = pieces[2] || ''
      , data = pieces[5] || ''
      , packet = {
            type: packets[pieces[1]]
          , endpoint: pieces[4] || ''
        };

    // whether we need to acknowledge the packet
    if (id) {
      packet.id = id;
      if (pieces[3])
        packet.ack = 'data';
      else
        packet.ack = true;
    }

    // handle different packet types
    switch (packet.type) {
      case 'error':
        var pieces = data.split('+');
        packet.reason = reasons[pieces[0]] || '';
        packet.advice = advice[pieces[1]] || '';
        break;

      case 'message':
        packet.data = data || '';
        break;

      case 'event':
        try {
          var opts = JSON.parse(data);
          packet.name = opts.name;
          packet.args = opts.args;
        } catch (e) { }

        packet.args = packet.args || [];
        break;

      case 'json':
        try {
          packet.data = JSON.parse(data);
        } catch (e) { }
        break;

      case 'connect':
        packet.qs = data || '';
        break;

      case 'ack':
        var pieces = data.match(/^([0-9]+)(\+)?(.*)/);
        if (pieces) {
          packet.ackId = pieces[1];
          packet.args = [];

          if (pieces[3]) {
            try {
              packet.args = pieces[3] ? JSON.parse(pieces[3]) : [];
            } catch (e) { }
          }
        }
        break;

      case 'disconnect':
      case 'heartbeat':
        break;
    };

    return packet;
  };

  /**
   * Decodes data payload. Detects multiple messages
   *
   * @return {Array} messages
   * @api public
   */

  parser.decodePayload = function (data) {
    // IE doesn't like data[i] for unicode chars, charAt works fine
    if (data.charAt(0) == '\ufffd') {
      var ret = [];

      for (var i = 1, length = ''; i < data.length; i++) {
        if (data.charAt(i) == '\ufffd') {
          ret.push(parser.decodePacket(data.substr(i + 1).substr(0, length)));
          i += Number(length) + 1;
          length = '';
        } else {
          length += data.charAt(i);
        }
      }

      return ret;
    } else {
      return [parser.decodePacket(data)];
    }
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.Transport = Transport;

  /**
   * This is the transport template for all supported transport methods.
   *
   * @constructor
   * @api public
   */

  function Transport (socket, sessid) {
    this.socket = socket;
    this.sessid = sessid;
  };

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(Transport, io.EventEmitter);


  /**
   * Indicates whether heartbeats is enabled for this transport
   *
   * @api private
   */

  Transport.prototype.heartbeats = function () {
    return true;
  };

  /**
   * Handles the response from the server. When a new response is received
   * it will automatically update the timeout, decode the message and
   * forwards the response to the onMessage function for further processing.
   *
   * @param {String} data Response from the server.
   * @api private
   */

  Transport.prototype.onData = function (data) {
    this.clearCloseTimeout();

    // If the connection in currently open (or in a reopening state) reset the close
    // timeout since we have just received data. This check is necessary so
    // that we don't reset the timeout on an explicitly disconnected connection.
    if (this.socket.connected || this.socket.connecting || this.socket.reconnecting) {
      this.setCloseTimeout();
    }

    if (data !== '') {
      // todo: we should only do decodePayload for xhr transports
      var msgs = io.parser.decodePayload(data);

      if (msgs && msgs.length) {
        for (var i = 0, l = msgs.length; i < l; i++) {
          this.onPacket(msgs[i]);
        }
      }
    }

    return this;
  };

  /**
   * Handles packets.
   *
   * @api private
   */

  Transport.prototype.onPacket = function (packet) {
    this.socket.setHeartbeatTimeout();

    if (packet.type == 'heartbeat') {
      return this.onHeartbeat();
    }

    if (packet.type == 'connect' && packet.endpoint == '') {
      this.onConnect();
    }

    if (packet.type == 'error' && packet.advice == 'reconnect') {
      this.isOpen = false;
    }

    this.socket.onPacket(packet);

    return this;
  };

  /**
   * Sets close timeout
   *
   * @api private
   */

  Transport.prototype.setCloseTimeout = function () {
    if (!this.closeTimeout) {
      var self = this;

      this.closeTimeout = setTimeout(function () {
        self.onDisconnect();
      }, this.socket.closeTimeout);
    }
  };

  /**
   * Called when transport disconnects.
   *
   * @api private
   */

  Transport.prototype.onDisconnect = function () {
    if (this.isOpen) this.close();
    this.clearTimeouts();
    this.socket.onDisconnect();
    return this;
  };

  /**
   * Called when transport connects
   *
   * @api private
   */

  Transport.prototype.onConnect = function () {
    this.socket.onConnect();
    return this;
  };

  /**
   * Clears close timeout
   *
   * @api private
   */

  Transport.prototype.clearCloseTimeout = function () {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  };

  /**
   * Clear timeouts
   *
   * @api private
   */

  Transport.prototype.clearTimeouts = function () {
    this.clearCloseTimeout();

    if (this.reopenTimeout) {
      clearTimeout(this.reopenTimeout);
    }
  };

  /**
   * Sends a packet
   *
   * @param {Object} packet object.
   * @api private
   */

  Transport.prototype.packet = function (packet) {
    this.send(io.parser.encodePacket(packet));
  };

  /**
   * Send the received heartbeat message back to server. So the server
   * knows we are still connected.
   *
   * @param {String} heartbeat Heartbeat response from the server.
   * @api private
   */

  Transport.prototype.onHeartbeat = function (heartbeat) {
    this.packet({ type: 'heartbeat' });
  };

  /**
   * Called when the transport opens.
   *
   * @api private
   */

  Transport.prototype.onOpen = function () {
    this.isOpen = true;
    this.clearCloseTimeout();
    this.socket.onOpen();
  };

  /**
   * Notifies the base when the connection with the Socket.IO server
   * has been disconnected.
   *
   * @api private
   */

  Transport.prototype.onClose = function () {
    var self = this;

    /* FIXME: reopen delay causing a infinit loop
    this.reopenTimeout = setTimeout(function () {
      self.open();
    }, this.socket.options['reopen delay']);*/

    this.isOpen = false;
    this.socket.onClose();
    this.onDisconnect();
  };

  /**
   * Generates a connection url based on the Socket.IO URL Protocol.
   * See <https://github.com/learnboost/socket.io-node/> for more details.
   *
   * @returns {String} Connection url
   * @api private
   */

  Transport.prototype.prepareUrl = function () {
    var options = this.socket.options;

    return this.scheme() + '://'
      + options.host + ':' + options.port + '/'
      + options.resource + '/' + io.protocol
      + '/' + this.name + '/' + this.sessid;
  };

  /**
   * Checks if the transport is ready to start a connection.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  Transport.prototype.ready = function (socket, fn) {
    fn.call(this);
  };
})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports.Socket = Socket;

  /**
   * Create a new `Socket.IO client` which can establish a persistent
   * connection with a Socket.IO enabled server.
   *
   * @api public
   */

  function Socket (options) {
    this.options = {
        port: 80
      , secure: false
      , document: 'document' in global ? document : false
      , resource: 'socket.io'
      , transports: io.transports
      , 'connect timeout': 10000
      , 'try multiple transports': true
      , 'reconnect': true
      , 'reconnection delay': 500
      , 'reconnection limit': Infinity
      , 'reopen delay': 3000
      , 'max reconnection attempts': 10
      , 'sync disconnect on unload': false
      , 'auto connect': true
      , 'flash policy port': 10843
      , 'manualFlush': false
    };

    io.util.merge(this.options, options);

    this.connected = false;
    this.open = false;
    this.connecting = false;
    this.reconnecting = false;
    this.namespaces = {};
    this.buffer = [];
    this.doBuffer = false;

    if (this.options['sync disconnect on unload'] &&
        (!this.isXDomain() || io.util.ua.hasCORS)) {
      var self = this;
      io.util.on(global, 'beforeunload', function () {
        self.disconnectSync();
      }, false);
    }

    if (this.options['auto connect']) {
      this.connect();
    }
};

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(Socket, io.EventEmitter);

  /**
   * Returns a namespace listener/emitter for this socket
   *
   * @api public
   */

  Socket.prototype.of = function (name) {
    if (!this.namespaces[name]) {
      this.namespaces[name] = new io.SocketNamespace(this, name);

      if (name !== '') {
        this.namespaces[name].packet({ type: 'connect' });
      }
    }

    return this.namespaces[name];
  };

  /**
   * Emits the given event to the Socket and all namespaces
   *
   * @api private
   */

  Socket.prototype.publish = function () {
    this.emit.apply(this, arguments);

    var nsp;

    for (var i in this.namespaces) {
      if (this.namespaces.hasOwnProperty(i)) {
        nsp = this.of(i);
        nsp.$emit.apply(nsp, arguments);
      }
    }
  };

  /**
   * Performs the handshake
   *
   * @api private
   */

  function empty () { };

  Socket.prototype.handshake = function (fn) {
    var self = this
      , options = this.options;

    function complete (data) {
      if (data instanceof Error) {
        self.connecting = false;
        self.onError(data.message);
      } else {
        fn.apply(null, data.split(':'));
      }
    };

    var url = [
          'http' + (options.secure ? 's' : '') + ':/'
        , options.host + ':' + options.port
        , options.resource
        , io.protocol
        , io.util.query(this.options.query, 't=' + +new Date)
      ].join('/');

    if (this.isXDomain() && !io.util.ua.hasCORS) {
      var insertAt = document.getElementsByTagName('script')[0]
        , script = document.createElement('script');

      script.src = url + '&jsonp=' + io.j.length;
      insertAt.parentNode.insertBefore(script, insertAt);

      io.j.push(function (data) {
        complete(data);
        script.parentNode.removeChild(script);
      });
    } else {
      var xhr = io.util.request();

      xhr.open('GET', url, true);
      if (this.isXDomain()) {
        xhr.withCredentials = true;
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          xhr.onreadystatechange = empty;

          if (xhr.status == 200) {
            complete(xhr.responseText);
          } else if (xhr.status == 403) {
            self.onError(xhr.responseText);
          } else {
            self.connecting = false;            
            !self.reconnecting && self.onError(xhr.responseText);
          }
        }
      };
      xhr.send(null);
    }
  };

  /**
   * Find an available transport based on the options supplied in the constructor.
   *
   * @api private
   */

  Socket.prototype.getTransport = function (override) {
    var transports = override || this.transports, match;

    for (var i = 0, transport; transport = transports[i]; i++) {
      if (io.Transport[transport]
        && io.Transport[transport].check(this)
        && (!this.isXDomain() || io.Transport[transport].xdomainCheck(this))) {
        return new io.Transport[transport](this, this.sessionid);
      }
    }

    return null;
  };

  /**
   * Connects to the server.
   *
   * @param {Function} [fn] Callback.
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.connect = function (fn) {
    if (this.connecting) {
      return this;
    }

    var self = this;
    self.connecting = true;
    
    this.handshake(function (sid, heartbeat, close, transports) {
      self.sessionid = sid;
      self.closeTimeout = close * 1000;
      self.heartbeatTimeout = heartbeat * 1000;
      if(!self.transports)
          self.transports = self.origTransports = (transports ? io.util.intersect(
              transports.split(',')
            , self.options.transports
          ) : self.options.transports);

      self.setHeartbeatTimeout();

      function connect (transports){
        if (self.transport) self.transport.clearTimeouts();

        self.transport = self.getTransport(transports);
        if (!self.transport) return self.publish('connect_failed');

        // once the transport is ready
        self.transport.ready(self, function () {
          self.connecting = true;
          self.publish('connecting', self.transport.name);
          self.transport.open();

          if (self.options['connect timeout']) {
            self.connectTimeoutTimer = setTimeout(function () {
              if (!self.connected) {
                self.connecting = false;

                if (self.options['try multiple transports']) {
                  var remaining = self.transports;

                  while (remaining.length > 0 && remaining.splice(0,1)[0] !=
                         self.transport.name) {}

                    if (remaining.length){
                      connect(remaining);
                    } else {
                      self.publish('connect_failed');
                    }
                }
              }
            }, self.options['connect timeout']);
          }
        });
      }

      connect(self.transports);

      self.once('connect', function (){
        clearTimeout(self.connectTimeoutTimer);

        fn && typeof fn == 'function' && fn();
      });
    });

    return this;
  };

  /**
   * Clears and sets a new heartbeat timeout using the value given by the
   * server during the handshake.
   *
   * @api private
   */

  Socket.prototype.setHeartbeatTimeout = function () {
    clearTimeout(this.heartbeatTimeoutTimer);
    if(this.transport && !this.transport.heartbeats()) return;

    var self = this;
    this.heartbeatTimeoutTimer = setTimeout(function () {
      self.transport.onClose();
    }, this.heartbeatTimeout);
  };

  /**
   * Sends a message.
   *
   * @param {Object} data packet.
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.packet = function (data) {
    if (this.connected && !this.doBuffer) {
      this.transport.packet(data);
    } else {
      this.buffer.push(data);
    }

    return this;
  };

  /**
   * Sets buffer state
   *
   * @api private
   */

  Socket.prototype.setBuffer = function (v) {
    this.doBuffer = v;

    if (!v && this.connected && this.buffer.length) {
      if (!this.options['manualFlush']) {
        this.flushBuffer();
      }
    }
  };

  /**
   * Flushes the buffer data over the wire.
   * To be invoked manually when 'manualFlush' is set to true.
   *
   * @api public
   */

  Socket.prototype.flushBuffer = function() {
    this.transport.payload(this.buffer);
    this.buffer = [];
  };
  

  /**
   * Disconnect the established connect.
   *
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.disconnect = function () {
    if (this.connected || this.connecting) {
      if (this.open) {
        this.of('').packet({ type: 'disconnect' });
      }

      // handle disconnection immediately
      this.onDisconnect('booted');
    }

    return this;
  };

  /**
   * Disconnects the socket with a sync XHR.
   *
   * @api private
   */

  Socket.prototype.disconnectSync = function () {
    // ensure disconnection
    var xhr = io.util.request();
    var uri = [
        'http' + (this.options.secure ? 's' : '') + ':/'
      , this.options.host + ':' + this.options.port
      , this.options.resource
      , io.protocol
      , ''
      , this.sessionid
    ].join('/') + '/?disconnect=1';

    xhr.open('GET', uri, false);
    xhr.send(null);

    // handle disconnection immediately
    this.onDisconnect('booted');
  };

  /**
   * Check if we need to use cross domain enabled transports. Cross domain would
   * be a different port or different domain name.
   *
   * @returns {Boolean}
   * @api private
   */

  Socket.prototype.isXDomain = function () {

    var port = global.location.port ||
      ('https:' == global.location.protocol ? 443 : 80);

    return this.options.host !== global.location.hostname 
      || this.options.port != port;
  };

  /**
   * Called upon handshake.
   *
   * @api private
   */

  Socket.prototype.onConnect = function () {
    if (!this.connected) {
      this.connected = true;
      this.connecting = false;
      if (!this.doBuffer) {
        // make sure to flush the buffer
        this.setBuffer(false);
      }
      this.emit('connect');
    }
  };

  /**
   * Called when the transport opens
   *
   * @api private
   */

  Socket.prototype.onOpen = function () {
    this.open = true;
  };

  /**
   * Called when the transport closes.
   *
   * @api private
   */

  Socket.prototype.onClose = function () {
    this.open = false;
    clearTimeout(this.heartbeatTimeoutTimer);
  };

  /**
   * Called when the transport first opens a connection
   *
   * @param text
   */

  Socket.prototype.onPacket = function (packet) {
    this.of(packet.endpoint).onPacket(packet);
  };

  /**
   * Handles an error.
   *
   * @api private
   */

  Socket.prototype.onError = function (err) {
    if (err && err.advice) {
      if (err.advice === 'reconnect' && (this.connected || this.connecting)) {
        this.disconnect();
        if (this.options.reconnect) {
          this.reconnect();
        }
      }
    }

    this.publish('error', err && err.reason ? err.reason : err);
  };

  /**
   * Called when the transport disconnects.
   *
   * @api private
   */

  Socket.prototype.onDisconnect = function (reason) {
    var wasConnected = this.connected
      , wasConnecting = this.connecting;

    this.connected = false;
    this.connecting = false;
    this.open = false;

    if (wasConnected || wasConnecting) {
      this.transport.close();
      this.transport.clearTimeouts();
      if (wasConnected) {
        this.publish('disconnect', reason);

        if ('booted' != reason && this.options.reconnect && !this.reconnecting) {
          this.reconnect();
        }
      }
    }
  };

  /**
   * Called upon reconnection.
   *
   * @api private
   */

  Socket.prototype.reconnect = function () {
    this.reconnecting = true;
    this.reconnectionAttempts = 0;
    this.reconnectionDelay = this.options['reconnection delay'];

    var self = this
      , maxAttempts = this.options['max reconnection attempts']
      , tryMultiple = this.options['try multiple transports']
      , limit = this.options['reconnection limit'];

    function reset () {
      if (self.connected) {
        for (var i in self.namespaces) {
          if (self.namespaces.hasOwnProperty(i) && '' !== i) {
              self.namespaces[i].packet({ type: 'connect' });
          }
        }
        self.publish('reconnect', self.transport.name, self.reconnectionAttempts);
      }

      clearTimeout(self.reconnectionTimer);

      self.removeListener('connect_failed', maybeReconnect);
      self.removeListener('connect', maybeReconnect);

      self.reconnecting = false;

      delete self.reconnectionAttempts;
      delete self.reconnectionDelay;
      delete self.reconnectionTimer;
      delete self.redoTransports;

      self.options['try multiple transports'] = tryMultiple;
    };

    function maybeReconnect () {
      if (!self.reconnecting) {
        return;
      }

      if (self.connected) {
        return reset();
      };

      if (self.connecting && self.reconnecting) {
        return self.reconnectionTimer = setTimeout(maybeReconnect, 1000);
      }

      if (self.reconnectionAttempts++ >= maxAttempts) {
        if (!self.redoTransports) {
          self.on('connect_failed', maybeReconnect);
          self.options['try multiple transports'] = true;
          self.transports = self.origTransports;
          self.transport = self.getTransport();
          self.redoTransports = true;
          self.connect();
        } else {
          self.publish('reconnect_failed');
          reset();
        }
      } else {
        if (self.reconnectionDelay < limit) {
          self.reconnectionDelay *= 2; // exponential back off
        }

        self.connect();
        self.publish('reconnecting', self.reconnectionDelay, self.reconnectionAttempts);
        self.reconnectionTimer = setTimeout(maybeReconnect, self.reconnectionDelay);
      }
    };

    this.options['try multiple transports'] = false;
    this.reconnectionTimer = setTimeout(maybeReconnect, this.reconnectionDelay);

    this.on('connect', maybeReconnect);
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.SocketNamespace = SocketNamespace;

  /**
   * Socket namespace constructor.
   *
   * @constructor
   * @api public
   */

  function SocketNamespace (socket, name) {
    this.socket = socket;
    this.name = name || '';
    this.flags = {};
    this.json = new Flag(this, 'json');
    this.ackPackets = 0;
    this.acks = {};
  };

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(SocketNamespace, io.EventEmitter);

  /**
   * Copies emit since we override it
   *
   * @api private
   */

  SocketNamespace.prototype.$emit = io.EventEmitter.prototype.emit;

  /**
   * Creates a new namespace, by proxying the request to the socket. This
   * allows us to use the synax as we do on the server.
   *
   * @api public
   */

  SocketNamespace.prototype.of = function () {
    return this.socket.of.apply(this.socket, arguments);
  };

  /**
   * Sends a packet.
   *
   * @api private
   */

  SocketNamespace.prototype.packet = function (packet) {
    packet.endpoint = this.name;
    this.socket.packet(packet);
    this.flags = {};
    return this;
  };

  /**
   * Sends a message
   *
   * @api public
   */

  SocketNamespace.prototype.send = function (data, fn) {
    var packet = {
        type: this.flags.json ? 'json' : 'message'
      , data: data
    };

    if ('function' == typeof fn) {
      packet.id = ++this.ackPackets;
      packet.ack = true;
      this.acks[packet.id] = fn;
    }

    return this.packet(packet);
  };

  /**
   * Emits an event
   *
   * @api public
   */
  
  SocketNamespace.prototype.emit = function (name) {
    var args = Array.prototype.slice.call(arguments, 1)
      , lastArg = args[args.length - 1]
      , packet = {
            type: 'event'
          , name: name
        };

    if ('function' == typeof lastArg) {
      packet.id = ++this.ackPackets;
      packet.ack = 'data';
      this.acks[packet.id] = lastArg;
      args = args.slice(0, args.length - 1);
    }

    packet.args = args;

    return this.packet(packet);
  };

  /**
   * Disconnects the namespace
   *
   * @api private
   */

  SocketNamespace.prototype.disconnect = function () {
    if (this.name === '') {
      this.socket.disconnect();
    } else {
      this.packet({ type: 'disconnect' });
      this.$emit('disconnect');
    }

    return this;
  };

  /**
   * Handles a packet
   *
   * @api private
   */

  SocketNamespace.prototype.onPacket = function (packet) {
    var self = this;

    function ack () {
      self.packet({
          type: 'ack'
        , args: io.util.toArray(arguments)
        , ackId: packet.id
      });
    };

    switch (packet.type) {
      case 'connect':
        this.$emit('connect');
        break;

      case 'disconnect':
        if (this.name === '') {
          this.socket.onDisconnect(packet.reason || 'booted');
        } else {
          this.$emit('disconnect', packet.reason);
        }
        break;

      case 'message':
      case 'json':
        var params = ['message', packet.data];

        if (packet.ack == 'data') {
          params.push(ack);
        } else if (packet.ack) {
          this.packet({ type: 'ack', ackId: packet.id });
        }

        this.$emit.apply(this, params);
        break;

      case 'event':
        var params = [packet.name].concat(packet.args);

        if (packet.ack == 'data')
          params.push(ack);

        this.$emit.apply(this, params);
        break;

      case 'ack':
        if (this.acks[packet.ackId]) {
          this.acks[packet.ackId].apply(this, packet.args);
          delete this.acks[packet.ackId];
        }
        break;

      case 'error':
        if (packet.advice){
          this.socket.onError(packet);
        } else {
          if (packet.reason == 'unauthorized') {
            this.$emit('connect_failed', packet.reason);
          } else {
            this.$emit('error', packet.reason);
          }
        }
        break;
    }
  };

  /**
   * Flag interface.
   *
   * @api private
   */

  function Flag (nsp, name) {
    this.namespace = nsp;
    this.name = name;
  };

  /**
   * Send a message
   *
   * @api public
   */

  Flag.prototype.send = function () {
    this.namespace.flags[this.name] = true;
    this.namespace.send.apply(this.namespace, arguments);
  };

  /**
   * Emit an event
   *
   * @api public
   */

  Flag.prototype.emit = function () {
    this.namespace.flags[this.name] = true;
    this.namespace.emit.apply(this.namespace, arguments);
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports.websocket = WS;

  /**
   * The WebSocket transport uses the HTML5 WebSocket API to establish an
   * persistent connection with the Socket.IO server. This transport will also
   * be inherited by the FlashSocket fallback as it provides a API compatible
   * polyfill for the WebSockets.
   *
   * @constructor
   * @extends {io.Transport}
   * @api public
   */

  function WS (socket) {
    io.Transport.apply(this, arguments);
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(WS, io.Transport);

  /**
   * Transport name
   *
   * @api public
   */

  WS.prototype.name = 'websocket';

  /**
   * Initializes a new `WebSocket` connection with the Socket.IO server. We attach
   * all the appropriate listeners to handle the responses from the server.
   *
   * @returns {Transport}
   * @api public
   */

  WS.prototype.open = function () {
    var query = io.util.query(this.socket.options.query)
      , self = this
      , Socket


    if (!Socket) {
      Socket = global.MozWebSocket || global.WebSocket;
    }

    this.websocket = new Socket(this.prepareUrl() + query);

    this.websocket.onopen = function () {
      self.onOpen();
      self.socket.setBuffer(false);
    };
    this.websocket.onmessage = function (ev) {
      self.onData(ev.data);
    };
    this.websocket.onclose = function () {
      self.onClose();
      self.socket.setBuffer(true);
    };
    this.websocket.onerror = function (e) {
      self.onError(e);
    };

    return this;
  };

  /**
   * Send a message to the Socket.IO server. The message will automatically be
   * encoded in the correct message format.
   *
   * @returns {Transport}
   * @api public
   */

  // Do to a bug in the current IDevices browser, we need to wrap the send in a 
  // setTimeout, when they resume from sleeping the browser will crash if 
  // we don't allow the browser time to detect the socket has been closed
  if (io.util.ua.iDevice) {
    WS.prototype.send = function (data) {
      var self = this;
      setTimeout(function() {
         self.websocket.send(data);
      },0);
      return this;
    };
  } else {
    WS.prototype.send = function (data) {
      this.websocket.send(data);
      return this;
    };
  }

  /**
   * Payload
   *
   * @api private
   */

  WS.prototype.payload = function (arr) {
    for (var i = 0, l = arr.length; i < l; i++) {
      this.packet(arr[i]);
    }
    return this;
  };

  /**
   * Disconnect the established `WebSocket` connection.
   *
   * @returns {Transport}
   * @api public
   */

  WS.prototype.close = function () {
    this.websocket.close();
    return this;
  };

  /**
   * Handle the errors that `WebSocket` might be giving when we
   * are attempting to connect or send messages.
   *
   * @param {Error} e The error.
   * @api private
   */

  WS.prototype.onError = function (e) {
    this.socket.onError(e);
  };

  /**
   * Returns the appropriate scheme for the URI generation.
   *
   * @api private
   */
  WS.prototype.scheme = function () {
    return this.socket.options.secure ? 'wss' : 'ws';
  };

  /**
   * Checks if the browser has support for native `WebSockets` and that
   * it's not the polyfill created for the FlashSocket transport.
   *
   * @return {Boolean}
   * @api public
   */

  WS.check = function () {
    return ('WebSocket' in global && !('__addTask' in WebSocket))
          || 'MozWebSocket' in global;
  };

  /**
   * Check if the `WebSocket` transport support cross domain communications.
   *
   * @returns {Boolean}
   * @api public
   */

  WS.xdomainCheck = function () {
    return true;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('websocket');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.flashsocket = Flashsocket;

  /**
   * The FlashSocket transport. This is a API wrapper for the HTML5 WebSocket
   * specification. It uses a .swf file to communicate with the server. If you want
   * to serve the .swf file from a other server than where the Socket.IO script is
   * coming from you need to use the insecure version of the .swf. More information
   * about this can be found on the github page.
   *
   * @constructor
   * @extends {io.Transport.websocket}
   * @api public
   */

  function Flashsocket () {
    io.Transport.websocket.apply(this, arguments);
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(Flashsocket, io.Transport.websocket);

  /**
   * Transport name
   *
   * @api public
   */

  Flashsocket.prototype.name = 'flashsocket';

  /**
   * Disconnect the established `FlashSocket` connection. This is done by adding a 
   * new task to the FlashSocket. The rest will be handled off by the `WebSocket` 
   * transport.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.open = function () {
    var self = this
      , args = arguments;

    WebSocket.__addTask(function () {
      io.Transport.websocket.prototype.open.apply(self, args);
    });
    return this;
  };
  
  /**
   * Sends a message to the Socket.IO server. This is done by adding a new
   * task to the FlashSocket. The rest will be handled off by the `WebSocket` 
   * transport.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.send = function () {
    var self = this, args = arguments;
    WebSocket.__addTask(function () {
      io.Transport.websocket.prototype.send.apply(self, args);
    });
    return this;
  };

  /**
   * Disconnects the established `FlashSocket` connection.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.close = function () {
    WebSocket.__tasks.length = 0;
    io.Transport.websocket.prototype.close.call(this);
    return this;
  };

  /**
   * The WebSocket fall back needs to append the flash container to the body
   * element, so we need to make sure we have access to it. Or defer the call
   * until we are sure there is a body element.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  Flashsocket.prototype.ready = function (socket, fn) {
    function init () {
      var options = socket.options
        , port = options['flash policy port']
        , path = [
              'http' + (options.secure ? 's' : '') + ':/'
            , options.host + ':' + options.port
            , options.resource
            , 'static/flashsocket'
            , 'WebSocketMain' + (socket.isXDomain() ? 'Insecure' : '') + '.swf'
          ];

      // Only start downloading the swf file when the checked that this browser
      // actually supports it
      if (!Flashsocket.loaded) {
        if (typeof WEB_SOCKET_SWF_LOCATION === 'undefined') {
          // Set the correct file based on the XDomain settings
          WEB_SOCKET_SWF_LOCATION = path.join('/');
        }

        if (port !== 843) {
          WebSocket.loadFlashPolicyFile('xmlsocket://' + options.host + ':' + port);
        }

        WebSocket.__initialize();
        Flashsocket.loaded = true;
      }

      fn.call(self);
    }

    var self = this;
    if (document.body) return init();

    io.util.load(init);
  };

  /**
   * Check if the FlashSocket transport is supported as it requires that the Adobe
   * Flash Player plug-in version `10.0.0` or greater is installed. And also check if
   * the polyfill is correctly loaded.
   *
   * @returns {Boolean}
   * @api public
   */

  Flashsocket.check = function () {
    if (
        typeof WebSocket == 'undefined'
      || !('__initialize' in WebSocket) || !swfobject
    ) return false;

    return swfobject.getFlashPlayerVersion().major >= 10;
  };

  /**
   * Check if the FlashSocket transport can be used as cross domain / cross origin 
   * transport. Because we can't see which type (secure or insecure) of .swf is used
   * we will just return true.
   *
   * @returns {Boolean}
   * @api public
   */

  Flashsocket.xdomainCheck = function () {
    return true;
  };

  /**
   * Disable AUTO_INITIALIZATION
   */

  if (typeof window != 'undefined') {
    WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
  }

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('flashsocket');
})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
if ('undefined' != typeof window) {
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O[(['Active'].concat('Object').join('X'))]!=D){try{var ad=new window[(['Active'].concat('Object').join('X'))](W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?(['Active'].concat('').join('X')):"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();
}
// Copyright: Hiroshi Ichikawa <http://gimite.net/en/>
// License: New BSD License
// Reference: http://dev.w3.org/html5/websockets/
// Reference: http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol

(function() {
  
  if ('undefined' == typeof window || window.WebSocket) return;

  var console = window.console;
  if (!console || !console.log || !console.error) {
    console = {log: function(){ }, error: function(){ }};
  }
  
  if (!swfobject.hasFlashPlayerVersion("10.0.0")) {
    console.error("Flash Player >= 10.0.0 is required.");
    return;
  }
  if (location.protocol == "file:") {
    console.error(
      "WARNING: web-socket-js doesn't work in file:///... URL " +
      "unless you set Flash Security Settings properly. " +
      "Open the page via Web server i.e. http://...");
  }

  /**
   * This class represents a faux web socket.
   * @param {string} url
   * @param {array or string} protocols
   * @param {string} proxyHost
   * @param {int} proxyPort
   * @param {string} headers
   */
  WebSocket = function(url, protocols, proxyHost, proxyPort, headers) {
    var self = this;
    self.__id = WebSocket.__nextId++;
    WebSocket.__instances[self.__id] = self;
    self.readyState = WebSocket.CONNECTING;
    self.bufferedAmount = 0;
    self.__events = {};
    if (!protocols) {
      protocols = [];
    } else if (typeof protocols == "string") {
      protocols = [protocols];
    }
    // Uses setTimeout() to make sure __createFlash() runs after the caller sets ws.onopen etc.
    // Otherwise, when onopen fires immediately, onopen is called before it is set.
    setTimeout(function() {
      WebSocket.__addTask(function() {
        WebSocket.__flash.create(
            self.__id, url, protocols, proxyHost || null, proxyPort || 0, headers || null);
      });
    }, 0);
  };

  /**
   * Send data to the web socket.
   * @param {string} data  The data to send to the socket.
   * @return {boolean}  True for success, false for failure.
   */
  WebSocket.prototype.send = function(data) {
    if (this.readyState == WebSocket.CONNECTING) {
      throw "INVALID_STATE_ERR: Web Socket connection has not been established";
    }
    // We use encodeURIComponent() here, because FABridge doesn't work if
    // the argument includes some characters. We don't use escape() here
    // because of this:
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Functions#escape_and_unescape_Functions
    // But it looks decodeURIComponent(encodeURIComponent(s)) doesn't
    // preserve all Unicode characters either e.g. "\uffff" in Firefox.
    // Note by wtritch: Hopefully this will not be necessary using ExternalInterface.  Will require
    // additional testing.
    var result = WebSocket.__flash.send(this.__id, encodeURIComponent(data));
    if (result < 0) { // success
      return true;
    } else {
      this.bufferedAmount += result;
      return false;
    }
  };

  /**
   * Close this web socket gracefully.
   */
  WebSocket.prototype.close = function() {
    if (this.readyState == WebSocket.CLOSED || this.readyState == WebSocket.CLOSING) {
      return;
    }
    this.readyState = WebSocket.CLOSING;
    WebSocket.__flash.close(this.__id);
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {string} type
   * @param {function} listener
   * @param {boolean} useCapture
   * @return void
   */
  WebSocket.prototype.addEventListener = function(type, listener, useCapture) {
    if (!(type in this.__events)) {
      this.__events[type] = [];
    }
    this.__events[type].push(listener);
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {string} type
   * @param {function} listener
   * @param {boolean} useCapture
   * @return void
   */
  WebSocket.prototype.removeEventListener = function(type, listener, useCapture) {
    if (!(type in this.__events)) return;
    var events = this.__events[type];
    for (var i = events.length - 1; i >= 0; --i) {
      if (events[i] === listener) {
        events.splice(i, 1);
        break;
      }
    }
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {Event} event
   * @return void
   */
  WebSocket.prototype.dispatchEvent = function(event) {
    var events = this.__events[event.type] || [];
    for (var i = 0; i < events.length; ++i) {
      events[i](event);
    }
    var handler = this["on" + event.type];
    if (handler) handler(event);
  };

  /**
   * Handles an event from Flash.
   * @param {Object} flashEvent
   */
  WebSocket.prototype.__handleEvent = function(flashEvent) {
    if ("readyState" in flashEvent) {
      this.readyState = flashEvent.readyState;
    }
    if ("protocol" in flashEvent) {
      this.protocol = flashEvent.protocol;
    }
    
    var jsEvent;
    if (flashEvent.type == "open" || flashEvent.type == "error") {
      jsEvent = this.__createSimpleEvent(flashEvent.type);
    } else if (flashEvent.type == "close") {
      // TODO implement jsEvent.wasClean
      jsEvent = this.__createSimpleEvent("close");
    } else if (flashEvent.type == "message") {
      var data = decodeURIComponent(flashEvent.message);
      jsEvent = this.__createMessageEvent("message", data);
    } else {
      throw "unknown event type: " + flashEvent.type;
    }
    
    this.dispatchEvent(jsEvent);
  };
  
  WebSocket.prototype.__createSimpleEvent = function(type) {
    if (document.createEvent && window.Event) {
      var event = document.createEvent("Event");
      event.initEvent(type, false, false);
      return event;
    } else {
      return {type: type, bubbles: false, cancelable: false};
    }
  };
  
  WebSocket.prototype.__createMessageEvent = function(type, data) {
    if (document.createEvent && window.MessageEvent && !window.opera) {
      var event = document.createEvent("MessageEvent");
      event.initMessageEvent("message", false, false, data, null, null, window, null);
      return event;
    } else {
      // IE and Opera, the latter one truncates the data parameter after any 0x00 bytes.
      return {type: type, data: data, bubbles: false, cancelable: false};
    }
  };
  
  /**
   * Define the WebSocket readyState enumeration.
   */
  WebSocket.CONNECTING = 0;
  WebSocket.OPEN = 1;
  WebSocket.CLOSING = 2;
  WebSocket.CLOSED = 3;

  WebSocket.__flash = null;
  WebSocket.__instances = {};
  WebSocket.__tasks = [];
  WebSocket.__nextId = 0;
  
  /**
   * Load a new flash security policy file.
   * @param {string} url
   */
  WebSocket.loadFlashPolicyFile = function(url){
    WebSocket.__addTask(function() {
      WebSocket.__flash.loadManualPolicyFile(url);
    });
  };

  /**
   * Loads WebSocketMain.swf and creates WebSocketMain object in Flash.
   */
  WebSocket.__initialize = function() {
    if (WebSocket.__flash) return;
    
    if (WebSocket.__swfLocation) {
      // For backword compatibility.
      window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation;
    }
    if (!window.WEB_SOCKET_SWF_LOCATION) {
      console.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf");
      return;
    }
    var container = document.createElement("div");
    container.id = "webSocketContainer";
    // Hides Flash box. We cannot use display: none or visibility: hidden because it prevents
    // Flash from loading at least in IE. So we move it out of the screen at (-100, -100).
    // But this even doesn't work with Flash Lite (e.g. in Droid Incredible). So with Flash
    // Lite, we put it at (0, 0). This shows 1x1 box visible at left-top corner but this is
    // the best we can do as far as we know now.
    container.style.position = "absolute";
    if (WebSocket.__isFlashLite()) {
      container.style.left = "0px";
      container.style.top = "0px";
    } else {
      container.style.left = "-100px";
      container.style.top = "-100px";
    }
    var holder = document.createElement("div");
    holder.id = "webSocketFlash";
    container.appendChild(holder);
    document.body.appendChild(container);
    // See this article for hasPriority:
    // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
    swfobject.embedSWF(
      WEB_SOCKET_SWF_LOCATION,
      "webSocketFlash",
      "1" /* width */,
      "1" /* height */,
      "10.0.0" /* SWF version */,
      null,
      null,
      {hasPriority: true, swliveconnect : true, allowScriptAccess: "always"},
      null,
      function(e) {
        if (!e.success) {
          console.error("[WebSocket] swfobject.embedSWF failed");
        }
      });
  };
  
  /**
   * Called by Flash to notify JS that it's fully loaded and ready
   * for communication.
   */
  WebSocket.__onFlashInitialized = function() {
    // We need to set a timeout here to avoid round-trip calls
    // to flash during the initialization process.
    setTimeout(function() {
      WebSocket.__flash = document.getElementById("webSocketFlash");
      WebSocket.__flash.setCallerUrl(location.href);
      WebSocket.__flash.setDebug(!!window.WEB_SOCKET_DEBUG);
      for (var i = 0; i < WebSocket.__tasks.length; ++i) {
        WebSocket.__tasks[i]();
      }
      WebSocket.__tasks = [];
    }, 0);
  };
  
  /**
   * Called by Flash to notify WebSockets events are fired.
   */
  WebSocket.__onFlashEvent = function() {
    setTimeout(function() {
      try {
        // Gets events using receiveEvents() instead of getting it from event object
        // of Flash event. This is to make sure to keep message order.
        // It seems sometimes Flash events don't arrive in the same order as they are sent.
        var events = WebSocket.__flash.receiveEvents();
        for (var i = 0; i < events.length; ++i) {
          WebSocket.__instances[events[i].webSocketId].__handleEvent(events[i]);
        }
      } catch (e) {
        console.error(e);
      }
    }, 0);
    return true;
  };
  
  // Called by Flash.
  WebSocket.__log = function(message) {
    console.log(decodeURIComponent(message));
  };
  
  // Called by Flash.
  WebSocket.__error = function(message) {
    console.error(decodeURIComponent(message));
  };
  
  WebSocket.__addTask = function(task) {
    if (WebSocket.__flash) {
      task();
    } else {
      WebSocket.__tasks.push(task);
    }
  };
  
  /**
   * Test if the browser is running flash lite.
   * @return {boolean} True if flash lite is running, false otherwise.
   */
  WebSocket.__isFlashLite = function() {
    if (!window.navigator || !window.navigator.mimeTypes) {
      return false;
    }
    var mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
    if (!mimeType || !mimeType.enabledPlugin || !mimeType.enabledPlugin.filename) {
      return false;
    }
    return mimeType.enabledPlugin.filename.match(/flashlite/i) ? true : false;
  };
  
  if (!window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION) {
    if (window.addEventListener) {
      window.addEventListener("load", function(){
        WebSocket.__initialize();
      }, false);
    } else {
      window.attachEvent("onload", function(){
        WebSocket.__initialize();
      });
    }
  }
  
})();

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   *
   * @api public
   */

  exports.XHR = XHR;

  /**
   * XHR constructor
   *
   * @costructor
   * @api public
   */

  function XHR (socket) {
    if (!socket) return;

    io.Transport.apply(this, arguments);
    this.sendBuffer = [];
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(XHR, io.Transport);

  /**
   * Establish a connection
   *
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.open = function () {
    this.socket.setBuffer(false);
    this.onOpen();
    this.get();

    // we need to make sure the request succeeds since we have no indication
    // whether the request opened or not until it succeeded.
    this.setCloseTimeout();

    return this;
  };

  /**
   * Check if we need to send data to the Socket.IO server, if we have data in our
   * buffer we encode it and forward it to the `post` method.
   *
   * @api private
   */

  XHR.prototype.payload = function (payload) {
    var msgs = [];

    for (var i = 0, l = payload.length; i < l; i++) {
      msgs.push(io.parser.encodePacket(payload[i]));
    }

    this.send(io.parser.encodePayload(msgs));
  };

  /**
   * Send data to the Socket.IO server.
   *
   * @param data The message
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.send = function (data) {
    this.post(data);
    return this;
  };

  /**
   * Posts a encoded message to the Socket.IO server.
   *
   * @param {String} data A encoded message.
   * @api private
   */

  function empty () { };

  XHR.prototype.post = function (data) {
    var self = this;
    this.socket.setBuffer(true);

    function stateChange () {
      if (this.readyState == 4) {
        this.onreadystatechange = empty;
        self.posting = false;

        if (this.status == 200){
          self.socket.setBuffer(false);
        } else {
          self.onClose();
        }
      }
    }

    function onload () {
      this.onload = empty;
      self.socket.setBuffer(false);
    };

    this.sendXHR = this.request('POST');

    if (global.XDomainRequest && this.sendXHR instanceof XDomainRequest) {
      this.sendXHR.onload = this.sendXHR.onerror = onload;
    } else {
      this.sendXHR.onreadystatechange = stateChange;
    }

    this.sendXHR.send(data);
  };

  /**
   * Disconnects the established `XHR` connection.
   *
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.close = function () {
    this.onClose();
    return this;
  };

  /**
   * Generates a configured XHR request
   *
   * @param {String} url The url that needs to be requested.
   * @param {String} method The method the request should use.
   * @returns {XMLHttpRequest}
   * @api private
   */

  XHR.prototype.request = function (method) {
    var req = io.util.request(this.socket.isXDomain())
      , query = io.util.query(this.socket.options.query, 't=' + +new Date);

    req.open(method || 'GET', this.prepareUrl() + query, true);

    if (method == 'POST') {
      try {
        if (req.setRequestHeader) {
          req.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        } else {
          // XDomainRequest
          req.contentType = 'text/plain';
        }
      } catch (e) {}
    }

    return req;
  };

  /**
   * Returns the scheme to use for the transport URLs.
   *
   * @api private
   */

  XHR.prototype.scheme = function () {
    return this.socket.options.secure ? 'https' : 'http';
  };

  /**
   * Check if the XHR transports are supported
   *
   * @param {Boolean} xdomain Check if we support cross domain requests.
   * @returns {Boolean}
   * @api public
   */

  XHR.check = function (socket, xdomain) {
    try {
      var request = io.util.request(xdomain),
          usesXDomReq = (global.XDomainRequest && request instanceof XDomainRequest),
          socketProtocol = (socket && socket.options && socket.options.secure ? 'https:' : 'http:'),
          isXProtocol = (global.location && socketProtocol != global.location.protocol);
      if (request && !(usesXDomReq && isXProtocol)) {
        return true;
      }
    } catch(e) {}

    return false;
  };

  /**
   * Check if the XHR transport supports cross domain requests.
   *
   * @returns {Boolean}
   * @api public
   */

  XHR.xdomainCheck = function (socket) {
    return XHR.check(socket, true);
  };

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.htmlfile = HTMLFile;

  /**
   * The HTMLFile transport creates a `forever iframe` based transport
   * for Internet Explorer. Regular forever iframe implementations will 
   * continuously trigger the browsers buzy indicators. If the forever iframe
   * is created inside a `htmlfile` these indicators will not be trigged.
   *
   * @constructor
   * @extends {io.Transport.XHR}
   * @api public
   */

  function HTMLFile (socket) {
    io.Transport.XHR.apply(this, arguments);
  };

  /**
   * Inherits from XHR transport.
   */

  io.util.inherit(HTMLFile, io.Transport.XHR);

  /**
   * Transport name
   *
   * @api public
   */

  HTMLFile.prototype.name = 'htmlfile';

  /**
   * Creates a new Ac...eX `htmlfile` with a forever loading iframe
   * that can be used to listen to messages. Inside the generated
   * `htmlfile` a reference will be made to the HTMLFile transport.
   *
   * @api private
   */

  HTMLFile.prototype.get = function () {
    this.doc = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
    this.doc.open();
    this.doc.write('<html></html>');
    this.doc.close();
    this.doc.parentWindow.s = this;

    var iframeC = this.doc.createElement('div');
    iframeC.className = 'socketio';

    this.doc.body.appendChild(iframeC);
    this.iframe = this.doc.createElement('iframe');

    iframeC.appendChild(this.iframe);

    var self = this
      , query = io.util.query(this.socket.options.query, 't='+ +new Date);

    this.iframe.src = this.prepareUrl() + query;

    io.util.on(window, 'unload', function () {
      self.destroy();
    });
  };

  /**
   * The Socket.IO server will write script tags inside the forever
   * iframe, this function will be used as callback for the incoming
   * information.
   *
   * @param {String} data The message
   * @param {document} doc Reference to the context
   * @api private
   */

  HTMLFile.prototype._ = function (data, doc) {
    this.onData(data);
    try {
      var script = doc.getElementsByTagName('script')[0];
      script.parentNode.removeChild(script);
    } catch (e) { }
  };

  /**
   * Destroy the established connection, iframe and `htmlfile`.
   * And calls the `CollectGarbage` function of Internet Explorer
   * to release the memory.
   *
   * @api private
   */

  HTMLFile.prototype.destroy = function () {
    if (this.iframe){
      try {
        this.iframe.src = 'about:blank';
      } catch(e){}

      this.doc = null;
      this.iframe.parentNode.removeChild(this.iframe);
      this.iframe = null;

      CollectGarbage();
    }
  };

  /**
   * Disconnects the established connection.
   *
   * @returns {Transport} Chaining.
   * @api public
   */

  HTMLFile.prototype.close = function () {
    this.destroy();
    return io.Transport.XHR.prototype.close.call(this);
  };

  /**
   * Checks if the browser supports this transport. The browser
   * must have an `Ac...eXObject` implementation.
   *
   * @return {Boolean}
   * @api public
   */

  HTMLFile.check = function (socket) {
    if (typeof window != "undefined" && (['Active'].concat('Object').join('X')) in window){
      try {
        var a = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
        return a && io.Transport.XHR.check(socket);
      } catch(e){}
    }
    return false;
  };

  /**
   * Check if cross domain requests are supported.
   *
   * @returns {Boolean}
   * @api public
   */

  HTMLFile.xdomainCheck = function () {
    // we can probably do handling for sub-domains, we should
    // test that it's cross domain but a subdomain here
    return false;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('htmlfile');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports['xhr-polling'] = XHRPolling;

  /**
   * The XHR-polling transport uses long polling XHR requests to create a
   * "persistent" connection with the server.
   *
   * @constructor
   * @api public
   */

  function XHRPolling () {
    io.Transport.XHR.apply(this, arguments);
  };

  /**
   * Inherits from XHR transport.
   */

  io.util.inherit(XHRPolling, io.Transport.XHR);

  /**
   * Merge the properties from XHR transport
   */

  io.util.merge(XHRPolling, io.Transport.XHR);

  /**
   * Transport name
   *
   * @api public
   */

  XHRPolling.prototype.name = 'xhr-polling';

  /**
   * Indicates whether heartbeats is enabled for this transport
   *
   * @api private
   */

  XHRPolling.prototype.heartbeats = function () {
    return false;
  };

  /** 
   * Establish a connection, for iPhone and Android this will be done once the page
   * is loaded.
   *
   * @returns {Transport} Chaining.
   * @api public
   */

  XHRPolling.prototype.open = function () {
    var self = this;

    io.Transport.XHR.prototype.open.call(self);
    return false;
  };

  /**
   * Starts a XHR request to wait for incoming messages.
   *
   * @api private
   */

  function empty () {};

  XHRPolling.prototype.get = function () {
    if (!this.isOpen) return;

    var self = this;

    function stateChange () {
      if (this.readyState == 4) {
        this.onreadystatechange = empty;

        if (this.status == 200) {
          self.onData(this.responseText);
          self.get();
        } else {
          self.onClose();
        }
      }
    };

    function onload () {
      this.onload = empty;
      this.onerror = empty;
      self.retryCounter = 1;
      self.onData(this.responseText);
      self.get();
    };

    function onerror () {
      self.retryCounter ++;
      if(!self.retryCounter || self.retryCounter > 3) {
        self.onClose();  
      } else {
        self.get();
      }
    };

    this.xhr = this.request();

    if (global.XDomainRequest && this.xhr instanceof XDomainRequest) {
      this.xhr.onload = onload;
      this.xhr.onerror = onerror;
    } else {
      this.xhr.onreadystatechange = stateChange;
    }

    this.xhr.send(null);
  };

  /**
   * Handle the unclean close behavior.
   *
   * @api private
   */

  XHRPolling.prototype.onClose = function () {
    io.Transport.XHR.prototype.onClose.call(this);

    if (this.xhr) {
      this.xhr.onreadystatechange = this.xhr.onload = this.xhr.onerror = empty;
      try {
        this.xhr.abort();
      } catch(e){}
      this.xhr = null;
    }
  };

  /**
   * Webkit based browsers show a infinit spinner when you start a XHR request
   * before the browsers onload event is called so we need to defer opening of
   * the transport until the onload event is called. Wrapping the cb in our
   * defer method solve this.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  XHRPolling.prototype.ready = function (socket, fn) {
    var self = this;

    io.util.defer(function () {
      fn.call(self);
    });
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('xhr-polling');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {
  /**
   * There is a way to hide the loading indicator in Firefox. If you create and
   * remove a iframe it will stop showing the current loading indicator.
   * Unfortunately we can't feature detect that and UA sniffing is evil.
   *
   * @api private
   */

  var indicator = global.document && "MozAppearance" in
    global.document.documentElement.style;

  /**
   * Expose constructor.
   */

  exports['jsonp-polling'] = JSONPPolling;

  /**
   * The JSONP transport creates an persistent connection by dynamically
   * inserting a script tag in the page. This script tag will receive the
   * information of the Socket.IO server. When new information is received
   * it creates a new script tag for the new data stream.
   *
   * @constructor
   * @extends {io.Transport.xhr-polling}
   * @api public
   */

  function JSONPPolling (socket) {
    io.Transport['xhr-polling'].apply(this, arguments);

    this.index = io.j.length;

    var self = this;

    io.j.push(function (msg) {
      self._(msg);
    });
  };

  /**
   * Inherits from XHR polling transport.
   */

  io.util.inherit(JSONPPolling, io.Transport['xhr-polling']);

  /**
   * Transport name
   *
   * @api public
   */

  JSONPPolling.prototype.name = 'jsonp-polling';

  /**
   * Posts a encoded message to the Socket.IO server using an iframe.
   * The iframe is used because script tags can create POST based requests.
   * The iframe is positioned outside of the view so the user does not
   * notice it's existence.
   *
   * @param {String} data A encoded message.
   * @api private
   */

  JSONPPolling.prototype.post = function (data) {
    var self = this
      , query = io.util.query(
             this.socket.options.query
          , 't='+ (+new Date) + '&i=' + this.index
        );

    if (!this.form) {
      var form = document.createElement('form')
        , area = document.createElement('textarea')
        , id = this.iframeId = 'socketio_iframe_' + this.index
        , iframe;

      form.className = 'socketio';
      form.style.position = 'absolute';
      form.style.top = '0px';
      form.style.left = '0px';
      form.style.display = 'none';
      form.target = id;
      form.method = 'POST';
      form.setAttribute('accept-charset', 'utf-8');
      area.name = 'd';
      form.appendChild(area);
      document.body.appendChild(form);

      this.form = form;
      this.area = area;
    }

    this.form.action = this.prepareUrl() + query;

    function complete () {
      initIframe();
      self.socket.setBuffer(false);
    };

    function initIframe () {
      if (self.iframe) {
        self.form.removeChild(self.iframe);
      }

      try {
        // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
        iframe = document.createElement('<iframe name="'+ self.iframeId +'">');
      } catch (e) {
        iframe = document.createElement('iframe');
        iframe.name = self.iframeId;
      }

      iframe.id = self.iframeId;

      self.form.appendChild(iframe);
      self.iframe = iframe;
    };

    initIframe();

    // we temporarily stringify until we figure out how to prevent
    // browsers from turning `\n` into `\r\n` in form inputs
    this.area.value = io.JSON.stringify(data);

    try {
      this.form.submit();
    } catch(e) {}

    if (this.iframe.attachEvent) {
      iframe.onreadystatechange = function () {
        if (self.iframe.readyState == 'complete') {
          complete();
        }
      };
    } else {
      this.iframe.onload = complete;
    }

    this.socket.setBuffer(true);
  };

  /**
   * Creates a new JSONP poll that can be used to listen
   * for messages from the Socket.IO server.
   *
   * @api private
   */

  JSONPPolling.prototype.get = function () {
    var self = this
      , script = document.createElement('script')
      , query = io.util.query(
             this.socket.options.query
          , 't='+ (+new Date) + '&i=' + this.index
        );

    if (this.script) {
      this.script.parentNode.removeChild(this.script);
      this.script = null;
    }

    script.async = true;
    script.src = this.prepareUrl() + query;
    script.onerror = function () {
      self.onClose();
    };

    var insertAt = document.getElementsByTagName('script')[0];
    insertAt.parentNode.insertBefore(script, insertAt);
    this.script = script;

    if (indicator) {
      setTimeout(function () {
        var iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        document.body.removeChild(iframe);
      }, 100);
    }
  };

  /**
   * Callback function for the incoming message stream from the Socket.IO server.
   *
   * @param {String} data The message
   * @api private
   */

  JSONPPolling.prototype._ = function (msg) {
    this.onData(msg);
    if (this.isOpen) {
      this.get();
    }
    return this;
  };

  /**
   * The indicator hack only works after onload
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  JSONPPolling.prototype.ready = function (socket, fn) {
    var self = this;
    if (!indicator) return fn.call(this);

    io.util.load(function () {
      fn.call(self);
    });
  };

  /**
   * Checks if browser supports this transport.
   *
   * @return {Boolean}
   * @api public
   */

  JSONPPolling.check = function () {
    return 'document' in global;
  };

  /**
   * Check if cross domain requests are supported
   *
   * @returns {Boolean}
   * @api public
   */

  JSONPPolling.xdomainCheck = function () {
    return true;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('jsonp-polling');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

if (typeof define === "function" && define.amd) {
  define([], function () { return io; });
}
})();
})()
},{}],6:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
var css, css_tools, html_scope, html_tools, pair_elems, resolve, single_elems,
  __slice = [].slice;

html_scope = {};

pair_elems = "head title body script  div nav header footer section article  p span textarea br pre code a address b backquote  button font frame form hr i  ul li ol table tr td th title  canvas audio video select style".split(/\s+/);

single_elems = "img meta input link iframe audio video".split(/\s+/);

html_tools = {
  attrs: function(obj) {
    var attrs, key, value;

    attrs = "";
    for (key in obj) {
      value = obj[key];
      attrs += " " + key + "='" + value + "'";
    }
    return attrs;
  },
  text: function(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\s/g, "&nbsp;");
  }
};

resolve = function(list) {
  var elem, obj;

  obj = {};
  elem = [];
  list.forEach(function(item) {
    var key, that, value, _i, _len, _results, _results1;

    if (item != null) {
      if (item.__proto__ === Object.prototype) {
        _results = [];
        for (key in item) {
          value = item[key];
          _results.push(obj[key] = value);
        }
        return _results;
      } else if (item.__proto__ === Array.prototype) {
        _results1 = [];
        for (_i = 0, _len = item.length; _i < _len; _i++) {
          that = item[_i];
          _results1.push(elem.push(that));
        }
        return _results1;
      } else {
        return elem.push(item);
      }
    }
  });
  return [obj, elem];
};

pair_elems.map(function(tag) {
  return html_scope[tag] = function() {
    var list, obj, _ref;

    list = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _ref = resolve(list), obj = _ref[0], list = _ref[1];
    return "<" + tag + (html_tools.attrs(obj)) + ">" + (list.join("")) + "</" + tag + ">";
  };
});

single_elems.map(function(tag) {
  return html_scope[tag] = function(obj) {
    if (obj == null) {
      obj = {};
    }
    return "<" + tag + (html_tools.attrs(obj)) + "/>";
  };
});

html_scope.html = function(string) {
  return string;
};

html_scope.text = html_tools.text;

css_tools = {
  template: function(base, selector, declaration) {
    return "" + base + " " + selector + "{\n" + declaration + "\n}\n";
  },
  utils: {
    hsl: function(h, s, l) {
      return "hsl(" + h + ", " + s + "%, " + l + "%)";
    },
    hsla: function(h, s, l, a) {
      return "hsl(" + h + ", " + s + "%, " + l + "%, " + a + ")";
    }
  },
  type: function(value) {
    var match, string;

    match = Object.prototype.toString.call(value).match(/\s\w+/);
    string = match[0].slice(1);
    return string.toLowerCase();
  },
  pretty: function(char) {
    if (char.match(/^[A-Z]$/) != null) {
      return "-" + char.toLowerCase();
    } else {
      return char;
    }
  }
};

css = function(generator) {
  var data, style, write_rule;

  style = "";
  css_tools.utils.generator = generator;
  data = css_tools.utils.generator();
  write_rule = function(base, data) {
    var attribute, declaration, nest_selector, nested, plain, rule, selector, value, values, _i, _len, _results;

    nested = {};
    for (selector in data) {
      declaration = data[selector];
      plain = [];
      for (attribute in declaration) {
        value = declaration[attribute];
        if ((css_tools.type(value)) === "object") {
          nest_selector = "" + base + " " + selector;
          if (nested[nest_selector] == null) {
            nested[nest_selector] = {};
          }
          nested[nest_selector][attribute] = value;
        } else {
          attribute = attribute.split("").map(css_tools.pretty).join("");
          if ((css_tools.type(value)) === "number") {
            value = "" + value + "px";
          }
          if ((css_tools.type(value)) === "array") {
            values = value;
            for (_i = 0, _len = values.length; _i < _len; _i++) {
              value = values[_i];
              plain.push("  " + attribute + ": " + value + ";");
            }
          } else {
            plain.push("  " + attribute + ": " + value + ";");
          }
        }
      }
      if (plain.length > 0) {
        declaration = plain.join("\n");
        rule = css_tools.template(base, selector, declaration);
        style += rule.trimLeft();
      }
    }
    if ((Object.keys(nested)).length > 0) {
      _results = [];
      for (base in nested) {
        data = nested[base];
        _results.push(write_rule(base, data));
      }
      return _results;
    }
  };
  write_rule("", data);
  return style;
};

exports.html = function(generator) {
  return generator.call(html_scope);
};

exports.css = function(data) {
  return css(data);
};

},{}],3:[function(require,module,exports){
(function() {
  var cache_name, cache_time, dateformat, html, q, time;

  dateformat = require('dateformat');

  time = function() {
    var now;

    now = new Date();
    return dateformat(now, 'mmmm dS, h:MM');
  };

  html = require('lilyturf').html;

  q = exports.q = function(query) {
    return document.querySelector(query);
  };

  cache_name = '';

  cache_time = '';

  exports.update = function(data) {
    var post_html, the_name, the_time;

    if (q("#id" + data.stamp) != null) {
      q("#id" + data.stamp).querySelector('.text').innerText = data.text;
      if (data.finish != null) {
        return q("#id" + data.stamp).classList.add('finish');
      }
    } else {
      the_time = time();
      if (the_time === cache_time) {
        the_time = '';
      } else {
        cache_time = the_time;
      }
      if (data.name === cache_name) {
        the_name = '';
      } else {
        cache_name = data.name;
        the_name = cache_name;
      }
      post_html = html(function() {
        return this.div({
          "class": 'post',
          id: "id" + data.stamp
        }, this.span({
          "class": 'name'
        }, this.text(the_name)), this.span({
          "class": 'text'
        }, this.text(data.text)), this.span({
          "class": 'time'
        }, this.text(the_time)));
      });
      q('#list').insertAdjacentHTML('beforeend', post_html);
      return q("#id" + data.stamp).scrollIntoView();
    }
  };

}).call(this);


},{"lilyturf":6,"dateformat":7}],7:[function(require,module,exports){
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		},
    /**
     * Get the ISO 8601 week number
     * Based on comments from
     * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
     */
    getWeek = function (date) {
      // Remove time components of date
      var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      // Change date to Thursday same week
      targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);

      // Take January 4th as it is always in week 1 (see ISO 8601)
      var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

      // Change date to Thursday same week
      firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

      // Check if daylight-saving-time-switch occured and correct for it
      var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
      targetThursday.setHours(targetThursday.getHours() - ds);

      // Number of weeks between target Thursday and first Thursday
      var weekDiff = (targetThursday - firstThursday) / (86400000*7);
      return 1 + weekDiff;
    },

    /**
     * Get ISO-8601 numeric representation of the day of the week
     * 1 (for Monday) through 7 (for Sunday)
     */

    getDayOfWeek = function(date){
    	var dow = date.getDay();
    	if(dow === 0) dow = 7;
    	return dow;
    };

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		date = date || new Date;

    if(!(date instanceof Date)) {
      date = new Date(date);
    }

    if (isNaN(date)) {
      throw TypeError("Invalid date");
    }

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			W = getWeek(date),
			N = getDayOfWeek(date),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
				W:    W,
				N:    N
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
	expiresHeaderFormat: "ddd, dd mmm yyyy HH:MM:ss Z"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

/*
// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};
*/

if (typeof exports !== "undefined") {
  module.exports = dateFormat;
}

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvb3B0L3Mvc2ltcGxlLWNoYXQvY29mZmVlL2xvYWQuY29mZmVlIiwiL29wdC9zL3NpbXBsZS1jaGF0L2NvZmZlZS9tYWluLmNvZmZlZSIsIi9vcHQvcy9zaW1wbGUtY2hhdC9jb2ZmZWUvd3MuY29mZmVlIiwiL29wdC9zL3NpbXBsZS1jaGF0L25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2Rpc3Qvc29ja2V0LmlvLmpzIiwiL29wdC9zL3NpbXBsZS1jaGF0L25vZGVfbW9kdWxlcy9saWx5dHVyZi9saWx5dHVyZi5qcyIsIi9vcHQvcy9zaW1wbGUtY2hhdC9jb2ZmZWUvZG9tLmNvZmZlZSIsIi9vcHQvcy9zaW1wbGUtY2hhdC9ub2RlX21vZHVsZXMvZGF0ZWZvcm1hdC9saWIvZGF0ZWZvcm1hdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBO0NBQUEsQ0FBQSxDQUFnQixHQUFWLEdBQVU7Q0FDTixNQUFSLElBQUEsSUFBQTtDQURGLEVBQWdCO0NBQWhCOzs7OztBQ0NBO0NBQUEsS0FBQSxvQ0FBQTs7Q0FBQSxDQUFBLENBQUEsSUFBTSxPQUFBOztDQUFOLENBQ0EsQ0FBSTs7Q0FESixDQUVBLENBQUssSUFBQSxNQUFBOztDQUZMLENBTUEsQ0FBVyxLQUFYLENBQVc7QUFBSSxDQUFBLEVBQUEsQ0FBRCxHQUFBLElBQUE7Q0FOZCxFQU1XOztDQU5YLENBT0EsQ0FBUSxFQUFSLEdBQVE7O0NBUFIsQ0FRQSxDQUFPLENBQVAsRUFBTyxDQUFBLElBUlAsQ0FRbUI7O0NBUm5CLENBWUEsQ0FBVSxFQUFBLEVBQVYsRUFBVztDQUNULE9BQUEsRUFBQTs7Q0FBQSxFQUFPLENBQVAsQ0FBeUIsR0FBbEIsS0FBUDtDQUFBLEVBRU8sQ0FBUDtDQUFPLENBQUMsRUFBRCxFQUFDO0NBQUQsQ0FBTyxHQUFQLENBQU87Q0FBUCxDQUFjLEVBQWQsRUFBYztDQUZyQixLQUFBO0NBSUEsQ0FBYyxFQUFkLENBQW9CLEVBQUwsUUFBWjtDQUNELENBQUEsQ0FBb0IsRUFBcEIsQ0FBQSxFQUFBO0NBQUEsRUFDUSxFQUFSLENBQUEsRUFBUTtDQURSLEVBRWMsQ0FBVixFQUFKO01BUEY7Q0FTRyxDQUFELEVBQUYsRUFBQSxLQUFBO0NBdEJGLEVBWVU7O0NBWlYsQ0F3QkEsR0FBQSxHQUFBOztDQXhCQSxDQXlCQSxDQUFzQixJQUF0QixDQUFBOztDQXpCQSxDQTBCQSxDQUFzQixJQUF0QixDQUFBOztDQUlBLENBQUEsRUFBRyxRQUFIO0NBQ0UsRUFBbUIsQ0FBbkIsQ0FBQSxFQUFBO0lBL0JGOztDQUFBLENBZ0NBLENBQW9CLEdBQXBCLENBQUEsRUFBb0I7Q0FDbEIsRUFBTyxDQUFQLENBQUE7Q0FDYSxDQUFnQixFQUE3QixFQUFBLENBQUEsSUFBQSxDQUFZO0NBbENkLEVBZ0NvQjs7Q0FoQ3BCLENBc0NBLENBQWMsQ0FBQSxFQUFkLEdBQWU7Q0FBYSxFQUFELENBQUgsRUFBQSxLQUFBO0NBQXhCLEVBQWM7Q0F0Q2Q7Ozs7O0FDREE7Q0FBQSxLQUFBOztDQUFBLENBQUEsQ0FBSyxJQUFBLFdBQUE7O0NBQUwsQ0FFQSxDQUFLLElBQU8sbUJBQU07Q0FGbEI7Ozs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy94SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM1S0E7Q0FBQSxLQUFBLDJDQUFBOztDQUFBLENBQUEsQ0FBYSxJQUFBLEdBQWIsRUFBYTs7Q0FBYixDQUNBLENBQU8sQ0FBUCxLQUFPO0NBQ0wsRUFBQSxLQUFBOztDQUFBLEVBQUEsQ0FBQTtDQUNXLENBQUssQ0FBaEIsT0FBQSxDQUFBLElBQUE7Q0FIRixFQUNPOztDQURQLENBS0EsQ0FBTyxDQUFQLEdBQU8sR0FBQTs7Q0FMUCxDQU9BLENBQUksRUFBWSxFQUFMLEVBQU07Q0FBbUIsSUFBVCxHQUFRLEdBQVIsRUFBQTtDQVAzQixFQU9nQjs7Q0FQaEIsQ0FXQSxDQUFhLE9BQWI7O0NBWEEsQ0FZQSxDQUFhLE9BQWI7O0NBWkEsQ0FjQSxDQUFpQixDQUFBLEVBQWpCLENBQU8sRUFBVztDQUNoQixPQUFBLHFCQUFBOztDQUFBLEdBQUEseUJBQUE7Q0FDRSxFQUFPLENBQUksQ0FBUixDQUFILENBQUEsRUFBQSxJQUFBO0NBQ0EsR0FBRyxFQUFILGFBQUE7Q0FDRSxFQUFPLENBQUksQ0FBUixHQUFILENBQStCLE1BQS9CO1FBSEo7TUFBQTtDQUtFLEVBQVcsQ0FBQSxFQUFYLEVBQUE7Q0FDQSxHQUFHLENBQVksQ0FBZixFQUFHLEVBQUg7Q0FDRSxDQUFBLENBQVcsS0FBWDtNQURGLEVBQUE7Q0FHRSxFQUFhLEtBQWIsRUFBQTtRQUpGO0NBTUEsR0FBRyxDQUFhLENBQWhCLElBQUE7Q0FDRSxDQUFBLENBQVcsS0FBWDtNQURGLEVBQUE7Q0FHRSxFQUFhLENBQUksSUFBakIsRUFBQTtDQUFBLEVBQ1csS0FBWCxFQURBO1FBVEY7Q0FBQSxFQVlZLENBQUEsRUFBWixHQUFBO0NBQ0csRUFBRCxDQUFDLFdBQUQ7Q0FBSyxDQUFPLElBQVAsQ0FBQSxHQUFBO0NBQUEsQ0FBZSxDQUFRLENBQUgsQ0FBcEIsS0FBZTtDQUNqQixDQUFELEVBQUMsTUFESDtDQUNRLENBQU8sSUFBUCxDQUFBLEdBQUE7Q0FDSCxDQUFELEVBQUMsSUFBRCxFQURGO0NBRU0sQ0FBTyxJQUFQLENBQUEsR0FBQTtDQUNILENBQUQsRUFBQyxNQURIO0NBRU0sQ0FBTyxJQUFQLENBQUEsR0FBQTtDQUNILENBQUQsRUFBQyxJQUFELEVBREY7Q0FOUSxNQUFLO0NBWmpCLENBcUIyQyxJQUEzQyxDQUFBLEVBQUEsRUFBQSxPQUFBO0NBRUEsRUFBTyxDQUFJLENBQVIsUUFBSCxDQUFBO01BN0JhO0NBZGpCLEVBY2lCO0NBZGpCOzs7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiXG53aW5kb3cub25sb2FkID0gLT5cbiAgcmVxdWlyZSAnLi9tYWluLmNvZmZlZSciLCJcblxuZG9tID0gcmVxdWlyZSgnLi9kb20uY29mZmVlJylcbnEgPSBkb20ucVxud3MgPSByZXF1aXJlKCcuL3dzLmNvZmZlZScpLndzXG5cbiMgdGltZSBmdW5jdGlvbnNcblxubmV3X3RpbWUgPSAtPiAobmV3IERhdGUpLmdldFRpbWUoKVxuc3RhbXAgPSBuZXdfdGltZSgpXG5uYW1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ25hbWUnKSBvciAnYW5vbnltb3VzJyAjIC0tIVxuXG4jIHdhdGNoXG5cbm1vbml0b3IgPSAoZXZlbnQpIC0+XG4gIHRleHQgPSBxKCcjaW5wdXQnKS52YWx1ZVsuLjYwXVxuXG4gIGRhdGEgPSB7dGV4dCwgc3RhbXAsIG5hbWV9XG5cbiAgaWYgZXZlbnQ/IGFuZCAoZXZlbnQua2V5Q29kZSBpcyAxMylcbiAgICBxKCcjaW5wdXQnKS52YWx1ZSA9ICcnXG4gICAgc3RhbXAgPSBuZXdfdGltZSgpXG4gICAgZGF0YS5maW5pc2ggPSB5ZXNcblxuICB3cy5lbWl0ICdwb3N0JywgZGF0YVxuXG5xKCcjaW5wdXQnKS5mb2N1cygpXG5xKCcjaW5wdXQnKS5vbmlucHV0ID0gbW9uaXRvclxucSgnI2lucHV0Jykub25rZXl1cCA9IG1vbml0b3JcblxuIyBuYW1lXG5cbmlmIG5hbWU/XG4gIHEoJyNuYW1lJykudmFsdWUgPSBuYW1lXG5xKCcjbmFtZScpLm9uYmx1ciA9IC0+XG4gIG5hbWUgPSBAdmFsdWVcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0gJ25hbWUnLCBuYW1lXG5cbiMgcmVjaXZlIG1lc3NhZ2VzXG5cbndzLm9uICdwb3N0JywgKGRhdGEpIC0+IGRvbS51cGRhdGUgZGF0YSIsIlxuaW8gPSByZXF1aXJlICdzb2NrZXQuaW8tY2xpZW50J1xuXG53cyA9IGV4cG9ydHMud3MgPSBpby5jb25uZWN0ICdodHRwOi8vMTkyLjE2OC4xLjQ2OjMwMDAnIiwiKGZ1bmN0aW9uKCl7LyohIFNvY2tldC5JTy5qcyBidWlsZDowLjkuMTEsIGRldmVsb3BtZW50LiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+IE1JVCBMaWNlbnNlZCAqL1xuXG52YXIgaW8gPSAoJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiBtb2R1bGUgPyB7fSA6IG1vZHVsZS5leHBvcnRzKTtcbihmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgZ2xvYmFsKSB7XG5cbiAgLyoqXG4gICAqIElPIG5hbWVzcGFjZS5cbiAgICpcbiAgICogQG5hbWVzcGFjZVxuICAgKi9cblxuICB2YXIgaW8gPSBleHBvcnRzO1xuXG4gIC8qKlxuICAgKiBTb2NrZXQuSU8gdmVyc2lvblxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBpby52ZXJzaW9uID0gJzAuOS4xMSc7XG5cbiAgLyoqXG4gICAqIFByb3RvY29sIGltcGxlbWVudGVkLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBpby5wcm90b2NvbCA9IDE7XG5cbiAgLyoqXG4gICAqIEF2YWlsYWJsZSB0cmFuc3BvcnRzLCB0aGVzZSB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIHRoZSBhdmFpbGFibGUgdHJhbnNwb3J0c1xuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBpby50cmFuc3BvcnRzID0gW107XG5cbiAgLyoqXG4gICAqIEtlZXAgdHJhY2sgb2YganNvbnAgY2FsbGJhY2tzLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgaW8uaiA9IFtdO1xuXG4gIC8qKlxuICAgKiBLZWVwIHRyYWNrIG9mIG91ciBpby5Tb2NrZXRzXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgaW8uc29ja2V0cyA9IHt9O1xuXG5cbiAgLyoqXG4gICAqIE1hbmFnZXMgY29ubmVjdGlvbnMgdG8gaG9zdHMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB1cmlcbiAgICogQFBhcmFtIHtCb29sZWFufSBmb3JjZSBjcmVhdGlvbiBvZiBuZXcgc29ja2V0IChkZWZhdWx0cyB0byBmYWxzZSlcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgaW8uY29ubmVjdCA9IGZ1bmN0aW9uIChob3N0LCBkZXRhaWxzKSB7XG4gICAgdmFyIHVyaSA9IGlvLnV0aWwucGFyc2VVcmkoaG9zdClcbiAgICAgICwgdXVyaVxuICAgICAgLCBzb2NrZXQ7XG5cbiAgICBpZiAoZ2xvYmFsICYmIGdsb2JhbC5sb2NhdGlvbikge1xuICAgICAgdXJpLnByb3RvY29sID0gdXJpLnByb3RvY29sIHx8IGdsb2JhbC5sb2NhdGlvbi5wcm90b2NvbC5zbGljZSgwLCAtMSk7XG4gICAgICB1cmkuaG9zdCA9IHVyaS5ob3N0IHx8IChnbG9iYWwuZG9jdW1lbnRcbiAgICAgICAgPyBnbG9iYWwuZG9jdW1lbnQuZG9tYWluIDogZ2xvYmFsLmxvY2F0aW9uLmhvc3RuYW1lKTtcbiAgICAgIHVyaS5wb3J0ID0gdXJpLnBvcnQgfHwgZ2xvYmFsLmxvY2F0aW9uLnBvcnQ7XG4gICAgfVxuXG4gICAgdXVyaSA9IGlvLnV0aWwudW5pcXVlVXJpKHVyaSk7XG5cbiAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgaG9zdDogdXJpLmhvc3RcbiAgICAgICwgc2VjdXJlOiAnaHR0cHMnID09IHVyaS5wcm90b2NvbFxuICAgICAgLCBwb3J0OiB1cmkucG9ydCB8fCAoJ2h0dHBzJyA9PSB1cmkucHJvdG9jb2wgPyA0NDMgOiA4MClcbiAgICAgICwgcXVlcnk6IHVyaS5xdWVyeSB8fCAnJ1xuICAgIH07XG5cbiAgICBpby51dGlsLm1lcmdlKG9wdGlvbnMsIGRldGFpbHMpO1xuXG4gICAgaWYgKG9wdGlvbnNbJ2ZvcmNlIG5ldyBjb25uZWN0aW9uJ10gfHwgIWlvLnNvY2tldHNbdXVyaV0pIHtcbiAgICAgIHNvY2tldCA9IG5ldyBpby5Tb2NrZXQob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgaWYgKCFvcHRpb25zWydmb3JjZSBuZXcgY29ubmVjdGlvbiddICYmIHNvY2tldCkge1xuICAgICAgaW8uc29ja2V0c1t1dXJpXSA9IHNvY2tldDtcbiAgICB9XG5cbiAgICBzb2NrZXQgPSBzb2NrZXQgfHwgaW8uc29ja2V0c1t1dXJpXTtcblxuICAgIC8vIGlmIHBhdGggaXMgZGlmZmVyZW50IGZyb20gJycgb3IgL1xuICAgIHJldHVybiBzb2NrZXQub2YodXJpLnBhdGgubGVuZ3RoID4gMSA/IHVyaS5wYXRoIDogJycpO1xuICB9O1xuXG59KSgnb2JqZWN0JyA9PT0gdHlwZW9mIG1vZHVsZSA/IG1vZHVsZS5leHBvcnRzIDogKHRoaXMuaW8gPSB7fSksIHRoaXMpO1xuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgZ2xvYmFsKSB7XG5cbiAgLyoqXG4gICAqIFV0aWxpdGllcyBuYW1lc3BhY2UuXG4gICAqXG4gICAqIEBuYW1lc3BhY2VcbiAgICovXG5cbiAgdmFyIHV0aWwgPSBleHBvcnRzLnV0aWwgPSB7fTtcblxuICAvKipcbiAgICogUGFyc2VzIGFuIFVSSVxuICAgKlxuICAgKiBAYXV0aG9yIFN0ZXZlbiBMZXZpdGhhbiA8c3RldmVubGV2aXRoYW4uY29tPiAoTUlUIGxpY2Vuc2UpXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHZhciByZSA9IC9eKD86KD8hW146QF0rOlteOkBcXC9dKkApKFteOlxcLz8jLl0rKTopPyg/OlxcL1xcLyk/KCg/OigoW146QF0qKSg/OjooW146QF0qKSk/KT9AKT8oW146XFwvPyNdKikoPzo6KFxcZCopKT8pKCgoXFwvKD86W14/I10oPyFbXj8jXFwvXSpcXC5bXj8jXFwvLl0rKD86Wz8jXXwkKSkpKlxcLz8pPyhbXj8jXFwvXSopKSg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8pLztcblxuICB2YXIgcGFydHMgPSBbJ3NvdXJjZScsICdwcm90b2NvbCcsICdhdXRob3JpdHknLCAndXNlckluZm8nLCAndXNlcicsICdwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAnaG9zdCcsICdwb3J0JywgJ3JlbGF0aXZlJywgJ3BhdGgnLCAnZGlyZWN0b3J5JywgJ2ZpbGUnLCAncXVlcnknLFxuICAgICAgICAgICAgICAgJ2FuY2hvciddO1xuXG4gIHV0aWwucGFyc2VVcmkgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgdmFyIG0gPSByZS5leGVjKHN0ciB8fCAnJylcbiAgICAgICwgdXJpID0ge31cbiAgICAgICwgaSA9IDE0O1xuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdXJpW3BhcnRzW2ldXSA9IG1baV0gfHwgJyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVyaTtcbiAgfTtcblxuICAvKipcbiAgICogUHJvZHVjZXMgYSB1bmlxdWUgdXJsIHRoYXQgaWRlbnRpZmllcyBhIFNvY2tldC5JTyBjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gdXJpXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwudW5pcXVlVXJpID0gZnVuY3Rpb24gKHVyaSkge1xuICAgIHZhciBwcm90b2NvbCA9IHVyaS5wcm90b2NvbFxuICAgICAgLCBob3N0ID0gdXJpLmhvc3RcbiAgICAgICwgcG9ydCA9IHVyaS5wb3J0O1xuXG4gICAgaWYgKCdkb2N1bWVudCcgaW4gZ2xvYmFsKSB7XG4gICAgICBob3N0ID0gaG9zdCB8fCBkb2N1bWVudC5kb21haW47XG4gICAgICBwb3J0ID0gcG9ydCB8fCAocHJvdG9jb2wgPT0gJ2h0dHBzJ1xuICAgICAgICAmJiBkb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbCAhPT0gJ2h0dHBzOicgPyA0NDMgOiBkb2N1bWVudC5sb2NhdGlvbi5wb3J0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaG9zdCA9IGhvc3QgfHwgJ2xvY2FsaG9zdCc7XG5cbiAgICAgIGlmICghcG9ydCAmJiBwcm90b2NvbCA9PSAnaHR0cHMnKSB7XG4gICAgICAgIHBvcnQgPSA0NDM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIChwcm90b2NvbCB8fCAnaHR0cCcpICsgJzovLycgKyBob3N0ICsgJzonICsgKHBvcnQgfHwgODApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBNZXJnZXN0IDIgcXVlcnkgc3RyaW5ncyBpbiB0byBvbmNlIHVuaXF1ZSBxdWVyeSBzdHJpbmdcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGJhc2VcbiAgICogQHBhcmFtIHtTdHJpbmd9IGFkZGl0aW9uXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwucXVlcnkgPSBmdW5jdGlvbiAoYmFzZSwgYWRkaXRpb24pIHtcbiAgICB2YXIgcXVlcnkgPSB1dGlsLmNodW5rUXVlcnkoYmFzZSB8fCAnJylcbiAgICAgICwgY29tcG9uZW50cyA9IFtdO1xuXG4gICAgdXRpbC5tZXJnZShxdWVyeSwgdXRpbC5jaHVua1F1ZXJ5KGFkZGl0aW9uIHx8ICcnKSk7XG4gICAgZm9yICh2YXIgcGFydCBpbiBxdWVyeSkge1xuICAgICAgaWYgKHF1ZXJ5Lmhhc093blByb3BlcnR5KHBhcnQpKSB7XG4gICAgICAgIGNvbXBvbmVudHMucHVzaChwYXJ0ICsgJz0nICsgcXVlcnlbcGFydF0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb21wb25lbnRzLmxlbmd0aCA/ICc/JyArIGNvbXBvbmVudHMuam9pbignJicpIDogJyc7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybXMgYSBxdWVyeXN0cmluZyBpbiB0byBhbiBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHFzXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwuY2h1bmtRdWVyeSA9IGZ1bmN0aW9uIChxcykge1xuICAgIHZhciBxdWVyeSA9IHt9XG4gICAgICAsIHBhcmFtcyA9IHFzLnNwbGl0KCcmJylcbiAgICAgICwgaSA9IDBcbiAgICAgICwgbCA9IHBhcmFtcy5sZW5ndGhcbiAgICAgICwga3Y7XG5cbiAgICBmb3IgKDsgaSA8IGw7ICsraSkge1xuICAgICAga3YgPSBwYXJhbXNbaV0uc3BsaXQoJz0nKTtcbiAgICAgIGlmIChrdlswXSkge1xuICAgICAgICBxdWVyeVtrdlswXV0gPSBrdlsxXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcXVlcnk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIHRoZSBnaXZlbiBmdW5jdGlvbiB3aGVuIHRoZSBwYWdlIGlzIGxvYWRlZC5cbiAgICpcbiAgICogICAgIGlvLnV0aWwubG9hZChmdW5jdGlvbiAoKSB7IGNvbnNvbGUubG9nKCdwYWdlIGxvYWRlZCcpOyB9KTtcbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdmFyIHBhZ2VMb2FkZWQgPSBmYWxzZTtcblxuICB1dGlsLmxvYWQgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICBpZiAoJ2RvY3VtZW50JyBpbiBnbG9iYWwgJiYgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyB8fCBwYWdlTG9hZGVkKSB7XG4gICAgICByZXR1cm4gZm4oKTtcbiAgICB9XG5cbiAgICB1dGlsLm9uKGdsb2JhbCwgJ2xvYWQnLCBmbiwgZmFsc2UpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGV2ZW50LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgdXRpbC5vbiA9IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudCwgZm4sIGNhcHR1cmUpIHtcbiAgICBpZiAoZWxlbWVudC5hdHRhY2hFdmVudCkge1xuICAgICAgZWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnQsIGZuKTtcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBmbiwgY2FwdHVyZSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgdGhlIGNvcnJlY3QgYFhNTEh0dHBSZXF1ZXN0YCBmb3IgcmVndWxhciBhbmQgY3Jvc3MgZG9tYWluIHJlcXVlc3RzLlxuICAgKlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFt4ZG9tYWluXSBDcmVhdGUgYSByZXF1ZXN0IHRoYXQgY2FuIGJlIHVzZWQgY3Jvc3MgZG9tYWluLlxuICAgKiBAcmV0dXJucyB7WE1MSHR0cFJlcXVlc3R8ZmFsc2V9IElmIHdlIGNhbiBjcmVhdGUgYSBYTUxIdHRwUmVxdWVzdC5cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHV0aWwucmVxdWVzdCA9IGZ1bmN0aW9uICh4ZG9tYWluKSB7XG5cbiAgICBpZiAoeGRvbWFpbiAmJiAndW5kZWZpbmVkJyAhPSB0eXBlb2YgWERvbWFpblJlcXVlc3QgJiYgIXV0aWwudWEuaGFzQ09SUykge1xuICAgICAgcmV0dXJuIG5ldyBYRG9tYWluUmVxdWVzdCgpO1xuICAgIH1cblxuICAgIGlmICgndW5kZWZpbmVkJyAhPSB0eXBlb2YgWE1MSHR0cFJlcXVlc3QgJiYgKCF4ZG9tYWluIHx8IHV0aWwudWEuaGFzQ09SUykpIHtcbiAgICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB9XG5cbiAgICBpZiAoIXhkb21haW4pIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBuZXcgd2luZG93WyhbJ0FjdGl2ZSddLmNvbmNhdCgnT2JqZWN0Jykuam9pbignWCcpKV0oJ01pY3Jvc29mdC5YTUxIVFRQJyk7XG4gICAgICB9IGNhdGNoKGUpIHsgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIC8qKlxuICAgKiBYSFIgYmFzZWQgdHJhbnNwb3J0IGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgaW50ZXJuYWwgcGFnZUxvYWRlZCB2YWx1ZS5cbiAgICovXG5cbiAgaWYgKCd1bmRlZmluZWQnICE9IHR5cGVvZiB3aW5kb3cpIHtcbiAgICB1dGlsLmxvYWQoZnVuY3Rpb24gKCkge1xuICAgICAgcGFnZUxvYWRlZCA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVmZXJzIGEgZnVuY3Rpb24gdG8gZW5zdXJlIGEgc3Bpbm5lciBpcyBub3QgZGlzcGxheWVkIGJ5IHRoZSBicm93c2VyXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwuZGVmZXIgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICBpZiAoIXV0aWwudWEud2Via2l0IHx8ICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbXBvcnRTY3JpcHRzKSB7XG4gICAgICByZXR1cm4gZm4oKTtcbiAgICB9XG5cbiAgICB1dGlsLmxvYWQoZnVuY3Rpb24gKCkge1xuICAgICAgc2V0VGltZW91dChmbiwgMTAwKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogTWVyZ2VzIHR3byBvYmplY3RzLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLm1lcmdlID0gZnVuY3Rpb24gbWVyZ2UgKHRhcmdldCwgYWRkaXRpb25hbCwgZGVlcCwgbGFzdHNlZW4pIHtcbiAgICB2YXIgc2VlbiA9IGxhc3RzZWVuIHx8IFtdXG4gICAgICAsIGRlcHRoID0gdHlwZW9mIGRlZXAgPT0gJ3VuZGVmaW5lZCcgPyAyIDogZGVlcFxuICAgICAgLCBwcm9wO1xuXG4gICAgZm9yIChwcm9wIGluIGFkZGl0aW9uYWwpIHtcbiAgICAgIGlmIChhZGRpdGlvbmFsLmhhc093blByb3BlcnR5KHByb3ApICYmIHV0aWwuaW5kZXhPZihzZWVuLCBwcm9wKSA8IDApIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXRbcHJvcF0gIT09ICdvYmplY3QnIHx8ICFkZXB0aCkge1xuICAgICAgICAgIHRhcmdldFtwcm9wXSA9IGFkZGl0aW9uYWxbcHJvcF07XG4gICAgICAgICAgc2Vlbi5wdXNoKGFkZGl0aW9uYWxbcHJvcF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHV0aWwubWVyZ2UodGFyZ2V0W3Byb3BdLCBhZGRpdGlvbmFsW3Byb3BdLCBkZXB0aCAtIDEsIHNlZW4pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfTtcblxuICAvKipcbiAgICogTWVyZ2VzIHByb3RvdHlwZXMgZnJvbSBvYmplY3RzXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwubWl4aW4gPSBmdW5jdGlvbiAoY3RvciwgY3RvcjIpIHtcbiAgICB1dGlsLm1lcmdlKGN0b3IucHJvdG90eXBlLCBjdG9yMi5wcm90b3R5cGUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTaG9ydGN1dCBmb3IgcHJvdG90eXBpY2FsIGFuZCBzdGF0aWMgaW5oZXJpdGFuY2UuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICB1dGlsLmluaGVyaXQgPSBmdW5jdGlvbiAoY3RvciwgY3RvcjIpIHtcbiAgICBmdW5jdGlvbiBmKCkge307XG4gICAgZi5wcm90b3R5cGUgPSBjdG9yMi5wcm90b3R5cGU7XG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgZjtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBvYmplY3QgaXMgYW4gQXJyYXkuXG4gICAqXG4gICAqICAgICBpby51dGlsLmlzQXJyYXkoW10pOyAvLyB0cnVlXG4gICAqICAgICBpby51dGlsLmlzQXJyYXkoe30pOyAvLyBmYWxzZVxuICAgKlxuICAgKiBAcGFyYW0gT2JqZWN0IG9ialxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLmlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLyoqXG4gICAqIEludGVyc2VjdHMgdmFsdWVzIG9mIHR3byBhcnJheXMgaW50byBhIHRoaXJkXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwuaW50ZXJzZWN0ID0gZnVuY3Rpb24gKGFyciwgYXJyMikge1xuICAgIHZhciByZXQgPSBbXVxuICAgICAgLCBsb25nZXN0ID0gYXJyLmxlbmd0aCA+IGFycjIubGVuZ3RoID8gYXJyIDogYXJyMlxuICAgICAgLCBzaG9ydGVzdCA9IGFyci5sZW5ndGggPiBhcnIyLmxlbmd0aCA/IGFycjIgOiBhcnI7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHNob3J0ZXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKH51dGlsLmluZGV4T2YobG9uZ2VzdCwgc2hvcnRlc3RbaV0pKVxuICAgICAgICByZXQucHVzaChzaG9ydGVzdFtpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfTtcblxuICAvKipcbiAgICogQXJyYXkgaW5kZXhPZiBjb21wYXRpYmlsaXR5LlxuICAgKlxuICAgKiBAc2VlIGJpdC5seS9hNUR4YTJcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5pbmRleE9mID0gZnVuY3Rpb24gKGFyciwgbywgaSkge1xuXG4gICAgZm9yICh2YXIgaiA9IGFyci5sZW5ndGgsIGkgPSBpIDwgMCA/IGkgKyBqIDwgMCA/IDAgOiBpICsgaiA6IGkgfHwgMDtcbiAgICAgICAgIGkgPCBqICYmIGFycltpXSAhPT0gbzsgaSsrKSB7fVxuXG4gICAgcmV0dXJuIGogPD0gaSA/IC0xIDogaTtcbiAgfTtcblxuICAvKipcbiAgICogQ29udmVydHMgZW51bWVyYWJsZXMgdG8gYXJyYXkuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwudG9BcnJheSA9IGZ1bmN0aW9uIChlbnUpIHtcbiAgICB2YXIgYXJyID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGVudS5sZW5ndGg7IGkgPCBsOyBpKyspXG4gICAgICBhcnIucHVzaChlbnVbaV0pO1xuXG4gICAgcmV0dXJuIGFycjtcbiAgfTtcblxuICAvKipcbiAgICogVUEgLyBlbmdpbmVzIGRldGVjdGlvbiBuYW1lc3BhY2UuXG4gICAqXG4gICAqIEBuYW1lc3BhY2VcbiAgICovXG5cbiAgdXRpbC51YSA9IHt9O1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBVQSBzdXBwb3J0cyBDT1JTIGZvciBYSFIuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwudWEuaGFzQ09SUyA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAmJiAoZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgYSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYS53aXRoQ3JlZGVudGlhbHMgIT0gdW5kZWZpbmVkO1xuICB9KSgpO1xuXG4gIC8qKlxuICAgKiBEZXRlY3Qgd2Via2l0LlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLnVhLndlYmtpdCA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBuYXZpZ2F0b3JcbiAgICAmJiAvd2Via2l0L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxuICAgLyoqXG4gICAqIERldGVjdCBpUGFkL2lQaG9uZS9pUG9kLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLnVhLmlEZXZpY2UgPSAndW5kZWZpbmVkJyAhPSB0eXBlb2YgbmF2aWdhdG9yXG4gICAgICAmJiAvaVBhZHxpUGhvbmV8aVBvZC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbn0pKCd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLmV4cG9ydHMsIHRoaXMpO1xuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8pIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuICAvKipcbiAgICogRXZlbnQgZW1pdHRlciBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQGFwaSBwdWJsaWMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEV2ZW50RW1pdHRlciAoKSB7fTtcblxuICAvKipcbiAgICogQWRkcyBhIGxpc3RlbmVyXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAobmFtZSwgZm4pIHtcbiAgICBpZiAoIXRoaXMuJGV2ZW50cykge1xuICAgICAgdGhpcy4kZXZlbnRzID0ge307XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLiRldmVudHNbbmFtZV0pIHtcbiAgICAgIHRoaXMuJGV2ZW50c1tuYW1lXSA9IGZuO1xuICAgIH0gZWxzZSBpZiAoaW8udXRpbC5pc0FycmF5KHRoaXMuJGV2ZW50c1tuYW1lXSkpIHtcbiAgICAgIHRoaXMuJGV2ZW50c1tuYW1lXS5wdXNoKGZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4kZXZlbnRzW25hbWVdID0gW3RoaXMuJGV2ZW50c1tuYW1lXSwgZm5dO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4gIC8qKlxuICAgKiBBZGRzIGEgdm9sYXRpbGUgbGlzdGVuZXIuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIG9uICgpIHtcbiAgICAgIHNlbGYucmVtb3ZlTGlzdGVuZXIobmFtZSwgb24pO1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgb24ubGlzdGVuZXIgPSBmbjtcbiAgICB0aGlzLm9uKG5hbWUsIG9uKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgbGlzdGVuZXIuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiAobmFtZSwgZm4pIHtcbiAgICBpZiAodGhpcy4kZXZlbnRzICYmIHRoaXMuJGV2ZW50c1tuYW1lXSkge1xuICAgICAgdmFyIGxpc3QgPSB0aGlzLiRldmVudHNbbmFtZV07XG5cbiAgICAgIGlmIChpby51dGlsLmlzQXJyYXkobGlzdCkpIHtcbiAgICAgICAgdmFyIHBvcyA9IC0xO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpZiAobGlzdFtpXSA9PT0gZm4gfHwgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gZm4pKSB7XG4gICAgICAgICAgICBwb3MgPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvcyA8IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGxpc3Quc3BsaWNlKHBvcywgMSk7XG5cbiAgICAgICAgaWYgKCFsaXN0Lmxlbmd0aCkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLiRldmVudHNbbmFtZV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobGlzdCA9PT0gZm4gfHwgKGxpc3QubGlzdGVuZXIgJiYgbGlzdC5saXN0ZW5lciA9PT0gZm4pKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLiRldmVudHNbbmFtZV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYWxsIGxpc3RlbmVycyBmb3IgYW4gZXZlbnQuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAobmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLiRldmVudHMgPSB7fTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLiRldmVudHMgJiYgdGhpcy4kZXZlbnRzW25hbWVdKSB7XG4gICAgICB0aGlzLiRldmVudHNbbmFtZV0gPSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXRzIGFsbCBsaXN0ZW5lcnMgZm9yIGEgY2VydGFpbiBldmVudC5cbiAgICpcbiAgICogQGFwaSBwdWJsY2lcbiAgICovXG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmICghdGhpcy4kZXZlbnRzKSB7XG4gICAgICB0aGlzLiRldmVudHMgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuJGV2ZW50c1tuYW1lXSkge1xuICAgICAgdGhpcy4kZXZlbnRzW25hbWVdID0gW107XG4gICAgfVxuXG4gICAgaWYgKCFpby51dGlsLmlzQXJyYXkodGhpcy4kZXZlbnRzW25hbWVdKSkge1xuICAgICAgdGhpcy4kZXZlbnRzW25hbWVdID0gW3RoaXMuJGV2ZW50c1tuYW1lXV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuJGV2ZW50c1tuYW1lXTtcbiAgfTtcblxuICAvKipcbiAgICogRW1pdHMgYW4gZXZlbnQuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKCF0aGlzLiRldmVudHMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgaGFuZGxlciA9IHRoaXMuJGV2ZW50c1tuYW1lXTtcblxuICAgIGlmICghaGFuZGxlcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBoYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH0gZWxzZSBpZiAoaW8udXRpbC5pc0FycmF5KGhhbmRsZXIpKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuKTtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbi8qKlxuICogQmFzZWQgb24gSlNPTjIgKGh0dHA6Ly93d3cuSlNPTi5vcmcvanMuaHRtbCkuXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBuYXRpdmVKU09OKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIHVzZSBuYXRpdmUgSlNPTiBpZiBpdCdzIGF2YWlsYWJsZVxuICBpZiAobmF0aXZlSlNPTiAmJiBuYXRpdmVKU09OLnBhcnNlKXtcbiAgICByZXR1cm4gZXhwb3J0cy5KU09OID0ge1xuICAgICAgcGFyc2U6IG5hdGl2ZUpTT04ucGFyc2VcbiAgICAsIHN0cmluZ2lmeTogbmF0aXZlSlNPTi5zdHJpbmdpZnlcbiAgICB9O1xuICB9XG5cbiAgdmFyIEpTT04gPSBleHBvcnRzLkpTT04gPSB7fTtcblxuICBmdW5jdGlvbiBmKG4pIHtcbiAgICAgIC8vIEZvcm1hdCBpbnRlZ2VycyB0byBoYXZlIGF0IGxlYXN0IHR3byBkaWdpdHMuXG4gICAgICByZXR1cm4gbiA8IDEwID8gJzAnICsgbiA6IG47XG4gIH1cblxuICBmdW5jdGlvbiBkYXRlKGQsIGtleSkge1xuICAgIHJldHVybiBpc0Zpbml0ZShkLnZhbHVlT2YoKSkgP1xuICAgICAgICBkLmdldFVUQ0Z1bGxZZWFyKCkgICAgICsgJy0nICtcbiAgICAgICAgZihkLmdldFVUQ01vbnRoKCkgKyAxKSArICctJyArXG4gICAgICAgIGYoZC5nZXRVVENEYXRlKCkpICAgICAgKyAnVCcgK1xuICAgICAgICBmKGQuZ2V0VVRDSG91cnMoKSkgICAgICsgJzonICtcbiAgICAgICAgZihkLmdldFVUQ01pbnV0ZXMoKSkgICArICc6JyArXG4gICAgICAgIGYoZC5nZXRVVENTZWNvbmRzKCkpICAgKyAnWicgOiBudWxsO1xuICB9O1xuXG4gIHZhciBjeCA9IC9bXFx1MDAwMFxcdTAwYWRcXHUwNjAwLVxcdTA2MDRcXHUwNzBmXFx1MTdiNFxcdTE3YjVcXHUyMDBjLVxcdTIwMGZcXHUyMDI4LVxcdTIwMmZcXHUyMDYwLVxcdTIwNmZcXHVmZWZmXFx1ZmZmMC1cXHVmZmZmXS9nLFxuICAgICAgZXNjYXBhYmxlID0gL1tcXFxcXFxcIlxceDAwLVxceDFmXFx4N2YtXFx4OWZcXHUwMGFkXFx1MDYwMC1cXHUwNjA0XFx1MDcwZlxcdTE3YjRcXHUxN2I1XFx1MjAwYy1cXHUyMDBmXFx1MjAyOC1cXHUyMDJmXFx1MjA2MC1cXHUyMDZmXFx1ZmVmZlxcdWZmZjAtXFx1ZmZmZl0vZyxcbiAgICAgIGdhcCxcbiAgICAgIGluZGVudCxcbiAgICAgIG1ldGEgPSB7ICAgIC8vIHRhYmxlIG9mIGNoYXJhY3RlciBzdWJzdGl0dXRpb25zXG4gICAgICAgICAgJ1xcYic6ICdcXFxcYicsXG4gICAgICAgICAgJ1xcdCc6ICdcXFxcdCcsXG4gICAgICAgICAgJ1xcbic6ICdcXFxcbicsXG4gICAgICAgICAgJ1xcZic6ICdcXFxcZicsXG4gICAgICAgICAgJ1xccic6ICdcXFxccicsXG4gICAgICAgICAgJ1wiJyA6ICdcXFxcXCInLFxuICAgICAgICAgICdcXFxcJzogJ1xcXFxcXFxcJ1xuICAgICAgfSxcbiAgICAgIHJlcDtcblxuXG4gIGZ1bmN0aW9uIHF1b3RlKHN0cmluZykge1xuXG4vLyBJZiB0aGUgc3RyaW5nIGNvbnRhaW5zIG5vIGNvbnRyb2wgY2hhcmFjdGVycywgbm8gcXVvdGUgY2hhcmFjdGVycywgYW5kIG5vXG4vLyBiYWNrc2xhc2ggY2hhcmFjdGVycywgdGhlbiB3ZSBjYW4gc2FmZWx5IHNsYXAgc29tZSBxdW90ZXMgYXJvdW5kIGl0LlxuLy8gT3RoZXJ3aXNlIHdlIG11c3QgYWxzbyByZXBsYWNlIHRoZSBvZmZlbmRpbmcgY2hhcmFjdGVycyB3aXRoIHNhZmUgZXNjYXBlXG4vLyBzZXF1ZW5jZXMuXG5cbiAgICAgIGVzY2FwYWJsZS5sYXN0SW5kZXggPSAwO1xuICAgICAgcmV0dXJuIGVzY2FwYWJsZS50ZXN0KHN0cmluZykgPyAnXCInICsgc3RyaW5nLnJlcGxhY2UoZXNjYXBhYmxlLCBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgIHZhciBjID0gbWV0YVthXTtcbiAgICAgICAgICByZXR1cm4gdHlwZW9mIGMgPT09ICdzdHJpbmcnID8gYyA6XG4gICAgICAgICAgICAgICdcXFxcdScgKyAoJzAwMDAnICsgYS5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTQpO1xuICAgICAgfSkgKyAnXCInIDogJ1wiJyArIHN0cmluZyArICdcIic7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIHN0cihrZXksIGhvbGRlcikge1xuXG4vLyBQcm9kdWNlIGEgc3RyaW5nIGZyb20gaG9sZGVyW2tleV0uXG5cbiAgICAgIHZhciBpLCAgICAgICAgICAvLyBUaGUgbG9vcCBjb3VudGVyLlxuICAgICAgICAgIGssICAgICAgICAgIC8vIFRoZSBtZW1iZXIga2V5LlxuICAgICAgICAgIHYsICAgICAgICAgIC8vIFRoZSBtZW1iZXIgdmFsdWUuXG4gICAgICAgICAgbGVuZ3RoLFxuICAgICAgICAgIG1pbmQgPSBnYXAsXG4gICAgICAgICAgcGFydGlhbCxcbiAgICAgICAgICB2YWx1ZSA9IGhvbGRlcltrZXldO1xuXG4vLyBJZiB0aGUgdmFsdWUgaGFzIGEgdG9KU09OIG1ldGhvZCwgY2FsbCBpdCB0byBvYnRhaW4gYSByZXBsYWNlbWVudCB2YWx1ZS5cblxuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgIHZhbHVlID0gZGF0ZShrZXkpO1xuICAgICAgfVxuXG4vLyBJZiB3ZSB3ZXJlIGNhbGxlZCB3aXRoIGEgcmVwbGFjZXIgZnVuY3Rpb24sIHRoZW4gY2FsbCB0aGUgcmVwbGFjZXIgdG9cbi8vIG9idGFpbiBhIHJlcGxhY2VtZW50IHZhbHVlLlxuXG4gICAgICBpZiAodHlwZW9mIHJlcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHZhbHVlID0gcmVwLmNhbGwoaG9sZGVyLCBrZXksIHZhbHVlKTtcbiAgICAgIH1cblxuLy8gV2hhdCBoYXBwZW5zIG5leHQgZGVwZW5kcyBvbiB0aGUgdmFsdWUncyB0eXBlLlxuXG4gICAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICByZXR1cm4gcXVvdGUodmFsdWUpO1xuXG4gICAgICBjYXNlICdudW1iZXInOlxuXG4vLyBKU09OIG51bWJlcnMgbXVzdCBiZSBmaW5pdGUuIEVuY29kZSBub24tZmluaXRlIG51bWJlcnMgYXMgbnVsbC5cblxuICAgICAgICAgIHJldHVybiBpc0Zpbml0ZSh2YWx1ZSkgPyBTdHJpbmcodmFsdWUpIDogJ251bGwnO1xuXG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIGNhc2UgJ251bGwnOlxuXG4vLyBJZiB0aGUgdmFsdWUgaXMgYSBib29sZWFuIG9yIG51bGwsIGNvbnZlcnQgaXQgdG8gYSBzdHJpbmcuIE5vdGU6XG4vLyB0eXBlb2YgbnVsbCBkb2VzIG5vdCBwcm9kdWNlICdudWxsJy4gVGhlIGNhc2UgaXMgaW5jbHVkZWQgaGVyZSBpblxuLy8gdGhlIHJlbW90ZSBjaGFuY2UgdGhhdCB0aGlzIGdldHMgZml4ZWQgc29tZWRheS5cblxuICAgICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuXG4vLyBJZiB0aGUgdHlwZSBpcyAnb2JqZWN0Jywgd2UgbWlnaHQgYmUgZGVhbGluZyB3aXRoIGFuIG9iamVjdCBvciBhbiBhcnJheSBvclxuLy8gbnVsbC5cblxuICAgICAgY2FzZSAnb2JqZWN0JzpcblxuLy8gRHVlIHRvIGEgc3BlY2lmaWNhdGlvbiBibHVuZGVyIGluIEVDTUFTY3JpcHQsIHR5cGVvZiBudWxsIGlzICdvYmplY3QnLFxuLy8gc28gd2F0Y2ggb3V0IGZvciB0aGF0IGNhc2UuXG5cbiAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnbnVsbCc7XG4gICAgICAgICAgfVxuXG4vLyBNYWtlIGFuIGFycmF5IHRvIGhvbGQgdGhlIHBhcnRpYWwgcmVzdWx0cyBvZiBzdHJpbmdpZnlpbmcgdGhpcyBvYmplY3QgdmFsdWUuXG5cbiAgICAgICAgICBnYXAgKz0gaW5kZW50O1xuICAgICAgICAgIHBhcnRpYWwgPSBbXTtcblxuLy8gSXMgdGhlIHZhbHVlIGFuIGFycmF5P1xuXG4gICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nKSB7XG5cbi8vIFRoZSB2YWx1ZSBpcyBhbiBhcnJheS4gU3RyaW5naWZ5IGV2ZXJ5IGVsZW1lbnQuIFVzZSBudWxsIGFzIGEgcGxhY2Vob2xkZXJcbi8vIGZvciBub24tSlNPTiB2YWx1ZXMuXG5cbiAgICAgICAgICAgICAgbGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgIHBhcnRpYWxbaV0gPSBzdHIoaSwgdmFsdWUpIHx8ICdudWxsJztcbiAgICAgICAgICAgICAgfVxuXG4vLyBKb2luIGFsbCBvZiB0aGUgZWxlbWVudHMgdG9nZXRoZXIsIHNlcGFyYXRlZCB3aXRoIGNvbW1hcywgYW5kIHdyYXAgdGhlbSBpblxuLy8gYnJhY2tldHMuXG5cbiAgICAgICAgICAgICAgdiA9IHBhcnRpYWwubGVuZ3RoID09PSAwID8gJ1tdJyA6IGdhcCA/XG4gICAgICAgICAgICAgICAgICAnW1xcbicgKyBnYXAgKyBwYXJ0aWFsLmpvaW4oJyxcXG4nICsgZ2FwKSArICdcXG4nICsgbWluZCArICddJyA6XG4gICAgICAgICAgICAgICAgICAnWycgKyBwYXJ0aWFsLmpvaW4oJywnKSArICddJztcbiAgICAgICAgICAgICAgZ2FwID0gbWluZDtcbiAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgfVxuXG4vLyBJZiB0aGUgcmVwbGFjZXIgaXMgYW4gYXJyYXksIHVzZSBpdCB0byBzZWxlY3QgdGhlIG1lbWJlcnMgdG8gYmUgc3RyaW5naWZpZWQuXG5cbiAgICAgICAgICBpZiAocmVwICYmIHR5cGVvZiByZXAgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgIGxlbmd0aCA9IHJlcC5sZW5ndGg7XG4gICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXBbaV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgayA9IHJlcFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICB2ID0gc3RyKGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsLnB1c2gocXVvdGUoaykgKyAoZ2FwID8gJzogJyA6ICc6JykgKyB2KTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuXG4vLyBPdGhlcndpc2UsIGl0ZXJhdGUgdGhyb3VnaCBhbGwgb2YgdGhlIGtleXMgaW4gdGhlIG9iamVjdC5cblxuICAgICAgICAgICAgICBmb3IgKGsgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGspKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdiA9IHN0cihrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGlhbC5wdXNoKHF1b3RlKGspICsgKGdhcCA/ICc6ICcgOiAnOicpICsgdik7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4vLyBKb2luIGFsbCBvZiB0aGUgbWVtYmVyIHRleHRzIHRvZ2V0aGVyLCBzZXBhcmF0ZWQgd2l0aCBjb21tYXMsXG4vLyBhbmQgd3JhcCB0aGVtIGluIGJyYWNlcy5cblxuICAgICAgICAgIHYgPSBwYXJ0aWFsLmxlbmd0aCA9PT0gMCA/ICd7fScgOiBnYXAgP1xuICAgICAgICAgICAgICAne1xcbicgKyBnYXAgKyBwYXJ0aWFsLmpvaW4oJyxcXG4nICsgZ2FwKSArICdcXG4nICsgbWluZCArICd9JyA6XG4gICAgICAgICAgICAgICd7JyArIHBhcnRpYWwuam9pbignLCcpICsgJ30nO1xuICAgICAgICAgIGdhcCA9IG1pbmQ7XG4gICAgICAgICAgcmV0dXJuIHY7XG4gICAgICB9XG4gIH1cblxuLy8gSWYgdGhlIEpTT04gb2JqZWN0IGRvZXMgbm90IHlldCBoYXZlIGEgc3RyaW5naWZ5IG1ldGhvZCwgZ2l2ZSBpdCBvbmUuXG5cbiAgSlNPTi5zdHJpbmdpZnkgPSBmdW5jdGlvbiAodmFsdWUsIHJlcGxhY2VyLCBzcGFjZSkge1xuXG4vLyBUaGUgc3RyaW5naWZ5IG1ldGhvZCB0YWtlcyBhIHZhbHVlIGFuZCBhbiBvcHRpb25hbCByZXBsYWNlciwgYW5kIGFuIG9wdGlvbmFsXG4vLyBzcGFjZSBwYXJhbWV0ZXIsIGFuZCByZXR1cm5zIGEgSlNPTiB0ZXh0LiBUaGUgcmVwbGFjZXIgY2FuIGJlIGEgZnVuY3Rpb25cbi8vIHRoYXQgY2FuIHJlcGxhY2UgdmFsdWVzLCBvciBhbiBhcnJheSBvZiBzdHJpbmdzIHRoYXQgd2lsbCBzZWxlY3QgdGhlIGtleXMuXG4vLyBBIGRlZmF1bHQgcmVwbGFjZXIgbWV0aG9kIGNhbiBiZSBwcm92aWRlZC4gVXNlIG9mIHRoZSBzcGFjZSBwYXJhbWV0ZXIgY2FuXG4vLyBwcm9kdWNlIHRleHQgdGhhdCBpcyBtb3JlIGVhc2lseSByZWFkYWJsZS5cblxuICAgICAgdmFyIGk7XG4gICAgICBnYXAgPSAnJztcbiAgICAgIGluZGVudCA9ICcnO1xuXG4vLyBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgbnVtYmVyLCBtYWtlIGFuIGluZGVudCBzdHJpbmcgY29udGFpbmluZyB0aGF0XG4vLyBtYW55IHNwYWNlcy5cblxuICAgICAgaWYgKHR5cGVvZiBzcGFjZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3BhY2U7IGkgKz0gMSkge1xuICAgICAgICAgICAgICBpbmRlbnQgKz0gJyAnO1xuICAgICAgICAgIH1cblxuLy8gSWYgdGhlIHNwYWNlIHBhcmFtZXRlciBpcyBhIHN0cmluZywgaXQgd2lsbCBiZSB1c2VkIGFzIHRoZSBpbmRlbnQgc3RyaW5nLlxuXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzcGFjZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBpbmRlbnQgPSBzcGFjZTtcbiAgICAgIH1cblxuLy8gSWYgdGhlcmUgaXMgYSByZXBsYWNlciwgaXQgbXVzdCBiZSBhIGZ1bmN0aW9uIG9yIGFuIGFycmF5LlxuLy8gT3RoZXJ3aXNlLCB0aHJvdyBhbiBlcnJvci5cblxuICAgICAgcmVwID0gcmVwbGFjZXI7XG4gICAgICBpZiAocmVwbGFjZXIgJiYgdHlwZW9mIHJlcGxhY2VyICE9PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgICAgICh0eXBlb2YgcmVwbGFjZXIgIT09ICdvYmplY3QnIHx8XG4gICAgICAgICAgICAgIHR5cGVvZiByZXBsYWNlci5sZW5ndGggIT09ICdudW1iZXInKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSlNPTi5zdHJpbmdpZnknKTtcbiAgICAgIH1cblxuLy8gTWFrZSBhIGZha2Ugcm9vdCBvYmplY3QgY29udGFpbmluZyBvdXIgdmFsdWUgdW5kZXIgdGhlIGtleSBvZiAnJy5cbi8vIFJldHVybiB0aGUgcmVzdWx0IG9mIHN0cmluZ2lmeWluZyB0aGUgdmFsdWUuXG5cbiAgICAgIHJldHVybiBzdHIoJycsIHsnJzogdmFsdWV9KTtcbiAgfTtcblxuLy8gSWYgdGhlIEpTT04gb2JqZWN0IGRvZXMgbm90IHlldCBoYXZlIGEgcGFyc2UgbWV0aG9kLCBnaXZlIGl0IG9uZS5cblxuICBKU09OLnBhcnNlID0gZnVuY3Rpb24gKHRleHQsIHJldml2ZXIpIHtcbiAgLy8gVGhlIHBhcnNlIG1ldGhvZCB0YWtlcyBhIHRleHQgYW5kIGFuIG9wdGlvbmFsIHJldml2ZXIgZnVuY3Rpb24sIGFuZCByZXR1cm5zXG4gIC8vIGEgSmF2YVNjcmlwdCB2YWx1ZSBpZiB0aGUgdGV4dCBpcyBhIHZhbGlkIEpTT04gdGV4dC5cblxuICAgICAgdmFyIGo7XG5cbiAgICAgIGZ1bmN0aW9uIHdhbGsoaG9sZGVyLCBrZXkpIHtcblxuICAvLyBUaGUgd2FsayBtZXRob2QgaXMgdXNlZCB0byByZWN1cnNpdmVseSB3YWxrIHRoZSByZXN1bHRpbmcgc3RydWN0dXJlIHNvXG4gIC8vIHRoYXQgbW9kaWZpY2F0aW9ucyBjYW4gYmUgbWFkZS5cblxuICAgICAgICAgIHZhciBrLCB2LCB2YWx1ZSA9IGhvbGRlcltrZXldO1xuICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgIGZvciAoayBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICB2ID0gd2Fsayh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrXSA9IHY7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHZhbHVlW2tdO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmV2aXZlci5jYWxsKGhvbGRlciwga2V5LCB2YWx1ZSk7XG4gICAgICB9XG5cblxuICAvLyBQYXJzaW5nIGhhcHBlbnMgaW4gZm91ciBzdGFnZXMuIEluIHRoZSBmaXJzdCBzdGFnZSwgd2UgcmVwbGFjZSBjZXJ0YWluXG4gIC8vIFVuaWNvZGUgY2hhcmFjdGVycyB3aXRoIGVzY2FwZSBzZXF1ZW5jZXMuIEphdmFTY3JpcHQgaGFuZGxlcyBtYW55IGNoYXJhY3RlcnNcbiAgLy8gaW5jb3JyZWN0bHksIGVpdGhlciBzaWxlbnRseSBkZWxldGluZyB0aGVtLCBvciB0cmVhdGluZyB0aGVtIGFzIGxpbmUgZW5kaW5ncy5cblxuICAgICAgdGV4dCA9IFN0cmluZyh0ZXh0KTtcbiAgICAgIGN4Lmxhc3RJbmRleCA9IDA7XG4gICAgICBpZiAoY3gudGVzdCh0ZXh0KSkge1xuICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoY3gsIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnXFxcXHUnICtcbiAgICAgICAgICAgICAgICAgICgnMDAwMCcgKyBhLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtNCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgLy8gSW4gdGhlIHNlY29uZCBzdGFnZSwgd2UgcnVuIHRoZSB0ZXh0IGFnYWluc3QgcmVndWxhciBleHByZXNzaW9ucyB0aGF0IGxvb2tcbiAgLy8gZm9yIG5vbi1KU09OIHBhdHRlcm5zLiBXZSBhcmUgZXNwZWNpYWxseSBjb25jZXJuZWQgd2l0aCAnKCknIGFuZCAnbmV3J1xuICAvLyBiZWNhdXNlIHRoZXkgY2FuIGNhdXNlIGludm9jYXRpb24sIGFuZCAnPScgYmVjYXVzZSBpdCBjYW4gY2F1c2UgbXV0YXRpb24uXG4gIC8vIEJ1dCBqdXN0IHRvIGJlIHNhZmUsIHdlIHdhbnQgdG8gcmVqZWN0IGFsbCB1bmV4cGVjdGVkIGZvcm1zLlxuXG4gIC8vIFdlIHNwbGl0IHRoZSBzZWNvbmQgc3RhZ2UgaW50byA0IHJlZ2V4cCBvcGVyYXRpb25zIGluIG9yZGVyIHRvIHdvcmsgYXJvdW5kXG4gIC8vIGNyaXBwbGluZyBpbmVmZmljaWVuY2llcyBpbiBJRSdzIGFuZCBTYWZhcmkncyByZWdleHAgZW5naW5lcy4gRmlyc3Qgd2VcbiAgLy8gcmVwbGFjZSB0aGUgSlNPTiBiYWNrc2xhc2ggcGFpcnMgd2l0aCAnQCcgKGEgbm9uLUpTT04gY2hhcmFjdGVyKS4gU2Vjb25kLCB3ZVxuICAvLyByZXBsYWNlIGFsbCBzaW1wbGUgdmFsdWUgdG9rZW5zIHdpdGggJ10nIGNoYXJhY3RlcnMuIFRoaXJkLCB3ZSBkZWxldGUgYWxsXG4gIC8vIG9wZW4gYnJhY2tldHMgdGhhdCBmb2xsb3cgYSBjb2xvbiBvciBjb21tYSBvciB0aGF0IGJlZ2luIHRoZSB0ZXh0LiBGaW5hbGx5LFxuICAvLyB3ZSBsb29rIHRvIHNlZSB0aGF0IHRoZSByZW1haW5pbmcgY2hhcmFjdGVycyBhcmUgb25seSB3aGl0ZXNwYWNlIG9yICddJyBvclxuICAvLyAnLCcgb3IgJzonIG9yICd7JyBvciAnfScuIElmIHRoYXQgaXMgc28sIHRoZW4gdGhlIHRleHQgaXMgc2FmZSBmb3IgZXZhbC5cblxuICAgICAgaWYgKC9eW1xcXSw6e31cXHNdKiQvXG4gICAgICAgICAgICAgIC50ZXN0KHRleHQucmVwbGFjZSgvXFxcXCg/OltcIlxcXFxcXC9iZm5ydF18dVswLTlhLWZBLUZdezR9KS9nLCAnQCcpXG4gICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXCJbXlwiXFxcXFxcblxccl0qXCJ8dHJ1ZXxmYWxzZXxudWxsfC0/XFxkKyg/OlxcLlxcZCopPyg/OltlRV1bK1xcLV0/XFxkKyk/L2csICddJylcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oPzpefDp8LCkoPzpcXHMqXFxbKSsvZywgJycpKSkge1xuXG4gIC8vIEluIHRoZSB0aGlyZCBzdGFnZSB3ZSB1c2UgdGhlIGV2YWwgZnVuY3Rpb24gdG8gY29tcGlsZSB0aGUgdGV4dCBpbnRvIGFcbiAgLy8gSmF2YVNjcmlwdCBzdHJ1Y3R1cmUuIFRoZSAneycgb3BlcmF0b3IgaXMgc3ViamVjdCB0byBhIHN5bnRhY3RpYyBhbWJpZ3VpdHlcbiAgLy8gaW4gSmF2YVNjcmlwdDogaXQgY2FuIGJlZ2luIGEgYmxvY2sgb3IgYW4gb2JqZWN0IGxpdGVyYWwuIFdlIHdyYXAgdGhlIHRleHRcbiAgLy8gaW4gcGFyZW5zIHRvIGVsaW1pbmF0ZSB0aGUgYW1iaWd1aXR5LlxuXG4gICAgICAgICAgaiA9IGV2YWwoJygnICsgdGV4dCArICcpJyk7XG5cbiAgLy8gSW4gdGhlIG9wdGlvbmFsIGZvdXJ0aCBzdGFnZSwgd2UgcmVjdXJzaXZlbHkgd2FsayB0aGUgbmV3IHN0cnVjdHVyZSwgcGFzc2luZ1xuICAvLyBlYWNoIG5hbWUvdmFsdWUgcGFpciB0byBhIHJldml2ZXIgZnVuY3Rpb24gZm9yIHBvc3NpYmxlIHRyYW5zZm9ybWF0aW9uLlxuXG4gICAgICAgICAgcmV0dXJuIHR5cGVvZiByZXZpdmVyID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgICAgICAgd2Fsayh7Jyc6IGp9LCAnJykgOiBqO1xuICAgICAgfVxuXG4gIC8vIElmIHRoZSB0ZXh0IGlzIG5vdCBKU09OIHBhcnNlYWJsZSwgdGhlbiBhIFN5bnRheEVycm9yIGlzIHRocm93bi5cblxuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdKU09OLnBhcnNlJyk7XG4gIH07XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLmV4cG9ydHNcbiAgLCB0eXBlb2YgSlNPTiAhPT0gJ3VuZGVmaW5lZCcgPyBKU09OIDogdW5kZWZpbmVkXG4pO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbykge1xuXG4gIC8qKlxuICAgKiBQYXJzZXIgbmFtZXNwYWNlLlxuICAgKlxuICAgKiBAbmFtZXNwYWNlXG4gICAqL1xuXG4gIHZhciBwYXJzZXIgPSBleHBvcnRzLnBhcnNlciA9IHt9O1xuXG4gIC8qKlxuICAgKiBQYWNrZXQgdHlwZXMuXG4gICAqL1xuXG4gIHZhciBwYWNrZXRzID0gcGFyc2VyLnBhY2tldHMgPSBbXG4gICAgICAnZGlzY29ubmVjdCdcbiAgICAsICdjb25uZWN0J1xuICAgICwgJ2hlYXJ0YmVhdCdcbiAgICAsICdtZXNzYWdlJ1xuICAgICwgJ2pzb24nXG4gICAgLCAnZXZlbnQnXG4gICAgLCAnYWNrJ1xuICAgICwgJ2Vycm9yJ1xuICAgICwgJ25vb3AnXG4gIF07XG5cbiAgLyoqXG4gICAqIEVycm9ycyByZWFzb25zLlxuICAgKi9cblxuICB2YXIgcmVhc29ucyA9IHBhcnNlci5yZWFzb25zID0gW1xuICAgICAgJ3RyYW5zcG9ydCBub3Qgc3VwcG9ydGVkJ1xuICAgICwgJ2NsaWVudCBub3QgaGFuZHNoYWtlbidcbiAgICAsICd1bmF1dGhvcml6ZWQnXG4gIF07XG5cbiAgLyoqXG4gICAqIEVycm9ycyBhZHZpY2UuXG4gICAqL1xuXG4gIHZhciBhZHZpY2UgPSBwYXJzZXIuYWR2aWNlID0gW1xuICAgICAgJ3JlY29ubmVjdCdcbiAgXTtcblxuICAvKipcbiAgICogU2hvcnRjdXRzLlxuICAgKi9cblxuICB2YXIgSlNPTiA9IGlvLkpTT05cbiAgICAsIGluZGV4T2YgPSBpby51dGlsLmluZGV4T2Y7XG5cbiAgLyoqXG4gICAqIEVuY29kZXMgYSBwYWNrZXQuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBwYXJzZXIuZW5jb2RlUGFja2V0ID0gZnVuY3Rpb24gKHBhY2tldCkge1xuICAgIHZhciB0eXBlID0gaW5kZXhPZihwYWNrZXRzLCBwYWNrZXQudHlwZSlcbiAgICAgICwgaWQgPSBwYWNrZXQuaWQgfHwgJydcbiAgICAgICwgZW5kcG9pbnQgPSBwYWNrZXQuZW5kcG9pbnQgfHwgJydcbiAgICAgICwgYWNrID0gcGFja2V0LmFja1xuICAgICAgLCBkYXRhID0gbnVsbDtcblxuICAgIHN3aXRjaCAocGFja2V0LnR5cGUpIHtcbiAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgdmFyIHJlYXNvbiA9IHBhY2tldC5yZWFzb24gPyBpbmRleE9mKHJlYXNvbnMsIHBhY2tldC5yZWFzb24pIDogJydcbiAgICAgICAgICAsIGFkdiA9IHBhY2tldC5hZHZpY2UgPyBpbmRleE9mKGFkdmljZSwgcGFja2V0LmFkdmljZSkgOiAnJztcblxuICAgICAgICBpZiAocmVhc29uICE9PSAnJyB8fCBhZHYgIT09ICcnKVxuICAgICAgICAgIGRhdGEgPSByZWFzb24gKyAoYWR2ICE9PSAnJyA/ICgnKycgKyBhZHYpIDogJycpO1xuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdtZXNzYWdlJzpcbiAgICAgICAgaWYgKHBhY2tldC5kYXRhICE9PSAnJylcbiAgICAgICAgICBkYXRhID0gcGFja2V0LmRhdGE7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdldmVudCc6XG4gICAgICAgIHZhciBldiA9IHsgbmFtZTogcGFja2V0Lm5hbWUgfTtcblxuICAgICAgICBpZiAocGFja2V0LmFyZ3MgJiYgcGFja2V0LmFyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgZXYuYXJncyA9IHBhY2tldC5hcmdzO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YSA9IEpTT04uc3RyaW5naWZ5KGV2KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2pzb24nOlxuICAgICAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkocGFja2V0LmRhdGEpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnY29ubmVjdCc6XG4gICAgICAgIGlmIChwYWNrZXQucXMpXG4gICAgICAgICAgZGF0YSA9IHBhY2tldC5xcztcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Fjayc6XG4gICAgICAgIGRhdGEgPSBwYWNrZXQuYWNrSWRcbiAgICAgICAgICArIChwYWNrZXQuYXJncyAmJiBwYWNrZXQuYXJncy5sZW5ndGhcbiAgICAgICAgICAgICAgPyAnKycgKyBKU09OLnN0cmluZ2lmeShwYWNrZXQuYXJncykgOiAnJyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIGNvbnN0cnVjdCBwYWNrZXQgd2l0aCByZXF1aXJlZCBmcmFnbWVudHNcbiAgICB2YXIgZW5jb2RlZCA9IFtcbiAgICAgICAgdHlwZVxuICAgICAgLCBpZCArIChhY2sgPT0gJ2RhdGEnID8gJysnIDogJycpXG4gICAgICAsIGVuZHBvaW50XG4gICAgXTtcblxuICAgIC8vIGRhdGEgZnJhZ21lbnQgaXMgb3B0aW9uYWxcbiAgICBpZiAoZGF0YSAhPT0gbnVsbCAmJiBkYXRhICE9PSB1bmRlZmluZWQpXG4gICAgICBlbmNvZGVkLnB1c2goZGF0YSk7XG5cbiAgICByZXR1cm4gZW5jb2RlZC5qb2luKCc6Jyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEVuY29kZXMgbXVsdGlwbGUgbWVzc2FnZXMgKHBheWxvYWQpLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSBtZXNzYWdlc1xuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgcGFyc2VyLmVuY29kZVBheWxvYWQgPSBmdW5jdGlvbiAocGFja2V0cykge1xuICAgIHZhciBkZWNvZGVkID0gJyc7XG5cbiAgICBpZiAocGFja2V0cy5sZW5ndGggPT0gMSlcbiAgICAgIHJldHVybiBwYWNrZXRzWzBdO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBwYWNrZXRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIHBhY2tldCA9IHBhY2tldHNbaV07XG4gICAgICBkZWNvZGVkICs9ICdcXHVmZmZkJyArIHBhY2tldC5sZW5ndGggKyAnXFx1ZmZmZCcgKyBwYWNrZXRzW2ldO1xuICAgIH1cblxuICAgIHJldHVybiBkZWNvZGVkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEZWNvZGVzIGEgcGFja2V0XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICB2YXIgcmVnZXhwID0gLyhbXjpdKyk6KFswLTldKyk/KFxcKyk/OihbXjpdKyk/Oj8oW1xcc1xcU10qKT8vO1xuXG4gIHBhcnNlci5kZWNvZGVQYWNrZXQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhciBwaWVjZXMgPSBkYXRhLm1hdGNoKHJlZ2V4cCk7XG5cbiAgICBpZiAoIXBpZWNlcykgcmV0dXJuIHt9O1xuXG4gICAgdmFyIGlkID0gcGllY2VzWzJdIHx8ICcnXG4gICAgICAsIGRhdGEgPSBwaWVjZXNbNV0gfHwgJydcbiAgICAgICwgcGFja2V0ID0ge1xuICAgICAgICAgICAgdHlwZTogcGFja2V0c1twaWVjZXNbMV1dXG4gICAgICAgICAgLCBlbmRwb2ludDogcGllY2VzWzRdIHx8ICcnXG4gICAgICAgIH07XG5cbiAgICAvLyB3aGV0aGVyIHdlIG5lZWQgdG8gYWNrbm93bGVkZ2UgdGhlIHBhY2tldFxuICAgIGlmIChpZCkge1xuICAgICAgcGFja2V0LmlkID0gaWQ7XG4gICAgICBpZiAocGllY2VzWzNdKVxuICAgICAgICBwYWNrZXQuYWNrID0gJ2RhdGEnO1xuICAgICAgZWxzZVxuICAgICAgICBwYWNrZXQuYWNrID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBoYW5kbGUgZGlmZmVyZW50IHBhY2tldCB0eXBlc1xuICAgIHN3aXRjaCAocGFja2V0LnR5cGUpIHtcbiAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgdmFyIHBpZWNlcyA9IGRhdGEuc3BsaXQoJysnKTtcbiAgICAgICAgcGFja2V0LnJlYXNvbiA9IHJlYXNvbnNbcGllY2VzWzBdXSB8fCAnJztcbiAgICAgICAgcGFja2V0LmFkdmljZSA9IGFkdmljZVtwaWVjZXNbMV1dIHx8ICcnO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnbWVzc2FnZSc6XG4gICAgICAgIHBhY2tldC5kYXRhID0gZGF0YSB8fCAnJztcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2V2ZW50JzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgb3B0cyA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgcGFja2V0Lm5hbWUgPSBvcHRzLm5hbWU7XG4gICAgICAgICAgcGFja2V0LmFyZ3MgPSBvcHRzLmFyZ3M7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgfVxuXG4gICAgICAgIHBhY2tldC5hcmdzID0gcGFja2V0LmFyZ3MgfHwgW107XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwYWNrZXQuZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnY29ubmVjdCc6XG4gICAgICAgIHBhY2tldC5xcyA9IGRhdGEgfHwgJyc7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdhY2snOlxuICAgICAgICB2YXIgcGllY2VzID0gZGF0YS5tYXRjaCgvXihbMC05XSspKFxcKyk/KC4qKS8pO1xuICAgICAgICBpZiAocGllY2VzKSB7XG4gICAgICAgICAgcGFja2V0LmFja0lkID0gcGllY2VzWzFdO1xuICAgICAgICAgIHBhY2tldC5hcmdzID0gW107XG5cbiAgICAgICAgICBpZiAocGllY2VzWzNdKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBwYWNrZXQuYXJncyA9IHBpZWNlc1szXSA/IEpTT04ucGFyc2UocGllY2VzWzNdKSA6IFtdO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdkaXNjb25uZWN0JzpcbiAgICAgIGNhc2UgJ2hlYXJ0YmVhdCc6XG4gICAgICAgIGJyZWFrO1xuICAgIH07XG5cbiAgICByZXR1cm4gcGFja2V0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBEZWNvZGVzIGRhdGEgcGF5bG9hZC4gRGV0ZWN0cyBtdWx0aXBsZSBtZXNzYWdlc1xuICAgKlxuICAgKiBAcmV0dXJuIHtBcnJheX0gbWVzc2FnZXNcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFyc2VyLmRlY29kZVBheWxvYWQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIC8vIElFIGRvZXNuJ3QgbGlrZSBkYXRhW2ldIGZvciB1bmljb2RlIGNoYXJzLCBjaGFyQXQgd29ya3MgZmluZVxuICAgIGlmIChkYXRhLmNoYXJBdCgwKSA9PSAnXFx1ZmZmZCcpIHtcbiAgICAgIHZhciByZXQgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDEsIGxlbmd0aCA9ICcnOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZGF0YS5jaGFyQXQoaSkgPT0gJ1xcdWZmZmQnKSB7XG4gICAgICAgICAgcmV0LnB1c2gocGFyc2VyLmRlY29kZVBhY2tldChkYXRhLnN1YnN0cihpICsgMSkuc3Vic3RyKDAsIGxlbmd0aCkpKTtcbiAgICAgICAgICBpICs9IE51bWJlcihsZW5ndGgpICsgMTtcbiAgICAgICAgICBsZW5ndGggPSAnJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZW5ndGggKz0gZGF0YS5jaGFyQXQoaSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJldDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtwYXJzZXIuZGVjb2RlUGFja2V0KGRhdGEpXTtcbiAgICB9XG4gIH07XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuKTtcbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0cy5UcmFuc3BvcnQgPSBUcmFuc3BvcnQ7XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgdGhlIHRyYW5zcG9ydCB0ZW1wbGF0ZSBmb3IgYWxsIHN1cHBvcnRlZCB0cmFuc3BvcnQgbWV0aG9kcy5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFRyYW5zcG9ydCAoc29ja2V0LCBzZXNzaWQpIHtcbiAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcbiAgICB0aGlzLnNlc3NpZCA9IHNlc3NpZDtcbiAgfTtcblxuICAvKipcbiAgICogQXBwbHkgRXZlbnRFbWl0dGVyIG1peGluLlxuICAgKi9cblxuICBpby51dGlsLm1peGluKFRyYW5zcG9ydCwgaW8uRXZlbnRFbWl0dGVyKTtcblxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciBoZWFydGJlYXRzIGlzIGVuYWJsZWQgZm9yIHRoaXMgdHJhbnNwb3J0XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLmhlYXJ0YmVhdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlci4gV2hlbiBhIG5ldyByZXNwb25zZSBpcyByZWNlaXZlZFxuICAgKiBpdCB3aWxsIGF1dG9tYXRpY2FsbHkgdXBkYXRlIHRoZSB0aW1lb3V0LCBkZWNvZGUgdGhlIG1lc3NhZ2UgYW5kXG4gICAqIGZvcndhcmRzIHRoZSByZXNwb25zZSB0byB0aGUgb25NZXNzYWdlIGZ1bmN0aW9uIGZvciBmdXJ0aGVyIHByb2Nlc3NpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhIFJlc3BvbnNlIGZyb20gdGhlIHNlcnZlci5cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUub25EYXRhID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB0aGlzLmNsZWFyQ2xvc2VUaW1lb3V0KCk7XG5cbiAgICAvLyBJZiB0aGUgY29ubmVjdGlvbiBpbiBjdXJyZW50bHkgb3BlbiAob3IgaW4gYSByZW9wZW5pbmcgc3RhdGUpIHJlc2V0IHRoZSBjbG9zZVxuICAgIC8vIHRpbWVvdXQgc2luY2Ugd2UgaGF2ZSBqdXN0IHJlY2VpdmVkIGRhdGEuIFRoaXMgY2hlY2sgaXMgbmVjZXNzYXJ5IHNvXG4gICAgLy8gdGhhdCB3ZSBkb24ndCByZXNldCB0aGUgdGltZW91dCBvbiBhbiBleHBsaWNpdGx5IGRpc2Nvbm5lY3RlZCBjb25uZWN0aW9uLlxuICAgIGlmICh0aGlzLnNvY2tldC5jb25uZWN0ZWQgfHwgdGhpcy5zb2NrZXQuY29ubmVjdGluZyB8fCB0aGlzLnNvY2tldC5yZWNvbm5lY3RpbmcpIHtcbiAgICAgIHRoaXMuc2V0Q2xvc2VUaW1lb3V0KCk7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEgIT09ICcnKSB7XG4gICAgICAvLyB0b2RvOiB3ZSBzaG91bGQgb25seSBkbyBkZWNvZGVQYXlsb2FkIGZvciB4aHIgdHJhbnNwb3J0c1xuICAgICAgdmFyIG1zZ3MgPSBpby5wYXJzZXIuZGVjb2RlUGF5bG9hZChkYXRhKTtcblxuICAgICAgaWYgKG1zZ3MgJiYgbXNncy5sZW5ndGgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBtc2dzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIHRoaXMub25QYWNrZXQobXNnc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlcyBwYWNrZXRzLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5vblBhY2tldCA9IGZ1bmN0aW9uIChwYWNrZXQpIHtcbiAgICB0aGlzLnNvY2tldC5zZXRIZWFydGJlYXRUaW1lb3V0KCk7XG5cbiAgICBpZiAocGFja2V0LnR5cGUgPT0gJ2hlYXJ0YmVhdCcpIHtcbiAgICAgIHJldHVybiB0aGlzLm9uSGVhcnRiZWF0KCk7XG4gICAgfVxuXG4gICAgaWYgKHBhY2tldC50eXBlID09ICdjb25uZWN0JyAmJiBwYWNrZXQuZW5kcG9pbnQgPT0gJycpIHtcbiAgICAgIHRoaXMub25Db25uZWN0KCk7XG4gICAgfVxuXG4gICAgaWYgKHBhY2tldC50eXBlID09ICdlcnJvcicgJiYgcGFja2V0LmFkdmljZSA9PSAncmVjb25uZWN0Jykge1xuICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5vblBhY2tldChwYWNrZXQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldHMgY2xvc2UgdGltZW91dFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5zZXRDbG9zZVRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmNsb3NlVGltZW91dCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLmNsb3NlVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLm9uRGlzY29ubmVjdCgpO1xuICAgICAgfSwgdGhpcy5zb2NrZXQuY2xvc2VUaW1lb3V0KTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRyYW5zcG9ydCBkaXNjb25uZWN0cy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUub25EaXNjb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmlzT3BlbikgdGhpcy5jbG9zZSgpO1xuICAgIHRoaXMuY2xlYXJUaW1lb3V0cygpO1xuICAgIHRoaXMuc29ja2V0Lm9uRGlzY29ubmVjdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0cmFuc3BvcnQgY29ubmVjdHNcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUub25Db25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc29ja2V0Lm9uQ29ubmVjdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbGVhcnMgY2xvc2UgdGltZW91dFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5jbGVhckNsb3NlVGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5jbG9zZVRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmNsb3NlVGltZW91dCk7XG4gICAgICB0aGlzLmNsb3NlVGltZW91dCA9IG51bGw7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDbGVhciB0aW1lb3V0c1xuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5jbGVhclRpbWVvdXRzID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2xlYXJDbG9zZVRpbWVvdXQoKTtcblxuICAgIGlmICh0aGlzLnJlb3BlblRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlb3BlblRpbWVvdXQpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogU2VuZHMgYSBwYWNrZXRcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHBhY2tldCBvYmplY3QuXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLnBhY2tldCA9IGZ1bmN0aW9uIChwYWNrZXQpIHtcbiAgICB0aGlzLnNlbmQoaW8ucGFyc2VyLmVuY29kZVBhY2tldChwYWNrZXQpKTtcbiAgfTtcblxuICAvKipcbiAgICogU2VuZCB0aGUgcmVjZWl2ZWQgaGVhcnRiZWF0IG1lc3NhZ2UgYmFjayB0byBzZXJ2ZXIuIFNvIHRoZSBzZXJ2ZXJcbiAgICoga25vd3Mgd2UgYXJlIHN0aWxsIGNvbm5lY3RlZC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGhlYXJ0YmVhdCBIZWFydGJlYXQgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyLlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5vbkhlYXJ0YmVhdCA9IGZ1bmN0aW9uIChoZWFydGJlYXQpIHtcbiAgICB0aGlzLnBhY2tldCh7IHR5cGU6ICdoZWFydGJlYXQnIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdHJhbnNwb3J0IG9wZW5zLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5vbk9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc09wZW4gPSB0cnVlO1xuICAgIHRoaXMuY2xlYXJDbG9zZVRpbWVvdXQoKTtcbiAgICB0aGlzLnNvY2tldC5vbk9wZW4oKTtcbiAgfTtcblxuICAvKipcbiAgICogTm90aWZpZXMgdGhlIGJhc2Ugd2hlbiB0aGUgY29ubmVjdGlvbiB3aXRoIHRoZSBTb2NrZXQuSU8gc2VydmVyXG4gICAqIGhhcyBiZWVuIGRpc2Nvbm5lY3RlZC5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUub25DbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvKiBGSVhNRTogcmVvcGVuIGRlbGF5IGNhdXNpbmcgYSBpbmZpbml0IGxvb3BcbiAgICB0aGlzLnJlb3BlblRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYub3BlbigpO1xuICAgIH0sIHRoaXMuc29ja2V0Lm9wdGlvbnNbJ3Jlb3BlbiBkZWxheSddKTsqL1xuXG4gICAgdGhpcy5pc09wZW4gPSBmYWxzZTtcbiAgICB0aGlzLnNvY2tldC5vbkNsb3NlKCk7XG4gICAgdGhpcy5vbkRpc2Nvbm5lY3QoKTtcbiAgfTtcblxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgY29ubmVjdGlvbiB1cmwgYmFzZWQgb24gdGhlIFNvY2tldC5JTyBVUkwgUHJvdG9jb2wuXG4gICAqIFNlZSA8aHR0cHM6Ly9naXRodWIuY29tL2xlYXJuYm9vc3Qvc29ja2V0LmlvLW5vZGUvPiBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBDb25uZWN0aW9uIHVybFxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5wcmVwYXJlVXJsID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5zb2NrZXQub3B0aW9ucztcblxuICAgIHJldHVybiB0aGlzLnNjaGVtZSgpICsgJzovLydcbiAgICAgICsgb3B0aW9ucy5ob3N0ICsgJzonICsgb3B0aW9ucy5wb3J0ICsgJy8nXG4gICAgICArIG9wdGlvbnMucmVzb3VyY2UgKyAnLycgKyBpby5wcm90b2NvbFxuICAgICAgKyAnLycgKyB0aGlzLm5hbWUgKyAnLycgKyB0aGlzLnNlc3NpZDtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSB0cmFuc3BvcnQgaXMgcmVhZHkgdG8gc3RhcnQgYSBjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge1NvY2tldH0gc29ja2V0IFRoZSBzb2NrZXQgaW5zdGFuY2UgdGhhdCBuZWVkcyBhIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2tcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbiAoc29ja2V0LCBmbikge1xuICAgIGZuLmNhbGwodGhpcyk7XG4gIH07XG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbik7XG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbywgZ2xvYmFsKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0cy5Tb2NrZXQgPSBTb2NrZXQ7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgU29ja2V0LklPIGNsaWVudGAgd2hpY2ggY2FuIGVzdGFibGlzaCBhIHBlcnNpc3RlbnRcbiAgICogY29ubmVjdGlvbiB3aXRoIGEgU29ja2V0LklPIGVuYWJsZWQgc2VydmVyLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBTb2NrZXQgKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgIHBvcnQ6IDgwXG4gICAgICAsIHNlY3VyZTogZmFsc2VcbiAgICAgICwgZG9jdW1lbnQ6ICdkb2N1bWVudCcgaW4gZ2xvYmFsID8gZG9jdW1lbnQgOiBmYWxzZVxuICAgICAgLCByZXNvdXJjZTogJ3NvY2tldC5pbydcbiAgICAgICwgdHJhbnNwb3J0czogaW8udHJhbnNwb3J0c1xuICAgICAgLCAnY29ubmVjdCB0aW1lb3V0JzogMTAwMDBcbiAgICAgICwgJ3RyeSBtdWx0aXBsZSB0cmFuc3BvcnRzJzogdHJ1ZVxuICAgICAgLCAncmVjb25uZWN0JzogdHJ1ZVxuICAgICAgLCAncmVjb25uZWN0aW9uIGRlbGF5JzogNTAwXG4gICAgICAsICdyZWNvbm5lY3Rpb24gbGltaXQnOiBJbmZpbml0eVxuICAgICAgLCAncmVvcGVuIGRlbGF5JzogMzAwMFxuICAgICAgLCAnbWF4IHJlY29ubmVjdGlvbiBhdHRlbXB0cyc6IDEwXG4gICAgICAsICdzeW5jIGRpc2Nvbm5lY3Qgb24gdW5sb2FkJzogZmFsc2VcbiAgICAgICwgJ2F1dG8gY29ubmVjdCc6IHRydWVcbiAgICAgICwgJ2ZsYXNoIHBvbGljeSBwb3J0JzogMTA4NDNcbiAgICAgICwgJ21hbnVhbEZsdXNoJzogZmFsc2VcbiAgICB9O1xuXG4gICAgaW8udXRpbC5tZXJnZSh0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgICB0aGlzLmNvbm5lY3RpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlY29ubmVjdGluZyA9IGZhbHNlO1xuICAgIHRoaXMubmFtZXNwYWNlcyA9IHt9O1xuICAgIHRoaXMuYnVmZmVyID0gW107XG4gICAgdGhpcy5kb0J1ZmZlciA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMub3B0aW9uc1snc3luYyBkaXNjb25uZWN0IG9uIHVubG9hZCddICYmXG4gICAgICAgICghdGhpcy5pc1hEb21haW4oKSB8fCBpby51dGlsLnVhLmhhc0NPUlMpKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBpby51dGlsLm9uKGdsb2JhbCwgJ2JlZm9yZXVubG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5kaXNjb25uZWN0U3luYygpO1xuICAgICAgfSwgZmFsc2UpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnNbJ2F1dG8gY29ubmVjdCddKSB7XG4gICAgICB0aGlzLmNvbm5lY3QoKTtcbiAgICB9XG59O1xuXG4gIC8qKlxuICAgKiBBcHBseSBFdmVudEVtaXR0ZXIgbWl4aW4uXG4gICAqL1xuXG4gIGlvLnV0aWwubWl4aW4oU29ja2V0LCBpby5FdmVudEVtaXR0ZXIpO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmFtZXNwYWNlIGxpc3RlbmVyL2VtaXR0ZXIgZm9yIHRoaXMgc29ja2V0XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUub2YgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmICghdGhpcy5uYW1lc3BhY2VzW25hbWVdKSB7XG4gICAgICB0aGlzLm5hbWVzcGFjZXNbbmFtZV0gPSBuZXcgaW8uU29ja2V0TmFtZXNwYWNlKHRoaXMsIG5hbWUpO1xuXG4gICAgICBpZiAobmFtZSAhPT0gJycpIHtcbiAgICAgICAgdGhpcy5uYW1lc3BhY2VzW25hbWVdLnBhY2tldCh7IHR5cGU6ICdjb25uZWN0JyB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5uYW1lc3BhY2VzW25hbWVdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgZ2l2ZW4gZXZlbnQgdG8gdGhlIFNvY2tldCBhbmQgYWxsIG5hbWVzcGFjZXNcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUucHVibGlzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVtaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHZhciBuc3A7XG5cbiAgICBmb3IgKHZhciBpIGluIHRoaXMubmFtZXNwYWNlcykge1xuICAgICAgaWYgKHRoaXMubmFtZXNwYWNlcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICBuc3AgPSB0aGlzLm9mKGkpO1xuICAgICAgICBuc3AuJGVtaXQuYXBwbHkobnNwLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogUGVyZm9ybXMgdGhlIGhhbmRzaGFrZVxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gZW1wdHkgKCkgeyB9O1xuXG4gIFNvY2tldC5wcm90b3R5cGUuaGFuZHNoYWtlID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICBmdW5jdGlvbiBjb21wbGV0ZSAoZGF0YSkge1xuICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICBzZWxmLmNvbm5lY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgc2VsZi5vbkVycm9yKGRhdGEubWVzc2FnZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbi5hcHBseShudWxsLCBkYXRhLnNwbGl0KCc6JykpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgdXJsID0gW1xuICAgICAgICAgICdodHRwJyArIChvcHRpb25zLnNlY3VyZSA/ICdzJyA6ICcnKSArICc6LydcbiAgICAgICAgLCBvcHRpb25zLmhvc3QgKyAnOicgKyBvcHRpb25zLnBvcnRcbiAgICAgICAgLCBvcHRpb25zLnJlc291cmNlXG4gICAgICAgICwgaW8ucHJvdG9jb2xcbiAgICAgICAgLCBpby51dGlsLnF1ZXJ5KHRoaXMub3B0aW9ucy5xdWVyeSwgJ3Q9JyArICtuZXcgRGF0ZSlcbiAgICAgIF0uam9pbignLycpO1xuXG4gICAgaWYgKHRoaXMuaXNYRG9tYWluKCkgJiYgIWlvLnV0aWwudWEuaGFzQ09SUykge1xuICAgICAgdmFyIGluc2VydEF0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdXG4gICAgICAgICwgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5cbiAgICAgIHNjcmlwdC5zcmMgPSB1cmwgKyAnJmpzb25wPScgKyBpby5qLmxlbmd0aDtcbiAgICAgIGluc2VydEF0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHNjcmlwdCwgaW5zZXJ0QXQpO1xuXG4gICAgICBpby5qLnB1c2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgY29tcGxldGUoZGF0YSk7XG4gICAgICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHhociA9IGlvLnV0aWwucmVxdWVzdCgpO1xuXG4gICAgICB4aHIub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICAgIGlmICh0aGlzLmlzWERvbWFpbigpKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09IDQpIHtcbiAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZW1wdHk7XG5cbiAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgICAgIGNvbXBsZXRlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoeGhyLnN0YXR1cyA9PSA0MDMpIHtcbiAgICAgICAgICAgIHNlbGYub25FcnJvcih4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5jb25uZWN0aW5nID0gZmFsc2U7ICAgICAgICAgICAgXG4gICAgICAgICAgICAhc2VsZi5yZWNvbm5lY3RpbmcgJiYgc2VsZi5vbkVycm9yKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHhoci5zZW5kKG51bGwpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRmluZCBhbiBhdmFpbGFibGUgdHJhbnNwb3J0IGJhc2VkIG9uIHRoZSBvcHRpb25zIHN1cHBsaWVkIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUuZ2V0VHJhbnNwb3J0ID0gZnVuY3Rpb24gKG92ZXJyaWRlKSB7XG4gICAgdmFyIHRyYW5zcG9ydHMgPSBvdmVycmlkZSB8fCB0aGlzLnRyYW5zcG9ydHMsIG1hdGNoO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIHRyYW5zcG9ydDsgdHJhbnNwb3J0ID0gdHJhbnNwb3J0c1tpXTsgaSsrKSB7XG4gICAgICBpZiAoaW8uVHJhbnNwb3J0W3RyYW5zcG9ydF1cbiAgICAgICAgJiYgaW8uVHJhbnNwb3J0W3RyYW5zcG9ydF0uY2hlY2sodGhpcylcbiAgICAgICAgJiYgKCF0aGlzLmlzWERvbWFpbigpIHx8IGlvLlRyYW5zcG9ydFt0cmFuc3BvcnRdLnhkb21haW5DaGVjayh0aGlzKSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBpby5UcmFuc3BvcnRbdHJhbnNwb3J0XSh0aGlzLCB0aGlzLnNlc3Npb25pZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgLyoqXG4gICAqIENvbm5lY3RzIHRvIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl0gQ2FsbGJhY2suXG4gICAqIEByZXR1cm5zIHtpby5Tb2NrZXR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChmbikge1xuICAgIGlmICh0aGlzLmNvbm5lY3RpbmcpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLmNvbm5lY3RpbmcgPSB0cnVlO1xuICAgIFxuICAgIHRoaXMuaGFuZHNoYWtlKGZ1bmN0aW9uIChzaWQsIGhlYXJ0YmVhdCwgY2xvc2UsIHRyYW5zcG9ydHMpIHtcbiAgICAgIHNlbGYuc2Vzc2lvbmlkID0gc2lkO1xuICAgICAgc2VsZi5jbG9zZVRpbWVvdXQgPSBjbG9zZSAqIDEwMDA7XG4gICAgICBzZWxmLmhlYXJ0YmVhdFRpbWVvdXQgPSBoZWFydGJlYXQgKiAxMDAwO1xuICAgICAgaWYoIXNlbGYudHJhbnNwb3J0cylcbiAgICAgICAgICBzZWxmLnRyYW5zcG9ydHMgPSBzZWxmLm9yaWdUcmFuc3BvcnRzID0gKHRyYW5zcG9ydHMgPyBpby51dGlsLmludGVyc2VjdChcbiAgICAgICAgICAgICAgdHJhbnNwb3J0cy5zcGxpdCgnLCcpXG4gICAgICAgICAgICAsIHNlbGYub3B0aW9ucy50cmFuc3BvcnRzXG4gICAgICAgICAgKSA6IHNlbGYub3B0aW9ucy50cmFuc3BvcnRzKTtcblxuICAgICAgc2VsZi5zZXRIZWFydGJlYXRUaW1lb3V0KCk7XG5cbiAgICAgIGZ1bmN0aW9uIGNvbm5lY3QgKHRyYW5zcG9ydHMpe1xuICAgICAgICBpZiAoc2VsZi50cmFuc3BvcnQpIHNlbGYudHJhbnNwb3J0LmNsZWFyVGltZW91dHMoKTtcblxuICAgICAgICBzZWxmLnRyYW5zcG9ydCA9IHNlbGYuZ2V0VHJhbnNwb3J0KHRyYW5zcG9ydHMpO1xuICAgICAgICBpZiAoIXNlbGYudHJhbnNwb3J0KSByZXR1cm4gc2VsZi5wdWJsaXNoKCdjb25uZWN0X2ZhaWxlZCcpO1xuXG4gICAgICAgIC8vIG9uY2UgdGhlIHRyYW5zcG9ydCBpcyByZWFkeVxuICAgICAgICBzZWxmLnRyYW5zcG9ydC5yZWFkeShzZWxmLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2VsZi5jb25uZWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBzZWxmLnB1Ymxpc2goJ2Nvbm5lY3RpbmcnLCBzZWxmLnRyYW5zcG9ydC5uYW1lKTtcbiAgICAgICAgICBzZWxmLnRyYW5zcG9ydC5vcGVuKCk7XG5cbiAgICAgICAgICBpZiAoc2VsZi5vcHRpb25zWydjb25uZWN0IHRpbWVvdXQnXSkge1xuICAgICAgICAgICAgc2VsZi5jb25uZWN0VGltZW91dFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGlmICghc2VsZi5jb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNvbm5lY3RpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmIChzZWxmLm9wdGlvbnNbJ3RyeSBtdWx0aXBsZSB0cmFuc3BvcnRzJ10pIHtcbiAgICAgICAgICAgICAgICAgIHZhciByZW1haW5pbmcgPSBzZWxmLnRyYW5zcG9ydHM7XG5cbiAgICAgICAgICAgICAgICAgIHdoaWxlIChyZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZW1haW5pbmcuc3BsaWNlKDAsMSlbMF0gIT1cbiAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydC5uYW1lKSB7fVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZW1haW5pbmcubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgICBjb25uZWN0KHJlbWFpbmluZyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgc2VsZi5wdWJsaXNoKCdjb25uZWN0X2ZhaWxlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBzZWxmLm9wdGlvbnNbJ2Nvbm5lY3QgdGltZW91dCddKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBjb25uZWN0KHNlbGYudHJhbnNwb3J0cyk7XG5cbiAgICAgIHNlbGYub25jZSgnY29ubmVjdCcsIGZ1bmN0aW9uICgpe1xuICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5jb25uZWN0VGltZW91dFRpbWVyKTtcblxuICAgICAgICBmbiAmJiB0eXBlb2YgZm4gPT0gJ2Z1bmN0aW9uJyAmJiBmbigpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogQ2xlYXJzIGFuZCBzZXRzIGEgbmV3IGhlYXJ0YmVhdCB0aW1lb3V0IHVzaW5nIHRoZSB2YWx1ZSBnaXZlbiBieSB0aGVcbiAgICogc2VydmVyIGR1cmluZyB0aGUgaGFuZHNoYWtlLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5zZXRIZWFydGJlYXRUaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmhlYXJ0YmVhdFRpbWVvdXRUaW1lcik7XG4gICAgaWYodGhpcy50cmFuc3BvcnQgJiYgIXRoaXMudHJhbnNwb3J0LmhlYXJ0YmVhdHMoKSkgcmV0dXJuO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuaGVhcnRiZWF0VGltZW91dFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnRyYW5zcG9ydC5vbkNsb3NlKCk7XG4gICAgfSwgdGhpcy5oZWFydGJlYXRUaW1lb3V0KTtcbiAgfTtcblxuICAvKipcbiAgICogU2VuZHMgYSBtZXNzYWdlLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBwYWNrZXQuXG4gICAqIEByZXR1cm5zIHtpby5Tb2NrZXR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUucGFja2V0ID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBpZiAodGhpcy5jb25uZWN0ZWQgJiYgIXRoaXMuZG9CdWZmZXIpIHtcbiAgICAgIHRoaXMudHJhbnNwb3J0LnBhY2tldChkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWZmZXIucHVzaChkYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogU2V0cyBidWZmZXIgc3RhdGVcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUuc2V0QnVmZmVyID0gZnVuY3Rpb24gKHYpIHtcbiAgICB0aGlzLmRvQnVmZmVyID0gdjtcblxuICAgIGlmICghdiAmJiB0aGlzLmNvbm5lY3RlZCAmJiB0aGlzLmJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgIGlmICghdGhpcy5vcHRpb25zWydtYW51YWxGbHVzaCddKSB7XG4gICAgICAgIHRoaXMuZmx1c2hCdWZmZXIoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEZsdXNoZXMgdGhlIGJ1ZmZlciBkYXRhIG92ZXIgdGhlIHdpcmUuXG4gICAqIFRvIGJlIGludm9rZWQgbWFudWFsbHkgd2hlbiAnbWFudWFsRmx1c2gnIGlzIHNldCB0byB0cnVlLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLmZsdXNoQnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50cmFuc3BvcnQucGF5bG9hZCh0aGlzLmJ1ZmZlcik7XG4gICAgdGhpcy5idWZmZXIgPSBbXTtcbiAgfTtcbiAgXG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3QgdGhlIGVzdGFibGlzaGVkIGNvbm5lY3QuXG4gICAqXG4gICAqIEByZXR1cm5zIHtpby5Tb2NrZXR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5jb25uZWN0ZWQgfHwgdGhpcy5jb25uZWN0aW5nKSB7XG4gICAgICBpZiAodGhpcy5vcGVuKSB7XG4gICAgICAgIHRoaXMub2YoJycpLnBhY2tldCh7IHR5cGU6ICdkaXNjb25uZWN0JyB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gaGFuZGxlIGRpc2Nvbm5lY3Rpb24gaW1tZWRpYXRlbHlcbiAgICAgIHRoaXMub25EaXNjb25uZWN0KCdib290ZWQnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogRGlzY29ubmVjdHMgdGhlIHNvY2tldCB3aXRoIGEgc3luYyBYSFIuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLmRpc2Nvbm5lY3RTeW5jID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIGVuc3VyZSBkaXNjb25uZWN0aW9uXG4gICAgdmFyIHhociA9IGlvLnV0aWwucmVxdWVzdCgpO1xuICAgIHZhciB1cmkgPSBbXG4gICAgICAgICdodHRwJyArICh0aGlzLm9wdGlvbnMuc2VjdXJlID8gJ3MnIDogJycpICsgJzovJ1xuICAgICAgLCB0aGlzLm9wdGlvbnMuaG9zdCArICc6JyArIHRoaXMub3B0aW9ucy5wb3J0XG4gICAgICAsIHRoaXMub3B0aW9ucy5yZXNvdXJjZVxuICAgICAgLCBpby5wcm90b2NvbFxuICAgICAgLCAnJ1xuICAgICAgLCB0aGlzLnNlc3Npb25pZFxuICAgIF0uam9pbignLycpICsgJy8/ZGlzY29ubmVjdD0xJztcblxuICAgIHhoci5vcGVuKCdHRVQnLCB1cmksIGZhbHNlKTtcbiAgICB4aHIuc2VuZChudWxsKTtcblxuICAgIC8vIGhhbmRsZSBkaXNjb25uZWN0aW9uIGltbWVkaWF0ZWx5XG4gICAgdGhpcy5vbkRpc2Nvbm5lY3QoJ2Jvb3RlZCcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB3ZSBuZWVkIHRvIHVzZSBjcm9zcyBkb21haW4gZW5hYmxlZCB0cmFuc3BvcnRzLiBDcm9zcyBkb21haW4gd291bGRcbiAgICogYmUgYSBkaWZmZXJlbnQgcG9ydCBvciBkaWZmZXJlbnQgZG9tYWluIG5hbWUuXG4gICAqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5pc1hEb21haW4gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgcG9ydCA9IGdsb2JhbC5sb2NhdGlvbi5wb3J0IHx8XG4gICAgICAoJ2h0dHBzOicgPT0gZ2xvYmFsLmxvY2F0aW9uLnByb3RvY29sID8gNDQzIDogODApO1xuXG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5ob3N0ICE9PSBnbG9iYWwubG9jYXRpb24uaG9zdG5hbWUgXG4gICAgICB8fCB0aGlzLm9wdGlvbnMucG9ydCAhPSBwb3J0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgdXBvbiBoYW5kc2hha2UuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLm9uQ29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuY29ubmVjdGVkKSB7XG4gICAgICB0aGlzLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICB0aGlzLmNvbm5lY3RpbmcgPSBmYWxzZTtcbiAgICAgIGlmICghdGhpcy5kb0J1ZmZlcikge1xuICAgICAgICAvLyBtYWtlIHN1cmUgdG8gZmx1c2ggdGhlIGJ1ZmZlclxuICAgICAgICB0aGlzLnNldEJ1ZmZlcihmYWxzZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoJ2Nvbm5lY3QnKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB0cmFuc3BvcnQgb3BlbnNcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUub25PcGVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub3BlbiA9IHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB0cmFuc3BvcnQgY2xvc2VzLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5vbkNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmhlYXJ0YmVhdFRpbWVvdXRUaW1lcik7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB0cmFuc3BvcnQgZmlyc3Qgb3BlbnMgYSBjb25uZWN0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB0ZXh0XG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUub25QYWNrZXQgPSBmdW5jdGlvbiAocGFja2V0KSB7XG4gICAgdGhpcy5vZihwYWNrZXQuZW5kcG9pbnQpLm9uUGFja2V0KHBhY2tldCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgYW4gZXJyb3IuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLm9uRXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgaWYgKGVyciAmJiBlcnIuYWR2aWNlKSB7XG4gICAgICBpZiAoZXJyLmFkdmljZSA9PT0gJ3JlY29ubmVjdCcgJiYgKHRoaXMuY29ubmVjdGVkIHx8IHRoaXMuY29ubmVjdGluZykpIHtcbiAgICAgICAgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmVjb25uZWN0KSB7XG4gICAgICAgICAgdGhpcy5yZWNvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucHVibGlzaCgnZXJyb3InLCBlcnIgJiYgZXJyLnJlYXNvbiA/IGVyci5yZWFzb24gOiBlcnIpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdHJhbnNwb3J0IGRpc2Nvbm5lY3RzLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5vbkRpc2Nvbm5lY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgdmFyIHdhc0Nvbm5lY3RlZCA9IHRoaXMuY29ubmVjdGVkXG4gICAgICAsIHdhc0Nvbm5lY3RpbmcgPSB0aGlzLmNvbm5lY3Rpbmc7XG5cbiAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuY29ubmVjdGluZyA9IGZhbHNlO1xuICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuXG4gICAgaWYgKHdhc0Nvbm5lY3RlZCB8fCB3YXNDb25uZWN0aW5nKSB7XG4gICAgICB0aGlzLnRyYW5zcG9ydC5jbG9zZSgpO1xuICAgICAgdGhpcy50cmFuc3BvcnQuY2xlYXJUaW1lb3V0cygpO1xuICAgICAgaWYgKHdhc0Nvbm5lY3RlZCkge1xuICAgICAgICB0aGlzLnB1Ymxpc2goJ2Rpc2Nvbm5lY3QnLCByZWFzb24pO1xuXG4gICAgICAgIGlmICgnYm9vdGVkJyAhPSByZWFzb24gJiYgdGhpcy5vcHRpb25zLnJlY29ubmVjdCAmJiAhdGhpcy5yZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgICB0aGlzLnJlY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgdXBvbiByZWNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLnJlY29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnJlY29ubmVjdGluZyA9IHRydWU7XG4gICAgdGhpcy5yZWNvbm5lY3Rpb25BdHRlbXB0cyA9IDA7XG4gICAgdGhpcy5yZWNvbm5lY3Rpb25EZWxheSA9IHRoaXMub3B0aW9uc1sncmVjb25uZWN0aW9uIGRlbGF5J107XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgbWF4QXR0ZW1wdHMgPSB0aGlzLm9wdGlvbnNbJ21heCByZWNvbm5lY3Rpb24gYXR0ZW1wdHMnXVxuICAgICAgLCB0cnlNdWx0aXBsZSA9IHRoaXMub3B0aW9uc1sndHJ5IG11bHRpcGxlIHRyYW5zcG9ydHMnXVxuICAgICAgLCBsaW1pdCA9IHRoaXMub3B0aW9uc1sncmVjb25uZWN0aW9uIGxpbWl0J107XG5cbiAgICBmdW5jdGlvbiByZXNldCAoKSB7XG4gICAgICBpZiAoc2VsZi5jb25uZWN0ZWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBzZWxmLm5hbWVzcGFjZXMpIHtcbiAgICAgICAgICBpZiAoc2VsZi5uYW1lc3BhY2VzLmhhc093blByb3BlcnR5KGkpICYmICcnICE9PSBpKSB7XG4gICAgICAgICAgICAgIHNlbGYubmFtZXNwYWNlc1tpXS5wYWNrZXQoeyB0eXBlOiAnY29ubmVjdCcgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNlbGYucHVibGlzaCgncmVjb25uZWN0Jywgc2VsZi50cmFuc3BvcnQubmFtZSwgc2VsZi5yZWNvbm5lY3Rpb25BdHRlbXB0cyk7XG4gICAgICB9XG5cbiAgICAgIGNsZWFyVGltZW91dChzZWxmLnJlY29ubmVjdGlvblRpbWVyKTtcblxuICAgICAgc2VsZi5yZW1vdmVMaXN0ZW5lcignY29ubmVjdF9mYWlsZWQnLCBtYXliZVJlY29ubmVjdCk7XG4gICAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKCdjb25uZWN0JywgbWF5YmVSZWNvbm5lY3QpO1xuXG4gICAgICBzZWxmLnJlY29ubmVjdGluZyA9IGZhbHNlO1xuXG4gICAgICBkZWxldGUgc2VsZi5yZWNvbm5lY3Rpb25BdHRlbXB0cztcbiAgICAgIGRlbGV0ZSBzZWxmLnJlY29ubmVjdGlvbkRlbGF5O1xuICAgICAgZGVsZXRlIHNlbGYucmVjb25uZWN0aW9uVGltZXI7XG4gICAgICBkZWxldGUgc2VsZi5yZWRvVHJhbnNwb3J0cztcblxuICAgICAgc2VsZi5vcHRpb25zWyd0cnkgbXVsdGlwbGUgdHJhbnNwb3J0cyddID0gdHJ5TXVsdGlwbGU7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG1heWJlUmVjb25uZWN0ICgpIHtcbiAgICAgIGlmICghc2VsZi5yZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZi5jb25uZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlc2V0KCk7XG4gICAgICB9O1xuXG4gICAgICBpZiAoc2VsZi5jb25uZWN0aW5nICYmIHNlbGYucmVjb25uZWN0aW5nKSB7XG4gICAgICAgIHJldHVybiBzZWxmLnJlY29ubmVjdGlvblRpbWVyID0gc2V0VGltZW91dChtYXliZVJlY29ubmVjdCwgMTAwMCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxmLnJlY29ubmVjdGlvbkF0dGVtcHRzKysgPj0gbWF4QXR0ZW1wdHMpIHtcbiAgICAgICAgaWYgKCFzZWxmLnJlZG9UcmFuc3BvcnRzKSB7XG4gICAgICAgICAgc2VsZi5vbignY29ubmVjdF9mYWlsZWQnLCBtYXliZVJlY29ubmVjdCk7XG4gICAgICAgICAgc2VsZi5vcHRpb25zWyd0cnkgbXVsdGlwbGUgdHJhbnNwb3J0cyddID0gdHJ1ZTtcbiAgICAgICAgICBzZWxmLnRyYW5zcG9ydHMgPSBzZWxmLm9yaWdUcmFuc3BvcnRzO1xuICAgICAgICAgIHNlbGYudHJhbnNwb3J0ID0gc2VsZi5nZXRUcmFuc3BvcnQoKTtcbiAgICAgICAgICBzZWxmLnJlZG9UcmFuc3BvcnRzID0gdHJ1ZTtcbiAgICAgICAgICBzZWxmLmNvbm5lY3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLnB1Ymxpc2goJ3JlY29ubmVjdF9mYWlsZWQnKTtcbiAgICAgICAgICByZXNldCgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2VsZi5yZWNvbm5lY3Rpb25EZWxheSA8IGxpbWl0KSB7XG4gICAgICAgICAgc2VsZi5yZWNvbm5lY3Rpb25EZWxheSAqPSAyOyAvLyBleHBvbmVudGlhbCBiYWNrIG9mZlxuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5jb25uZWN0KCk7XG4gICAgICAgIHNlbGYucHVibGlzaCgncmVjb25uZWN0aW5nJywgc2VsZi5yZWNvbm5lY3Rpb25EZWxheSwgc2VsZi5yZWNvbm5lY3Rpb25BdHRlbXB0cyk7XG4gICAgICAgIHNlbGYucmVjb25uZWN0aW9uVGltZXIgPSBzZXRUaW1lb3V0KG1heWJlUmVjb25uZWN0LCBzZWxmLnJlY29ubmVjdGlvbkRlbGF5KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5vcHRpb25zWyd0cnkgbXVsdGlwbGUgdHJhbnNwb3J0cyddID0gZmFsc2U7XG4gICAgdGhpcy5yZWNvbm5lY3Rpb25UaW1lciA9IHNldFRpbWVvdXQobWF5YmVSZWNvbm5lY3QsIHRoaXMucmVjb25uZWN0aW9uRGVsYXkpO1xuXG4gICAgdGhpcy5vbignY29ubmVjdCcsIG1heWJlUmVjb25uZWN0KTtcbiAgfTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4gICwgdGhpc1xuKTtcbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0cy5Tb2NrZXROYW1lc3BhY2UgPSBTb2NrZXROYW1lc3BhY2U7XG5cbiAgLyoqXG4gICAqIFNvY2tldCBuYW1lc3BhY2UgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBTb2NrZXROYW1lc3BhY2UgKHNvY2tldCwgbmFtZSkge1xuICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgJyc7XG4gICAgdGhpcy5mbGFncyA9IHt9O1xuICAgIHRoaXMuanNvbiA9IG5ldyBGbGFnKHRoaXMsICdqc29uJyk7XG4gICAgdGhpcy5hY2tQYWNrZXRzID0gMDtcbiAgICB0aGlzLmFja3MgPSB7fTtcbiAgfTtcblxuICAvKipcbiAgICogQXBwbHkgRXZlbnRFbWl0dGVyIG1peGluLlxuICAgKi9cblxuICBpby51dGlsLm1peGluKFNvY2tldE5hbWVzcGFjZSwgaW8uRXZlbnRFbWl0dGVyKTtcblxuICAvKipcbiAgICogQ29waWVzIGVtaXQgc2luY2Ugd2Ugb3ZlcnJpZGUgaXRcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldE5hbWVzcGFjZS5wcm90b3R5cGUuJGVtaXQgPSBpby5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQ7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgbmFtZXNwYWNlLCBieSBwcm94eWluZyB0aGUgcmVxdWVzdCB0byB0aGUgc29ja2V0LiBUaGlzXG4gICAqIGFsbG93cyB1cyB0byB1c2UgdGhlIHN5bmF4IGFzIHdlIGRvIG9uIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFNvY2tldE5hbWVzcGFjZS5wcm90b3R5cGUub2YgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0Lm9mLmFwcGx5KHRoaXMuc29ja2V0LCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kcyBhIHBhY2tldC5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldE5hbWVzcGFjZS5wcm90b3R5cGUucGFja2V0ID0gZnVuY3Rpb24gKHBhY2tldCkge1xuICAgIHBhY2tldC5lbmRwb2ludCA9IHRoaXMubmFtZTtcbiAgICB0aGlzLnNvY2tldC5wYWNrZXQocGFja2V0KTtcbiAgICB0aGlzLmZsYWdzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmRzIGEgbWVzc2FnZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBTb2NrZXROYW1lc3BhY2UucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoZGF0YSwgZm4pIHtcbiAgICB2YXIgcGFja2V0ID0ge1xuICAgICAgICB0eXBlOiB0aGlzLmZsYWdzLmpzb24gPyAnanNvbicgOiAnbWVzc2FnZSdcbiAgICAgICwgZGF0YTogZGF0YVxuICAgIH07XG5cbiAgICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZm4pIHtcbiAgICAgIHBhY2tldC5pZCA9ICsrdGhpcy5hY2tQYWNrZXRzO1xuICAgICAgcGFja2V0LmFjayA9IHRydWU7XG4gICAgICB0aGlzLmFja3NbcGFja2V0LmlkXSA9IGZuO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnBhY2tldChwYWNrZXQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFbWl0cyBhbiBldmVudFxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgXG4gIFNvY2tldE5hbWVzcGFjZS5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgICAsIGxhc3RBcmcgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV1cbiAgICAgICwgcGFja2V0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ2V2ZW50J1xuICAgICAgICAgICwgbmFtZTogbmFtZVxuICAgICAgICB9O1xuXG4gICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGxhc3RBcmcpIHtcbiAgICAgIHBhY2tldC5pZCA9ICsrdGhpcy5hY2tQYWNrZXRzO1xuICAgICAgcGFja2V0LmFjayA9ICdkYXRhJztcbiAgICAgIHRoaXMuYWNrc1twYWNrZXQuaWRdID0gbGFzdEFyZztcbiAgICAgIGFyZ3MgPSBhcmdzLnNsaWNlKDAsIGFyZ3MubGVuZ3RoIC0gMSk7XG4gICAgfVxuXG4gICAgcGFja2V0LmFyZ3MgPSBhcmdzO1xuXG4gICAgcmV0dXJuIHRoaXMucGFja2V0KHBhY2tldCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3RzIHRoZSBuYW1lc3BhY2VcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldE5hbWVzcGFjZS5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5uYW1lID09PSAnJykge1xuICAgICAgdGhpcy5zb2NrZXQuZGlzY29ubmVjdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBhY2tldCh7IHR5cGU6ICdkaXNjb25uZWN0JyB9KTtcbiAgICAgIHRoaXMuJGVtaXQoJ2Rpc2Nvbm5lY3QnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlcyBhIHBhY2tldFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZS5vblBhY2tldCA9IGZ1bmN0aW9uIChwYWNrZXQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiBhY2sgKCkge1xuICAgICAgc2VsZi5wYWNrZXQoe1xuICAgICAgICAgIHR5cGU6ICdhY2snXG4gICAgICAgICwgYXJnczogaW8udXRpbC50b0FycmF5KGFyZ3VtZW50cylcbiAgICAgICAgLCBhY2tJZDogcGFja2V0LmlkXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgc3dpdGNoIChwYWNrZXQudHlwZSkge1xuICAgICAgY2FzZSAnY29ubmVjdCc6XG4gICAgICAgIHRoaXMuJGVtaXQoJ2Nvbm5lY3QnKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Rpc2Nvbm5lY3QnOlxuICAgICAgICBpZiAodGhpcy5uYW1lID09PSAnJykge1xuICAgICAgICAgIHRoaXMuc29ja2V0Lm9uRGlzY29ubmVjdChwYWNrZXQucmVhc29uIHx8ICdib290ZWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLiRlbWl0KCdkaXNjb25uZWN0JywgcGFja2V0LnJlYXNvbik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ21lc3NhZ2UnOlxuICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgIHZhciBwYXJhbXMgPSBbJ21lc3NhZ2UnLCBwYWNrZXQuZGF0YV07XG5cbiAgICAgICAgaWYgKHBhY2tldC5hY2sgPT0gJ2RhdGEnKSB7XG4gICAgICAgICAgcGFyYW1zLnB1c2goYWNrKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYWNrZXQuYWNrKSB7XG4gICAgICAgICAgdGhpcy5wYWNrZXQoeyB0eXBlOiAnYWNrJywgYWNrSWQ6IHBhY2tldC5pZCB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuJGVtaXQuYXBwbHkodGhpcywgcGFyYW1zKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2V2ZW50JzpcbiAgICAgICAgdmFyIHBhcmFtcyA9IFtwYWNrZXQubmFtZV0uY29uY2F0KHBhY2tldC5hcmdzKTtcblxuICAgICAgICBpZiAocGFja2V0LmFjayA9PSAnZGF0YScpXG4gICAgICAgICAgcGFyYW1zLnB1c2goYWNrKTtcblxuICAgICAgICB0aGlzLiRlbWl0LmFwcGx5KHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdhY2snOlxuICAgICAgICBpZiAodGhpcy5hY2tzW3BhY2tldC5hY2tJZF0pIHtcbiAgICAgICAgICB0aGlzLmFja3NbcGFja2V0LmFja0lkXS5hcHBseSh0aGlzLCBwYWNrZXQuYXJncyk7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuYWNrc1twYWNrZXQuYWNrSWRdO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgIGlmIChwYWNrZXQuYWR2aWNlKXtcbiAgICAgICAgICB0aGlzLnNvY2tldC5vbkVycm9yKHBhY2tldCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHBhY2tldC5yZWFzb24gPT0gJ3VuYXV0aG9yaXplZCcpIHtcbiAgICAgICAgICAgIHRoaXMuJGVtaXQoJ2Nvbm5lY3RfZmFpbGVkJywgcGFja2V0LnJlYXNvbik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuJGVtaXQoJ2Vycm9yJywgcGFja2V0LnJlYXNvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRmxhZyBpbnRlcmZhY2UuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBGbGFnIChuc3AsIG5hbWUpIHtcbiAgICB0aGlzLm5hbWVzcGFjZSA9IG5zcDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kIGEgbWVzc2FnZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBGbGFnLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubmFtZXNwYWNlLmZsYWdzW3RoaXMubmFtZV0gPSB0cnVlO1xuICAgIHRoaXMubmFtZXNwYWNlLnNlbmQuYXBwbHkodGhpcy5uYW1lc3BhY2UsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEVtaXQgYW4gZXZlbnRcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRmxhZy5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm5hbWVzcGFjZS5mbGFnc1t0aGlzLm5hbWVdID0gdHJ1ZTtcbiAgICB0aGlzLm5hbWVzcGFjZS5lbWl0LmFwcGx5KHRoaXMubmFtZXNwYWNlLCBhcmd1bWVudHMpO1xuICB9O1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbik7XG5cbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvLCBnbG9iYWwpIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzLndlYnNvY2tldCA9IFdTO1xuXG4gIC8qKlxuICAgKiBUaGUgV2ViU29ja2V0IHRyYW5zcG9ydCB1c2VzIHRoZSBIVE1MNSBXZWJTb2NrZXQgQVBJIHRvIGVzdGFibGlzaCBhblxuICAgKiBwZXJzaXN0ZW50IGNvbm5lY3Rpb24gd2l0aCB0aGUgU29ja2V0LklPIHNlcnZlci4gVGhpcyB0cmFuc3BvcnQgd2lsbCBhbHNvXG4gICAqIGJlIGluaGVyaXRlZCBieSB0aGUgRmxhc2hTb2NrZXQgZmFsbGJhY2sgYXMgaXQgcHJvdmlkZXMgYSBBUEkgY29tcGF0aWJsZVxuICAgKiBwb2x5ZmlsbCBmb3IgdGhlIFdlYlNvY2tldHMuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAZXh0ZW5kcyB7aW8uVHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBXUyAoc29ja2V0KSB7XG4gICAgaW8uVHJhbnNwb3J0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaGVyaXRzIGZyb20gVHJhbnNwb3J0LlxuICAgKi9cblxuICBpby51dGlsLmluaGVyaXQoV1MsIGlvLlRyYW5zcG9ydCk7XG5cbiAgLyoqXG4gICAqIFRyYW5zcG9ydCBuYW1lXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFdTLnByb3RvdHlwZS5uYW1lID0gJ3dlYnNvY2tldCc7XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGEgbmV3IGBXZWJTb2NrZXRgIGNvbm5lY3Rpb24gd2l0aCB0aGUgU29ja2V0LklPIHNlcnZlci4gV2UgYXR0YWNoXG4gICAqIGFsbCB0aGUgYXBwcm9wcmlhdGUgbGlzdGVuZXJzIHRvIGhhbmRsZSB0aGUgcmVzcG9uc2VzIGZyb20gdGhlIHNlcnZlci5cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgV1MucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHF1ZXJ5ID0gaW8udXRpbC5xdWVyeSh0aGlzLnNvY2tldC5vcHRpb25zLnF1ZXJ5KVxuICAgICAgLCBzZWxmID0gdGhpc1xuICAgICAgLCBTb2NrZXRcblxuXG4gICAgaWYgKCFTb2NrZXQpIHtcbiAgICAgIFNvY2tldCA9IGdsb2JhbC5Nb3pXZWJTb2NrZXQgfHwgZ2xvYmFsLldlYlNvY2tldDtcbiAgICB9XG5cbiAgICB0aGlzLndlYnNvY2tldCA9IG5ldyBTb2NrZXQodGhpcy5wcmVwYXJlVXJsKCkgKyBxdWVyeSk7XG5cbiAgICB0aGlzLndlYnNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLm9uT3BlbigpO1xuICAgICAgc2VsZi5zb2NrZXQuc2V0QnVmZmVyKGZhbHNlKTtcbiAgICB9O1xuICAgIHRoaXMud2Vic29ja2V0Lm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldikge1xuICAgICAgc2VsZi5vbkRhdGEoZXYuZGF0YSk7XG4gICAgfTtcbiAgICB0aGlzLndlYnNvY2tldC5vbmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5vbkNsb3NlKCk7XG4gICAgICBzZWxmLnNvY2tldC5zZXRCdWZmZXIodHJ1ZSk7XG4gICAgfTtcbiAgICB0aGlzLndlYnNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIHNlbGYub25FcnJvcihlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmQgYSBtZXNzYWdlIHRvIHRoZSBTb2NrZXQuSU8gc2VydmVyLiBUaGUgbWVzc2FnZSB3aWxsIGF1dG9tYXRpY2FsbHkgYmVcbiAgICogZW5jb2RlZCBpbiB0aGUgY29ycmVjdCBtZXNzYWdlIGZvcm1hdC5cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgLy8gRG8gdG8gYSBidWcgaW4gdGhlIGN1cnJlbnQgSURldmljZXMgYnJvd3Nlciwgd2UgbmVlZCB0byB3cmFwIHRoZSBzZW5kIGluIGEgXG4gIC8vIHNldFRpbWVvdXQsIHdoZW4gdGhleSByZXN1bWUgZnJvbSBzbGVlcGluZyB0aGUgYnJvd3NlciB3aWxsIGNyYXNoIGlmIFxuICAvLyB3ZSBkb24ndCBhbGxvdyB0aGUgYnJvd3NlciB0aW1lIHRvIGRldGVjdCB0aGUgc29ja2V0IGhhcyBiZWVuIGNsb3NlZFxuICBpZiAoaW8udXRpbC51YS5pRGV2aWNlKSB7XG4gICAgV1MucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgIHNlbGYud2Vic29ja2V0LnNlbmQoZGF0YSk7XG4gICAgICB9LDApO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBXUy5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICB0aGlzLndlYnNvY2tldC5zZW5kKGRhdGEpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXlsb2FkXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBXUy5wcm90b3R5cGUucGF5bG9hZCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFyci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMucGFja2V0KGFycltpXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0IHRoZSBlc3RhYmxpc2hlZCBgV2ViU29ja2V0YCBjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBXUy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy53ZWJzb2NrZXQuY2xvc2UoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlIHRoZSBlcnJvcnMgdGhhdCBgV2ViU29ja2V0YCBtaWdodCBiZSBnaXZpbmcgd2hlbiB3ZVxuICAgKiBhcmUgYXR0ZW1wdGluZyB0byBjb25uZWN0IG9yIHNlbmQgbWVzc2FnZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7RXJyb3J9IGUgVGhlIGVycm9yLlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgV1MucHJvdG90eXBlLm9uRXJyb3IgPSBmdW5jdGlvbiAoZSkge1xuICAgIHRoaXMuc29ja2V0Lm9uRXJyb3IoZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFwcHJvcHJpYXRlIHNjaGVtZSBmb3IgdGhlIFVSSSBnZW5lcmF0aW9uLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIFdTLnByb3RvdHlwZS5zY2hlbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0Lm9wdGlvbnMuc2VjdXJlID8gJ3dzcycgOiAnd3MnO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGJyb3dzZXIgaGFzIHN1cHBvcnQgZm9yIG5hdGl2ZSBgV2ViU29ja2V0c2AgYW5kIHRoYXRcbiAgICogaXQncyBub3QgdGhlIHBvbHlmaWxsIGNyZWF0ZWQgZm9yIHRoZSBGbGFzaFNvY2tldCB0cmFuc3BvcnQuXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFdTLmNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoJ1dlYlNvY2tldCcgaW4gZ2xvYmFsICYmICEoJ19fYWRkVGFzaycgaW4gV2ViU29ja2V0KSlcbiAgICAgICAgICB8fCAnTW96V2ViU29ja2V0JyBpbiBnbG9iYWw7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBgV2ViU29ja2V0YCB0cmFuc3BvcnQgc3VwcG9ydCBjcm9zcyBkb21haW4gY29tbXVuaWNhdGlvbnMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBXUy54ZG9tYWluQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgdHJhbnNwb3J0IHRvIHlvdXIgcHVibGljIGlvLnRyYW5zcG9ydHMgYXJyYXkuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBpby50cmFuc3BvcnRzLnB1c2goJ3dlYnNvY2tldCcpO1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpby5UcmFuc3BvcnQgOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4gICwgdGhpc1xuKTtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8pIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzLmZsYXNoc29ja2V0ID0gRmxhc2hzb2NrZXQ7XG5cbiAgLyoqXG4gICAqIFRoZSBGbGFzaFNvY2tldCB0cmFuc3BvcnQuIFRoaXMgaXMgYSBBUEkgd3JhcHBlciBmb3IgdGhlIEhUTUw1IFdlYlNvY2tldFxuICAgKiBzcGVjaWZpY2F0aW9uLiBJdCB1c2VzIGEgLnN3ZiBmaWxlIHRvIGNvbW11bmljYXRlIHdpdGggdGhlIHNlcnZlci4gSWYgeW91IHdhbnRcbiAgICogdG8gc2VydmUgdGhlIC5zd2YgZmlsZSBmcm9tIGEgb3RoZXIgc2VydmVyIHRoYW4gd2hlcmUgdGhlIFNvY2tldC5JTyBzY3JpcHQgaXNcbiAgICogY29taW5nIGZyb20geW91IG5lZWQgdG8gdXNlIHRoZSBpbnNlY3VyZSB2ZXJzaW9uIG9mIHRoZSAuc3dmLiBNb3JlIGluZm9ybWF0aW9uXG4gICAqIGFib3V0IHRoaXMgY2FuIGJlIGZvdW5kIG9uIHRoZSBnaXRodWIgcGFnZS5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBleHRlbmRzIHtpby5UcmFuc3BvcnQud2Vic29ja2V0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBGbGFzaHNvY2tldCAoKSB7XG4gICAgaW8uVHJhbnNwb3J0LndlYnNvY2tldC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbmhlcml0cyBmcm9tIFRyYW5zcG9ydC5cbiAgICovXG5cbiAgaW8udXRpbC5pbmhlcml0KEZsYXNoc29ja2V0LCBpby5UcmFuc3BvcnQud2Vic29ja2V0KTtcblxuICAvKipcbiAgICogVHJhbnNwb3J0IG5hbWVcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRmxhc2hzb2NrZXQucHJvdG90eXBlLm5hbWUgPSAnZmxhc2hzb2NrZXQnO1xuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0IHRoZSBlc3RhYmxpc2hlZCBgRmxhc2hTb2NrZXRgIGNvbm5lY3Rpb24uIFRoaXMgaXMgZG9uZSBieSBhZGRpbmcgYSBcbiAgICogbmV3IHRhc2sgdG8gdGhlIEZsYXNoU29ja2V0LiBUaGUgcmVzdCB3aWxsIGJlIGhhbmRsZWQgb2ZmIGJ5IHRoZSBgV2ViU29ja2V0YCBcbiAgICogdHJhbnNwb3J0LlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBGbGFzaHNvY2tldC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgYXJncyA9IGFyZ3VtZW50cztcblxuICAgIFdlYlNvY2tldC5fX2FkZFRhc2soZnVuY3Rpb24gKCkge1xuICAgICAgaW8uVHJhbnNwb3J0LndlYnNvY2tldC5wcm90b3R5cGUub3Blbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgXG4gIC8qKlxuICAgKiBTZW5kcyBhIG1lc3NhZ2UgdG8gdGhlIFNvY2tldC5JTyBzZXJ2ZXIuIFRoaXMgaXMgZG9uZSBieSBhZGRpbmcgYSBuZXdcbiAgICogdGFzayB0byB0aGUgRmxhc2hTb2NrZXQuIFRoZSByZXN0IHdpbGwgYmUgaGFuZGxlZCBvZmYgYnkgdGhlIGBXZWJTb2NrZXRgIFxuICAgKiB0cmFuc3BvcnQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYXNoc29ja2V0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcbiAgICBXZWJTb2NrZXQuX19hZGRUYXNrKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlvLlRyYW5zcG9ydC53ZWJzb2NrZXQucHJvdG90eXBlLnNlbmQuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3RzIHRoZSBlc3RhYmxpc2hlZCBgRmxhc2hTb2NrZXRgIGNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYXNoc29ja2V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBXZWJTb2NrZXQuX190YXNrcy5sZW5ndGggPSAwO1xuICAgIGlvLlRyYW5zcG9ydC53ZWJzb2NrZXQucHJvdG90eXBlLmNsb3NlLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoZSBXZWJTb2NrZXQgZmFsbCBiYWNrIG5lZWRzIHRvIGFwcGVuZCB0aGUgZmxhc2ggY29udGFpbmVyIHRvIHRoZSBib2R5XG4gICAqIGVsZW1lbnQsIHNvIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHdlIGhhdmUgYWNjZXNzIHRvIGl0LiBPciBkZWZlciB0aGUgY2FsbFxuICAgKiB1bnRpbCB3ZSBhcmUgc3VyZSB0aGVyZSBpcyBhIGJvZHkgZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtTb2NrZXR9IHNvY2tldCBUaGUgc29ja2V0IGluc3RhbmNlIHRoYXQgbmVlZHMgYSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBGbGFzaHNvY2tldC5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbiAoc29ja2V0LCBmbikge1xuICAgIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSBzb2NrZXQub3B0aW9uc1xuICAgICAgICAsIHBvcnQgPSBvcHRpb25zWydmbGFzaCBwb2xpY3kgcG9ydCddXG4gICAgICAgICwgcGF0aCA9IFtcbiAgICAgICAgICAgICAgJ2h0dHAnICsgKG9wdGlvbnMuc2VjdXJlID8gJ3MnIDogJycpICsgJzovJ1xuICAgICAgICAgICAgLCBvcHRpb25zLmhvc3QgKyAnOicgKyBvcHRpb25zLnBvcnRcbiAgICAgICAgICAgICwgb3B0aW9ucy5yZXNvdXJjZVxuICAgICAgICAgICAgLCAnc3RhdGljL2ZsYXNoc29ja2V0J1xuICAgICAgICAgICAgLCAnV2ViU29ja2V0TWFpbicgKyAoc29ja2V0LmlzWERvbWFpbigpID8gJ0luc2VjdXJlJyA6ICcnKSArICcuc3dmJ1xuICAgICAgICAgIF07XG5cbiAgICAgIC8vIE9ubHkgc3RhcnQgZG93bmxvYWRpbmcgdGhlIHN3ZiBmaWxlIHdoZW4gdGhlIGNoZWNrZWQgdGhhdCB0aGlzIGJyb3dzZXJcbiAgICAgIC8vIGFjdHVhbGx5IHN1cHBvcnRzIGl0XG4gICAgICBpZiAoIUZsYXNoc29ja2V0LmxvYWRlZCkge1xuICAgICAgICBpZiAodHlwZW9mIFdFQl9TT0NLRVRfU1dGX0xPQ0FUSU9OID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vIFNldCB0aGUgY29ycmVjdCBmaWxlIGJhc2VkIG9uIHRoZSBYRG9tYWluIHNldHRpbmdzXG4gICAgICAgICAgV0VCX1NPQ0tFVF9TV0ZfTE9DQVRJT04gPSBwYXRoLmpvaW4oJy8nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3J0ICE9PSA4NDMpIHtcbiAgICAgICAgICBXZWJTb2NrZXQubG9hZEZsYXNoUG9saWN5RmlsZSgneG1sc29ja2V0Oi8vJyArIG9wdGlvbnMuaG9zdCArICc6JyArIHBvcnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgV2ViU29ja2V0Ll9faW5pdGlhbGl6ZSgpO1xuICAgICAgICBGbGFzaHNvY2tldC5sb2FkZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBmbi5jYWxsKHNlbGYpO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoZG9jdW1lbnQuYm9keSkgcmV0dXJuIGluaXQoKTtcblxuICAgIGlvLnV0aWwubG9hZChpbml0KTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIEZsYXNoU29ja2V0IHRyYW5zcG9ydCBpcyBzdXBwb3J0ZWQgYXMgaXQgcmVxdWlyZXMgdGhhdCB0aGUgQWRvYmVcbiAgICogRmxhc2ggUGxheWVyIHBsdWctaW4gdmVyc2lvbiBgMTAuMC4wYCBvciBncmVhdGVyIGlzIGluc3RhbGxlZC4gQW5kIGFsc28gY2hlY2sgaWZcbiAgICogdGhlIHBvbHlmaWxsIGlzIGNvcnJlY3RseSBsb2FkZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBGbGFzaHNvY2tldC5jaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoXG4gICAgICAgIHR5cGVvZiBXZWJTb2NrZXQgPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHx8ICEoJ19faW5pdGlhbGl6ZScgaW4gV2ViU29ja2V0KSB8fCAhc3dmb2JqZWN0XG4gICAgKSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gc3dmb2JqZWN0LmdldEZsYXNoUGxheWVyVmVyc2lvbigpLm1ham9yID49IDEwO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgRmxhc2hTb2NrZXQgdHJhbnNwb3J0IGNhbiBiZSB1c2VkIGFzIGNyb3NzIGRvbWFpbiAvIGNyb3NzIG9yaWdpbiBcbiAgICogdHJhbnNwb3J0LiBCZWNhdXNlIHdlIGNhbid0IHNlZSB3aGljaCB0eXBlIChzZWN1cmUgb3IgaW5zZWN1cmUpIG9mIC5zd2YgaXMgdXNlZFxuICAgKiB3ZSB3aWxsIGp1c3QgcmV0dXJuIHRydWUuXG4gICAqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBGbGFzaHNvY2tldC54ZG9tYWluQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc2FibGUgQVVUT19JTklUSUFMSVpBVElPTlxuICAgKi9cblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJykge1xuICAgIFdFQl9TT0NLRVRfRElTQUJMRV9BVVRPX0lOSVRJQUxJWkFUSU9OID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIHRyYW5zcG9ydCB0byB5b3VyIHB1YmxpYyBpby50cmFuc3BvcnRzIGFycmF5LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgaW8udHJhbnNwb3J0cy5wdXNoKCdmbGFzaHNvY2tldCcpO1xufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8uVHJhbnNwb3J0IDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuKTtcbi8qXHRTV0ZPYmplY3QgdjIuMiA8aHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL3N3Zm9iamVjdC8+IFxuXHRpcyByZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgPGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwPiBcbiovXG5pZiAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIHdpbmRvdykge1xudmFyIHN3Zm9iamVjdD1mdW5jdGlvbigpe3ZhciBEPVwidW5kZWZpbmVkXCIscj1cIm9iamVjdFwiLFM9XCJTaG9ja3dhdmUgRmxhc2hcIixXPVwiU2hvY2t3YXZlRmxhc2guU2hvY2t3YXZlRmxhc2hcIixxPVwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIixSPVwiU1dGT2JqZWN0RXhwckluc3RcIix4PVwib25yZWFkeXN0YXRlY2hhbmdlXCIsTz13aW5kb3csaj1kb2N1bWVudCx0PW5hdmlnYXRvcixUPWZhbHNlLFU9W2hdLG89W10sTj1bXSxJPVtdLGwsUSxFLEIsSj1mYWxzZSxhPWZhbHNlLG4sRyxtPXRydWUsTT1mdW5jdGlvbigpe3ZhciBhYT10eXBlb2Ygai5nZXRFbGVtZW50QnlJZCE9RCYmdHlwZW9mIGouZ2V0RWxlbWVudHNCeVRhZ05hbWUhPUQmJnR5cGVvZiBqLmNyZWF0ZUVsZW1lbnQhPUQsYWg9dC51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSxZPXQucGxhdGZvcm0udG9Mb3dlckNhc2UoKSxhZT1ZPy93aW4vLnRlc3QoWSk6L3dpbi8udGVzdChhaCksYWM9WT8vbWFjLy50ZXN0KFkpOi9tYWMvLnRlc3QoYWgpLGFmPS93ZWJraXQvLnRlc3QoYWgpP3BhcnNlRmxvYXQoYWgucmVwbGFjZSgvXi4qd2Via2l0XFwvKFxcZCsoXFwuXFxkKyk/KS4qJC8sXCIkMVwiKSk6ZmFsc2UsWD0hK1wiXFx2MVwiLGFnPVswLDAsMF0sYWI9bnVsbDtpZih0eXBlb2YgdC5wbHVnaW5zIT1EJiZ0eXBlb2YgdC5wbHVnaW5zW1NdPT1yKXthYj10LnBsdWdpbnNbU10uZGVzY3JpcHRpb247aWYoYWImJiEodHlwZW9mIHQubWltZVR5cGVzIT1EJiZ0Lm1pbWVUeXBlc1txXSYmIXQubWltZVR5cGVzW3FdLmVuYWJsZWRQbHVnaW4pKXtUPXRydWU7WD1mYWxzZTthYj1hYi5yZXBsYWNlKC9eLipcXHMrKFxcUytcXHMrXFxTKyQpLyxcIiQxXCIpO2FnWzBdPXBhcnNlSW50KGFiLnJlcGxhY2UoL14oLiopXFwuLiokLyxcIiQxXCIpLDEwKTthZ1sxXT1wYXJzZUludChhYi5yZXBsYWNlKC9eLipcXC4oLiopXFxzLiokLyxcIiQxXCIpLDEwKTthZ1syXT0vW2EtekEtWl0vLnRlc3QoYWIpP3BhcnNlSW50KGFiLnJlcGxhY2UoL14uKlthLXpBLVpdKyguKikkLyxcIiQxXCIpLDEwKTowfX1lbHNle2lmKHR5cGVvZiBPWyhbJ0FjdGl2ZSddLmNvbmNhdCgnT2JqZWN0Jykuam9pbignWCcpKV0hPUQpe3RyeXt2YXIgYWQ9bmV3IHdpbmRvd1soWydBY3RpdmUnXS5jb25jYXQoJ09iamVjdCcpLmpvaW4oJ1gnKSldKFcpO2lmKGFkKXthYj1hZC5HZXRWYXJpYWJsZShcIiR2ZXJzaW9uXCIpO2lmKGFiKXtYPXRydWU7YWI9YWIuc3BsaXQoXCIgXCIpWzFdLnNwbGl0KFwiLFwiKTthZz1bcGFyc2VJbnQoYWJbMF0sMTApLHBhcnNlSW50KGFiWzFdLDEwKSxwYXJzZUludChhYlsyXSwxMCldfX19Y2F0Y2goWil7fX19cmV0dXJue3czOmFhLHB2OmFnLHdrOmFmLGllOlgsd2luOmFlLG1hYzphY319KCksaz1mdW5jdGlvbigpe2lmKCFNLnczKXtyZXR1cm59aWYoKHR5cGVvZiBqLnJlYWR5U3RhdGUhPUQmJmoucmVhZHlTdGF0ZT09XCJjb21wbGV0ZVwiKXx8KHR5cGVvZiBqLnJlYWR5U3RhdGU9PUQmJihqLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXXx8ai5ib2R5KSkpe2YoKX1pZighSil7aWYodHlwZW9mIGouYWRkRXZlbnRMaXN0ZW5lciE9RCl7ai5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGYsZmFsc2UpfWlmKE0uaWUmJk0ud2luKXtqLmF0dGFjaEV2ZW50KHgsZnVuY3Rpb24oKXtpZihqLnJlYWR5U3RhdGU9PVwiY29tcGxldGVcIil7ai5kZXRhY2hFdmVudCh4LGFyZ3VtZW50cy5jYWxsZWUpO2YoKX19KTtpZihPPT10b3ApeyhmdW5jdGlvbigpe2lmKEope3JldHVybn10cnl7ai5kb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwoXCJsZWZ0XCIpfWNhdGNoKFgpe3NldFRpbWVvdXQoYXJndW1lbnRzLmNhbGxlZSwwKTtyZXR1cm59ZigpfSkoKX19aWYoTS53ayl7KGZ1bmN0aW9uKCl7aWYoSil7cmV0dXJufWlmKCEvbG9hZGVkfGNvbXBsZXRlLy50ZXN0KGoucmVhZHlTdGF0ZSkpe3NldFRpbWVvdXQoYXJndW1lbnRzLmNhbGxlZSwwKTtyZXR1cm59ZigpfSkoKX1zKGYpfX0oKTtmdW5jdGlvbiBmKCl7aWYoSil7cmV0dXJufXRyeXt2YXIgWj1qLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXS5hcHBlbmRDaGlsZChDKFwic3BhblwiKSk7Wi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKFopfWNhdGNoKGFhKXtyZXR1cm59Sj10cnVlO3ZhciBYPVUubGVuZ3RoO2Zvcih2YXIgWT0wO1k8WDtZKyspe1VbWV0oKX19ZnVuY3Rpb24gSyhYKXtpZihKKXtYKCl9ZWxzZXtVW1UubGVuZ3RoXT1YfX1mdW5jdGlvbiBzKFkpe2lmKHR5cGVvZiBPLmFkZEV2ZW50TGlzdGVuZXIhPUQpe08uYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIixZLGZhbHNlKX1lbHNle2lmKHR5cGVvZiBqLmFkZEV2ZW50TGlzdGVuZXIhPUQpe2ouYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIixZLGZhbHNlKX1lbHNle2lmKHR5cGVvZiBPLmF0dGFjaEV2ZW50IT1EKXtpKE8sXCJvbmxvYWRcIixZKX1lbHNle2lmKHR5cGVvZiBPLm9ubG9hZD09XCJmdW5jdGlvblwiKXt2YXIgWD1PLm9ubG9hZDtPLm9ubG9hZD1mdW5jdGlvbigpe1goKTtZKCl9fWVsc2V7Ty5vbmxvYWQ9WX19fX19ZnVuY3Rpb24gaCgpe2lmKFQpe1YoKX1lbHNle0goKX19ZnVuY3Rpb24gVigpe3ZhciBYPWouZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdO3ZhciBhYT1DKHIpO2FhLnNldEF0dHJpYnV0ZShcInR5cGVcIixxKTt2YXIgWj1YLmFwcGVuZENoaWxkKGFhKTtpZihaKXt2YXIgWT0wOyhmdW5jdGlvbigpe2lmKHR5cGVvZiBaLkdldFZhcmlhYmxlIT1EKXt2YXIgYWI9Wi5HZXRWYXJpYWJsZShcIiR2ZXJzaW9uXCIpO2lmKGFiKXthYj1hYi5zcGxpdChcIiBcIilbMV0uc3BsaXQoXCIsXCIpO00ucHY9W3BhcnNlSW50KGFiWzBdLDEwKSxwYXJzZUludChhYlsxXSwxMCkscGFyc2VJbnQoYWJbMl0sMTApXX19ZWxzZXtpZihZPDEwKXtZKys7c2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLDEwKTtyZXR1cm59fVgucmVtb3ZlQ2hpbGQoYWEpO1o9bnVsbDtIKCl9KSgpfWVsc2V7SCgpfX1mdW5jdGlvbiBIKCl7dmFyIGFnPW8ubGVuZ3RoO2lmKGFnPjApe2Zvcih2YXIgYWY9MDthZjxhZzthZisrKXt2YXIgWT1vW2FmXS5pZDt2YXIgYWI9b1thZl0uY2FsbGJhY2tGbjt2YXIgYWE9e3N1Y2Nlc3M6ZmFsc2UsaWQ6WX07aWYoTS5wdlswXT4wKXt2YXIgYWU9YyhZKTtpZihhZSl7aWYoRihvW2FmXS5zd2ZWZXJzaW9uKSYmIShNLndrJiZNLndrPDMxMikpe3coWSx0cnVlKTtpZihhYil7YWEuc3VjY2Vzcz10cnVlO2FhLnJlZj16KFkpO2FiKGFhKX19ZWxzZXtpZihvW2FmXS5leHByZXNzSW5zdGFsbCYmQSgpKXt2YXIgYWk9e307YWkuZGF0YT1vW2FmXS5leHByZXNzSW5zdGFsbDthaS53aWR0aD1hZS5nZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiKXx8XCIwXCI7YWkuaGVpZ2h0PWFlLmdldEF0dHJpYnV0ZShcImhlaWdodFwiKXx8XCIwXCI7aWYoYWUuZ2V0QXR0cmlidXRlKFwiY2xhc3NcIikpe2FpLnN0eWxlY2xhc3M9YWUuZ2V0QXR0cmlidXRlKFwiY2xhc3NcIil9aWYoYWUuZ2V0QXR0cmlidXRlKFwiYWxpZ25cIikpe2FpLmFsaWduPWFlLmdldEF0dHJpYnV0ZShcImFsaWduXCIpfXZhciBhaD17fTt2YXIgWD1hZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInBhcmFtXCIpO3ZhciBhYz1YLmxlbmd0aDtmb3IodmFyIGFkPTA7YWQ8YWM7YWQrKyl7aWYoWFthZF0uZ2V0QXR0cmlidXRlKFwibmFtZVwiKS50b0xvd2VyQ2FzZSgpIT1cIm1vdmllXCIpe2FoW1hbYWRdLmdldEF0dHJpYnV0ZShcIm5hbWVcIildPVhbYWRdLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpfX1QKGFpLGFoLFksYWIpfWVsc2V7cChhZSk7aWYoYWIpe2FiKGFhKX19fX19ZWxzZXt3KFksdHJ1ZSk7aWYoYWIpe3ZhciBaPXooWSk7aWYoWiYmdHlwZW9mIFouU2V0VmFyaWFibGUhPUQpe2FhLnN1Y2Nlc3M9dHJ1ZTthYS5yZWY9Wn1hYihhYSl9fX19fWZ1bmN0aW9uIHooYWEpe3ZhciBYPW51bGw7dmFyIFk9YyhhYSk7aWYoWSYmWS5ub2RlTmFtZT09XCJPQkpFQ1RcIil7aWYodHlwZW9mIFkuU2V0VmFyaWFibGUhPUQpe1g9WX1lbHNle3ZhciBaPVkuZ2V0RWxlbWVudHNCeVRhZ05hbWUocilbMF07aWYoWil7WD1afX19cmV0dXJuIFh9ZnVuY3Rpb24gQSgpe3JldHVybiAhYSYmRihcIjYuMC42NVwiKSYmKE0ud2lufHxNLm1hYykmJiEoTS53ayYmTS53azwzMTIpfWZ1bmN0aW9uIFAoYWEsYWIsWCxaKXthPXRydWU7RT1afHxudWxsO0I9e3N1Y2Nlc3M6ZmFsc2UsaWQ6WH07dmFyIGFlPWMoWCk7aWYoYWUpe2lmKGFlLm5vZGVOYW1lPT1cIk9CSkVDVFwiKXtsPWcoYWUpO1E9bnVsbH1lbHNle2w9YWU7UT1YfWFhLmlkPVI7aWYodHlwZW9mIGFhLndpZHRoPT1EfHwoIS8lJC8udGVzdChhYS53aWR0aCkmJnBhcnNlSW50KGFhLndpZHRoLDEwKTwzMTApKXthYS53aWR0aD1cIjMxMFwifWlmKHR5cGVvZiBhYS5oZWlnaHQ9PUR8fCghLyUkLy50ZXN0KGFhLmhlaWdodCkmJnBhcnNlSW50KGFhLmhlaWdodCwxMCk8MTM3KSl7YWEuaGVpZ2h0PVwiMTM3XCJ9ai50aXRsZT1qLnRpdGxlLnNsaWNlKDAsNDcpK1wiIC0gRmxhc2ggUGxheWVyIEluc3RhbGxhdGlvblwiO3ZhciBhZD1NLmllJiZNLndpbj8oWydBY3RpdmUnXS5jb25jYXQoJycpLmpvaW4oJ1gnKSk6XCJQbHVnSW5cIixhYz1cIk1NcmVkaXJlY3RVUkw9XCIrTy5sb2NhdGlvbi50b1N0cmluZygpLnJlcGxhY2UoLyYvZyxcIiUyNlwiKStcIiZNTXBsYXllclR5cGU9XCIrYWQrXCImTU1kb2N0aXRsZT1cIitqLnRpdGxlO2lmKHR5cGVvZiBhYi5mbGFzaHZhcnMhPUQpe2FiLmZsYXNodmFycys9XCImXCIrYWN9ZWxzZXthYi5mbGFzaHZhcnM9YWN9aWYoTS5pZSYmTS53aW4mJmFlLnJlYWR5U3RhdGUhPTQpe3ZhciBZPUMoXCJkaXZcIik7WCs9XCJTV0ZPYmplY3ROZXdcIjtZLnNldEF0dHJpYnV0ZShcImlkXCIsWCk7YWUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoWSxhZSk7YWUuc3R5bGUuZGlzcGxheT1cIm5vbmVcIjsoZnVuY3Rpb24oKXtpZihhZS5yZWFkeVN0YXRlPT00KXthZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGFlKX1lbHNle3NldFRpbWVvdXQoYXJndW1lbnRzLmNhbGxlZSwxMCl9fSkoKX11KGFhLGFiLFgpfX1mdW5jdGlvbiBwKFkpe2lmKE0uaWUmJk0ud2luJiZZLnJlYWR5U3RhdGUhPTQpe3ZhciBYPUMoXCJkaXZcIik7WS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShYLFkpO1gucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZyhZKSxYKTtZLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7KGZ1bmN0aW9uKCl7aWYoWS5yZWFkeVN0YXRlPT00KXtZLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoWSl9ZWxzZXtzZXRUaW1lb3V0KGFyZ3VtZW50cy5jYWxsZWUsMTApfX0pKCl9ZWxzZXtZLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGcoWSksWSl9fWZ1bmN0aW9uIGcoYWIpe3ZhciBhYT1DKFwiZGl2XCIpO2lmKE0ud2luJiZNLmllKXthYS5pbm5lckhUTUw9YWIuaW5uZXJIVE1MfWVsc2V7dmFyIFk9YWIuZ2V0RWxlbWVudHNCeVRhZ05hbWUocilbMF07aWYoWSl7dmFyIGFkPVkuY2hpbGROb2RlcztpZihhZCl7dmFyIFg9YWQubGVuZ3RoO2Zvcih2YXIgWj0wO1o8WDtaKyspe2lmKCEoYWRbWl0ubm9kZVR5cGU9PTEmJmFkW1pdLm5vZGVOYW1lPT1cIlBBUkFNXCIpJiYhKGFkW1pdLm5vZGVUeXBlPT04KSl7YWEuYXBwZW5kQ2hpbGQoYWRbWl0uY2xvbmVOb2RlKHRydWUpKX19fX19cmV0dXJuIGFhfWZ1bmN0aW9uIHUoYWksYWcsWSl7dmFyIFgsYWE9YyhZKTtpZihNLndrJiZNLndrPDMxMil7cmV0dXJuIFh9aWYoYWEpe2lmKHR5cGVvZiBhaS5pZD09RCl7YWkuaWQ9WX1pZihNLmllJiZNLndpbil7dmFyIGFoPVwiXCI7Zm9yKHZhciBhZSBpbiBhaSl7aWYoYWlbYWVdIT1PYmplY3QucHJvdG90eXBlW2FlXSl7aWYoYWUudG9Mb3dlckNhc2UoKT09XCJkYXRhXCIpe2FnLm1vdmllPWFpW2FlXX1lbHNle2lmKGFlLnRvTG93ZXJDYXNlKCk9PVwic3R5bGVjbGFzc1wiKXthaCs9JyBjbGFzcz1cIicrYWlbYWVdKydcIid9ZWxzZXtpZihhZS50b0xvd2VyQ2FzZSgpIT1cImNsYXNzaWRcIil7YWgrPVwiIFwiK2FlKyc9XCInK2FpW2FlXSsnXCInfX19fX12YXIgYWY9XCJcIjtmb3IodmFyIGFkIGluIGFnKXtpZihhZ1thZF0hPU9iamVjdC5wcm90b3R5cGVbYWRdKXthZis9JzxwYXJhbSBuYW1lPVwiJythZCsnXCIgdmFsdWU9XCInK2FnW2FkXSsnXCIgLz4nfX1hYS5vdXRlckhUTUw9JzxvYmplY3QgY2xhc3NpZD1cImNsc2lkOkQyN0NEQjZFLUFFNkQtMTFjZi05NkI4LTQ0NDU1MzU0MDAwMFwiJythaCtcIj5cIithZitcIjwvb2JqZWN0PlwiO05bTi5sZW5ndGhdPWFpLmlkO1g9YyhhaS5pZCl9ZWxzZXt2YXIgWj1DKHIpO1ouc2V0QXR0cmlidXRlKFwidHlwZVwiLHEpO2Zvcih2YXIgYWMgaW4gYWkpe2lmKGFpW2FjXSE9T2JqZWN0LnByb3RvdHlwZVthY10pe2lmKGFjLnRvTG93ZXJDYXNlKCk9PVwic3R5bGVjbGFzc1wiKXtaLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsYWlbYWNdKX1lbHNle2lmKGFjLnRvTG93ZXJDYXNlKCkhPVwiY2xhc3NpZFwiKXtaLnNldEF0dHJpYnV0ZShhYyxhaVthY10pfX19fWZvcih2YXIgYWIgaW4gYWcpe2lmKGFnW2FiXSE9T2JqZWN0LnByb3RvdHlwZVthYl0mJmFiLnRvTG93ZXJDYXNlKCkhPVwibW92aWVcIil7ZShaLGFiLGFnW2FiXSl9fWFhLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKFosYWEpO1g9Wn19cmV0dXJuIFh9ZnVuY3Rpb24gZShaLFgsWSl7dmFyIGFhPUMoXCJwYXJhbVwiKTthYS5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsWCk7YWEuc2V0QXR0cmlidXRlKFwidmFsdWVcIixZKTtaLmFwcGVuZENoaWxkKGFhKX1mdW5jdGlvbiB5KFkpe3ZhciBYPWMoWSk7aWYoWCYmWC5ub2RlTmFtZT09XCJPQkpFQ1RcIil7aWYoTS5pZSYmTS53aW4pe1guc3R5bGUuZGlzcGxheT1cIm5vbmVcIjsoZnVuY3Rpb24oKXtpZihYLnJlYWR5U3RhdGU9PTQpe2IoWSl9ZWxzZXtzZXRUaW1lb3V0KGFyZ3VtZW50cy5jYWxsZWUsMTApfX0pKCl9ZWxzZXtYLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoWCl9fX1mdW5jdGlvbiBiKFope3ZhciBZPWMoWik7aWYoWSl7Zm9yKHZhciBYIGluIFkpe2lmKHR5cGVvZiBZW1hdPT1cImZ1bmN0aW9uXCIpe1lbWF09bnVsbH19WS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKFkpfX1mdW5jdGlvbiBjKFope3ZhciBYPW51bGw7dHJ5e1g9ai5nZXRFbGVtZW50QnlJZChaKX1jYXRjaChZKXt9cmV0dXJuIFh9ZnVuY3Rpb24gQyhYKXtyZXR1cm4gai5jcmVhdGVFbGVtZW50KFgpfWZ1bmN0aW9uIGkoWixYLFkpe1ouYXR0YWNoRXZlbnQoWCxZKTtJW0kubGVuZ3RoXT1bWixYLFldfWZ1bmN0aW9uIEYoWil7dmFyIFk9TS5wdixYPVouc3BsaXQoXCIuXCIpO1hbMF09cGFyc2VJbnQoWFswXSwxMCk7WFsxXT1wYXJzZUludChYWzFdLDEwKXx8MDtYWzJdPXBhcnNlSW50KFhbMl0sMTApfHwwO3JldHVybihZWzBdPlhbMF18fChZWzBdPT1YWzBdJiZZWzFdPlhbMV0pfHwoWVswXT09WFswXSYmWVsxXT09WFsxXSYmWVsyXT49WFsyXSkpP3RydWU6ZmFsc2V9ZnVuY3Rpb24gdihhYyxZLGFkLGFiKXtpZihNLmllJiZNLm1hYyl7cmV0dXJufXZhciBhYT1qLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXTtpZighYWEpe3JldHVybn12YXIgWD0oYWQmJnR5cGVvZiBhZD09XCJzdHJpbmdcIik/YWQ6XCJzY3JlZW5cIjtpZihhYil7bj1udWxsO0c9bnVsbH1pZighbnx8RyE9WCl7dmFyIFo9QyhcInN0eWxlXCIpO1ouc2V0QXR0cmlidXRlKFwidHlwZVwiLFwidGV4dC9jc3NcIik7Wi5zZXRBdHRyaWJ1dGUoXCJtZWRpYVwiLFgpO249YWEuYXBwZW5kQ2hpbGQoWik7aWYoTS5pZSYmTS53aW4mJnR5cGVvZiBqLnN0eWxlU2hlZXRzIT1EJiZqLnN0eWxlU2hlZXRzLmxlbmd0aD4wKXtuPWouc3R5bGVTaGVldHNbai5zdHlsZVNoZWV0cy5sZW5ndGgtMV19Rz1YfWlmKE0uaWUmJk0ud2luKXtpZihuJiZ0eXBlb2Ygbi5hZGRSdWxlPT1yKXtuLmFkZFJ1bGUoYWMsWSl9fWVsc2V7aWYobiYmdHlwZW9mIGouY3JlYXRlVGV4dE5vZGUhPUQpe24uYXBwZW5kQ2hpbGQoai5jcmVhdGVUZXh0Tm9kZShhYytcIiB7XCIrWStcIn1cIikpfX19ZnVuY3Rpb24gdyhaLFgpe2lmKCFtKXtyZXR1cm59dmFyIFk9WD9cInZpc2libGVcIjpcImhpZGRlblwiO2lmKEomJmMoWikpe2MoWikuc3R5bGUudmlzaWJpbGl0eT1ZfWVsc2V7dihcIiNcIitaLFwidmlzaWJpbGl0eTpcIitZKX19ZnVuY3Rpb24gTChZKXt2YXIgWj0vW1xcXFxcXFwiPD5cXC47XS87dmFyIFg9Wi5leGVjKFkpIT1udWxsO3JldHVybiBYJiZ0eXBlb2YgZW5jb2RlVVJJQ29tcG9uZW50IT1EP2VuY29kZVVSSUNvbXBvbmVudChZKTpZfXZhciBkPWZ1bmN0aW9uKCl7aWYoTS5pZSYmTS53aW4pe3dpbmRvdy5hdHRhY2hFdmVudChcIm9udW5sb2FkXCIsZnVuY3Rpb24oKXt2YXIgYWM9SS5sZW5ndGg7Zm9yKHZhciBhYj0wO2FiPGFjO2FiKyspe0lbYWJdWzBdLmRldGFjaEV2ZW50KElbYWJdWzFdLElbYWJdWzJdKX12YXIgWj1OLmxlbmd0aDtmb3IodmFyIGFhPTA7YWE8WjthYSsrKXt5KE5bYWFdKX1mb3IodmFyIFkgaW4gTSl7TVtZXT1udWxsfU09bnVsbDtmb3IodmFyIFggaW4gc3dmb2JqZWN0KXtzd2ZvYmplY3RbWF09bnVsbH1zd2ZvYmplY3Q9bnVsbH0pfX0oKTtyZXR1cm57cmVnaXN0ZXJPYmplY3Q6ZnVuY3Rpb24oYWIsWCxhYSxaKXtpZihNLnczJiZhYiYmWCl7dmFyIFk9e307WS5pZD1hYjtZLnN3ZlZlcnNpb249WDtZLmV4cHJlc3NJbnN0YWxsPWFhO1kuY2FsbGJhY2tGbj1aO29bby5sZW5ndGhdPVk7dyhhYixmYWxzZSl9ZWxzZXtpZihaKXtaKHtzdWNjZXNzOmZhbHNlLGlkOmFifSl9fX0sZ2V0T2JqZWN0QnlJZDpmdW5jdGlvbihYKXtpZihNLnczKXtyZXR1cm4geihYKX19LGVtYmVkU1dGOmZ1bmN0aW9uKGFiLGFoLGFlLGFnLFksYWEsWixhZCxhZixhYyl7dmFyIFg9e3N1Y2Nlc3M6ZmFsc2UsaWQ6YWh9O2lmKE0udzMmJiEoTS53ayYmTS53azwzMTIpJiZhYiYmYWgmJmFlJiZhZyYmWSl7dyhhaCxmYWxzZSk7SyhmdW5jdGlvbigpe2FlKz1cIlwiO2FnKz1cIlwiO3ZhciBhaj17fTtpZihhZiYmdHlwZW9mIGFmPT09cil7Zm9yKHZhciBhbCBpbiBhZil7YWpbYWxdPWFmW2FsXX19YWouZGF0YT1hYjthai53aWR0aD1hZTthai5oZWlnaHQ9YWc7dmFyIGFtPXt9O2lmKGFkJiZ0eXBlb2YgYWQ9PT1yKXtmb3IodmFyIGFrIGluIGFkKXthbVtha109YWRbYWtdfX1pZihaJiZ0eXBlb2YgWj09PXIpe2Zvcih2YXIgYWkgaW4gWil7aWYodHlwZW9mIGFtLmZsYXNodmFycyE9RCl7YW0uZmxhc2h2YXJzKz1cIiZcIithaStcIj1cIitaW2FpXX1lbHNle2FtLmZsYXNodmFycz1haStcIj1cIitaW2FpXX19fWlmKEYoWSkpe3ZhciBhbj11KGFqLGFtLGFoKTtpZihhai5pZD09YWgpe3coYWgsdHJ1ZSl9WC5zdWNjZXNzPXRydWU7WC5yZWY9YW59ZWxzZXtpZihhYSYmQSgpKXthai5kYXRhPWFhO1AoYWosYW0sYWgsYWMpO3JldHVybn1lbHNle3coYWgsdHJ1ZSl9fWlmKGFjKXthYyhYKX19KX1lbHNle2lmKGFjKXthYyhYKX19fSxzd2l0Y2hPZmZBdXRvSGlkZVNob3c6ZnVuY3Rpb24oKXttPWZhbHNlfSx1YTpNLGdldEZsYXNoUGxheWVyVmVyc2lvbjpmdW5jdGlvbigpe3JldHVybnttYWpvcjpNLnB2WzBdLG1pbm9yOk0ucHZbMV0scmVsZWFzZTpNLnB2WzJdfX0saGFzRmxhc2hQbGF5ZXJWZXJzaW9uOkYsY3JlYXRlU1dGOmZ1bmN0aW9uKFosWSxYKXtpZihNLnczKXtyZXR1cm4gdShaLFksWCl9ZWxzZXtyZXR1cm4gdW5kZWZpbmVkfX0sc2hvd0V4cHJlc3NJbnN0YWxsOmZ1bmN0aW9uKFosYWEsWCxZKXtpZihNLnczJiZBKCkpe1AoWixhYSxYLFkpfX0scmVtb3ZlU1dGOmZ1bmN0aW9uKFgpe2lmKE0udzMpe3koWCl9fSxjcmVhdGVDU1M6ZnVuY3Rpb24oYWEsWixZLFgpe2lmKE0udzMpe3YoYWEsWixZLFgpfX0sYWRkRG9tTG9hZEV2ZW50OkssYWRkTG9hZEV2ZW50OnMsZ2V0UXVlcnlQYXJhbVZhbHVlOmZ1bmN0aW9uKGFhKXt2YXIgWj1qLmxvY2F0aW9uLnNlYXJjaHx8ai5sb2NhdGlvbi5oYXNoO2lmKFope2lmKC9cXD8vLnRlc3QoWikpe1o9Wi5zcGxpdChcIj9cIilbMV19aWYoYWE9PW51bGwpe3JldHVybiBMKFopfXZhciBZPVouc3BsaXQoXCImXCIpO2Zvcih2YXIgWD0wO1g8WS5sZW5ndGg7WCsrKXtpZihZW1hdLnN1YnN0cmluZygwLFlbWF0uaW5kZXhPZihcIj1cIikpPT1hYSl7cmV0dXJuIEwoWVtYXS5zdWJzdHJpbmcoKFlbWF0uaW5kZXhPZihcIj1cIikrMSkpKX19fXJldHVyblwiXCJ9LGV4cHJlc3NJbnN0YWxsQ2FsbGJhY2s6ZnVuY3Rpb24oKXtpZihhKXt2YXIgWD1jKFIpO2lmKFgmJmwpe1gucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobCxYKTtpZihRKXt3KFEsdHJ1ZSk7aWYoTS5pZSYmTS53aW4pe2wuc3R5bGUuZGlzcGxheT1cImJsb2NrXCJ9fWlmKEUpe0UoQil9fWE9ZmFsc2V9fX19KCk7XG59XG4vLyBDb3B5cmlnaHQ6IEhpcm9zaGkgSWNoaWthd2EgPGh0dHA6Ly9naW1pdGUubmV0L2VuLz5cbi8vIExpY2Vuc2U6IE5ldyBCU0QgTGljZW5zZVxuLy8gUmVmZXJlbmNlOiBodHRwOi8vZGV2LnczLm9yZy9odG1sNS93ZWJzb2NrZXRzL1xuLy8gUmVmZXJlbmNlOiBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9kcmFmdC1oaXhpZS10aGV3ZWJzb2NrZXRwcm90b2NvbFxuXG4oZnVuY3Rpb24oKSB7XG4gIFxuICBpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvdyB8fCB3aW5kb3cuV2ViU29ja2V0KSByZXR1cm47XG5cbiAgdmFyIGNvbnNvbGUgPSB3aW5kb3cuY29uc29sZTtcbiAgaWYgKCFjb25zb2xlIHx8ICFjb25zb2xlLmxvZyB8fCAhY29uc29sZS5lcnJvcikge1xuICAgIGNvbnNvbGUgPSB7bG9nOiBmdW5jdGlvbigpeyB9LCBlcnJvcjogZnVuY3Rpb24oKXsgfX07XG4gIH1cbiAgXG4gIGlmICghc3dmb2JqZWN0Lmhhc0ZsYXNoUGxheWVyVmVyc2lvbihcIjEwLjAuMFwiKSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJGbGFzaCBQbGF5ZXIgPj0gMTAuMC4wIGlzIHJlcXVpcmVkLlwiKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGxvY2F0aW9uLnByb3RvY29sID09IFwiZmlsZTpcIikge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICBcIldBUk5JTkc6IHdlYi1zb2NrZXQtanMgZG9lc24ndCB3b3JrIGluIGZpbGU6Ly8vLi4uIFVSTCBcIiArXG4gICAgICBcInVubGVzcyB5b3Ugc2V0IEZsYXNoIFNlY3VyaXR5IFNldHRpbmdzIHByb3Blcmx5LiBcIiArXG4gICAgICBcIk9wZW4gdGhlIHBhZ2UgdmlhIFdlYiBzZXJ2ZXIgaS5lLiBodHRwOi8vLi4uXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY2xhc3MgcmVwcmVzZW50cyBhIGZhdXggd2ViIHNvY2tldC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0ge2FycmF5IG9yIHN0cmluZ30gcHJvdG9jb2xzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcm94eUhvc3RcbiAgICogQHBhcmFtIHtpbnR9IHByb3h5UG9ydFxuICAgKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyc1xuICAgKi9cbiAgV2ViU29ja2V0ID0gZnVuY3Rpb24odXJsLCBwcm90b2NvbHMsIHByb3h5SG9zdCwgcHJveHlQb3J0LCBoZWFkZXJzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuX19pZCA9IFdlYlNvY2tldC5fX25leHRJZCsrO1xuICAgIFdlYlNvY2tldC5fX2luc3RhbmNlc1tzZWxmLl9faWRdID0gc2VsZjtcbiAgICBzZWxmLnJlYWR5U3RhdGUgPSBXZWJTb2NrZXQuQ09OTkVDVElORztcbiAgICBzZWxmLmJ1ZmZlcmVkQW1vdW50ID0gMDtcbiAgICBzZWxmLl9fZXZlbnRzID0ge307XG4gICAgaWYgKCFwcm90b2NvbHMpIHtcbiAgICAgIHByb3RvY29scyA9IFtdO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb3RvY29scyA9PSBcInN0cmluZ1wiKSB7XG4gICAgICBwcm90b2NvbHMgPSBbcHJvdG9jb2xzXTtcbiAgICB9XG4gICAgLy8gVXNlcyBzZXRUaW1lb3V0KCkgdG8gbWFrZSBzdXJlIF9fY3JlYXRlRmxhc2goKSBydW5zIGFmdGVyIHRoZSBjYWxsZXIgc2V0cyB3cy5vbm9wZW4gZXRjLlxuICAgIC8vIE90aGVyd2lzZSwgd2hlbiBvbm9wZW4gZmlyZXMgaW1tZWRpYXRlbHksIG9ub3BlbiBpcyBjYWxsZWQgYmVmb3JlIGl0IGlzIHNldC5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgV2ViU29ja2V0Ll9fYWRkVGFzayhmdW5jdGlvbigpIHtcbiAgICAgICAgV2ViU29ja2V0Ll9fZmxhc2guY3JlYXRlKFxuICAgICAgICAgICAgc2VsZi5fX2lkLCB1cmwsIHByb3RvY29scywgcHJveHlIb3N0IHx8IG51bGwsIHByb3h5UG9ydCB8fCAwLCBoZWFkZXJzIHx8IG51bGwpO1xuICAgICAgfSk7XG4gICAgfSwgMCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmQgZGF0YSB0byB0aGUgd2ViIHNvY2tldC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgIFRoZSBkYXRhIHRvIHNlbmQgdG8gdGhlIHNvY2tldC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gIFRydWUgZm9yIHN1Y2Nlc3MsIGZhbHNlIGZvciBmYWlsdXJlLlxuICAgKi9cbiAgV2ViU29ja2V0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT0gV2ViU29ja2V0LkNPTk5FQ1RJTkcpIHtcbiAgICAgIHRocm93IFwiSU5WQUxJRF9TVEFURV9FUlI6IFdlYiBTb2NrZXQgY29ubmVjdGlvbiBoYXMgbm90IGJlZW4gZXN0YWJsaXNoZWRcIjtcbiAgICB9XG4gICAgLy8gV2UgdXNlIGVuY29kZVVSSUNvbXBvbmVudCgpIGhlcmUsIGJlY2F1c2UgRkFCcmlkZ2UgZG9lc24ndCB3b3JrIGlmXG4gICAgLy8gdGhlIGFyZ3VtZW50IGluY2x1ZGVzIHNvbWUgY2hhcmFjdGVycy4gV2UgZG9uJ3QgdXNlIGVzY2FwZSgpIGhlcmVcbiAgICAvLyBiZWNhdXNlIG9mIHRoaXM6XG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vQ29yZV9KYXZhU2NyaXB0XzEuNV9HdWlkZS9GdW5jdGlvbnMjZXNjYXBlX2FuZF91bmVzY2FwZV9GdW5jdGlvbnNcbiAgICAvLyBCdXQgaXQgbG9va3MgZGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZVVSSUNvbXBvbmVudChzKSkgZG9lc24ndFxuICAgIC8vIHByZXNlcnZlIGFsbCBVbmljb2RlIGNoYXJhY3RlcnMgZWl0aGVyIGUuZy4gXCJcXHVmZmZmXCIgaW4gRmlyZWZveC5cbiAgICAvLyBOb3RlIGJ5IHd0cml0Y2g6IEhvcGVmdWxseSB0aGlzIHdpbGwgbm90IGJlIG5lY2Vzc2FyeSB1c2luZyBFeHRlcm5hbEludGVyZmFjZS4gIFdpbGwgcmVxdWlyZVxuICAgIC8vIGFkZGl0aW9uYWwgdGVzdGluZy5cbiAgICB2YXIgcmVzdWx0ID0gV2ViU29ja2V0Ll9fZmxhc2guc2VuZCh0aGlzLl9faWQsIGVuY29kZVVSSUNvbXBvbmVudChkYXRhKSk7XG4gICAgaWYgKHJlc3VsdCA8IDApIHsgLy8gc3VjY2Vzc1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYnVmZmVyZWRBbW91bnQgKz0gcmVzdWx0O1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2xvc2UgdGhpcyB3ZWIgc29ja2V0IGdyYWNlZnVsbHkuXG4gICAqL1xuICBXZWJTb2NrZXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PSBXZWJTb2NrZXQuQ0xPU0VEIHx8IHRoaXMucmVhZHlTdGF0ZSA9PSBXZWJTb2NrZXQuQ0xPU0lORykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBXZWJTb2NrZXQuQ0xPU0lORztcbiAgICBXZWJTb2NrZXQuX19mbGFzaC5jbG9zZSh0aGlzLl9faWQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBvZiB7QGxpbmsgPGEgaHJlZj1cImh0dHA6Ly93d3cudzMub3JnL1RSL0RPTS1MZXZlbC0yLUV2ZW50cy9ldmVudHMuaHRtbCNFdmVudHMtcmVnaXN0cmF0aW9uXCI+RE9NIDIgRXZlbnRUYXJnZXQgSW50ZXJmYWNlPC9hPn1cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXJcbiAgICogQHBhcmFtIHtib29sZWFufSB1c2VDYXB0dXJlXG4gICAqIEByZXR1cm4gdm9pZFxuICAgKi9cbiAgV2ViU29ja2V0LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICBpZiAoISh0eXBlIGluIHRoaXMuX19ldmVudHMpKSB7XG4gICAgICB0aGlzLl9fZXZlbnRzW3R5cGVdID0gW107XG4gICAgfVxuICAgIHRoaXMuX19ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIH07XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIHtAbGluayA8YSBocmVmPVwiaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTItRXZlbnRzL2V2ZW50cy5odG1sI0V2ZW50cy1yZWdpc3RyYXRpb25cIj5ET00gMiBFdmVudFRhcmdldCBJbnRlcmZhY2U8L2E+fVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVzZUNhcHR1cmVcbiAgICogQHJldHVybiB2b2lkXG4gICAqL1xuICBXZWJTb2NrZXQucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgIGlmICghKHR5cGUgaW4gdGhpcy5fX2V2ZW50cykpIHJldHVybjtcbiAgICB2YXIgZXZlbnRzID0gdGhpcy5fX2V2ZW50c1t0eXBlXTtcbiAgICBmb3IgKHZhciBpID0gZXZlbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICBpZiAoZXZlbnRzW2ldID09PSBsaXN0ZW5lcikge1xuICAgICAgICBldmVudHMuc3BsaWNlKGksIDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIHtAbGluayA8YSBocmVmPVwiaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTItRXZlbnRzL2V2ZW50cy5odG1sI0V2ZW50cy1yZWdpc3RyYXRpb25cIj5ET00gMiBFdmVudFRhcmdldCBJbnRlcmZhY2U8L2E+fVxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKiBAcmV0dXJuIHZvaWRcbiAgICovXG4gIFdlYlNvY2tldC5wcm90b3R5cGUuZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGV2ZW50cyA9IHRoaXMuX19ldmVudHNbZXZlbnQudHlwZV0gfHwgW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGV2ZW50c1tpXShldmVudCk7XG4gICAgfVxuICAgIHZhciBoYW5kbGVyID0gdGhpc1tcIm9uXCIgKyBldmVudC50eXBlXTtcbiAgICBpZiAoaGFuZGxlcikgaGFuZGxlcihldmVudCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgYW4gZXZlbnQgZnJvbSBGbGFzaC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGZsYXNoRXZlbnRcbiAgICovXG4gIFdlYlNvY2tldC5wcm90b3R5cGUuX19oYW5kbGVFdmVudCA9IGZ1bmN0aW9uKGZsYXNoRXZlbnQpIHtcbiAgICBpZiAoXCJyZWFkeVN0YXRlXCIgaW4gZmxhc2hFdmVudCkge1xuICAgICAgdGhpcy5yZWFkeVN0YXRlID0gZmxhc2hFdmVudC5yZWFkeVN0YXRlO1xuICAgIH1cbiAgICBpZiAoXCJwcm90b2NvbFwiIGluIGZsYXNoRXZlbnQpIHtcbiAgICAgIHRoaXMucHJvdG9jb2wgPSBmbGFzaEV2ZW50LnByb3RvY29sO1xuICAgIH1cbiAgICBcbiAgICB2YXIganNFdmVudDtcbiAgICBpZiAoZmxhc2hFdmVudC50eXBlID09IFwib3BlblwiIHx8IGZsYXNoRXZlbnQudHlwZSA9PSBcImVycm9yXCIpIHtcbiAgICAgIGpzRXZlbnQgPSB0aGlzLl9fY3JlYXRlU2ltcGxlRXZlbnQoZmxhc2hFdmVudC50eXBlKTtcbiAgICB9IGVsc2UgaWYgKGZsYXNoRXZlbnQudHlwZSA9PSBcImNsb3NlXCIpIHtcbiAgICAgIC8vIFRPRE8gaW1wbGVtZW50IGpzRXZlbnQud2FzQ2xlYW5cbiAgICAgIGpzRXZlbnQgPSB0aGlzLl9fY3JlYXRlU2ltcGxlRXZlbnQoXCJjbG9zZVwiKTtcbiAgICB9IGVsc2UgaWYgKGZsYXNoRXZlbnQudHlwZSA9PSBcIm1lc3NhZ2VcIikge1xuICAgICAgdmFyIGRhdGEgPSBkZWNvZGVVUklDb21wb25lbnQoZmxhc2hFdmVudC5tZXNzYWdlKTtcbiAgICAgIGpzRXZlbnQgPSB0aGlzLl9fY3JlYXRlTWVzc2FnZUV2ZW50KFwibWVzc2FnZVwiLCBkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgXCJ1bmtub3duIGV2ZW50IHR5cGU6IFwiICsgZmxhc2hFdmVudC50eXBlO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoanNFdmVudCk7XG4gIH07XG4gIFxuICBXZWJTb2NrZXQucHJvdG90eXBlLl9fY3JlYXRlU2ltcGxlRXZlbnQgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50ICYmIHdpbmRvdy5FdmVudCkge1xuICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudFwiKTtcbiAgICAgIGV2ZW50LmluaXRFdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge3R5cGU6IHR5cGUsIGJ1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlOiBmYWxzZX07XG4gICAgfVxuICB9O1xuICBcbiAgV2ViU29ja2V0LnByb3RvdHlwZS5fX2NyZWF0ZU1lc3NhZ2VFdmVudCA9IGZ1bmN0aW9uKHR5cGUsIGRhdGEpIHtcbiAgICBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnQgJiYgd2luZG93Lk1lc3NhZ2VFdmVudCAmJiAhd2luZG93Lm9wZXJhKSB7XG4gICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIk1lc3NhZ2VFdmVudFwiKTtcbiAgICAgIGV2ZW50LmluaXRNZXNzYWdlRXZlbnQoXCJtZXNzYWdlXCIsIGZhbHNlLCBmYWxzZSwgZGF0YSwgbnVsbCwgbnVsbCwgd2luZG93LCBudWxsKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSUUgYW5kIE9wZXJhLCB0aGUgbGF0dGVyIG9uZSB0cnVuY2F0ZXMgdGhlIGRhdGEgcGFyYW1ldGVyIGFmdGVyIGFueSAweDAwIGJ5dGVzLlxuICAgICAgcmV0dXJuIHt0eXBlOiB0eXBlLCBkYXRhOiBkYXRhLCBidWJibGVzOiBmYWxzZSwgY2FuY2VsYWJsZTogZmFsc2V9O1xuICAgIH1cbiAgfTtcbiAgXG4gIC8qKlxuICAgKiBEZWZpbmUgdGhlIFdlYlNvY2tldCByZWFkeVN0YXRlIGVudW1lcmF0aW9uLlxuICAgKi9cbiAgV2ViU29ja2V0LkNPTk5FQ1RJTkcgPSAwO1xuICBXZWJTb2NrZXQuT1BFTiA9IDE7XG4gIFdlYlNvY2tldC5DTE9TSU5HID0gMjtcbiAgV2ViU29ja2V0LkNMT1NFRCA9IDM7XG5cbiAgV2ViU29ja2V0Ll9fZmxhc2ggPSBudWxsO1xuICBXZWJTb2NrZXQuX19pbnN0YW5jZXMgPSB7fTtcbiAgV2ViU29ja2V0Ll9fdGFza3MgPSBbXTtcbiAgV2ViU29ja2V0Ll9fbmV4dElkID0gMDtcbiAgXG4gIC8qKlxuICAgKiBMb2FkIGEgbmV3IGZsYXNoIHNlY3VyaXR5IHBvbGljeSBmaWxlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqL1xuICBXZWJTb2NrZXQubG9hZEZsYXNoUG9saWN5RmlsZSA9IGZ1bmN0aW9uKHVybCl7XG4gICAgV2ViU29ja2V0Ll9fYWRkVGFzayhmdW5jdGlvbigpIHtcbiAgICAgIFdlYlNvY2tldC5fX2ZsYXNoLmxvYWRNYW51YWxQb2xpY3lGaWxlKHVybCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIExvYWRzIFdlYlNvY2tldE1haW4uc3dmIGFuZCBjcmVhdGVzIFdlYlNvY2tldE1haW4gb2JqZWN0IGluIEZsYXNoLlxuICAgKi9cbiAgV2ViU29ja2V0Ll9faW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChXZWJTb2NrZXQuX19mbGFzaCkgcmV0dXJuO1xuICAgIFxuICAgIGlmIChXZWJTb2NrZXQuX19zd2ZMb2NhdGlvbikge1xuICAgICAgLy8gRm9yIGJhY2t3b3JkIGNvbXBhdGliaWxpdHkuXG4gICAgICB3aW5kb3cuV0VCX1NPQ0tFVF9TV0ZfTE9DQVRJT04gPSBXZWJTb2NrZXQuX19zd2ZMb2NhdGlvbjtcbiAgICB9XG4gICAgaWYgKCF3aW5kb3cuV0VCX1NPQ0tFVF9TV0ZfTE9DQVRJT04pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJbV2ViU29ja2V0XSBzZXQgV0VCX1NPQ0tFVF9TV0ZfTE9DQVRJT04gdG8gbG9jYXRpb24gb2YgV2ViU29ja2V0TWFpbi5zd2ZcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNvbnRhaW5lci5pZCA9IFwid2ViU29ja2V0Q29udGFpbmVyXCI7XG4gICAgLy8gSGlkZXMgRmxhc2ggYm94LiBXZSBjYW5ub3QgdXNlIGRpc3BsYXk6IG5vbmUgb3IgdmlzaWJpbGl0eTogaGlkZGVuIGJlY2F1c2UgaXQgcHJldmVudHNcbiAgICAvLyBGbGFzaCBmcm9tIGxvYWRpbmcgYXQgbGVhc3QgaW4gSUUuIFNvIHdlIG1vdmUgaXQgb3V0IG9mIHRoZSBzY3JlZW4gYXQgKC0xMDAsIC0xMDApLlxuICAgIC8vIEJ1dCB0aGlzIGV2ZW4gZG9lc24ndCB3b3JrIHdpdGggRmxhc2ggTGl0ZSAoZS5nLiBpbiBEcm9pZCBJbmNyZWRpYmxlKS4gU28gd2l0aCBGbGFzaFxuICAgIC8vIExpdGUsIHdlIHB1dCBpdCBhdCAoMCwgMCkuIFRoaXMgc2hvd3MgMXgxIGJveCB2aXNpYmxlIGF0IGxlZnQtdG9wIGNvcm5lciBidXQgdGhpcyBpc1xuICAgIC8vIHRoZSBiZXN0IHdlIGNhbiBkbyBhcyBmYXIgYXMgd2Uga25vdyBub3cuXG4gICAgY29udGFpbmVyLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgIGlmIChXZWJTb2NrZXQuX19pc0ZsYXNoTGl0ZSgpKSB7XG4gICAgICBjb250YWluZXIuc3R5bGUubGVmdCA9IFwiMHB4XCI7XG4gICAgICBjb250YWluZXIuc3R5bGUudG9wID0gXCIwcHhcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGFpbmVyLnN0eWxlLmxlZnQgPSBcIi0xMDBweFwiO1xuICAgICAgY29udGFpbmVyLnN0eWxlLnRvcCA9IFwiLTEwMHB4XCI7XG4gICAgfVxuICAgIHZhciBob2xkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGhvbGRlci5pZCA9IFwid2ViU29ja2V0Rmxhc2hcIjtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaG9sZGVyKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgLy8gU2VlIHRoaXMgYXJ0aWNsZSBmb3IgaGFzUHJpb3JpdHk6XG4gICAgLy8gaHR0cDovL2hlbHAuYWRvYmUuY29tL2VuX1VTL2FzMy9tb2JpbGUvV1M0YmViY2Q2NmE3NDI3NWMzNmNmYjgxMzcxMjQzMThlZWJjNi03ZmZkLmh0bWxcbiAgICBzd2ZvYmplY3QuZW1iZWRTV0YoXG4gICAgICBXRUJfU09DS0VUX1NXRl9MT0NBVElPTixcbiAgICAgIFwid2ViU29ja2V0Rmxhc2hcIixcbiAgICAgIFwiMVwiIC8qIHdpZHRoICovLFxuICAgICAgXCIxXCIgLyogaGVpZ2h0ICovLFxuICAgICAgXCIxMC4wLjBcIiAvKiBTV0YgdmVyc2lvbiAqLyxcbiAgICAgIG51bGwsXG4gICAgICBudWxsLFxuICAgICAge2hhc1ByaW9yaXR5OiB0cnVlLCBzd2xpdmVjb25uZWN0IDogdHJ1ZSwgYWxsb3dTY3JpcHRBY2Nlc3M6IFwiYWx3YXlzXCJ9LFxuICAgICAgbnVsbCxcbiAgICAgIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKCFlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiW1dlYlNvY2tldF0gc3dmb2JqZWN0LmVtYmVkU1dGIGZhaWxlZFwiKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH07XG4gIFxuICAvKipcbiAgICogQ2FsbGVkIGJ5IEZsYXNoIHRvIG5vdGlmeSBKUyB0aGF0IGl0J3MgZnVsbHkgbG9hZGVkIGFuZCByZWFkeVxuICAgKiBmb3IgY29tbXVuaWNhdGlvbi5cbiAgICovXG4gIFdlYlNvY2tldC5fX29uRmxhc2hJbml0aWFsaXplZCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIFdlIG5lZWQgdG8gc2V0IGEgdGltZW91dCBoZXJlIHRvIGF2b2lkIHJvdW5kLXRyaXAgY2FsbHNcbiAgICAvLyB0byBmbGFzaCBkdXJpbmcgdGhlIGluaXRpYWxpemF0aW9uIHByb2Nlc3MuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIFdlYlNvY2tldC5fX2ZsYXNoID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3ZWJTb2NrZXRGbGFzaFwiKTtcbiAgICAgIFdlYlNvY2tldC5fX2ZsYXNoLnNldENhbGxlclVybChsb2NhdGlvbi5ocmVmKTtcbiAgICAgIFdlYlNvY2tldC5fX2ZsYXNoLnNldERlYnVnKCEhd2luZG93LldFQl9TT0NLRVRfREVCVUcpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBXZWJTb2NrZXQuX190YXNrcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBXZWJTb2NrZXQuX190YXNrc1tpXSgpO1xuICAgICAgfVxuICAgICAgV2ViU29ja2V0Ll9fdGFza3MgPSBbXTtcbiAgICB9LCAwKTtcbiAgfTtcbiAgXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgRmxhc2ggdG8gbm90aWZ5IFdlYlNvY2tldHMgZXZlbnRzIGFyZSBmaXJlZC5cbiAgICovXG4gIFdlYlNvY2tldC5fX29uRmxhc2hFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBHZXRzIGV2ZW50cyB1c2luZyByZWNlaXZlRXZlbnRzKCkgaW5zdGVhZCBvZiBnZXR0aW5nIGl0IGZyb20gZXZlbnQgb2JqZWN0XG4gICAgICAgIC8vIG9mIEZsYXNoIGV2ZW50LiBUaGlzIGlzIHRvIG1ha2Ugc3VyZSB0byBrZWVwIG1lc3NhZ2Ugb3JkZXIuXG4gICAgICAgIC8vIEl0IHNlZW1zIHNvbWV0aW1lcyBGbGFzaCBldmVudHMgZG9uJ3QgYXJyaXZlIGluIHRoZSBzYW1lIG9yZGVyIGFzIHRoZXkgYXJlIHNlbnQuXG4gICAgICAgIHZhciBldmVudHMgPSBXZWJTb2NrZXQuX19mbGFzaC5yZWNlaXZlRXZlbnRzKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgV2ViU29ja2V0Ll9faW5zdGFuY2VzW2V2ZW50c1tpXS53ZWJTb2NrZXRJZF0uX19oYW5kbGVFdmVudChldmVudHNbaV0pO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICB9XG4gICAgfSwgMCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIFxuICAvLyBDYWxsZWQgYnkgRmxhc2guXG4gIFdlYlNvY2tldC5fX2xvZyA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICBjb25zb2xlLmxvZyhkZWNvZGVVUklDb21wb25lbnQobWVzc2FnZSkpO1xuICB9O1xuICBcbiAgLy8gQ2FsbGVkIGJ5IEZsYXNoLlxuICBXZWJTb2NrZXQuX19lcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICBjb25zb2xlLmVycm9yKGRlY29kZVVSSUNvbXBvbmVudChtZXNzYWdlKSk7XG4gIH07XG4gIFxuICBXZWJTb2NrZXQuX19hZGRUYXNrID0gZnVuY3Rpb24odGFzaykge1xuICAgIGlmIChXZWJTb2NrZXQuX19mbGFzaCkge1xuICAgICAgdGFzaygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBXZWJTb2NrZXQuX190YXNrcy5wdXNoKHRhc2spO1xuICAgIH1cbiAgfTtcbiAgXG4gIC8qKlxuICAgKiBUZXN0IGlmIHRoZSBicm93c2VyIGlzIHJ1bm5pbmcgZmxhc2ggbGl0ZS5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiBmbGFzaCBsaXRlIGlzIHJ1bm5pbmcsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIFdlYlNvY2tldC5fX2lzRmxhc2hMaXRlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF3aW5kb3cubmF2aWdhdG9yIHx8ICF3aW5kb3cubmF2aWdhdG9yLm1pbWVUeXBlcykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgbWltZVR5cGUgPSB3aW5kb3cubmF2aWdhdG9yLm1pbWVUeXBlc1tcImFwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoXCJdO1xuICAgIGlmICghbWltZVR5cGUgfHwgIW1pbWVUeXBlLmVuYWJsZWRQbHVnaW4gfHwgIW1pbWVUeXBlLmVuYWJsZWRQbHVnaW4uZmlsZW5hbWUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG1pbWVUeXBlLmVuYWJsZWRQbHVnaW4uZmlsZW5hbWUubWF0Y2goL2ZsYXNobGl0ZS9pKSA/IHRydWUgOiBmYWxzZTtcbiAgfTtcbiAgXG4gIGlmICghd2luZG93LldFQl9TT0NLRVRfRElTQUJMRV9BVVRPX0lOSVRJQUxJWkFUSU9OKSB7XG4gICAgaWYgKHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgV2ViU29ja2V0Ll9faW5pdGlhbGl6ZSgpO1xuICAgICAgfSwgZmFsc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cuYXR0YWNoRXZlbnQoXCJvbmxvYWRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgV2ViU29ja2V0Ll9faW5pdGlhbGl6ZSgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIFxufSkoKTtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8sIGdsb2JhbCkge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGV4cG9ydHMuWEhSID0gWEhSO1xuXG4gIC8qKlxuICAgKiBYSFIgY29uc3RydWN0b3JcbiAgICpcbiAgICogQGNvc3RydWN0b3JcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gWEhSIChzb2NrZXQpIHtcbiAgICBpZiAoIXNvY2tldCkgcmV0dXJuO1xuXG4gICAgaW8uVHJhbnNwb3J0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5zZW5kQnVmZmVyID0gW107XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaGVyaXRzIGZyb20gVHJhbnNwb3J0LlxuICAgKi9cblxuICBpby51dGlsLmluaGVyaXQoWEhSLCBpby5UcmFuc3BvcnQpO1xuXG4gIC8qKlxuICAgKiBFc3RhYmxpc2ggYSBjb25uZWN0aW9uXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFhIUi5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNvY2tldC5zZXRCdWZmZXIoZmFsc2UpO1xuICAgIHRoaXMub25PcGVuKCk7XG4gICAgdGhpcy5nZXQoKTtcblxuICAgIC8vIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoZSByZXF1ZXN0IHN1Y2NlZWRzIHNpbmNlIHdlIGhhdmUgbm8gaW5kaWNhdGlvblxuICAgIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3Qgb3BlbmVkIG9yIG5vdCB1bnRpbCBpdCBzdWNjZWVkZWQuXG4gICAgdGhpcy5zZXRDbG9zZVRpbWVvdXQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB3ZSBuZWVkIHRvIHNlbmQgZGF0YSB0byB0aGUgU29ja2V0LklPIHNlcnZlciwgaWYgd2UgaGF2ZSBkYXRhIGluIG91clxuICAgKiBidWZmZXIgd2UgZW5jb2RlIGl0IGFuZCBmb3J3YXJkIGl0IHRvIHRoZSBgcG9zdGAgbWV0aG9kLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgWEhSLnByb3RvdHlwZS5wYXlsb2FkID0gZnVuY3Rpb24gKHBheWxvYWQpIHtcbiAgICB2YXIgbXNncyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBwYXlsb2FkLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgbXNncy5wdXNoKGlvLnBhcnNlci5lbmNvZGVQYWNrZXQocGF5bG9hZFtpXSkpO1xuICAgIH1cblxuICAgIHRoaXMuc2VuZChpby5wYXJzZXIuZW5jb2RlUGF5bG9hZChtc2dzKSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmQgZGF0YSB0byB0aGUgU29ja2V0LklPIHNlcnZlci5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgVGhlIG1lc3NhZ2VcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgWEhSLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB0aGlzLnBvc3QoZGF0YSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBvc3RzIGEgZW5jb2RlZCBtZXNzYWdlIHRvIHRoZSBTb2NrZXQuSU8gc2VydmVyLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YSBBIGVuY29kZWQgbWVzc2FnZS5cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGVtcHR5ICgpIHsgfTtcblxuICBYSFIucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLnNvY2tldC5zZXRCdWZmZXIodHJ1ZSk7XG5cbiAgICBmdW5jdGlvbiBzdGF0ZUNoYW5nZSAoKSB7XG4gICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09IDQpIHtcbiAgICAgICAgdGhpcy5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBlbXB0eTtcbiAgICAgICAgc2VsZi5wb3N0aW5nID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IDIwMCl7XG4gICAgICAgICAgc2VsZi5zb2NrZXQuc2V0QnVmZmVyKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLm9uQ2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9ubG9hZCAoKSB7XG4gICAgICB0aGlzLm9ubG9hZCA9IGVtcHR5O1xuICAgICAgc2VsZi5zb2NrZXQuc2V0QnVmZmVyKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zZW5kWEhSID0gdGhpcy5yZXF1ZXN0KCdQT1NUJyk7XG5cbiAgICBpZiAoZ2xvYmFsLlhEb21haW5SZXF1ZXN0ICYmIHRoaXMuc2VuZFhIUiBpbnN0YW5jZW9mIFhEb21haW5SZXF1ZXN0KSB7XG4gICAgICB0aGlzLnNlbmRYSFIub25sb2FkID0gdGhpcy5zZW5kWEhSLm9uZXJyb3IgPSBvbmxvYWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2VuZFhIUi5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBzdGF0ZUNoYW5nZTtcbiAgICB9XG5cbiAgICB0aGlzLnNlbmRYSFIuc2VuZChkYXRhKTtcbiAgfTtcblxuICAvKipcbiAgICogRGlzY29ubmVjdHMgdGhlIGVzdGFibGlzaGVkIGBYSFJgIGNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFhIUi5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vbkNsb3NlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhIGNvbmZpZ3VyZWQgWEhSIHJlcXVlc3RcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgdXJsIHRoYXQgbmVlZHMgdG8gYmUgcmVxdWVzdGVkLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kIFRoZSBtZXRob2QgdGhlIHJlcXVlc3Qgc2hvdWxkIHVzZS5cbiAgICogQHJldHVybnMge1hNTEh0dHBSZXF1ZXN0fVxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgWEhSLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgIHZhciByZXEgPSBpby51dGlsLnJlcXVlc3QodGhpcy5zb2NrZXQuaXNYRG9tYWluKCkpXG4gICAgICAsIHF1ZXJ5ID0gaW8udXRpbC5xdWVyeSh0aGlzLnNvY2tldC5vcHRpb25zLnF1ZXJ5LCAndD0nICsgK25ldyBEYXRlKTtcblxuICAgIHJlcS5vcGVuKG1ldGhvZCB8fCAnR0VUJywgdGhpcy5wcmVwYXJlVXJsKCkgKyBxdWVyeSwgdHJ1ZSk7XG5cbiAgICBpZiAobWV0aG9kID09ICdQT1NUJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHJlcS5zZXRSZXF1ZXN0SGVhZGVyKSB7XG4gICAgICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBYRG9tYWluUmVxdWVzdFxuICAgICAgICAgIHJlcS5jb250ZW50VHlwZSA9ICd0ZXh0L3BsYWluJztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG5cbiAgICByZXR1cm4gcmVxO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzY2hlbWUgdG8gdXNlIGZvciB0aGUgdHJhbnNwb3J0IFVSTHMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBYSFIucHJvdG90eXBlLnNjaGVtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQub3B0aW9ucy5zZWN1cmUgPyAnaHR0cHMnIDogJ2h0dHAnO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgWEhSIHRyYW5zcG9ydHMgYXJlIHN1cHBvcnRlZFxuICAgKlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHhkb21haW4gQ2hlY2sgaWYgd2Ugc3VwcG9ydCBjcm9zcyBkb21haW4gcmVxdWVzdHMuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBYSFIuY2hlY2sgPSBmdW5jdGlvbiAoc29ja2V0LCB4ZG9tYWluKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciByZXF1ZXN0ID0gaW8udXRpbC5yZXF1ZXN0KHhkb21haW4pLFxuICAgICAgICAgIHVzZXNYRG9tUmVxID0gKGdsb2JhbC5YRG9tYWluUmVxdWVzdCAmJiByZXF1ZXN0IGluc3RhbmNlb2YgWERvbWFpblJlcXVlc3QpLFxuICAgICAgICAgIHNvY2tldFByb3RvY29sID0gKHNvY2tldCAmJiBzb2NrZXQub3B0aW9ucyAmJiBzb2NrZXQub3B0aW9ucy5zZWN1cmUgPyAnaHR0cHM6JyA6ICdodHRwOicpLFxuICAgICAgICAgIGlzWFByb3RvY29sID0gKGdsb2JhbC5sb2NhdGlvbiAmJiBzb2NrZXRQcm90b2NvbCAhPSBnbG9iYWwubG9jYXRpb24ucHJvdG9jb2wpO1xuICAgICAgaWYgKHJlcXVlc3QgJiYgISh1c2VzWERvbVJlcSAmJiBpc1hQcm90b2NvbCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSBjYXRjaChlKSB7fVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgWEhSIHRyYW5zcG9ydCBzdXBwb3J0cyBjcm9zcyBkb21haW4gcmVxdWVzdHMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBYSFIueGRvbWFpbkNoZWNrID0gZnVuY3Rpb24gKHNvY2tldCkge1xuICAgIHJldHVybiBYSFIuY2hlY2soc29ja2V0LCB0cnVlKTtcbiAgfTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8uVHJhbnNwb3J0IDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuICAsIHRoaXNcbik7XG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbykge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHMuaHRtbGZpbGUgPSBIVE1MRmlsZTtcblxuICAvKipcbiAgICogVGhlIEhUTUxGaWxlIHRyYW5zcG9ydCBjcmVhdGVzIGEgYGZvcmV2ZXIgaWZyYW1lYCBiYXNlZCB0cmFuc3BvcnRcbiAgICogZm9yIEludGVybmV0IEV4cGxvcmVyLiBSZWd1bGFyIGZvcmV2ZXIgaWZyYW1lIGltcGxlbWVudGF0aW9ucyB3aWxsIFxuICAgKiBjb250aW51b3VzbHkgdHJpZ2dlciB0aGUgYnJvd3NlcnMgYnV6eSBpbmRpY2F0b3JzLiBJZiB0aGUgZm9yZXZlciBpZnJhbWVcbiAgICogaXMgY3JlYXRlZCBpbnNpZGUgYSBgaHRtbGZpbGVgIHRoZXNlIGluZGljYXRvcnMgd2lsbCBub3QgYmUgdHJpZ2dlZC5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBleHRlbmRzIHtpby5UcmFuc3BvcnQuWEhSfVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBIVE1MRmlsZSAoc29ja2V0KSB7XG4gICAgaW8uVHJhbnNwb3J0LlhIUi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbmhlcml0cyBmcm9tIFhIUiB0cmFuc3BvcnQuXG4gICAqL1xuXG4gIGlvLnV0aWwuaW5oZXJpdChIVE1MRmlsZSwgaW8uVHJhbnNwb3J0LlhIUik7XG5cbiAgLyoqXG4gICAqIFRyYW5zcG9ydCBuYW1lXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEhUTUxGaWxlLnByb3RvdHlwZS5uYW1lID0gJ2h0bWxmaWxlJztcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBBYy4uLmVYIGBodG1sZmlsZWAgd2l0aCBhIGZvcmV2ZXIgbG9hZGluZyBpZnJhbWVcbiAgICogdGhhdCBjYW4gYmUgdXNlZCB0byBsaXN0ZW4gdG8gbWVzc2FnZXMuIEluc2lkZSB0aGUgZ2VuZXJhdGVkXG4gICAqIGBodG1sZmlsZWAgYSByZWZlcmVuY2Ugd2lsbCBiZSBtYWRlIHRvIHRoZSBIVE1MRmlsZSB0cmFuc3BvcnQuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBIVE1MRmlsZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZG9jID0gbmV3IHdpbmRvd1soWydBY3RpdmUnXS5jb25jYXQoJ09iamVjdCcpLmpvaW4oJ1gnKSldKCdodG1sZmlsZScpO1xuICAgIHRoaXMuZG9jLm9wZW4oKTtcbiAgICB0aGlzLmRvYy53cml0ZSgnPGh0bWw+PC9odG1sPicpO1xuICAgIHRoaXMuZG9jLmNsb3NlKCk7XG4gICAgdGhpcy5kb2MucGFyZW50V2luZG93LnMgPSB0aGlzO1xuXG4gICAgdmFyIGlmcmFtZUMgPSB0aGlzLmRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpZnJhbWVDLmNsYXNzTmFtZSA9ICdzb2NrZXRpbyc7XG5cbiAgICB0aGlzLmRvYy5ib2R5LmFwcGVuZENoaWxkKGlmcmFtZUMpO1xuICAgIHRoaXMuaWZyYW1lID0gdGhpcy5kb2MuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG5cbiAgICBpZnJhbWVDLmFwcGVuZENoaWxkKHRoaXMuaWZyYW1lKTtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCBxdWVyeSA9IGlvLnV0aWwucXVlcnkodGhpcy5zb2NrZXQub3B0aW9ucy5xdWVyeSwgJ3Q9JysgK25ldyBEYXRlKTtcblxuICAgIHRoaXMuaWZyYW1lLnNyYyA9IHRoaXMucHJlcGFyZVVybCgpICsgcXVlcnk7XG5cbiAgICBpby51dGlsLm9uKHdpbmRvdywgJ3VubG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUaGUgU29ja2V0LklPIHNlcnZlciB3aWxsIHdyaXRlIHNjcmlwdCB0YWdzIGluc2lkZSB0aGUgZm9yZXZlclxuICAgKiBpZnJhbWUsIHRoaXMgZnVuY3Rpb24gd2lsbCBiZSB1c2VkIGFzIGNhbGxiYWNrIGZvciB0aGUgaW5jb21pbmdcbiAgICogaW5mb3JtYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhIFRoZSBtZXNzYWdlXG4gICAqIEBwYXJhbSB7ZG9jdW1lbnR9IGRvYyBSZWZlcmVuY2UgdG8gdGhlIGNvbnRleHRcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEhUTUxGaWxlLnByb3RvdHlwZS5fID0gZnVuY3Rpb24gKGRhdGEsIGRvYykge1xuICAgIHRoaXMub25EYXRhKGRhdGEpO1xuICAgIHRyeSB7XG4gICAgICB2YXIgc2NyaXB0ID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtcbiAgICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gICAgfSBjYXRjaCAoZSkgeyB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIGVzdGFibGlzaGVkIGNvbm5lY3Rpb24sIGlmcmFtZSBhbmQgYGh0bWxmaWxlYC5cbiAgICogQW5kIGNhbGxzIHRoZSBgQ29sbGVjdEdhcmJhZ2VgIGZ1bmN0aW9uIG9mIEludGVybmV0IEV4cGxvcmVyXG4gICAqIHRvIHJlbGVhc2UgdGhlIG1lbW9yeS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEhUTUxGaWxlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmlmcmFtZSl7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmlmcmFtZS5zcmMgPSAnYWJvdXQ6YmxhbmsnO1xuICAgICAgfSBjYXRjaChlKXt9XG5cbiAgICAgIHRoaXMuZG9jID0gbnVsbDtcbiAgICAgIHRoaXMuaWZyYW1lLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5pZnJhbWUpO1xuICAgICAgdGhpcy5pZnJhbWUgPSBudWxsO1xuXG4gICAgICBDb2xsZWN0R2FyYmFnZSgpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRGlzY29ubmVjdHMgdGhlIGVzdGFibGlzaGVkIGNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9IENoYWluaW5nLlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBIVE1MRmlsZS5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gICAgcmV0dXJuIGlvLlRyYW5zcG9ydC5YSFIucHJvdG90eXBlLmNsb3NlLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgYnJvd3NlciBzdXBwb3J0cyB0aGlzIHRyYW5zcG9ydC4gVGhlIGJyb3dzZXJcbiAgICogbXVzdCBoYXZlIGFuIGBBYy4uLmVYT2JqZWN0YCBpbXBsZW1lbnRhdGlvbi5cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSFRNTEZpbGUuY2hlY2sgPSBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIiAmJiAoWydBY3RpdmUnXS5jb25jYXQoJ09iamVjdCcpLmpvaW4oJ1gnKSkgaW4gd2luZG93KXtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBhID0gbmV3IHdpbmRvd1soWydBY3RpdmUnXS5jb25jYXQoJ09iamVjdCcpLmpvaW4oJ1gnKSldKCdodG1sZmlsZScpO1xuICAgICAgICByZXR1cm4gYSAmJiBpby5UcmFuc3BvcnQuWEhSLmNoZWNrKHNvY2tldCk7XG4gICAgICB9IGNhdGNoKGUpe31cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBjcm9zcyBkb21haW4gcmVxdWVzdHMgYXJlIHN1cHBvcnRlZC5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEhUTUxGaWxlLnhkb21haW5DaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyB3ZSBjYW4gcHJvYmFibHkgZG8gaGFuZGxpbmcgZm9yIHN1Yi1kb21haW5zLCB3ZSBzaG91bGRcbiAgICAvLyB0ZXN0IHRoYXQgaXQncyBjcm9zcyBkb21haW4gYnV0IGEgc3ViZG9tYWluIGhlcmVcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgdHJhbnNwb3J0IHRvIHlvdXIgcHVibGljIGlvLnRyYW5zcG9ydHMgYXJyYXkuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBpby50cmFuc3BvcnRzLnB1c2goJ2h0bWxmaWxlJyk7XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvLlRyYW5zcG9ydCA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbik7XG5cbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvLCBnbG9iYWwpIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzWyd4aHItcG9sbGluZyddID0gWEhSUG9sbGluZztcblxuICAvKipcbiAgICogVGhlIFhIUi1wb2xsaW5nIHRyYW5zcG9ydCB1c2VzIGxvbmcgcG9sbGluZyBYSFIgcmVxdWVzdHMgdG8gY3JlYXRlIGFcbiAgICogXCJwZXJzaXN0ZW50XCIgY29ubmVjdGlvbiB3aXRoIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBYSFJQb2xsaW5nICgpIHtcbiAgICBpby5UcmFuc3BvcnQuWEhSLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaGVyaXRzIGZyb20gWEhSIHRyYW5zcG9ydC5cbiAgICovXG5cbiAgaW8udXRpbC5pbmhlcml0KFhIUlBvbGxpbmcsIGlvLlRyYW5zcG9ydC5YSFIpO1xuXG4gIC8qKlxuICAgKiBNZXJnZSB0aGUgcHJvcGVydGllcyBmcm9tIFhIUiB0cmFuc3BvcnRcbiAgICovXG5cbiAgaW8udXRpbC5tZXJnZShYSFJQb2xsaW5nLCBpby5UcmFuc3BvcnQuWEhSKTtcblxuICAvKipcbiAgICogVHJhbnNwb3J0IG5hbWVcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgWEhSUG9sbGluZy5wcm90b3R5cGUubmFtZSA9ICd4aHItcG9sbGluZyc7XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIGhlYXJ0YmVhdHMgaXMgZW5hYmxlZCBmb3IgdGhpcyB0cmFuc3BvcnRcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFhIUlBvbGxpbmcucHJvdG90eXBlLmhlYXJ0YmVhdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIC8qKiBcbiAgICogRXN0YWJsaXNoIGEgY29ubmVjdGlvbiwgZm9yIGlQaG9uZSBhbmQgQW5kcm9pZCB0aGlzIHdpbGwgYmUgZG9uZSBvbmNlIHRoZSBwYWdlXG4gICAqIGlzIGxvYWRlZC5cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH0gQ2hhaW5pbmcuXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFhIUlBvbGxpbmcucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaW8uVHJhbnNwb3J0LlhIUi5wcm90b3R5cGUub3Blbi5jYWxsKHNlbGYpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvKipcbiAgICogU3RhcnRzIGEgWEhSIHJlcXVlc3QgdG8gd2FpdCBmb3IgaW5jb21pbmcgbWVzc2FnZXMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBlbXB0eSAoKSB7fTtcblxuICBYSFJQb2xsaW5nLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmlzT3BlbikgcmV0dXJuO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gc3RhdGVDaGFuZ2UgKCkge1xuICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgIHRoaXMub25yZWFkeXN0YXRlY2hhbmdlID0gZW1wdHk7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IDIwMCkge1xuICAgICAgICAgIHNlbGYub25EYXRhKHRoaXMucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICBzZWxmLmdldCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYub25DbG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG9ubG9hZCAoKSB7XG4gICAgICB0aGlzLm9ubG9hZCA9IGVtcHR5O1xuICAgICAgdGhpcy5vbmVycm9yID0gZW1wdHk7XG4gICAgICBzZWxmLnJldHJ5Q291bnRlciA9IDE7XG4gICAgICBzZWxmLm9uRGF0YSh0aGlzLnJlc3BvbnNlVGV4dCk7XG4gICAgICBzZWxmLmdldCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBvbmVycm9yICgpIHtcbiAgICAgIHNlbGYucmV0cnlDb3VudGVyICsrO1xuICAgICAgaWYoIXNlbGYucmV0cnlDb3VudGVyIHx8IHNlbGYucmV0cnlDb3VudGVyID4gMykge1xuICAgICAgICBzZWxmLm9uQ2xvc2UoKTsgIFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5nZXQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy54aHIgPSB0aGlzLnJlcXVlc3QoKTtcblxuICAgIGlmIChnbG9iYWwuWERvbWFpblJlcXVlc3QgJiYgdGhpcy54aHIgaW5zdGFuY2VvZiBYRG9tYWluUmVxdWVzdCkge1xuICAgICAgdGhpcy54aHIub25sb2FkID0gb25sb2FkO1xuICAgICAgdGhpcy54aHIub25lcnJvciA9IG9uZXJyb3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMueGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IHN0YXRlQ2hhbmdlO1xuICAgIH1cblxuICAgIHRoaXMueGhyLnNlbmQobnVsbCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB0aGUgdW5jbGVhbiBjbG9zZSBiZWhhdmlvci5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFhIUlBvbGxpbmcucHJvdG90eXBlLm9uQ2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaW8uVHJhbnNwb3J0LlhIUi5wcm90b3R5cGUub25DbG9zZS5jYWxsKHRoaXMpO1xuXG4gICAgaWYgKHRoaXMueGhyKSB7XG4gICAgICB0aGlzLnhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSB0aGlzLnhoci5vbmxvYWQgPSB0aGlzLnhoci5vbmVycm9yID0gZW1wdHk7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnhoci5hYm9ydCgpO1xuICAgICAgfSBjYXRjaChlKXt9XG4gICAgICB0aGlzLnhociA9IG51bGw7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBXZWJraXQgYmFzZWQgYnJvd3NlcnMgc2hvdyBhIGluZmluaXQgc3Bpbm5lciB3aGVuIHlvdSBzdGFydCBhIFhIUiByZXF1ZXN0XG4gICAqIGJlZm9yZSB0aGUgYnJvd3NlcnMgb25sb2FkIGV2ZW50IGlzIGNhbGxlZCBzbyB3ZSBuZWVkIHRvIGRlZmVyIG9wZW5pbmcgb2ZcbiAgICogdGhlIHRyYW5zcG9ydCB1bnRpbCB0aGUgb25sb2FkIGV2ZW50IGlzIGNhbGxlZC4gV3JhcHBpbmcgdGhlIGNiIGluIG91clxuICAgKiBkZWZlciBtZXRob2Qgc29sdmUgdGhpcy5cbiAgICpcbiAgICogQHBhcmFtIHtTb2NrZXR9IHNvY2tldCBUaGUgc29ja2V0IGluc3RhbmNlIHRoYXQgbmVlZHMgYSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBYSFJQb2xsaW5nLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uIChzb2NrZXQsIGZuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaW8udXRpbC5kZWZlcihmdW5jdGlvbiAoKSB7XG4gICAgICBmbi5jYWxsKHNlbGYpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGQgdGhlIHRyYW5zcG9ydCB0byB5b3VyIHB1YmxpYyBpby50cmFuc3BvcnRzIGFycmF5LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgaW8udHJhbnNwb3J0cy5wdXNoKCd4aHItcG9sbGluZycpO1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpby5UcmFuc3BvcnQgOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4gICwgdGhpc1xuKTtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8sIGdsb2JhbCkge1xuICAvKipcbiAgICogVGhlcmUgaXMgYSB3YXkgdG8gaGlkZSB0aGUgbG9hZGluZyBpbmRpY2F0b3IgaW4gRmlyZWZveC4gSWYgeW91IGNyZWF0ZSBhbmRcbiAgICogcmVtb3ZlIGEgaWZyYW1lIGl0IHdpbGwgc3RvcCBzaG93aW5nIHRoZSBjdXJyZW50IGxvYWRpbmcgaW5kaWNhdG9yLlxuICAgKiBVbmZvcnR1bmF0ZWx5IHdlIGNhbid0IGZlYXR1cmUgZGV0ZWN0IHRoYXQgYW5kIFVBIHNuaWZmaW5nIGlzIGV2aWwuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICB2YXIgaW5kaWNhdG9yID0gZ2xvYmFsLmRvY3VtZW50ICYmIFwiTW96QXBwZWFyYW5jZVwiIGluXG4gICAgZ2xvYmFsLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZTtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzWydqc29ucC1wb2xsaW5nJ10gPSBKU09OUFBvbGxpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBKU09OUCB0cmFuc3BvcnQgY3JlYXRlcyBhbiBwZXJzaXN0ZW50IGNvbm5lY3Rpb24gYnkgZHluYW1pY2FsbHlcbiAgICogaW5zZXJ0aW5nIGEgc2NyaXB0IHRhZyBpbiB0aGUgcGFnZS4gVGhpcyBzY3JpcHQgdGFnIHdpbGwgcmVjZWl2ZSB0aGVcbiAgICogaW5mb3JtYXRpb24gb2YgdGhlIFNvY2tldC5JTyBzZXJ2ZXIuIFdoZW4gbmV3IGluZm9ybWF0aW9uIGlzIHJlY2VpdmVkXG4gICAqIGl0IGNyZWF0ZXMgYSBuZXcgc2NyaXB0IHRhZyBmb3IgdGhlIG5ldyBkYXRhIHN0cmVhbS5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBleHRlbmRzIHtpby5UcmFuc3BvcnQueGhyLXBvbGxpbmd9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEpTT05QUG9sbGluZyAoc29ja2V0KSB7XG4gICAgaW8uVHJhbnNwb3J0Wyd4aHItcG9sbGluZyddLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLmluZGV4ID0gaW8uai5sZW5ndGg7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpby5qLnB1c2goZnVuY3Rpb24gKG1zZykge1xuICAgICAgc2VsZi5fKG1zZyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaGVyaXRzIGZyb20gWEhSIHBvbGxpbmcgdHJhbnNwb3J0LlxuICAgKi9cblxuICBpby51dGlsLmluaGVyaXQoSlNPTlBQb2xsaW5nLCBpby5UcmFuc3BvcnRbJ3hoci1wb2xsaW5nJ10pO1xuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnQgbmFtZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBKU09OUFBvbGxpbmcucHJvdG90eXBlLm5hbWUgPSAnanNvbnAtcG9sbGluZyc7XG5cbiAgLyoqXG4gICAqIFBvc3RzIGEgZW5jb2RlZCBtZXNzYWdlIHRvIHRoZSBTb2NrZXQuSU8gc2VydmVyIHVzaW5nIGFuIGlmcmFtZS5cbiAgICogVGhlIGlmcmFtZSBpcyB1c2VkIGJlY2F1c2Ugc2NyaXB0IHRhZ3MgY2FuIGNyZWF0ZSBQT1NUIGJhc2VkIHJlcXVlc3RzLlxuICAgKiBUaGUgaWZyYW1lIGlzIHBvc2l0aW9uZWQgb3V0c2lkZSBvZiB0aGUgdmlldyBzbyB0aGUgdXNlciBkb2VzIG5vdFxuICAgKiBub3RpY2UgaXQncyBleGlzdGVuY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhIEEgZW5jb2RlZCBtZXNzYWdlLlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgSlNPTlBQb2xsaW5nLnByb3RvdHlwZS5wb3N0ID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgcXVlcnkgPSBpby51dGlsLnF1ZXJ5KFxuICAgICAgICAgICAgIHRoaXMuc29ja2V0Lm9wdGlvbnMucXVlcnlcbiAgICAgICAgICAsICd0PScrICgrbmV3IERhdGUpICsgJyZpPScgKyB0aGlzLmluZGV4XG4gICAgICAgICk7XG5cbiAgICBpZiAoIXRoaXMuZm9ybSkge1xuICAgICAgdmFyIGZvcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJylcbiAgICAgICAgLCBhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICAgICAgICAsIGlkID0gdGhpcy5pZnJhbWVJZCA9ICdzb2NrZXRpb19pZnJhbWVfJyArIHRoaXMuaW5kZXhcbiAgICAgICAgLCBpZnJhbWU7XG5cbiAgICAgIGZvcm0uY2xhc3NOYW1lID0gJ3NvY2tldGlvJztcbiAgICAgIGZvcm0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgZm9ybS5zdHlsZS50b3AgPSAnMHB4JztcbiAgICAgIGZvcm0uc3R5bGUubGVmdCA9ICcwcHgnO1xuICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgZm9ybS50YXJnZXQgPSBpZDtcbiAgICAgIGZvcm0ubWV0aG9kID0gJ1BPU1QnO1xuICAgICAgZm9ybS5zZXRBdHRyaWJ1dGUoJ2FjY2VwdC1jaGFyc2V0JywgJ3V0Zi04Jyk7XG4gICAgICBhcmVhLm5hbWUgPSAnZCc7XG4gICAgICBmb3JtLmFwcGVuZENoaWxkKGFyZWEpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChmb3JtKTtcblxuICAgICAgdGhpcy5mb3JtID0gZm9ybTtcbiAgICAgIHRoaXMuYXJlYSA9IGFyZWE7XG4gICAgfVxuXG4gICAgdGhpcy5mb3JtLmFjdGlvbiA9IHRoaXMucHJlcGFyZVVybCgpICsgcXVlcnk7XG5cbiAgICBmdW5jdGlvbiBjb21wbGV0ZSAoKSB7XG4gICAgICBpbml0SWZyYW1lKCk7XG4gICAgICBzZWxmLnNvY2tldC5zZXRCdWZmZXIoZmFsc2UpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBpbml0SWZyYW1lICgpIHtcbiAgICAgIGlmIChzZWxmLmlmcmFtZSkge1xuICAgICAgICBzZWxmLmZvcm0ucmVtb3ZlQ2hpbGQoc2VsZi5pZnJhbWUpO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBpZTYgZHluYW1pYyBpZnJhbWVzIHdpdGggdGFyZ2V0PVwiXCIgc3VwcG9ydCAodGhhbmtzIENocmlzIExhbWJhY2hlcilcbiAgICAgICAgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnPGlmcmFtZSBuYW1lPVwiJysgc2VsZi5pZnJhbWVJZCArJ1wiPicpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICAgICAgaWZyYW1lLm5hbWUgPSBzZWxmLmlmcmFtZUlkO1xuICAgICAgfVxuXG4gICAgICBpZnJhbWUuaWQgPSBzZWxmLmlmcmFtZUlkO1xuXG4gICAgICBzZWxmLmZvcm0uYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgICAgIHNlbGYuaWZyYW1lID0gaWZyYW1lO1xuICAgIH07XG5cbiAgICBpbml0SWZyYW1lKCk7XG5cbiAgICAvLyB3ZSB0ZW1wb3JhcmlseSBzdHJpbmdpZnkgdW50aWwgd2UgZmlndXJlIG91dCBob3cgdG8gcHJldmVudFxuICAgIC8vIGJyb3dzZXJzIGZyb20gdHVybmluZyBgXFxuYCBpbnRvIGBcXHJcXG5gIGluIGZvcm0gaW5wdXRzXG4gICAgdGhpcy5hcmVhLnZhbHVlID0gaW8uSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5mb3JtLnN1Ym1pdCgpO1xuICAgIH0gY2F0Y2goZSkge31cblxuICAgIGlmICh0aGlzLmlmcmFtZS5hdHRhY2hFdmVudCkge1xuICAgICAgaWZyYW1lLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHNlbGYuaWZyYW1lLnJlYWR5U3RhdGUgPT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgIGNvbXBsZXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaWZyYW1lLm9ubG9hZCA9IGNvbXBsZXRlO1xuICAgIH1cblxuICAgIHRoaXMuc29ja2V0LnNldEJ1ZmZlcih0cnVlKTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBKU09OUCBwb2xsIHRoYXQgY2FuIGJlIHVzZWQgdG8gbGlzdGVuXG4gICAqIGZvciBtZXNzYWdlcyBmcm9tIHRoZSBTb2NrZXQuSU8gc2VydmVyLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgSlNPTlBQb2xsaW5nLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG4gICAgICAsIHF1ZXJ5ID0gaW8udXRpbC5xdWVyeShcbiAgICAgICAgICAgICB0aGlzLnNvY2tldC5vcHRpb25zLnF1ZXJ5XG4gICAgICAgICAgLCAndD0nKyAoK25ldyBEYXRlKSArICcmaT0nICsgdGhpcy5pbmRleFxuICAgICAgICApO1xuXG4gICAgaWYgKHRoaXMuc2NyaXB0KSB7XG4gICAgICB0aGlzLnNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuc2NyaXB0KTtcbiAgICAgIHRoaXMuc2NyaXB0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBzY3JpcHQuYXN5bmMgPSB0cnVlO1xuICAgIHNjcmlwdC5zcmMgPSB0aGlzLnByZXBhcmVVcmwoKSArIHF1ZXJ5O1xuICAgIHNjcmlwdC5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5vbkNsb3NlKCk7XG4gICAgfTtcblxuICAgIHZhciBpbnNlcnRBdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtcbiAgICBpbnNlcnRBdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzY3JpcHQsIGluc2VydEF0KTtcbiAgICB0aGlzLnNjcmlwdCA9IHNjcmlwdDtcblxuICAgIGlmIChpbmRpY2F0b3IpIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICAgICAgfSwgMTAwKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgaW5jb21pbmcgbWVzc2FnZSBzdHJlYW0gZnJvbSB0aGUgU29ja2V0LklPIHNlcnZlci5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRhdGEgVGhlIG1lc3NhZ2VcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEpTT05QUG9sbGluZy5wcm90b3R5cGUuXyA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICB0aGlzLm9uRGF0YShtc2cpO1xuICAgIGlmICh0aGlzLmlzT3Blbikge1xuICAgICAgdGhpcy5nZXQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoZSBpbmRpY2F0b3IgaGFjayBvbmx5IHdvcmtzIGFmdGVyIG9ubG9hZFxuICAgKlxuICAgKiBAcGFyYW0ge1NvY2tldH0gc29ja2V0IFRoZSBzb2NrZXQgaW5zdGFuY2UgdGhhdCBuZWVkcyBhIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2tcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEpTT05QUG9sbGluZy5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbiAoc29ja2V0LCBmbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoIWluZGljYXRvcikgcmV0dXJuIGZuLmNhbGwodGhpcyk7XG5cbiAgICBpby51dGlsLmxvYWQoZnVuY3Rpb24gKCkge1xuICAgICAgZm4uY2FsbChzZWxmKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGJyb3dzZXIgc3VwcG9ydHMgdGhpcyB0cmFuc3BvcnQuXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEpTT05QUG9sbGluZy5jaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJ2RvY3VtZW50JyBpbiBnbG9iYWw7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNyb3NzIGRvbWFpbiByZXF1ZXN0cyBhcmUgc3VwcG9ydGVkXG4gICAqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBKU09OUFBvbGxpbmcueGRvbWFpbkNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGQgdGhlIHRyYW5zcG9ydCB0byB5b3VyIHB1YmxpYyBpby50cmFuc3BvcnRzIGFycmF5LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgaW8udHJhbnNwb3J0cy5wdXNoKCdqc29ucC1wb2xsaW5nJyk7XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvLlRyYW5zcG9ydCA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbiAgLCB0aGlzXG4pO1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7IHJldHVybiBpbzsgfSk7XG59XG59KSgpO1xufSkoKSIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS42LjJcbnZhciBjc3MsIGNzc190b29scywgaHRtbF9zY29wZSwgaHRtbF90b29scywgcGFpcl9lbGVtcywgcmVzb2x2ZSwgc2luZ2xlX2VsZW1zLFxuICBfX3NsaWNlID0gW10uc2xpY2U7XG5cbmh0bWxfc2NvcGUgPSB7fTtcblxucGFpcl9lbGVtcyA9IFwiaGVhZCB0aXRsZSBib2R5IHNjcmlwdCAgZGl2IG5hdiBoZWFkZXIgZm9vdGVyIHNlY3Rpb24gYXJ0aWNsZSAgcCBzcGFuIHRleHRhcmVhIGJyIHByZSBjb2RlIGEgYWRkcmVzcyBiIGJhY2txdW90ZSAgYnV0dG9uIGZvbnQgZnJhbWUgZm9ybSBociBpICB1bCBsaSBvbCB0YWJsZSB0ciB0ZCB0aCB0aXRsZSAgY2FudmFzIGF1ZGlvIHZpZGVvIHNlbGVjdCBzdHlsZVwiLnNwbGl0KC9cXHMrLyk7XG5cbnNpbmdsZV9lbGVtcyA9IFwiaW1nIG1ldGEgaW5wdXQgbGluayBpZnJhbWUgYXVkaW8gdmlkZW9cIi5zcGxpdCgvXFxzKy8pO1xuXG5odG1sX3Rvb2xzID0ge1xuICBhdHRyczogZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGF0dHJzLCBrZXksIHZhbHVlO1xuXG4gICAgYXR0cnMgPSBcIlwiO1xuICAgIGZvciAoa2V5IGluIG9iaikge1xuICAgICAgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgIGF0dHJzICs9IFwiIFwiICsga2V5ICsgXCI9J1wiICsgdmFsdWUgKyBcIidcIjtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJzO1xuICB9LFxuICB0ZXh0OiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQucmVwbGFjZSgvJi9nLCBcIiZhbXA7XCIpLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoLz4vZywgXCImZ3Q7XCIpLnJlcGxhY2UoL1xccy9nLCBcIiZuYnNwO1wiKTtcbiAgfVxufTtcblxucmVzb2x2ZSA9IGZ1bmN0aW9uKGxpc3QpIHtcbiAgdmFyIGVsZW0sIG9iajtcblxuICBvYmogPSB7fTtcbiAgZWxlbSA9IFtdO1xuICBsaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgIHZhciBrZXksIHRoYXQsIHZhbHVlLCBfaSwgX2xlbiwgX3Jlc3VsdHMsIF9yZXN1bHRzMTtcblxuICAgIGlmIChpdGVtICE9IG51bGwpIHtcbiAgICAgIGlmIChpdGVtLl9fcHJvdG9fXyA9PT0gT2JqZWN0LnByb3RvdHlwZSkge1xuICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGtleSBpbiBpdGVtKSB7XG4gICAgICAgICAgdmFsdWUgPSBpdGVtW2tleV07XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaChvYmpba2V5XSA9IHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICB9IGVsc2UgaWYgKGl0ZW0uX19wcm90b19fID09PSBBcnJheS5wcm90b3R5cGUpIHtcbiAgICAgICAgX3Jlc3VsdHMxID0gW107XG4gICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gaXRlbS5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgIHRoYXQgPSBpdGVtW19pXTtcbiAgICAgICAgICBfcmVzdWx0czEucHVzaChlbGVtLnB1c2godGhhdCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0czE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZWxlbS5wdXNoKGl0ZW0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBbb2JqLCBlbGVtXTtcbn07XG5cbnBhaXJfZWxlbXMubWFwKGZ1bmN0aW9uKHRhZykge1xuICByZXR1cm4gaHRtbF9zY29wZVt0YWddID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxpc3QsIG9iaiwgX3JlZjtcblxuICAgIGxpc3QgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBfX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIF9yZWYgPSByZXNvbHZlKGxpc3QpLCBvYmogPSBfcmVmWzBdLCBsaXN0ID0gX3JlZlsxXTtcbiAgICByZXR1cm4gXCI8XCIgKyB0YWcgKyAoaHRtbF90b29scy5hdHRycyhvYmopKSArIFwiPlwiICsgKGxpc3Quam9pbihcIlwiKSkgKyBcIjwvXCIgKyB0YWcgKyBcIj5cIjtcbiAgfTtcbn0pO1xuXG5zaW5nbGVfZWxlbXMubWFwKGZ1bmN0aW9uKHRhZykge1xuICByZXR1cm4gaHRtbF9zY29wZVt0YWddID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICBvYmogPSB7fTtcbiAgICB9XG4gICAgcmV0dXJuIFwiPFwiICsgdGFnICsgKGh0bWxfdG9vbHMuYXR0cnMob2JqKSkgKyBcIi8+XCI7XG4gIH07XG59KTtcblxuaHRtbF9zY29wZS5odG1sID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmc7XG59O1xuXG5odG1sX3Njb3BlLnRleHQgPSBodG1sX3Rvb2xzLnRleHQ7XG5cbmNzc190b29scyA9IHtcbiAgdGVtcGxhdGU6IGZ1bmN0aW9uKGJhc2UsIHNlbGVjdG9yLCBkZWNsYXJhdGlvbikge1xuICAgIHJldHVybiBcIlwiICsgYmFzZSArIFwiIFwiICsgc2VsZWN0b3IgKyBcIntcXG5cIiArIGRlY2xhcmF0aW9uICsgXCJcXG59XFxuXCI7XG4gIH0sXG4gIHV0aWxzOiB7XG4gICAgaHNsOiBmdW5jdGlvbihoLCBzLCBsKSB7XG4gICAgICByZXR1cm4gXCJoc2woXCIgKyBoICsgXCIsIFwiICsgcyArIFwiJSwgXCIgKyBsICsgXCIlKVwiO1xuICAgIH0sXG4gICAgaHNsYTogZnVuY3Rpb24oaCwgcywgbCwgYSkge1xuICAgICAgcmV0dXJuIFwiaHNsKFwiICsgaCArIFwiLCBcIiArIHMgKyBcIiUsIFwiICsgbCArIFwiJSwgXCIgKyBhICsgXCIpXCI7XG4gICAgfVxuICB9LFxuICB0eXBlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBtYXRjaCwgc3RyaW5nO1xuXG4gICAgbWF0Y2ggPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLm1hdGNoKC9cXHNcXHcrLyk7XG4gICAgc3RyaW5nID0gbWF0Y2hbMF0uc2xpY2UoMSk7XG4gICAgcmV0dXJuIHN0cmluZy50b0xvd2VyQ2FzZSgpO1xuICB9LFxuICBwcmV0dHk6IGZ1bmN0aW9uKGNoYXIpIHtcbiAgICBpZiAoY2hhci5tYXRjaCgvXltBLVpdJC8pICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBcIi1cIiArIGNoYXIudG9Mb3dlckNhc2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNoYXI7XG4gICAgfVxuICB9XG59O1xuXG5jc3MgPSBmdW5jdGlvbihnZW5lcmF0b3IpIHtcbiAgdmFyIGRhdGEsIHN0eWxlLCB3cml0ZV9ydWxlO1xuXG4gIHN0eWxlID0gXCJcIjtcbiAgY3NzX3Rvb2xzLnV0aWxzLmdlbmVyYXRvciA9IGdlbmVyYXRvcjtcbiAgZGF0YSA9IGNzc190b29scy51dGlscy5nZW5lcmF0b3IoKTtcbiAgd3JpdGVfcnVsZSA9IGZ1bmN0aW9uKGJhc2UsIGRhdGEpIHtcbiAgICB2YXIgYXR0cmlidXRlLCBkZWNsYXJhdGlvbiwgbmVzdF9zZWxlY3RvciwgbmVzdGVkLCBwbGFpbiwgcnVsZSwgc2VsZWN0b3IsIHZhbHVlLCB2YWx1ZXMsIF9pLCBfbGVuLCBfcmVzdWx0cztcblxuICAgIG5lc3RlZCA9IHt9O1xuICAgIGZvciAoc2VsZWN0b3IgaW4gZGF0YSkge1xuICAgICAgZGVjbGFyYXRpb24gPSBkYXRhW3NlbGVjdG9yXTtcbiAgICAgIHBsYWluID0gW107XG4gICAgICBmb3IgKGF0dHJpYnV0ZSBpbiBkZWNsYXJhdGlvbikge1xuICAgICAgICB2YWx1ZSA9IGRlY2xhcmF0aW9uW2F0dHJpYnV0ZV07XG4gICAgICAgIGlmICgoY3NzX3Rvb2xzLnR5cGUodmFsdWUpKSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIG5lc3Rfc2VsZWN0b3IgPSBcIlwiICsgYmFzZSArIFwiIFwiICsgc2VsZWN0b3I7XG4gICAgICAgICAgaWYgKG5lc3RlZFtuZXN0X3NlbGVjdG9yXSA9PSBudWxsKSB7XG4gICAgICAgICAgICBuZXN0ZWRbbmVzdF9zZWxlY3Rvcl0gPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbmVzdGVkW25lc3Rfc2VsZWN0b3JdW2F0dHJpYnV0ZV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGUuc3BsaXQoXCJcIikubWFwKGNzc190b29scy5wcmV0dHkpLmpvaW4oXCJcIik7XG4gICAgICAgICAgaWYgKChjc3NfdG9vbHMudHlwZSh2YWx1ZSkpID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IFwiXCIgKyB2YWx1ZSArIFwicHhcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKChjc3NfdG9vbHMudHlwZSh2YWx1ZSkpID09PSBcImFycmF5XCIpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlO1xuICAgICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSB2YWx1ZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZXNbX2ldO1xuICAgICAgICAgICAgICBwbGFpbi5wdXNoKFwiICBcIiArIGF0dHJpYnV0ZSArIFwiOiBcIiArIHZhbHVlICsgXCI7XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwbGFpbi5wdXNoKFwiICBcIiArIGF0dHJpYnV0ZSArIFwiOiBcIiArIHZhbHVlICsgXCI7XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHBsYWluLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGVjbGFyYXRpb24gPSBwbGFpbi5qb2luKFwiXFxuXCIpO1xuICAgICAgICBydWxlID0gY3NzX3Rvb2xzLnRlbXBsYXRlKGJhc2UsIHNlbGVjdG9yLCBkZWNsYXJhdGlvbik7XG4gICAgICAgIHN0eWxlICs9IHJ1bGUudHJpbUxlZnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKChPYmplY3Qua2V5cyhuZXN0ZWQpKS5sZW5ndGggPiAwKSB7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChiYXNlIGluIG5lc3RlZCkge1xuICAgICAgICBkYXRhID0gbmVzdGVkW2Jhc2VdO1xuICAgICAgICBfcmVzdWx0cy5wdXNoKHdyaXRlX3J1bGUoYmFzZSwgZGF0YSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH1cbiAgfTtcbiAgd3JpdGVfcnVsZShcIlwiLCBkYXRhKTtcbiAgcmV0dXJuIHN0eWxlO1xufTtcblxuZXhwb3J0cy5odG1sID0gZnVuY3Rpb24oZ2VuZXJhdG9yKSB7XG4gIHJldHVybiBnZW5lcmF0b3IuY2FsbChodG1sX3Njb3BlKTtcbn07XG5cbmV4cG9ydHMuY3NzID0gZnVuY3Rpb24oZGF0YSkge1xuICByZXR1cm4gY3NzKGRhdGEpO1xufTtcbiIsIlxuZGF0ZWZvcm1hdCA9IHJlcXVpcmUoJ2RhdGVmb3JtYXQnKVxudGltZSA9IC0+XG4gIG5vdyA9IG5ldyBEYXRlKClcbiAgZGF0ZWZvcm1hdCBub3csICdtbW1tIGRTLCBoOk1NJ1xuXG5odG1sID0gcmVxdWlyZSgnbGlseXR1cmYnKS5odG1sXG5cbnEgPSBleHBvcnRzLnEgPSAocXVlcnkpIC0+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgcXVlcnlcblxuIyBjYWNoZXNcblxuY2FjaGVfbmFtZSA9ICcnXG5jYWNoZV90aW1lID0gJydcblxuZXhwb3J0cy51cGRhdGUgPSAoZGF0YSkgLT5cbiAgaWYgcShcIiNpZCN7ZGF0YS5zdGFtcH1cIik/XG4gICAgcShcIiNpZCN7ZGF0YS5zdGFtcH1cIikucXVlcnlTZWxlY3RvcignLnRleHQnKS5pbm5lclRleHQgPSBkYXRhLnRleHRcbiAgICBpZiBkYXRhLmZpbmlzaD9cbiAgICAgIHEoXCIjaWQje2RhdGEuc3RhbXB9XCIpLmNsYXNzTGlzdC5hZGQgJ2ZpbmlzaCdcbiAgZWxzZVxuICAgIHRoZV90aW1lID0gdGltZSgpXG4gICAgaWYgdGhlX3RpbWUgaXMgY2FjaGVfdGltZVxuICAgICAgdGhlX3RpbWUgPSAnJ1xuICAgIGVsc2VcbiAgICAgIGNhY2hlX3RpbWUgPSB0aGVfdGltZVxuXG4gICAgaWYgZGF0YS5uYW1lIGlzIGNhY2hlX25hbWVcbiAgICAgIHRoZV9uYW1lID0gJydcbiAgICBlbHNlXG4gICAgICBjYWNoZV9uYW1lID0gZGF0YS5uYW1lXG4gICAgICB0aGVfbmFtZSA9IGNhY2hlX25hbWVcbiAgICAgIFxuICAgIHBvc3RfaHRtbCA9IGh0bWwgLT5cbiAgICAgIEBkaXYgY2xhc3M6ICdwb3N0JywgaWQ6IFwiaWQje2RhdGEuc3RhbXB9XCIsXG4gICAgICAgIEBzcGFuIGNsYXNzOiAnbmFtZScsXG4gICAgICAgICAgQHRleHQgdGhlX25hbWVcbiAgICAgICAgQHNwYW4gY2xhc3M6ICd0ZXh0JyxcbiAgICAgICAgICBAdGV4dCBkYXRhLnRleHRcbiAgICAgICAgQHNwYW4gY2xhc3M6ICd0aW1lJyxcbiAgICAgICAgICBAdGV4dCB0aGVfdGltZVxuXG4gICAgcSgnI2xpc3QnKS5pbnNlcnRBZGphY2VudEhUTUwgJ2JlZm9yZWVuZCcsIHBvc3RfaHRtbFxuXG4gICAgcShcIiNpZCN7ZGF0YS5zdGFtcH1cIikuc2Nyb2xsSW50b1ZpZXcoKSIsIi8qXG4gKiBEYXRlIEZvcm1hdCAxLjIuM1xuICogKGMpIDIwMDctMjAwOSBTdGV2ZW4gTGV2aXRoYW4gPHN0ZXZlbmxldml0aGFuLmNvbT5cbiAqIE1JVCBsaWNlbnNlXG4gKlxuICogSW5jbHVkZXMgZW5oYW5jZW1lbnRzIGJ5IFNjb3R0IFRyZW5kYSA8c2NvdHQudHJlbmRhLm5ldD5cbiAqIGFuZCBLcmlzIEtvd2FsIDxjaXhhci5jb20vfmtyaXMua293YWwvPlxuICpcbiAqIEFjY2VwdHMgYSBkYXRlLCBhIG1hc2ssIG9yIGEgZGF0ZSBhbmQgYSBtYXNrLlxuICogUmV0dXJucyBhIGZvcm1hdHRlZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBkYXRlLlxuICogVGhlIGRhdGUgZGVmYXVsdHMgdG8gdGhlIGN1cnJlbnQgZGF0ZS90aW1lLlxuICogVGhlIG1hc2sgZGVmYXVsdHMgdG8gZGF0ZUZvcm1hdC5tYXNrcy5kZWZhdWx0LlxuICovXG5cbnZhciBkYXRlRm9ybWF0ID0gZnVuY3Rpb24gKCkge1xuXHR2YXJcdHRva2VuID0gL2R7MSw0fXxtezEsNH18eXkoPzp5eSk/fChbSGhNc1R0XSlcXDE/fFtMbG9TWldOXXxcIlteXCJdKlwifCdbXiddKicvZyxcblx0XHR0aW1lem9uZSA9IC9cXGIoPzpbUE1DRUFdW1NEUF1UfCg/OlBhY2lmaWN8TW91bnRhaW58Q2VudHJhbHxFYXN0ZXJufEF0bGFudGljKSAoPzpTdGFuZGFyZHxEYXlsaWdodHxQcmV2YWlsaW5nKSBUaW1lfCg/OkdNVHxVVEMpKD86Wy0rXVxcZHs0fSk/KVxcYi9nLFxuXHRcdHRpbWV6b25lQ2xpcCA9IC9bXi0rXFxkQS1aXS9nLFxuXHRcdHBhZCA9IGZ1bmN0aW9uICh2YWwsIGxlbikge1xuXHRcdFx0dmFsID0gU3RyaW5nKHZhbCk7XG5cdFx0XHRsZW4gPSBsZW4gfHwgMjtcblx0XHRcdHdoaWxlICh2YWwubGVuZ3RoIDwgbGVuKSB2YWwgPSBcIjBcIiArIHZhbDtcblx0XHRcdHJldHVybiB2YWw7XG5cdFx0fSxcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIElTTyA4NjAxIHdlZWsgbnVtYmVyXG4gICAgICogQmFzZWQgb24gY29tbWVudHMgZnJvbVxuICAgICAqIGh0dHA6Ly90ZWNoYmxvZy5wcm9jdXJpb3Mubmwvay9uNjE4L25ld3Mvdmlldy8zMzc5Ni8xNDg2My9DYWxjdWxhdGUtSVNPLTg2MDEtd2Vlay1hbmQteWVhci1pbi1qYXZhc2NyaXB0Lmh0bWxcbiAgICAgKi9cbiAgICBnZXRXZWVrID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgIC8vIFJlbW92ZSB0aW1lIGNvbXBvbmVudHMgb2YgZGF0ZVxuICAgICAgdmFyIHRhcmdldFRodXJzZGF5ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpKTtcblxuICAgICAgLy8gQ2hhbmdlIGRhdGUgdG8gVGh1cnNkYXkgc2FtZSB3ZWVrXG4gICAgICB0YXJnZXRUaHVyc2RheS5zZXREYXRlKHRhcmdldFRodXJzZGF5LmdldERhdGUoKSAtICgodGFyZ2V0VGh1cnNkYXkuZ2V0RGF5KCkgKyA2KSAlIDcpICsgMyk7XG5cbiAgICAgIC8vIFRha2UgSmFudWFyeSA0dGggYXMgaXQgaXMgYWx3YXlzIGluIHdlZWsgMSAoc2VlIElTTyA4NjAxKVxuICAgICAgdmFyIGZpcnN0VGh1cnNkYXkgPSBuZXcgRGF0ZSh0YXJnZXRUaHVyc2RheS5nZXRGdWxsWWVhcigpLCAwLCA0KTtcblxuICAgICAgLy8gQ2hhbmdlIGRhdGUgdG8gVGh1cnNkYXkgc2FtZSB3ZWVrXG4gICAgICBmaXJzdFRodXJzZGF5LnNldERhdGUoZmlyc3RUaHVyc2RheS5nZXREYXRlKCkgLSAoKGZpcnN0VGh1cnNkYXkuZ2V0RGF5KCkgKyA2KSAlIDcpICsgMyk7XG5cbiAgICAgIC8vIENoZWNrIGlmIGRheWxpZ2h0LXNhdmluZy10aW1lLXN3aXRjaCBvY2N1cmVkIGFuZCBjb3JyZWN0IGZvciBpdFxuICAgICAgdmFyIGRzID0gdGFyZ2V0VGh1cnNkYXkuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIGZpcnN0VGh1cnNkYXkuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgICAgIHRhcmdldFRodXJzZGF5LnNldEhvdXJzKHRhcmdldFRodXJzZGF5LmdldEhvdXJzKCkgLSBkcyk7XG5cbiAgICAgIC8vIE51bWJlciBvZiB3ZWVrcyBiZXR3ZWVuIHRhcmdldCBUaHVyc2RheSBhbmQgZmlyc3QgVGh1cnNkYXlcbiAgICAgIHZhciB3ZWVrRGlmZiA9ICh0YXJnZXRUaHVyc2RheSAtIGZpcnN0VGh1cnNkYXkpIC8gKDg2NDAwMDAwKjcpO1xuICAgICAgcmV0dXJuIDEgKyB3ZWVrRGlmZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IElTTy04NjAxIG51bWVyaWMgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRheSBvZiB0aGUgd2Vla1xuICAgICAqIDEgKGZvciBNb25kYXkpIHRocm91Z2ggNyAoZm9yIFN1bmRheSlcbiAgICAgKi9cblxuICAgIGdldERheU9mV2VlayA9IGZ1bmN0aW9uKGRhdGUpe1xuICAgIFx0dmFyIGRvdyA9IGRhdGUuZ2V0RGF5KCk7XG4gICAgXHRpZihkb3cgPT09IDApIGRvdyA9IDc7XG4gICAgXHRyZXR1cm4gZG93O1xuICAgIH07XG5cblx0Ly8gUmVnZXhlcyBhbmQgc3VwcG9ydGluZyBmdW5jdGlvbnMgYXJlIGNhY2hlZCB0aHJvdWdoIGNsb3N1cmVcblx0cmV0dXJuIGZ1bmN0aW9uIChkYXRlLCBtYXNrLCB1dGMpIHtcblx0XHR2YXIgZEYgPSBkYXRlRm9ybWF0O1xuXG5cdFx0Ly8gWW91IGNhbid0IHByb3ZpZGUgdXRjIGlmIHlvdSBza2lwIG90aGVyIGFyZ3MgKHVzZSB0aGUgXCJVVEM6XCIgbWFzayBwcmVmaXgpXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0ZSkgPT0gXCJbb2JqZWN0IFN0cmluZ11cIiAmJiAhL1xcZC8udGVzdChkYXRlKSkge1xuXHRcdFx0bWFzayA9IGRhdGU7XG5cdFx0XHRkYXRlID0gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGRhdGUgPSBkYXRlIHx8IG5ldyBEYXRlO1xuXG4gICAgaWYoIShkYXRlIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZShkYXRlKTtcbiAgICB9XG5cbiAgICBpZiAoaXNOYU4oZGF0ZSkpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcihcIkludmFsaWQgZGF0ZVwiKTtcbiAgICB9XG5cblx0XHRtYXNrID0gU3RyaW5nKGRGLm1hc2tzW21hc2tdIHx8IG1hc2sgfHwgZEYubWFza3NbXCJkZWZhdWx0XCJdKTtcblxuXHRcdC8vIEFsbG93IHNldHRpbmcgdGhlIHV0YyBhcmd1bWVudCB2aWEgdGhlIG1hc2tcblx0XHRpZiAobWFzay5zbGljZSgwLCA0KSA9PSBcIlVUQzpcIikge1xuXHRcdFx0bWFzayA9IG1hc2suc2xpY2UoNCk7XG5cdFx0XHR1dGMgPSB0cnVlO1xuXHRcdH1cblxuXHRcdHZhclx0XyA9IHV0YyA/IFwiZ2V0VVRDXCIgOiBcImdldFwiLFxuXHRcdFx0ZCA9IGRhdGVbXyArIFwiRGF0ZVwiXSgpLFxuXHRcdFx0RCA9IGRhdGVbXyArIFwiRGF5XCJdKCksXG5cdFx0XHRtID0gZGF0ZVtfICsgXCJNb250aFwiXSgpLFxuXHRcdFx0eSA9IGRhdGVbXyArIFwiRnVsbFllYXJcIl0oKSxcblx0XHRcdEggPSBkYXRlW18gKyBcIkhvdXJzXCJdKCksXG5cdFx0XHRNID0gZGF0ZVtfICsgXCJNaW51dGVzXCJdKCksXG5cdFx0XHRzID0gZGF0ZVtfICsgXCJTZWNvbmRzXCJdKCksXG5cdFx0XHRMID0gZGF0ZVtfICsgXCJNaWxsaXNlY29uZHNcIl0oKSxcblx0XHRcdG8gPSB1dGMgPyAwIDogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpLFxuXHRcdFx0VyA9IGdldFdlZWsoZGF0ZSksXG5cdFx0XHROID0gZ2V0RGF5T2ZXZWVrKGRhdGUpLFxuXHRcdFx0ZmxhZ3MgPSB7XG5cdFx0XHRcdGQ6ICAgIGQsXG5cdFx0XHRcdGRkOiAgIHBhZChkKSxcblx0XHRcdFx0ZGRkOiAgZEYuaTE4bi5kYXlOYW1lc1tEXSxcblx0XHRcdFx0ZGRkZDogZEYuaTE4bi5kYXlOYW1lc1tEICsgN10sXG5cdFx0XHRcdG06ICAgIG0gKyAxLFxuXHRcdFx0XHRtbTogICBwYWQobSArIDEpLFxuXHRcdFx0XHRtbW06ICBkRi5pMThuLm1vbnRoTmFtZXNbbV0sXG5cdFx0XHRcdG1tbW06IGRGLmkxOG4ubW9udGhOYW1lc1ttICsgMTJdLFxuXHRcdFx0XHR5eTogICBTdHJpbmcoeSkuc2xpY2UoMiksXG5cdFx0XHRcdHl5eXk6IHksXG5cdFx0XHRcdGg6ICAgIEggJSAxMiB8fCAxMixcblx0XHRcdFx0aGg6ICAgcGFkKEggJSAxMiB8fCAxMiksXG5cdFx0XHRcdEg6ICAgIEgsXG5cdFx0XHRcdEhIOiAgIHBhZChIKSxcblx0XHRcdFx0TTogICAgTSxcblx0XHRcdFx0TU06ICAgcGFkKE0pLFxuXHRcdFx0XHRzOiAgICBzLFxuXHRcdFx0XHRzczogICBwYWQocyksXG5cdFx0XHRcdGw6ICAgIHBhZChMLCAzKSxcblx0XHRcdFx0TDogICAgcGFkKEwgPiA5OSA/IE1hdGgucm91bmQoTCAvIDEwKSA6IEwpLFxuXHRcdFx0XHR0OiAgICBIIDwgMTIgPyBcImFcIiAgOiBcInBcIixcblx0XHRcdFx0dHQ6ICAgSCA8IDEyID8gXCJhbVwiIDogXCJwbVwiLFxuXHRcdFx0XHRUOiAgICBIIDwgMTIgPyBcIkFcIiAgOiBcIlBcIixcblx0XHRcdFx0VFQ6ICAgSCA8IDEyID8gXCJBTVwiIDogXCJQTVwiLFxuXHRcdFx0XHRaOiAgICB1dGMgPyBcIlVUQ1wiIDogKFN0cmluZyhkYXRlKS5tYXRjaCh0aW1lem9uZSkgfHwgW1wiXCJdKS5wb3AoKS5yZXBsYWNlKHRpbWV6b25lQ2xpcCwgXCJcIiksXG5cdFx0XHRcdG86ICAgIChvID4gMCA/IFwiLVwiIDogXCIrXCIpICsgcGFkKE1hdGguZmxvb3IoTWF0aC5hYnMobykgLyA2MCkgKiAxMDAgKyBNYXRoLmFicyhvKSAlIDYwLCA0KSxcblx0XHRcdFx0UzogICAgW1widGhcIiwgXCJzdFwiLCBcIm5kXCIsIFwicmRcIl1bZCAlIDEwID4gMyA/IDAgOiAoZCAlIDEwMCAtIGQgJSAxMCAhPSAxMCkgKiBkICUgMTBdLFxuXHRcdFx0XHRXOiAgICBXLFxuXHRcdFx0XHROOiAgICBOXG5cdFx0XHR9O1xuXG5cdFx0cmV0dXJuIG1hc2sucmVwbGFjZSh0b2tlbiwgZnVuY3Rpb24gKCQwKSB7XG5cdFx0XHRyZXR1cm4gJDAgaW4gZmxhZ3MgPyBmbGFnc1skMF0gOiAkMC5zbGljZSgxLCAkMC5sZW5ndGggLSAxKTtcblx0XHR9KTtcblx0fTtcbn0oKTtcblxuLy8gU29tZSBjb21tb24gZm9ybWF0IHN0cmluZ3NcbmRhdGVGb3JtYXQubWFza3MgPSB7XG5cdFwiZGVmYXVsdFwiOiAgICAgIFwiZGRkIG1tbSBkZCB5eXl5IEhIOk1NOnNzXCIsXG5cdHNob3J0RGF0ZTogICAgICBcIm0vZC95eVwiLFxuXHRtZWRpdW1EYXRlOiAgICAgXCJtbW0gZCwgeXl5eVwiLFxuXHRsb25nRGF0ZTogICAgICAgXCJtbW1tIGQsIHl5eXlcIixcblx0ZnVsbERhdGU6ICAgICAgIFwiZGRkZCwgbW1tbSBkLCB5eXl5XCIsXG5cdHNob3J0VGltZTogICAgICBcImg6TU0gVFRcIixcblx0bWVkaXVtVGltZTogICAgIFwiaDpNTTpzcyBUVFwiLFxuXHRsb25nVGltZTogICAgICAgXCJoOk1NOnNzIFRUIFpcIixcblx0aXNvRGF0ZTogICAgICAgIFwieXl5eS1tbS1kZFwiLFxuXHRpc29UaW1lOiAgICAgICAgXCJISDpNTTpzc1wiLFxuXHRpc29EYXRlVGltZTogICAgXCJ5eXl5LW1tLWRkJ1QnSEg6TU06c3NcIixcblx0aXNvVXRjRGF0ZVRpbWU6IFwiVVRDOnl5eXktbW0tZGQnVCdISDpNTTpzcydaJ1wiLFxuXHRleHBpcmVzSGVhZGVyRm9ybWF0OiBcImRkZCwgZGQgbW1tIHl5eXkgSEg6TU06c3MgWlwiXG59O1xuXG4vLyBJbnRlcm5hdGlvbmFsaXphdGlvbiBzdHJpbmdzXG5kYXRlRm9ybWF0LmkxOG4gPSB7XG5cdGRheU5hbWVzOiBbXG5cdFx0XCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIixcblx0XHRcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJcblx0XSxcblx0bW9udGhOYW1lczogW1xuXHRcdFwiSmFuXCIsIFwiRmViXCIsIFwiTWFyXCIsIFwiQXByXCIsIFwiTWF5XCIsIFwiSnVuXCIsIFwiSnVsXCIsIFwiQXVnXCIsIFwiU2VwXCIsIFwiT2N0XCIsIFwiTm92XCIsIFwiRGVjXCIsXG5cdFx0XCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXG5cdF1cbn07XG5cbi8qXG4vLyBGb3IgY29udmVuaWVuY2UuLi5cbkRhdGUucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uIChtYXNrLCB1dGMpIHtcblx0cmV0dXJuIGRhdGVGb3JtYXQodGhpcywgbWFzaywgdXRjKTtcbn07XG4qL1xuXG5pZiAodHlwZW9mIGV4cG9ydHMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBkYXRlRm9ybWF0O1xufVxuIl19
;