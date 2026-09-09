"use strict";

export const ENVIRONMENT_URLS = {
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
export const TOKEN_PATHS = {
  pre: '/IdentityServer/connect/token',
  pro: '/connect/token'
};
//# sourceMappingURL=environments.js.map