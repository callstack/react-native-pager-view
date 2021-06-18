"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  LazyPagerView: true,
  PagerView: true
};
Object.defineProperty(exports, "LazyPagerView", {
  enumerable: true,
  get: function () {
    return _LazyPagerView.LazyPagerView;
  }
});
Object.defineProperty(exports, "PagerView", {
  enumerable: true,
  get: function () {
    return _PagerView.PagerView;
  }
});

var _types = require("./types");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});

var _LazyPagerView = require("./LazyPagerView");

var _PagerView = require("./PagerView");
//# sourceMappingURL=index.js.map