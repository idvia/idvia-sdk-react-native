"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ENVIRONMENT_URLS", {
  enumerable: true,
  get: function () {
    return _environments.ENVIRONMENT_URLS;
  }
});
Object.defineProperty(exports, "SignSession", {
  enumerable: true,
  get: function () {
    return _aliases.SignSession;
  }
});
Object.defineProperty(exports, "TrustCloudApiError", {
  enumerable: true,
  get: function () {
    return _errors.TrustCloudApiError;
  }
});
Object.defineProperty(exports, "TrustCloudClient", {
  enumerable: true,
  get: function () {
    return _TrustCloudClient.TrustCloudClient;
  }
});
Object.defineProperty(exports, "TrustCloudPortal", {
  enumerable: true,
  get: function () {
    return _TrustCloudPortal.TrustCloudPortal;
  }
});
Object.defineProperty(exports, "TrustCloudSession", {
  enumerable: true,
  get: function () {
    return _TrustCloudSession.TrustCloudSession;
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
Object.defineProperty(exports, "openTrustCloudSession", {
  enumerable: true,
  get: function () {
    return _openTrustCloudSession.openTrustCloudSession;
  }
});
Object.defineProperty(exports, "useTrustCloudSession", {
  enumerable: true,
  get: function () {
    return _useTrustCloudSession.useTrustCloudSession;
  }
});
var _TrustCloudClient = require("./client/TrustCloudClient");
var _errors = require("./client/errors");
var _environments = require("./client/environments");
var _TrustCloudSession = require("./session/TrustCloudSession");
var _aliases = require("./session/aliases");
var _TrustCloudPortal = require("./session/TrustCloudPortal");
var _openTrustCloudSession = require("./session/openTrustCloudSession");
var _useTrustCloudSession = require("./session/useTrustCloudSession");
var _matchLanding = require("./session/matchLanding");
var _types = require("./shared/types");
//# sourceMappingURL=index.js.map