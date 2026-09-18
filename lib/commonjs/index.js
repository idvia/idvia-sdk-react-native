"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DEFAULT_ALLOWED_HOSTS", {
  enumerable: true,
  get: function () {
    return _IdviaSession.DEFAULT_ALLOWED_HOSTS;
  }
});
Object.defineProperty(exports, "ENVIRONMENT_URLS", {
  enumerable: true,
  get: function () {
    return _environments.ENVIRONMENT_URLS;
  }
});
Object.defineProperty(exports, "IdviaApiError", {
  enumerable: true,
  get: function () {
    return _errors.IdviaApiError;
  }
});
Object.defineProperty(exports, "IdviaClient", {
  enumerable: true,
  get: function () {
    return _IdviaClient.IdviaClient;
  }
});
Object.defineProperty(exports, "IdviaPortal", {
  enumerable: true,
  get: function () {
    return _IdviaPortal.IdviaPortal;
  }
});
Object.defineProperty(exports, "IdviaSession", {
  enumerable: true,
  get: function () {
    return _IdviaSession.IdviaSession;
  }
});
Object.defineProperty(exports, "SignSession", {
  enumerable: true,
  get: function () {
    return _aliases.SignSession;
  }
});
Object.defineProperty(exports, "VideoIdAssistedSession", {
  enumerable: true,
  get: function () {
    return _aliases.VideoIdAssistedSession;
  }
});
Object.defineProperty(exports, "VideoIdUnassistedSession", {
  enumerable: true,
  get: function () {
    return _aliases.VideoIdUnassistedSession;
  }
});
Object.defineProperty(exports, "makeError", {
  enumerable: true,
  get: function () {
    return _types.makeError;
  }
});
Object.defineProperty(exports, "matchLanding", {
  enumerable: true,
  get: function () {
    return _matchLanding.matchLanding;
  }
});
Object.defineProperty(exports, "openIdviaSession", {
  enumerable: true,
  get: function () {
    return _openIdviaSession.openIdviaSession;
  }
});
Object.defineProperty(exports, "useIdviaSession", {
  enumerable: true,
  get: function () {
    return _useIdviaSession.useIdviaSession;
  }
});
var _IdviaClient = require("./client/IdviaClient");
var _errors = require("./client/errors");
var _environments = require("./client/environments");
var _IdviaSession = require("./session/IdviaSession");
var _aliases = require("./session/aliases");
var _IdviaPortal = require("./session/IdviaPortal");
var _openIdviaSession = require("./session/openIdviaSession");
var _useIdviaSession = require("./session/useIdviaSession");
var _matchLanding = require("./session/matchLanding");
var _types = require("./shared/types");
//# sourceMappingURL=index.js.map