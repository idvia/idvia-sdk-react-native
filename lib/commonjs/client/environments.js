"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TOKEN_PATHS = exports.ENVIRONMENT_URLS = void 0;
const ENVIRONMENT_URLS = exports.ENVIRONMENT_URLS = {
  pre: {
    orchestrator: 'https://orchestrator-pre.trustcloud.solutions',
    identityServer: 'https://identityserver-pre.trustcloud.solutions'
  },
  pro: {
    orchestrator: 'https://orchestrator.trustcloud.solutions',
    identityServer: 'https://identityserver.trustcloud.solutions'
  }
};

// The identity servers differ per environment: pre mounts IdentityServer
// under a path prefix, pro serves it at the root.
const TOKEN_PATHS = exports.TOKEN_PATHS = {
  pre: '/IdentityServer/connect/token',
  pro: '/connect/token'
};
//# sourceMappingURL=environments.js.map